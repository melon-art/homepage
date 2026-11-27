"""Public export privacy and attachment boundary checks; isolated temporary data."""
import json
from pathlib import Path
import tempfile
import unittest

from server.export_public import export_public


class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'data').mkdir()
        self.filename = 'a' * 64 + '.png'
        folder = self.root / 'assets/uploads'
        folder.mkdir(parents=True)
        (folder / self.filename).write_bytes(b'image')
        (folder / ('b' * 64 + '.png')).write_bytes(b'unreferenced')
        self.site = dict(schemaVersion=1, initialized=True, profile={
            'photo': {'path': 'assets/uploads/' + self.filename}}, news=[],
            updates=[{'status': 'published'}, {'status': 'draft', 'body': 'secret'}],
            blogArticles=[{'status': 'published'}, {'status': 'draft', 'body': 'secret'}],
            privateSecret='secret')
        self.save()

    def save(self):
        (self.root / 'data/site.json').write_text(json.dumps(self.site), encoding='utf-8')

    def test_only_published_content_and_referenced_files(self):
        before = (self.root / 'data/site.json').read_bytes()
        snapshot = export_public(self.root)
        self.assertNotIn('secret', json.dumps(snapshot))
        self.assertFalse(snapshot['canEdit'])
        self.assertEqual(snapshot['profile']['photo']['path'], 'assets/published/' + self.filename)
        self.assertEqual(len(list((self.root / 'public/assets/published').iterdir())), 1)
        self.assertEqual(before, (self.root / 'data/site.json').read_bytes())

    def test_missing_or_private_attachment_preserves_previous_export(self):
        export_public(self.root)
        output = self.root / 'public/data/site.published.json'
        before = output.read_bytes()
        for bad in ('assets/uploads/' + 'c' * 64 + '.png',
                    'assets/uploads/../private.png', 'api/draft-assets/private.png'):
            with self.subTest(path=bad):
                self.site['profile']['photo']['path'] = bad
                self.save()
                with self.assertRaises(ValueError):
                    export_public(self.root)
                self.assertEqual(output.read_bytes(), before)
