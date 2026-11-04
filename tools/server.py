"""Local file-backed homepage server. Standard library only; no Git operations."""
import argparse
import base64
import copy
import hashlib
import io
import ipaddress
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import tempfile
import threading
import time
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit
import uuid
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EXPLORE = json.loads((ROOT / 'data/explore-defaults.json').read_text(encoding='utf-8'))
LIMITS = dict(name=80, degree=120, englishName=80, school=120, department=120,
              major=120, introduction=10000, phone=80, email=254, wechat=300,
              instagram=500, xiaohongshu=500, bilibili=500)
IMAGE_TYPES = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp'}
SECTION_PAGES = {'about': 'home', 'news': 'home', 'activities': 'activities'}
ANCHORS = {'about': {'', 'about-title', 'news-title', 'updates-title'}, 'news': {''}, 'activities': {''}}


class Problem(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.writing-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.write('\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def text(value, maximum, label, default=''):
    if value is None:
        value = default
    if not isinstance(value, str) or len(value) > maximum:
        raise Problem(f'{label}格式错误或超过长度限制。')
    return value.strip()


def stamp():
    return time.time_ns() // 1_000_000


class Store:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.public = self.root / 'data/site.json'
        self.private = self.root / '.local/drafts.json'
        self.journal = self.root / '.local/transaction.json'
        self.lock = threading.RLock()
        self.private.parent.mkdir(parents=True, exist_ok=True)
        # One writer process per project. The OS releases this lock after a crash.
        self.process_lock = (self.private.parent / 'server.lock').open('a+b')
        self.process_lock.write(b'0')
        self.process_lock.flush()
        self.process_lock.seek(0)
        try:
            if os.name == 'nt':
                import msvcrt
                msvcrt.locking(self.process_lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(self.process_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            raise RuntimeError('这个项目已有文件服务正在运行，请使用已有窗口。') from error
        if self.journal.exists():
            transaction = self.load(self.journal)
            atomic_json(self.private, transaction['drafts'])
            atomic_json(self.public, transaction['site'])
            self.journal.unlink()
        if not self.public.exists():
            atomic_json(self.public, dict(schemaVersion=1, revision=0, initialized=False,
                                         profileRevision=0, profile={}, news=[], updates=[]))
        self.read()

    @staticmethod
    def load(path):
        try:
            return json.loads(path.read_text(encoding='utf-8-sig'))
        except (ValueError, OSError) as error:
            raise Problem('数据文件无法读取，请检查文件或从 .local/backups 恢复；未覆盖原文件。', 500) from error

    def read(self):
        site = self.load(self.public)
        if not isinstance(site, dict) or site.get('schemaVersion') != 1 or not all(
                isinstance(site.get(key), list) for key in ('news', 'updates')) or not isinstance(site.get('profile'), dict):
            raise Problem('数据文件结构不正确，原文件未被修改。', 500)
        drafts = self.load(self.private) if self.private.exists() else {'updates': []}
        if not isinstance(drafts, dict) or not isinstance(drafts.get('updates'), list):
            raise Problem('草稿文件结构不正确。', 500)
        # Additive compatibility: absent means the original cards; [] means all deleted.
        if 'explore' not in site:
            site['explore'] = copy.deepcopy(DEFAULT_EXPLORE)
        if not isinstance(site['explore'], list) or any(not isinstance(e, dict) for e in site['explore']):
            raise Problem('探索卡牌数据格式不正确，原文件未被修改。', 500)
        return site, drafts

    def backup(self, site, drafts, prefix='save'):
        target = self.root / '.local/backups' / f'{prefix}-{stamp()}-{uuid.uuid4().hex[:8]}'
        atomic_json(target / 'site.json', site)
        atomic_json(target / 'drafts.json', drafts)
        return target

    def commit(self, site, drafts):
        previous, old_drafts = self.read()
        self.backup(previous, old_drafts)
        site['revision'] = previous['revision'] + 1
        site['initialized'] = True
        # Write-ahead journal permits crash recovery across public/private files.
        atomic_json(self.journal, {'site': site, 'drafts': drafts})
        try:
            atomic_json(self.private, drafts)
            atomic_json(self.public, site)
        except OSError:
            # A normal I/O failure rolls back; a killed process rolls forward on restart.
            atomic_json(self.private, old_drafts)
            atomic_json(self.public, previous)
            self.journal.unlink(missing_ok=True)
            raise Problem('文件保存失败，原数据未更改；当前输入仍保留。', 500)
        self.journal.unlink(missing_ok=True)

    def asset_path(self, url):
        if not isinstance(url, str):
            raise Problem('附件路径无效。')
        match = re.fullmatch(r'(assets/uploads|api/draft-assets)/([a-f0-9]{64}\.(?:png|jpg|webp|pdf|bin))', url)
        if not match:
            raise Problem('附件路径无效。')
        folder = self.root / ('assets/uploads' if match[1] == 'assets/uploads' else '.local/uploads')
        path = folder / match[2]
        if not path.resolve().is_relative_to(folder.resolve()) or path.is_symlink():
            raise Problem('附件路径无效。')
        return path

    def asset(self, value, kind, private=False):
        if value is None:
            return None
        if not isinstance(value, dict):
            raise Problem('附件格式无效。')
        name = re.sub(r'[\x00-\x1f/\\<>:"|?*]', '', text(value.get('name'), 200, '附件名')) or 'attachment'
        limit = {'photo': 1, 'cv': 2, 'image': 5, 'file': 10}[kind] * 1024 * 1024
        mime = value.get('type', '')
        if isinstance(value.get('data'), str):
            match = re.fullmatch(r'data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})', value['data'])
            if not match or len(match[2]) > (limit + 2) // 3 * 4:
                raise Problem('附件编码无效或大小超限。')
            mime = match[1]
            try:
                content = base64.b64decode(match[2], validate=True)
            except ValueError as error:
                raise Problem('附件编码无效。') from error
        elif 'path' in value:
            try:
                content = self.asset_path(value['path']).read_bytes()
            except OSError as error:
                raise Problem('原附件不存在，请重新选择文件。') from error
        else:
            raise Problem('附件缺少内容。')
        if not content or len(content) > limit:
            raise Problem('附件为空或大小超限。')
        if kind in ('photo', 'image'):
            valid = ((mime == 'image/png' and content.startswith(b'\x89PNG\r\n\x1a\n')) or
                     (mime == 'image/jpeg' and content.startswith(b'\xff\xd8\xff')) or
                     (mime == 'image/webp' and content.startswith(b'RIFF') and content[8:12] == b'WEBP'))
            if not valid:
                raise Problem('图片仅支持有效的 JPG、PNG、WebP。')
            extension = IMAGE_TYPES[mime]
        elif kind == 'cv':
            if not content.startswith(b'%PDF-'):
                raise Problem('简历必须是 PDF。')
            mime, extension = 'application/pdf', '.pdf'
        else:
            mime, extension = 'application/octet-stream', '.bin'
        filename = hashlib.sha256(content).hexdigest() + extension
        url = ('api/draft-assets/' if private else 'assets/uploads/') + filename
        path = self.asset_path(url)
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            fd, temporary = tempfile.mkstemp(prefix='.upload-', dir=path.parent)
            try:
                with os.fdopen(fd, 'wb') as handle:
                    handle.write(content)
                    handle.flush()
                    os.fsync(handle.fileno())
                os.replace(temporary, path)
            finally:
                if os.path.exists(temporary):
                    os.unlink(temporary)
        return dict(name=name, path=url, type=mime, size=len(content))

    def profile(self, value):
        if not isinstance(value, dict):
            raise Problem('个人资料格式无效。')
        result = {key: text(value.get(key), maximum, key) for key, maximum in LIMITS.items()}
        runs = value.get('introductionRuns') or []
        if not isinstance(runs, list) or len(runs) > 10000:
            raise Problem('About格式无效。')
        result['introductionRuns'] = []
        for run in runs:
            if not isinstance(run, dict) or not isinstance(run.get('text'), str):
                raise Problem('About格式无效。')
            item = {'text': run['text']}
            if run.get('bold'):
                item['bold'] = True
            if re.fullmatch(r'#[0-9a-fA-F]{6}', str(run.get('color', ''))):
                item['color'] = run['color']
            result['introductionRuns'].append(item)
        if runs and ''.join(run['text'] for run in runs) != result['introduction']:
            result['introductionRuns'] = []
        result['photo'] = self.asset(value.get('photo'), 'photo')
        result['cv'] = self.asset(value.get('cv'), 'cv')
        return result

    def entry(self, value, collection, previous=None, migrating=False):
        if not isinstance(value, dict):
            raise Problem('记录格式无效。')
        identifier = value.get('id') or str(uuid.uuid4())
        if not isinstance(identifier, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', identifier):
            raise Problem('记录编号无效。')
        day = value.get('date')
        try:
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day or '') or date.fromisoformat(day).isoformat() != day:
                raise ValueError()
        except (ValueError, TypeError) as error:
            raise Problem('请选择有效日期。') from error
        result = dict(id=identifier, date=day, body=text(value.get('body'), 2000 if collection == 'news' else 500, '正文'))
        if collection == 'updates':
            if not '1900-01-01' <= day <= '2100-12-31':
                raise Problem('更新日期应在1900—2100年之间。')
            for key in ('sectionId', 'pageId', 'anchorId'):
                result[key] = text(value.get(key), 100, key)
            result['status'] = value.get('status')
            result['imageAlt'] = text(value.get('imageAlt'), 160, '图片说明')
            if result['status'] not in ('draft', 'published'):
                raise Problem('更新状态无效。')
            if result['status'] == 'published' and (not result['body'] or
                    SECTION_PAGES.get(result['pageId']) != result['sectionId'] or
                    result['anchorId'] not in ANCHORS.get(result['pageId'], set())):
                raise Problem('展示更新需要正文和已建立的站内目标。')
        elif not result['body']:
            raise Problem('请填写新闻正文。')
        private = collection == 'updates' and result['status'] == 'draft'
        result['image'] = self.asset(value.get('image'), 'image', private)
        if collection == 'news':
            result['file'] = self.asset(value.get('file'), 'file')
        for key in ('createdAt', 'updatedAt'):
            original = (previous or value).get(key)
            if migrating and original is not None and (not isinstance(original, (int, float)) or original < 0):
                raise Problem('记录时间无效。')
        result['createdAt'] = (previous or value).get('createdAt') or stamp()
        result['updatedAt'] = (value.get('updatedAt') or result['createdAt']) if migrating else max(stamp(), (previous or {}).get('updatedAt', 0) + 1)
        return result

    def state(self, editor=False):
        with self.lock:
            site, drafts = self.read()
            result = copy.deepcopy(site)
            if editor:
                result['updates'] += drafts['updates']
            return result

    def explore_entry(self, value, previous):
        name = text(value.get('name'), 24, '标题')
        description = text(value.get('description'), 160, '介绍')
        if not name or not description:
            raise Problem('请填写卡牌标题和介绍。')
        return {**previous, 'name': name, 'description': description,
                'image': self.asset(value.get('image'), 'image'),
                'updatedAt': max(stamp(), previous['updatedAt'] + 1)}

    def mutate(self, action, payload):
        with self.lock:
            site, drafts = self.read()
            if action in ('migrate', 'initialize'):
                if site['initialized'] or payload.get('expectedRevision') != site['revision']:
                    raise Problem('文件已初始化或已被修改，请刷新；不会覆盖已有文件。', 409)
                if action == 'migrate':
                    snapshot = payload.get('snapshot')
                    if not isinstance(snapshot, dict) or not isinstance(snapshot.get('profile'), dict):
                        raise Problem('迁移数据格式无效。')
                    incoming = {}
                    incoming['profile'] = self.profile(snapshot['profile'])
                    for collection in ('news', 'updates'):
                        values = snapshot.get(collection)
                        if not isinstance(values, list) or len(values) > 5000:
                            raise Problem('迁移列表格式无效或数量超限。')
                        incoming[collection] = [self.entry(value, collection, migrating=True) for value in values]
                        if len({value['id'] for value in incoming[collection]}) != len(values):
                            raise Problem('存在重复记录编号，迁移未执行。')
                    # Embedded backup includes the original browser attachment bytes.
                    target = self.backup(site, drafts, 'migration')
                    atomic_json(target / 'browser-snapshot.json', snapshot)
                    site.update(profile=incoming['profile'], news=incoming['news'],
                                updates=[e for e in incoming['updates'] if e['status'] == 'published'])
                    drafts['updates'] = [e for e in incoming['updates'] if e['status'] == 'draft']
                site['profileRevision'] = stamp()
            else:
                if not site['initialized']:
                    raise Problem('请先在设置页迁移旧数据，或确认使用空白文件开始。', 409)
                if action == 'profile':
                    if payload.get('expected') != site['profileRevision']:
                        raise Problem('资料已在其他页面修改，请保留输入并重新打开设置。', 409)
                    site['profile'] = self.profile(payload.get('value'))
                    site['profileRevision'] = max(stamp(), site['profileRevision'] + 1)
                elif action in ('news', 'updates', 'explore'):
                    entries = site[action] + (drafts['updates'] if action == 'updates' else [])
                    identifier = payload.get('id') or (payload.get('value') or {}).get('id')
                    previous = next((e for e in entries if e['id'] == identifier), None)
                    if action == 'explore' and previous is None:
                        raise Problem('这个板块已被删除，请返回探索广场管理页。', 409)
                    expected = payload.get('expected')
                    version = None if previous is None else previous.get('updatedAt', previous['createdAt'])
                    if (expected is None and previous) or (expected is not None and (not previous or version != expected)):
                        raise Problem('记录已被修改或删除，请保留输入并重新打开，不能覆盖新版本。', 409)
                    deleting = payload.get('action') == 'delete'
                    if deleting and not previous:
                        raise Problem('记录已被删除。', 409)
                    entries = [e for e in entries if e is not previous]
                    if not deleting:
                        value = dict(payload.get('value') or {})
                        if previous:
                            value['id'] = previous['id']
                        if action == 'explore':
                            # Keep order, routes and card identity fixed; edit only the three fields.
                            entries = [self.explore_entry(value, previous) if e is previous else e for e in site['explore']]
                        else:
                            entries.append(self.entry(value, action, previous))
                    if action == 'updates':
                        site['updates'] = [e for e in entries if e['status'] == 'published']
                        drafts['updates'] = [e for e in entries if e['status'] == 'draft']
                    else:
                        site[action] = entries
                else:
                    raise Problem('未知操作。', 404)
            self.commit(site, drafts)
            return self.state(True)

    def export(self):
        with self.lock:
            site, drafts = self.read()
            archive = io.BytesIO()
            with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
                output.writestr('data/site.json', json.dumps(site, ensure_ascii=False, indent=2))
                output.writestr('.local/drafts.json', json.dumps(drafts, ensure_ascii=False, indent=2))
                assets = set()
                for value in [site['profile'], *site['news'], *site['updates'], *site['explore'], *drafts['updates']]:
                    for key in ('photo', 'cv', 'image', 'file'):
                        asset = value.get(key)
                        if isinstance(asset, dict) and asset['path'] not in assets:
                            assets.add(asset['path'])
                            path = self.asset_path(asset['path'])
                            output.write(path, path.relative_to(self.root).as_posix())
            return archive.getvalue()


class Handler(SimpleHTTPRequestHandler):
    server_version = 'HomepageLocal/1'

    def __init__(self, request, client_address, server):
        super().__init__(request, client_address, server, directory=str(server.store.root))

    def log_message(self, format, *args):
        # Do not log request bodies, tokens, contact data or query strings.
        pass

    def is_editor(self):
        try:
            local = ipaddress.ip_address(self.client_address[0]).is_loopback
            host = urlsplit('http://' + self.headers.get('Host', '')).hostname
            return local and host in ('127.0.0.1', 'localhost', '::1')
        except ValueError:
            return False

    def send_bytes(self, content, mime, status=200, attachment=None):
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        if attachment:
            self.send_header('Content-Disposition', 'attachment; filename="' + attachment + '"')
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(content)

    def json(self, value, status=200):
        self.send_bytes(json.dumps(value, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8', status)

    def do_GET(self):
        try:
            route = unquote(urlsplit(self.path).path)
            if route == '/api/state':
                editor = self.is_editor()
                state = self.server.store.state(editor)
                self.json(dict(state, canEdit=editor, token=self.server.token if editor else None))
                return
            if route == '/api/export':
                if not self.is_editor() or self.headers.get('X-Homepage-Token') != self.server.token:
                    raise Problem('备份只能在电脑本机下载。', 403)
                self.send_bytes(self.server.store.export(), 'application/zip', attachment='homepage-backup.zip')
                return
            if route == '/data/site.json':
                self.json(self.server.store.state(False))
                return
            if route == '/data/explore-defaults.json':
                self.json(DEFAULT_EXPLORE)
                return
            if route.startswith('/api/draft-assets/'):
                if not self.is_editor():
                    raise Problem('草稿只允许电脑本机读取。', 403)
                path = self.server.store.asset_path(route[1:])
                self.send_bytes(path.read_bytes(), mimetypes.guess_type(path.name)[0] or 'application/octet-stream')
                return
            if route.startswith('/api/'):
                raise Problem('接口不存在。', 404)
            relative = route.lstrip('/') or 'index.html'
            parts = Path(relative).parts
            if any(part.startswith('.') or part in ('tools', 'node_modules', '__pycache__') for part in parts) or '..' in parts:
                raise Problem('文件不可访问。', 404)
            path = (self.server.store.root / relative).resolve()
            if not path.is_relative_to(self.server.store.root) or not path.is_file():
                raise Problem('文件不存在。', 404)
            # Only site assets are served; no directory listings, private state or scripts.
            if not (path.suffix.lower() in ('.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf', '.bin', '.ico', '.txt')
                    and not relative.endswith('.LEGAL.txt')):
                raise Problem('文件不可访问。', 404)
            mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
            self.send_bytes(path.read_bytes(), mime, attachment='download' + path.suffix if path.suffix in ('.bin', '.pdf') else None)
        except Problem as error:
            self.json({'error': str(error)}, error.status)
        except FileNotFoundError:
            self.json({'error': '附件不存在。'}, 404)
        except (OSError, ValueError):
            self.json({'error': '读取失败，请检查本地文件。'}, 500)

    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        try:
            if not self.is_editor():
                raise Problem('仅电脑本机可编辑，请使用 http://127.0.0.1:' + str(self.server.server_port) + '/ 。', 403)
            origin = self.headers.get('Origin')
            if ((origin and origin != 'http://' + self.headers.get('Host', '')) or
                    self.headers.get('Sec-Fetch-Site') == 'cross-site' or
                    self.headers.get('X-Homepage-Token') != self.server.token):
                raise Problem('保存请求无效，请刷新页面重试。', 403)
            if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                raise Problem('请求格式无效。', 415)
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 128 * 1024 * 1024:
                raise Problem('请求为空或超过128 MB；原数据未修改。', 413)
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise Problem('请求格式无效。')
            route = urlsplit(self.path).path
            if not re.fullmatch(r'/api/(profile|news|updates|explore|migrate|initialize)', route):
                raise Problem('接口不存在。', 404)
            state = self.server.store.mutate(route.rsplit('/', 1)[-1], payload)
            self.json(dict(state, canEdit=True, token=self.server.token))
        except Problem as error:
            self.json({'error': str(error)}, error.status)
        except (ValueError, TypeError, KeyError, OverflowError):
            self.json({'error': '数据格式无效，原文件未被覆盖。'}, 400)
        except OSError:
            self.json({'error': '文件保存失败，请检查磁盘空间和文件权限，输入仍保留。'}, 500)


def serve(root=ROOT, bind='127.0.0.1', port=8765):
    store = Store(root)
    server = ThreadingHTTPServer((bind, port), Handler)
    server.store, server.token = store, secrets.token_urlsafe(32)
    print(f'电脑编辑 / Edit: http://127.0.0.1:{port}/', flush=True)
    print('手机只读预览 / Phone preview: use this computer Wi-Fi IPv4 address.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        store.process_lock.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bind', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--root', type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        serve(args.root, args.bind, args.port)
    except (Problem, RuntimeError) as error:
        parser.exit(1, str(error) + '\n')
    except OSError as error:
        message = ('端口已被占用，请使用已开启的网页，或关闭旧预览服务后重试。'
                   if error.errno in (48, 98, 10048) or getattr(error, 'winerror', None) == 10048
                   else '无法启动本地文件服务，请检查端口、文件权限和数据文件。')
        parser.exit(1, message + '\n')
