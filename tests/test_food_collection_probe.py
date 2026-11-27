"""Local failure checks; these do not prove live Xiaohongshu access."""

import unittest
from unittest.mock import patch

from server import food_collection_probe as probe


class CollectionProbeTests(unittest.TestCase):
    def test_count_precision_and_unknown(self):
        self.assertEqual(probe.metric('1.2万'), {'raw': '1.2万', 'value': 12000, 'approximate': True})
        self.assertEqual(probe.metric('109')['value'], 109)
        self.assertIsNone(probe.metric(None)['value'])
        self.assertEqual(probe.metric('赞')['value'], 0)

    def test_publication_and_edit_are_separate(self):
        with patch.object(probe, 'invoke', side_effect=[
            {'ok': True, 'backend': 'opencli', 'items': [{'url': 'a'}]},
            {'ok': True, 'backend': 'opencli', 'items': [{
                'title': 'title', 'text': '推荐朱记乳鸽王，很好吃', 'published_time': 1787829705000,
                'updated_time': 1787920603000, 'date_text': '编辑于 08-28', 'likes': '109',
            }]},
        ]):
            item = probe.collect('unused', 'test', 1)['items'][0]
        self.assertNotEqual(item['published_at'], item['updated_at'])
        self.assertTrue(item['published_at'].startswith('2026-08-27'))
        self.assertEqual(item['likes']['value'], 109)

    def test_edit_label_does_not_become_publication_date(self):
        with patch.object(probe, 'invoke', side_effect=[
            {'ok': True, 'backend': 'opencli', 'items': [{'url': 'a'}]},
            {'ok': True, 'backend': 'opencli', 'items': [{
                'title': 'title', 'text': '推荐朱记乳鸽王，很好吃', 'date_text': '编辑于 昨天',
                'updated_time': 1787920603000,
            }]},
        ]):
            item = probe.collect('unused', 'test', 1)['items'][0]
        self.assertIsNone(item['published_at'])
        self.assertEqual(item['date_status'], 'unknown')
        self.assertIsNone(probe.timestamp('08-28'))
        self.assertIsNone(probe.timestamp(True))

    def test_login_requirement_stops_without_reading(self):
        with patch.object(probe, "invoke", return_value={
            "ok": False, "error": {"code": "NEED_LOGIN"},
        }) as call:
            report = probe.collect("unused", "test", 5)
        self.assertFalse(report["ok"])
        self.assertEqual(call.call_count, 1)

    def test_verification_requirement_stops_remaining_reads(self):
        with patch.object(probe, "invoke", side_effect=[
            {"ok": True, "backend": "opencli", "items": [{"url": "a"}, {"url": "b"}]},
            {"ok": False, "error": {"code": "PLATFORM_BLOCKED"}},
        ]) as call:
            report = probe.collect("unused", "test", 2)
        self.assertFalse(report["ok"])
        self.assertEqual(call.call_count, 2)

    def test_public_summary_does_not_pass_independent_browser_check(self):
        with patch.object(probe, "invoke", return_value={
            "ok": True, "backend": "public-web", "items": [{"url": "a"}],
        }):
            report = probe.collect("unused", "test", 1)
        self.assertFalse(report["ok"])
        self.assertEqual(report["errors"][0]["code"], "INVALID_RESULT")

    def test_missing_description_without_useful_comments_cannot_pass(self):
        with patch.object(probe, "invoke", side_effect=[
            {"ok": True, "backend": "opencli", "items": [{"url": "a"}]},
            {"ok": True, "backend": "opencli", "items": [{"title": "title", "text": ""}]},
            {"ok": True, "backend": "opencli", "items": []},
        ]):
            report = probe.collect("unused", "test", 1)
        self.assertFalse(report["ok"])
        self.assertEqual(report["errors"][0]["code"], "INSUFFICIENT_NOTES")


if __name__ == "__main__":
    unittest.main()
