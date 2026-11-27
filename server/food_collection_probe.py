"""One-shot, read-only collection check. Never writes public website data."""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

if __package__:
    from .food_shop_extraction import extract_shops
else:
    from food_shop_extraction import extract_shops


ROOT = Path(__file__).resolve().parents[1]
STOP_CODES = {"NEED_LOGIN", "PLATFORM_BLOCKED", "RATE_LIMITED", "BUSY"}


def invoke(executable, arguments):
    try:
        if arguments[0] == "read":
            runtime = Path(os.environ.get("UV_TOOL_DIR", str(Path(os.environ.get("APPDATA", "")) / "uv" / "tools"))) / "agent-reach"
            python = runtime / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
            if not python.is_file():
                return {"ok": False, "error": {"code": "NEED_SETUP", "message": "Agent Reach Python runtime not found; set UV_TOOL_DIR."}}
            command = [str(python), str(ROOT / "server" / "food_metadata_bridge.py"), arguments[1]]
        else:
            command = [executable, "xiaohongshu", *arguments, "--backend", "opencli", "--timeout", "90"]
        result = subprocess.run(
            command,
            capture_output=True, encoding="utf-8", errors="replace", timeout=150,
        )
        response = json.loads(result.stdout.strip())
        if not isinstance(response, dict):
            raise ValueError("Expected a JSON object")
        return response
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": {"code": "TIMEOUT", "message": "Local process exceeded 150 seconds."}}
    except (ValueError, OSError):
        # Do not expose arbitrary subprocess output, browser state or credentials.
        return {"ok": False, "error": {"code": "LOCAL_ERROR", "message": "Could not execute or parse Agent Reach JSON."}}


def timestamp(value):
    """Only accept plausible epoch seconds/milliseconds, never infer from note IDs."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        number = float(value)
        if number > 100_000_000_000:
            number /= 1000
        if not 1262304000 <= number <= time.time() + 86400:
            return None
        return datetime.fromtimestamp(number, timezone.utc).isoformat()
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def metric(value):
    """Preserve display text; missing values stay unknown and compact counts approximate."""
    raw = str(value).strip() if value is not None else None
    if not raw:
        return {"raw": raw, "value": None, "approximate": False}
    if raw in {"赞", "点赞", "收藏", "评论"}:
        return {"raw": raw, "value": 0, "approximate": False}
    match = re.fullmatch(r"([\d,]+(?:\.\d+)?)(万|亿|[kKwWmM])?(\+)?", raw)
    if not match:
        return {"raw": raw, "value": None, "approximate": False}
    unit = (match[2] or '').lower()
    multiplier = {'万': 10000, 'w': 10000, '亿': 100000000, 'k': 1000, 'm': 1000000}.get(unit, 1)
    return {"raw": raw, "value": int(float(match[1].replace(',', '')) * multiplier),
            "approximate": bool(unit or match[3])}


def collect(executable, query, limit, candidate_limit=None):
    candidate_limit = candidate_limit or limit
    report = {
        "task": "FOOD-COLLECT-003", "query": query,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "requested_count": limit, "scope": "independent local search and text reading",
        "ok": False, "items": [], "errors": [], "discarded": [],
        "candidate_limit": candidate_limit,
        "limits": ["Conservative text rules may miss or misclassify names. Comments are only the loaded subset, fetched when title/body lack usable shops. No image reading, date filtering, location verification, scheduling, server validation or publication."],
    }
    search = invoke(executable, ["search", query, "--limit", str(candidate_limit)])
    report["search_backend"] = search.get("backend")
    if not search.get("ok"):
        report["errors"].append(search.get("error") or {"code": "SEARCH_FAILED"})
        return report
    if search.get("backend") != "opencli" or not isinstance(search.get("items"), list):
        report["errors"].append({"code": "INVALID_RESULT", "message": "Expected independent browser search results."})
        return report
    seen = set()
    for candidate in search.get("items", [])[:candidate_limit]:
        if not isinstance(candidate, dict):
            continue
        url = candidate.get("url")
        if not url or url in seen:
            continue
        seen.add(url)
        response = invoke(executable, ["read", url])
        if not response.get("ok"):
            error = response.get("error") or {"code": "READ_FAILED"}
            report["errors"].append(error)
            if error.get("code") in STOP_CODES or error.get("code") == "TIMEOUT":
                break
            continue
        if response.get("backend") != "opencli" or not isinstance(response.get("items"), list):
            report["errors"].append({"code": "INVALID_RESULT", "message": "Expected independent browser note content."})
            break
        for item in response.get("items", []):
            if not isinstance(item, dict):
                continue
            title, body = item.get("title") or '', item.get("text") or ''
            if not isinstance(title, str) or not isinstance(body, str) or not (title.strip() or item.get('author')):
                report["errors"].append({"code": "INCOMPLETE_CONTENT", "message": "No identifiable note content."})
                continue
            shops = extract_shops(title, body, author=item.get('author'))
            comments_checked = False
            if not shops:
                comments_checked = True
                comments = invoke(executable, ['comments', url, '--limit', '20'])
                if not comments.get('ok'):
                    error = comments.get('error') or {'code': 'COMMENTS_FAILED'}
                    report['errors'].append(error)
                    if error.get('code') in STOP_CODES | {'TIMEOUT'}:
                        return report
                    report['discarded'].append({'url': url, 'title': title, 'reason': 'COMMENTS_UNAVAILABLE'})
                    break
                for comment in comments.get('items', []):
                    if isinstance(comment, dict):
                        extracted = extract_shops('', comment.get('text') or '', source='comment', author=comment.get('author'))
                        raw = comment.get('raw') or {}
                        for shop in extracted:
                            shop['comment_rank'] = raw.get('rank')
                            shop['is_reply'] = raw.get('is_reply')
                        shops.extend(extracted)
            if not shops:
                report['discarded'].append({'url': url, 'title': title, 'reason': 'NO_USABLE_SHOP_RECOMMENDATION', 'comments_checked': comments_checked})
                break
            report["items"].append({
                "shops": shops, "comments_checked": comments_checked,
                "title": title, "url": item.get("url") or url,
                "author": item.get("author"),
                "published_at": timestamp(item.get("published_time")),
                "updated_at": timestamp(item.get("updated_time")),
                "date_text": item.get("date_text"),
                "date_source": item.get("time_source"),
                "date_status": "known" if timestamp(item.get("published_time")) else "unknown",
                "likes": metric(item.get("likes")),
                "collects": metric(item.get("collects")),
                "comments": metric(item.get("comments")),
                "counts_source": item.get("counts_source"),
                "collected_at": datetime.now(timezone.utc).isoformat(),
                "text": body, "backend": response.get("backend"),
            })
            break
        if len(report["items"]) >= limit:
            break
    if len(report["items"]) < limit and not report["errors"]:
        report["errors"].append({"code": "INSUFFICIENT_NOTES", "message": "Fewer posts with usable shop recommendations than requested."})
    report["ok"] = len(report["items"]) >= limit and not report["errors"]
    report["metadata_summary"] = {
        "publication_dates": sum(item["published_at"] is not None for item in report["items"]),
        "complete_counts": sum(all(item[key]["value"] is not None for key in ("likes", "collects", "comments")) for item in report["items"]),
    }
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", default="北大附近美食")
    parser.add_argument("--limit", type=int, choices=range(1, 6), default=5)
    parser.add_argument("--candidates", type=int, choices=range(1, 21), default=10,
                        help="Maximum search results to inspect; stops after enough usable posts.")
    args = parser.parse_args()
    if args.candidates < args.limit:
        parser.error('--candidates must be at least --limit')
    executable = shutil.which("agent-reach")
    if not executable:
        print("Agent Reach is not installed or not on PATH.", file=sys.stderr)
        return 2
    started = time.monotonic()
    report = collect(executable, args.query, args.limit, args.candidates)
    report["elapsed_seconds"] = round(time.monotonic() - started, 2)
    destination = ROOT / ".local" / "food-collection" / "runs"
    destination.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    path = destination / (stamp + ".json")
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "ok": report["ok"], "count": len(report["items"]),
        "report": str(path), "errors": report["errors"],
        "metadata": report.get("metadata_summary", {}),
        "discarded_count": len(report['discarded']),
    }, ensure_ascii=False))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
