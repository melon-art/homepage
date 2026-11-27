"""Conservative text rules. Returned names are verbatim spans, not verified businesses."""
import re

POSITIVE = re.compile(r'推荐|好吃|美味|必点|必吃|不错|顶级|性价比|夯|喜欢|值得|可以试|可以去')
NEGATIVE = re.compile(r'不推荐|不值得|难吃|不(?:太|怎么|是很|算)?好吃|别去|避雷|踩雷|倒闭|关门|一般般|差评')
VAGUE = re.compile(r'这家|那家|一家|某家|什么|附近|周边|校内|食堂|饭堂|牛肉粒|年糕|宫保鸡丁|红烧肉|糖醋里脊|蛋炒饭|店名|地址|人均|求推荐|求一个|可以推荐|有没有|哪里|哪家|谁知道|的都是|连锁店|馆子')
PROSE = re.compile(r'真的|觉得|感觉|因为|所以|但是|很好吃|好吃|不错|推荐|不必多说|去了|吃了|适合|位于|在清河|是我|就是|大家|一定|你们|看着|看起来|看上去|收好|收藏|码住|好像|不确定')
MARKER = re.compile(r'(?<![A-Za-z])P\s*\d+(?:[～~—-]\s*P?\d+)?\s*', re.I)
BUSINESS_END = re.compile(r'(?:烤肉|火锅|乳鸽王|螺蛳粉|螺狮粉|水饺|餐厅|咖啡馆|面馆|荟|屋|轩|斋|坊|堂|居|阁|先生)$')


def valid_name(name):
    return (2 <= len(name) <= 24 and re.search(r'[\u4e00-\u9fffA-Za-z]', name)
            and name not in {'餐厅', '饭店', '烤肉', '火锅', '咖啡', '水饺', '螺蛳粉', '螺狮粉'}
            and not VAGUE.search(name) and not PROSE.search(name)
            and not re.search(r'[。！？?！：:]', name))


def extract_shops(title, text, source='body', author=None):
    """Require an explicit name span plus local positive evidence; skip uncertain cases."""
    original = text or ''
    cleaned = re.sub(r'#[^\s#]+', '', original).replace('\ufe0f', '').replace('\u20e3', '')
    found = extract_shops('', title, 'title', author) if title else []

    def add(name, evidence, rule):
        name = name.strip(' \t\n：:·-「」“”"')
        name = re.sub(r'\s+(?:外卖|at.*)$', '', name).strip()
        if VAGUE.search(name):
            return
        name = re.sub(r'^.{1,12}(?:城|路|街|口|区|旁边)的', '', name)
        # Avoid outputting a transformed or invented name.
        if not valid_name(name) or name not in original or NEGATIVE.search(evidence.replace('不踩雷', '')):
            return
        stars = evidence.count('⭐') + evidence.count('★')
        if 0 < stars < 3:
            return
        if not POSITIVE.search(evidence) and stars < 3:
            return
        if '?' in evidence or '？' in evidence or re.search(r'求.*推荐|有没有|怎么样|好吃吗', evidence):
            return
        if re.search(r'好像.*叫|不确定.*名|忘了.*名', evidence):
            return
        if any(row['name'].casefold() == name.casefold() for row in found):
            return
        found.append({'name': name, 'evidence': evidence.strip(), 'source': source,
                      'author': author, 'rule': rule, 'verification': 'text_only'})

    # Caption lists give a named entity boundary, including brands without a food suffix.
    markers = list(MARKER.finditer(cleaned))
    for index, marker in enumerate(markers):
        segment = cleaned[marker.end():markers[index + 1].start() if index + 1 < len(markers) else len(cleaned)].strip().lstrip('：: ')
        match = re.match(r'([^：:，,。\n（(]+)[：:（(]', segment)
        if match:
            add(match[1], segment, 'caption_list')

    # Explicit labels and direct recommendations work for ordinary prose/comments.
    for sentence in re.split(r'[。！!\n；;]', cleaned):
        sentence = sentence.strip()
        for match in re.finditer(r'(?:^|[，,：:\s])(?:店名|店铺|餐厅|推荐|强推)[：:\s「“]*(?:去|吃)?([^，,：:（）()「」“”]+)', sentence):
            name = re.split(r'\s|超好吃|很好吃|好吃|不错|值得|必吃', match[1].strip())[0]
            add(name, sentence, 'explicit_recommendation')
        match = re.match(r'^([\u4e00-\u9fffA-Za-z·]{2,24}?)(?:超好吃|很好吃|好吃|不错|值得一试)', sentence)
        if match and BUSINESS_END.search(match[1]):
            add(match[1], sentence, 'direct_positive_statement')
        # e.g. “柳真真烤肉很好吃”; no cross-comment/coreference guesses.
        for match in re.finditer(r'(?:^|[，,：:\s「“])([\u4e00-\u9fffA-Za-z][\u4e00-\u9fffA-Za-z·]{1,18}?(?:烤肉|火锅|乳鸽王|螺蛳粉|螺狮粉|水饺|餐厅|咖啡馆|面馆))(?=很|真|超|不|好|值得|必|[，,。\s」”]|$)', sentence):
            add(match[1], sentence, 'food_business_suffix')
    return found
