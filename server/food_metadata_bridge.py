"""Run with Agent Reach's Python; reuse its browser binding and query limits."""
import json
import sys

from agent_reach.backends.opencli import opencli_call
from agent_reach.runtime.browser_binding import query_slot
from agent_reach.runtime.result import ReachError


def main():
    try:
        with query_slot('xiaohongshu'):
            rows = opencli_call('xiaohongshu', ['food-metadata', sys.argv[1]], timeout=90)
        if isinstance(rows, dict):
            rows = rows.get('data', rows.get('items', []))
        items = [dict(row, text=row.get('content')) for row in rows]
        print(json.dumps({'ok': True, 'backend': 'opencli', 'items': items}, ensure_ascii=False))
    except ReachError as error:
        print(json.dumps({'ok': False, 'error': {'code': error.code, 'message': error.message}}))


if __name__ == '__main__':
    main()
