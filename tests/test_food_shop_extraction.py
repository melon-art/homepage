import unittest
from unittest.mock import patch

from server.food_shop_extraction import extract_shops
from server import food_collection_probe as probe


class FoodShopTests(unittest.TestCase):
    def test_caption_names_and_negative_dish_rejection(self):
        text = 'P1️⃣朱记乳鸽王：很好吃！ P2️⃣这家烙锅：不推荐 P3️⃣勺园牛肉粒：很好吃 P4️⃣泥靴：美味必点'
        shops = extract_shops('', text)
        self.assertEqual([s['name'] for s in shops], ['朱记乳鸽王', '泥靴'])

    def test_star_lists(self):
        shops = extract_shops('', 'P1～P4：欢喜Curry（⭐️⭐️⭐️⭐️⭐️） P5：刺森屋 外卖（⭐️⭐️⭐️⭐️）')
        self.assertEqual([s['name'] for s in shops], ['欢喜Curry', '刺森屋'])

    def test_question_tags_and_ambiguous_mentions_are_not_recommendations(self):
        for text in ['求推荐北大附近餐厅', '#北京美食 #北大探店', '这家真好吃', '朱记乳鸽王好吃吗？', '推荐一家附近的餐厅', '朱记乳鸽王不好吃', '朱记乳鸽王不太好吃', '牛肉粒很好吃', '推荐宫保鸡丁，很好吃']:
            self.assertEqual(extract_shops('', text), [], text)

    def test_comment_has_source_and_verbatim_evidence(self):
        shops = extract_shops('', '推荐柳真真烤肉，很好吃', 'comment', '测试评论者')
        self.assertEqual(shops[0]['name'], '柳真真烤肉')
        self.assertEqual(shops[0]['source'], 'comment')
        self.assertEqual(shops[0]['author'], '测试评论者')

    def test_title_recommendation(self):
        self.assertEqual(extract_shops('推荐泥靴', '今天又去了')[0]['source'], 'title')
        self.assertEqual(extract_shops('', '推荐阿嬷的手作，很好吃')[0]['name'], '阿嬷的手作')

    def test_live_comment_false_positives_and_location_prefix(self):
        for text in ['北京大学美食推荐收好，北京美食攻略码住', '看着好好吃呀', '美食推荐先收藏', '分享北京nb好吃的平价二人食', '陈潮昇顺德干蒸（好像是叫这个） 一楼一火锅 这两个好吃 推荐']:
            self.assertEqual(extract_shops('', text), [], text)
        shops = extract_shops('', '大融城的牛满盛潮汕牛肉火锅不错', 'comment')
        self.assertEqual(shops[0]['name'], '牛满盛潮汕牛肉火锅')

    def test_comments_rescue_post_and_empty_posts_are_discarded(self):
        with patch.object(probe, 'invoke', side_effect=[
            {'ok': True, 'backend': 'opencli', 'items': [{'url': 'a'}, {'url': 'b'}]},
            {'ok': True, 'backend': 'opencli', 'items': [{'title': '求推荐', 'text': ''}]},
            {'ok': True, 'items': [{'author': '评论者', 'text': '推荐朱记乳鸽王，很好吃'}]},
            {'ok': True, 'backend': 'opencli', 'items': [{'title': '随手拍', 'text': '#北京美食'}]},
            {'ok': True, 'items': [{'text': '蹲蹲'}]},
        ]):
            report = probe.collect('unused', 'test', 2)
        self.assertEqual(len(report['items']), 1)
        self.assertEqual(report['items'][0]['shops'][0]['source'], 'comment')
        self.assertEqual(report['discarded'][0]['reason'], 'NO_USABLE_SHOP_RECOMMENDATION')
        self.assertFalse(report['ok'])

    def test_comment_platform_block_stops_remaining_reads(self):
        with patch.object(probe, 'invoke', side_effect=[
            {'ok': True, 'backend': 'opencli', 'items': [{'url': 'a'}, {'url': 'b'}]},
            {'ok': True, 'backend': 'opencli', 'items': [{'title': 'test', 'text': '求推荐'}]},
            {'ok': False, 'error': {'code': 'PLATFORM_BLOCKED'}},
        ]) as call:
            report = probe.collect('unused', 'test', 2)
        self.assertEqual(call.call_count, 3)
        self.assertEqual(report['errors'][0]['code'], 'PLATFORM_BLOCKED')


if __name__ == '__main__':
    unittest.main()
