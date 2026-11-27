"""Export only displayed content and referenced attachments for GitHub Pages.

Run from the project root: python server/export_public.py
This command never uploads files or changes the local content store.
"""
import copy
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def export_public(root=ROOT):
    root = Path(root).resolve()
    source = root / 'data/site.json'
    site = json.loads(source.read_text(encoding='utf-8-sig'))
    if site.get('schemaVersion') != 1 or not site.get('initialized'):
        raise ValueError('请先在本机完成资料保存，未导出空白或无效数据。')
    keys = ('schemaVersion', 'revision', 'initialized', 'profileRevision',
            'profile', 'news', 'updates', 'explore', 'blogAppearance', 'blogArticles')
    snapshot = {key: copy.deepcopy(site[key]) for key in keys if key in site}
    snapshot['updates'] = [x for x in snapshot.get('updates', [])
                           if x.get('status') == 'published']
    snapshot['blogArticles'] = [x for x in snapshot.get('blogArticles', [])
                                if x.get('status') == 'published']
    snapshot['canEdit'] = False
    assets = {}

    def rewrite(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == 'path' and isinstance(child, str):
                    if child.startswith('assets/uploads/'):
                        filename = child.removeprefix('assets/uploads/')
                        if not re.fullmatch(r'[a-f0-9]{64}\.(png|jpg|webp|pdf|bin)', filename):
                            raise ValueError('附件路径不合法，导出已停止。')
                        original = root / 'assets/uploads' / filename
                        if not original.is_file():
                            raise ValueError('展示内容引用了缺失附件，导出已停止。')
                        assets[filename] = original.read_bytes()
                        value[key] = 'assets/published/' + filename
                    elif child.startswith(('api/', '.local/')):
                        raise ValueError('展示内容引用了私有附件，导出已停止。')
                else:
                    rewrite(child)
        elif isinstance(value, list):
            for child in value:
                rewrite(child)

    rewrite(snapshot)
    # Read and validate every attachment before replacing the previous snapshot.
    output = root / 'public/data/site.published.json'
    target = root / 'public/assets/published'
    target.mkdir(parents=True, exist_ok=True)
    for filename, content in assets.items():
        (target / filename).write_bytes(content)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(output)
    for old in target.iterdir():
        if old.is_file() and old.name not in assets:
            old.unlink()
    print(f'公开快照已生成：News {len(snapshot.get("news", []))}，'
          f'Updates {len(snapshot["updates"])}，文章 {len(snapshot["blogArticles"])}，附件 {len(assets)}。')
    print('尚未上传；请检查差异后提交并推送 GitHub。草稿和备份未导出。')
    return snapshot


if __name__ == '__main__':
    export_public()
