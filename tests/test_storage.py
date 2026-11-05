"""File persistence, migration, conflicts, rollback and HTTP access boundary checks."""
import base64
import copy
import json
import io
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
import urllib.error
import urllib.request
import zipfile
from http.server import ThreadingHTTPServer

from server.server import Store, Handler, Problem, atomic_json

PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCZYAAAAASUVORK5CYII='


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.store = Store(self.root)

    def tearDown(self):
        self.store.process_lock.close()
        self.temp.cleanup()

    def initialize(self):
        self.store.mutate('initialize', {'expectedRevision': 0})

    def test_migration_preserves_content_files_and_private_drafts(self):
        snapshot = dict(profile=dict(name='Example', introduction='Bold color', introductionRuns=[dict(text='Bold ', bold=True), dict(text='color', color='#866b35')], photo=dict(name='photo.png', data=PNG), cv=dict(name='cv.pdf', data='data:application/pdf;base64,' + base64.b64encode(b'%PDF-1.4\nexample').decode())),
                        news=[dict(id='n1', date='2026-11-04', body='News', createdAt=111, image=dict(name='news.png', data=PNG), file=dict(name='text.txt', data='data:text/plain;base64,aGVsbG8='))],
                        updates=[dict(id='u1', date='2026-11-04', body='Public', sectionId='home', pageId='about', anchorId='about-title', status='published', createdAt=222), dict(id='u2', date='2026-11-03', body='Private draft', status='draft', image=dict(name='draft.png', data=PNG), createdAt=333)])
        state = self.store.mutate('migrate', dict(expectedRevision=0, snapshot=snapshot))
        site, drafts = self.store.read()
        self.assertEqual(len(state['updates']), 2)
        self.assertEqual(site['news'][0]['createdAt'], 111)
        self.assertEqual(site['profile']['introductionRuns'], snapshot['profile']['introductionRuns'])
        self.assertEqual(drafts['updates'][0]['body'], 'Private draft')
        self.assertNotIn('Private draft', self.store.public.read_text())
        self.assertNotIn('base64,', self.store.public.read_text())
        self.assertTrue(self.store.asset_path(site['profile']['photo']['path']).exists())
        self.assertTrue(drafts['updates'][0]['image']['path'].startswith('api/draft-assets/'))
        backup = list((self.root / '.local/backups').glob('migration-*/browser-snapshot.json'))
        self.assertEqual(len(backup), 1)
        self.assertEqual(json.loads(backup[0].read_text())['news'][0]['file']['data'], 'data:text/plain;base64,aGVsbG8=')
        with self.assertRaises(Problem):
            self.store.mutate('migrate', dict(expectedRevision=site['revision'], snapshot=snapshot))

    def test_stale_edits_and_deleted_records_are_not_overwritten(self):
        self.initialize()
        state = self.store.mutate('profile', dict(expected=self.store.state()['profileRevision'], value={'name': 'First'}))
        with self.assertRaises(Problem) as error:
            self.store.mutate('profile', dict(expected=0, value={'name': 'Stale'}))
        self.assertEqual(error.exception.status, 409)
        self.assertEqual(self.store.state()['profile']['name'], 'First')
        value = dict(id='n1', date='2026-11-04', body='Saved')
        state = self.store.mutate('news', dict(value=value, expected=None))
        version = state['news'][0]['updatedAt']
        self.store.mutate('news', dict(action='delete', id='n1', expected=version))
        with self.assertRaises(Problem):
            self.store.mutate('news', dict(value={**value, 'body': 'Resurrection'}, expected=version))
        self.assertEqual(self.store.state()['news'], [])

    def test_invalid_inputs_leave_original_file_unchanged(self):
        self.initialize()
        before = self.store.public.read_bytes()
        for value in [dict(date='2026-02-30', body='bad'), dict(date='2026-11-04', body='x' * 2001), dict(date='2026-11-04', body='image', image=dict(name='bad.png', data='data:image/png;base64,YmFk'))]:
            with self.assertRaises(Problem):
                self.store.mutate('news', dict(value=value, expected=None))
            self.assertEqual(self.store.public.read_bytes(), before)
        with self.assertRaises(Problem):
            self.store.asset_path('assets/uploads/../../.local/drafts.json')

    def test_update_draft_publish_edit_conflict_and_delete(self):
        self.initialize()
        value = dict(id='u1', date='2026-11-04', body='Draft', status='draft',
                     image=dict(name='preview.png', data=PNG))
        state = self.store.mutate('updates', dict(value=value, expected=None))
        draft = state['updates'][0]
        self.assertEqual(self.store.state()['updates'], [])
        self.assertTrue(draft['image']['path'].startswith('api/draft-assets/'))
        published = {**draft, 'body': 'Published', 'status': 'published',
                     'sectionId': 'home', 'pageId': 'about', 'anchorId': ''}
        self.store.mutate('updates', dict(value=published, expected=draft['updatedAt']))
        entry = self.store.state()['updates'][0]
        self.assertTrue(entry['image']['path'].startswith('assets/uploads/'))
        self.assertEqual(entry['createdAt'], draft['createdAt'])
        with self.assertRaises(Problem):
            self.store.mutate('updates', dict(value=draft, expected=draft['updatedAt']))
        self.store.mutate('updates', dict(value={**entry, 'status': 'draft'}, expected=entry['updatedAt']))
        draft = self.store.state(True)['updates'][0]
        self.assertEqual(self.store.state()['updates'], [])
        self.store.mutate('updates', dict(action='delete', id='u1', expected=draft['updatedAt']))
        with self.assertRaises(Problem):
            self.store.mutate('updates', dict(value=draft, expected=draft['updatedAt']))
        self.assertEqual(self.store.state(True)['updates'], [])

    def test_explore_edits_preserve_routes_and_backup_uploaded_image(self):
        self.initialize()
        previous = self.store.state()['explore'][0]
        original_profile = self.store.state()['profile']
        value = {**previous, 'name': '新标题', 'description': '新的介绍',
                 'file': 'https://unrelated.example', 'kind': 'changed',
                 'image': dict(name='card.png', data=PNG)}
        state = self.store.mutate('explore', dict(value=value, expected=previous['updatedAt']))
        card = state['explore'][0]
        self.assertEqual(card['name'], '新标题')
        self.assertEqual(card['description'], '新的介绍')
        self.assertEqual(card['file'], previous['file'])
        self.assertEqual(card['kind'], previous['kind'])
        self.assertEqual(state['profile'], original_profile)
        self.assertEqual([e['id'] for e in state['explore']], ['food', 'read', 'concepts'])
        self.assertTrue(self.store.asset_path(card['image']['path']).exists())
        with zipfile.ZipFile(io.BytesIO(self.store.export())) as archive:
            self.assertIn(card['image']['path'], archive.namelist())
        before = self.store.public.read_bytes()
        for invalid in [{**card, 'name': ' '}, {**card, 'description': 'x' * 161},
                        {**card, 'image': dict(name='broken.png', data='data:image/png;base64,YmFk')}]:
            with self.assertRaises(Problem):
                self.store.mutate('explore', dict(value=invalid, expected=card['updatedAt']))
            self.assertEqual(before, self.store.public.read_bytes())
        with self.assertRaises(Problem):
            self.store.mutate('explore', dict(value=previous, expected=previous['updatedAt']))
        self.assertEqual(before, self.store.public.read_bytes())

    def test_explore_deletion_persists_when_all_cards_are_removed(self):
        self.initialize()
        first = self.store.state()['explore'][0]
        for card in self.store.state()['explore']:
            self.store.mutate('explore', dict(action='delete', id=card['id'], expected=card['updatedAt']))
        self.assertEqual(self.store.state()['explore'], [])
        self.store.process_lock.close()
        self.store = Store(self.root)
        self.assertEqual(self.store.state()['explore'], [])
        with self.assertRaises(Problem):
            self.store.mutate('explore', dict(value=first, expected=first['updatedAt']))
        self.assertEqual(self.store.state()['news'], [])
        self.assertEqual(self.store.state()['updates'], [])

    def test_disk_failure_rolls_back_and_restart_recovers_journal(self):
        self.initialize()
        before = self.store.state(True)
        actual_write = atomic_json
        failed = False

        def fail_once(path, value):
            nonlocal failed
            if path == self.store.public and not failed:
                failed = True
                raise OSError('simulated full disk')
            actual_write(path, value)

        with patch('server.server.atomic_json', side_effect=fail_once):
            with self.assertRaises(Problem):
                self.store.mutate('profile', dict(expected=before['profileRevision'], value={'name': 'unsaved'}))
        self.assertEqual(self.store.state(True), before)
        recovered = copy.deepcopy(before)
        recovered['profile'] = {'name': 'recovered'}
        recovered['revision'] += 1
        atomic_json(self.store.journal, dict(site=recovered, drafts={'updates': []}))
        self.store.process_lock.close()
        self.store = Store(self.root)
        self.assertEqual(self.store.state()['profile']['name'], 'recovered')
        self.assertFalse(self.store.journal.exists())

    def test_http_rejects_cross_origin_remote_write_and_private_files(self):
        self.initialize()
        (self.root / 'public').mkdir()
        (self.root / 'public/index.html').write_text('<h1>Example</h1>')
        (self.root / 'public/assets/js').mkdir(parents=True)
        (self.root / 'public/assets/js/example.js').write_text('window.example = true;')
        (self.root / 'public/data').mkdir()
        atomic_json(self.root / 'public/data/site.example.json', {'profile': {}, 'news': []})
        (self.root / 'internal.js').write_text('not a public resource')
        image = self.store.asset(dict(name='photo.png', data=PNG), 'image')
        (self.root / '.local/secret.txt').write_text('private')
        http = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        http.store, http.token = self.store, 'test-token'
        worker = threading.Thread(target=http.serve_forever, daemon=True)
        worker.start()
        base = 'http://127.0.0.1:' + str(http.server_port)
        try:
            self.assertIn(b'<h1>Example</h1>', urllib.request.urlopen(base + '/').read())
            self.assertIn(b'window.example', urllib.request.urlopen(base + '/assets/js/example.js').read())
            self.assertEqual(urllib.request.urlopen(base + '/' + image['path']).read(), self.store.asset_path(image['path']).read_bytes())
            self.assertEqual(json.load(urllib.request.urlopen(base + '/data/site.example.json')), {'profile': {}, 'news': []})
            value = json.load(urllib.request.urlopen(base + '/api/state'))
            self.assertTrue(value['canEdit'])
            self.assertEqual(value['token'], 'test-token')
            for route in ['/.local/secret.txt', '/%2elocal/secret.txt', '/tools/server.py', '/server/server.py', '/src/explore/main.jsx', '/internal.js', '/data/', '/assets/uploads/../../.local/secret.txt', '/.git/config']:
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(base + route)
                self.assertEqual(error.exception.code, 404)
            payload = json.dumps(dict(value={'name': 'not saved'}, expected=value['profileRevision'])).encode()
            for extra in [dict(Origin='https://unrelated.example'), dict(Host='192.168.1.2:' + str(http.server_port))]:
                request = urllib.request.Request(base + '/api/profile', data=payload, headers={'Content-Type': 'application/json', 'X-Homepage-Token': http.token, **extra})
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(request)
                self.assertEqual(error.exception.code, 403)
            remote = urllib.request.Request(base + '/api/state', headers={'Host': '192.168.1.2:' + str(http.server_port)})
            result = json.load(urllib.request.urlopen(remote))
            self.assertFalse(result['canEdit'])
            self.assertIsNone(result['token'])
        finally:
            http.shutdown()
            http.server_close()
            worker.join()


if __name__ == '__main__':
    unittest.main()
