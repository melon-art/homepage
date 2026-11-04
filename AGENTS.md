# 开发约定

适用范围：本仓库全部文件。首页、设置和News／Updates仍为原生静态页面；探索广场是局部React／Framer Motion模块，在explore/内构建，不能据此迁移整个站点。本地文件保存由 Python 标准库 tools/server.py 与共享 file-store.js 提供。所有工作先确认范围，保持现有业务行为。

## 开始新任务前

1. 先读 [PROJECT.md](docs/PROJECT.md) 和 [TASKS.md](docs/TASKS.md)，再读 [ROADMAP.md](docs/ROADMAP.md) 的当前阶段和 [CHANGELOG.md](docs/CHANGELOG.md) 的最近记录。按任务读取相关段落，避免无目的全量重读。
2. UI 任务再读完整 [DESIGN.md](docs/DESIGN.md) 与相关需求。需求、计划和历史评审都不是功能完成证据。
3. 检查 Git 状态，定位真实实现。本仓库根 `index.html`、`settings.html`、`profile.js`、`about.js`、`news-edit.html`、`news.html`、`news.js`、`news.css`、`updates.js`、`updates-view.js`、`updates-store.js`、`updates.css`、`updates-edit.html`、`updates-manage.html`、`updates-editor.js`、`updates-editor.css`、`site-pages.js` 是业务源；仓库外的独立预览副本、截图与临时脚本不作为实现依据。
4. 探索广场业务源为explore/src/main.jsx、explore/style.css、explore/header.css与explore/build.mjs；explore.html及三个子页HTML、explore/app.js由构建生成，修改源后在explore内执行npm run build。不要只改打包产物，也不回到仓库外预览修改正式功能。
5. 明确本次任务 ID、范围与完成标准。已有用户决定无需重复询问；遇到会改变结果的未知事实，记入 TASKS 的“待确认”，不要猜测。

## 实现和范围控制

- 不随意重写、删除或重构已有功能。用能完成需求的最小改动；架构、框架或数据结构迁移需另行确认范围。
- 保留 CONTACTS 六个键、复制与空值／失败恢复逻辑；没有真实资料不复制占位文案。
- 顶部六个栏目顺序为 Home、研究方向、课程作业、个人生活、获奖、探索广场，设置入口继续保留在其后；未有真实页面的入口继续明确待更新，不能挂上无效链接。个人生活／探索广场沿用 hobbies／activities 内部 ID，兼容已有 Updates 草稿。
- 探索广场activities已指向explore.html，首页导航与Updates共用site-pages.js目录。美食地图、瓜瓣READ、概念集仍为内容待添加页，不把空内容页登记为已完成内容或Updates目标；保留18卡圆周、旋转吸附、抽出与两侧让位、底部描述及减少动态。站内链接使用相对路径，不写死本机端口；读取现有英文名不写回个人资料。
- 设置页支持主页除 News 外的资料、About 全文、六类联系方式、照片和 PDF 简历编辑。资料／News／展示中的Updates通过file-store.js保存到data/site.json，附件在assets/uploads；Updates草稿／草稿附件与备份在.local并被Git忽略。本地data/site.json、assets/uploads和.local均Git忽略，仓库只包含空白site.example.json；不自动上传内容或向公网发布；只允许电脑回环地址编辑，局域网设备只读。旧浏览器数据库仅显式迁移读取，不清空或继续写入内容；不得自动用空白文件覆盖旧内容。使用start-local.cmd或python tools/server.py启动，禁止用普通http.server替代文件编辑服务。
- About 全文由用户填写，不按姓名、学历或研究字段拼接；保留已有 introduction 文本，News 由独立编辑页负责。About 加粗／颜色以 introductionRuns 结构化片段保存，渲染仅创建文字、strong／span 与经过校验的颜色，不直接插入用户 HTML。展开／收起只影响首页展示，不得把截断后的预览写回资料；短内容直接完整显示。
- 不编造姓名、学历、论文、奖项、动态、联系方式或线上部署地址。保留“待资料／待确认”状态。
- 维持白底、暖金色、衬线标题和参考图风格；无页脚，不自动恢复已删除的 Research Interests 独立面板。简历按钮与照片同宽，gold-soft 底、gold 字。
- PDF 缺失时简历继续禁用；本地选择 PDF 后可下载，不等于真实简历已公开。个人资料附件限照片 1 MB、PDF 2 MB，超限／存储失败必须明确提示并保留已保存资料。
- News 在独立 news-edit.html 新增／编辑，不并入设置页；编辑使用 id 查询参数，保留原 id、createdAt 及未改附件，缺失／过期记录不得覆盖或复活。删除需确认、事务成功再移除，触屏／键盘也可达；日期与纯文本正文必填，不增加标题。可选一张图片（JPG／PNG／WebP≤5 MB）和一个文件（≤10 MB），News在site.json的news集合与个人资料分离，附件独立落盘。首页只展示日期倒序的最新三条，View All 进入 news.html 展示全部；两页共享 news.css／news.js，不删除隐藏记录。左文右图、附件仅下载；不把本机保存解释为公开发布。
- Updates 与 News 分离，通过共享文件服务按 id 保存草稿／展示状态、日期、正文、目标与图片；顶部导航和编辑器必须共用 site-pages.js 页面目录，不生成未建立页面的有效入口。草稿不出现在主页，保存并展示须有效目标；没有真实记录保持“暂无更新”，不恢复示例。保留6:4、日期轴、立体预览、悬停抬高与日期下方同日小编号；日期轴／编号滚轮逐条浏览当天后平滑进入相邻自然日并保留空日占位；预览普通滚轮在节流／边界／占位时也必须阻止页面滚动，不恢复“当天更新”下拉框；保存／删除须核对版本，不覆盖新版本或复活已删记录。以电脑项目文件为准，不自动收集其他栏目变化或公开发布；草稿和备份不得暴露给局域网访客。
- 探索卡牌管理通过explore-manage.html／explore-edit.html，固定三个板块ID与路由，只编辑标题24字、介绍160字、单图≤5 MB；保存到site.json.explore。缺字段兼容默认配置，空数组必须保持删除态，禁止重新种入默认。删除移除整类重复卡面，保留页面文件，剩余仍填充18卡；保留光效／手机／减少动态，版本冲突不可覆盖或复活。图片纳入完整ZIP，不修改用户真实卡牌做测试。
- 纯文档任务仅修改 Markdown；不得顺带调整业务代码、配置或视觉参数。

## 验证与完成状态

- 不得将未经测试的功能标记“已完成”。已有实现但尚未验证写“实现待验证”；缺资料写“待资料”；无法确定写“待确认”。
- 验证与改动匹配：文档任务检查文件、链接、内容和业务文件未改动；局部 UI 草稿只检查受影响的桌面／手机布局；交互任务再覆盖相应状态和失败路径。
- 用户已要求草稿阶段减少重复检查和 token 消耗。优先一次合并检查，不自动运行多轮评审、完整审计或多代理；最终交付前按用户要求安排全面验收。
- 测试记录写明日期、代码基线、范围、结果和限制；模拟数据通过不能写成真实资料或真实线上服务已经通过。
- 不把 Git 提交／推送、首页按钮、样式代码或占位页，解释为栏目已实现、简历可下载或站点已上线。

## 开发完成后

1. 复查差异，排除无关业务变化，保留用户未提交的工作。
2. 及时更新 TASKS 的实际状态和验证依据、CHANGELOG 的实际变化；需要时同步 PROJECT、ROADMAP 和 DESIGN。任务没做完就保留进行中／待验证，不为整齐勾选。
3. 说明做了什么、如何验证、还有什么未确定。不能仅凭旧截图或过期评审给当前代码背书。
4. 提交时准确说明范围。仅在用户已有授权范围内推送；部署与外部发布不是文档整理的附带步骤。

## 文档职责与兼容入口

- `docs/PROJECT.md` 是现行项目事实，`docs/TASKS.md` 是完成状态与证据，`docs/ROADMAP.md` 是建议计划，`docs/CHANGELOG.md` 是已发生变更。
- `docs/DESIGN.md` 是完整设计规范；根 `DESIGN.md` 只保留同步的 frontmatter 和入口，供 Impeccable 默认路径读取。视觉参数变化时同步它们与 `.impeccable/design.json`；普通文案／文档修改不重建侧车。
- 根 `PRODUCT.md` 是产品上下文兼容摘要，事实边界以 docs/PROJECT 与代码核对；根 `requirements.md` 指向 docs 内的原需求。
- `docs/archive/` 和 `.impeccable/critique/` 属历史记录，不充当当前完成状态。遇冲突，标记差异、说明依据、确认后再更新，不擅自“修正”为想当然的状态。
