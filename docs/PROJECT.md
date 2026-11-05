# 项目总览

核对日期：2026-11-05（Asia/Shanghai）。文档整理基线：`ab371b8`；EDIT-001 建立本机编辑；EDIT-002 扩展主页除 News 外的所有待填字段；EDIT-004 在 `39cae46` 后将 About 改为全文自由填写。

## 定位与当前阶段

这是个人学术主页，面向希望了解站点主人基本情况、研究兴趣、课程与个人活动的访问者。当前阶段为**静态首页草稿，基础界面与交互已实现，真实内容尚未补齐；线上发布状态待确认**。

首页包含个人资料栏、About、News 和 Updates；顶部栏目顺序为 Home、研究方向、课程作业、个人生活、获奖、探索广场，其后保留设置入口。探索广场门户已接入，其余四个栏目仍待建立；三个探索子板块仍待真实内容。个人生活／探索广场沿用 hobbies／activities 内部 ID，保留已有 Updates 草稿关联。提供电脑本机使用的文件编辑服务，尚无账号系统或公网管理后台。页面语言当前为中文资料与少量英文栏目名，最终语言待确认。

探索广场已正式接入[explore.html](../public/explore.html)：美食地图、瓜瓣READ、概念集重复排列为18张卡，覆盖完整圆周；支持连续旋转、悬停抽出与两侧让位、选中描述、点击进入各自的内容待添加页。EXPLORE背景字调浅为oklch(91% .006 88)，保持最终确认的宽度、位置及3/4字高。门户通过site-pages.js同时接入顶部导航和Updates目标目录；子页不登记为已完成内容或Updates目标。React／Framer Motion仅用于此局部模块，首页与编辑功能保持原实现；源码与构建见src/explore/，验证见TASKS E41。仓库外预览保留为历史稿。

## 技术栈与运行方式

探索转盘当前全部卡牌共享浅银灰金属工牌与增强镭射／高光，各自保留名称、介绍和站内目标；默认九张本地卡面图仅为临时页面设计示意，可在设置中替换，未实现对应内容页功能。共享组件为src/explore/main.jsx内SectionBadge，验证见TASKS E44。

| 项目 | 当前真实实现 |
| --- | --- |
| 页面 | `public/explore-manage.html` 设置内探索广场管理、`public/explore-edit.html` 卡牌编辑；`public/index.html` 首页、`public/settings.html` 设置页、`public/news-edit.html` 独立 News 新增／编辑页、`public/news.html` 全部新闻页、`public/updates-edit.html` 更新编辑页、`public/updates-manage.html` 更新管理页，原生 HTML |
| 样式 | 页面内嵌 CSS 与共享 news.css、首页与编辑预览共享 updates.css、更新编辑／管理共享 updates-editor.css、自定义属性、Grid／Flex 和媒体查询 |
| 交互 | 首页保留原内联交互；共享 `public/assets/js/profile.js` 管理资料、联系信息及本地附件的读取、保存和同步；`public/assets/js/about.js` 处理 About 格式编辑、安全渲染与首页收起／展开 |
| 图标、字体 | 内联描边 SVG、本地字体栈，无图标包或网络字体依赖 |
| 数据 | `data/site.json` 保存资料、News、展示中的 Updates 和 `explore` 卡牌集合；附件独立保存至 `assets/uploads/`；草稿和自动备份在 Git 忽略的 `.local/`；旧 localStorage／IndexedDB 只用于用户主动迁移，不再写入内容；实际site.json、上传附件和.local被Git忽略，仓库只提供空白public/data/site.example.json |
| 构建和依赖 | 首页／编辑页无需构建；探索模块独立使用src/explore/package.json（React19.2.0、Framer Motion12.23.24、esbuild0.25.12），构建产物已保存，浏览时无需安装依赖 |
| 服务端 | Python 标准库 `server/server.py` 提供文件读写 API 和静态页面；仅电脑回环地址可写，局域网手机只读；无数据库、登录或 GitHub 上传 |
| 版本管理 | Git，分支 `main`，已配置 GitHub 远程 `melon-art/homepage` |
| 部署 | 仓库内未发现部署配置、工作流或线上地址记录；是否已有站外托管待确认 |

双击根目录 `start-local.cmd`，或在仓库根目录运行（网页文件现位于 public/，网址不变）：

```text
python server/server.py --port 8765
```

电脑编辑地址保持 `http://127.0.0.1:8765/`。服务默认监听所有网卡，手机连接同一网络后可用电脑 IPv4 地址只读预览；手机实际网络连通性取决于防火墙和当前网络。文件编辑需要 Python 3.9+，无需安装第三方包；普通 `python -m http.server` 只能读取已保存的公开内容，不能保存。不再支持直接 `file://` 编辑。首次在原浏览器／原地址打开设置，主动迁移旧内容；迁移不会删除旧数据。详细步骤见 [STORAGE.md](STORAGE.md)。

## 目录与职责

2026-11-05，ENG-003：页面迁入 public/，原生脚本／样式分组，探索源码迁入 src/explore/，服务与测试分开。服务将 public/ 映射为网站根目录，现有浏览器地址、站内目标ID和内容路径保持不变；本次不改页面设计和数据结构。根 DESIGN／PRODUCT 是工具约定入口，因此保留。历史任务记录中的旧路径按当时目录理解。

```text
academic-homepage/
├── public/                     网站目录，服务将此目录映射到原网址
│   ├── index.html              首页
│   ├── settings.html           基本信息设置
│   ├── news*.html              新闻列表与编辑页
│   ├── updates-*.html          更新管理与编辑页
│   ├── explore*.html           探索门户、管理与编辑页
│   ├── food-map.html / guaban-read.html / concepts.html
│   ├── assets/js/              原生脚本：资料、About、News、Updates、存储及导航
│   ├── assets/css/             原生页面共用样式
│   ├── explore/                自动构建的JS／CSS与默认卡面图片
│   └── data/                   空白模板与探索默认配置，不含个人填写内容
├── src/explore/                React／Framer Motion源码、样式、构建配置与模块说明
├── server/                     Python本地文件服务
├── tests/                      存储、接口和静态资源边界检查
├── docs/                       项目、路线、任务、变更、设计、存储与需求文档
├── data/site.json              电脑本地内容，Git忽略，原位置不变
├── assets/uploads/             电脑本地上传文件，Git忽略，原位置不变
├── .local/                     电脑本地草稿、备份与日志，Git忽略
├── .impeccable/                设计工具元数据与历史评审
├── start-local.cmd             双击启动，仍使用8765端口
├── README.md                   启动与目录入口
├── AGENTS.md                   开发约定
└── DESIGN.md / PRODUCT.md      设计工具需要的根目录兼容摘要
```

`.impeccable/review/` 在当前工作区有历史截图，已被 Git 忽略，克隆仓库后不保证存在。工作区外的独立 HTML 预览副本、临时测试脚本与截图不是仓库的业务源或可移植测试套件。

## 页面与逻辑组件

以下是原生页面中的逻辑分区，`public/assets/js/profile.js` 为两页共享的原生脚本。探索广场独立使用 React 组件，局部边界见 explore/，不改变首页与编辑页架构。

| 分区／选择器 | 当前内容与行为 |
| --- | --- |
| `header`、`.wordmark` | 英文名可编辑，默认占位；点击跳至 About 标题 |
| `.home-menu`、`.home-trigger` | 顶部 Home 悬停下拉；About 跳转 index.html，News 跳转 news.html，移出关闭；支持键盘与触屏 |
| `.settings-link` | 主页右上角“设置”，跳转设置页 |
| `#profile-form` | 个人资料、About、联系方式、简历四组；保存后返回主页 |
| `.nav-item` | 探索广场通过共用目录启用explore.html；其余四个待开发栏目仅提示待更新 |
| `.profile`、`.portrait` | 资料文字和照片占位；可显示本机保存的图片，仓库没有真实照片 |
| `.contacts` | 六个横排图标；名称提示、点击复制及空数据反馈 |
| `.cv-area`、`.cv-button` | 浅金底、金色字、与照片同宽；无 PDF 时 `disabled`；有本机 PDF 时启用并下载该文件 |
| `.about-block` | 用户填写的 About 全文，保留换行／加粗／文字颜色；与 News 同宽，长内容默认收起、段末展开／收起，未填写时明确占位 |
| `.news`、`.news-list` | 通过 file-store.js 从本地文件加载，日期倒序；主页 data-news-limit=3 仅显示最新三条，news.html 展示全部；每条日期与正文，无标题，可选右侧缩略图及文件下载 |
| `.updates`、`.depth-stage` | About 下方与 News 按 6:4 排列，1100px 以下上下排列；连续日期轴、前后景预览、悬停抬高、点击图片跳转；当前无可展示记录时显示“暂无更新”；加号新增，“管理”可查看草稿 |
| `.news-view-all` | 主页 News 标题栏右侧 View All →，左到右金色下划线，跳至 news.html |
| `.news-add`、`public/news-edit.html` | 加号新增；每条悬停／聚焦显示编辑、删除，触屏常显；编辑以 id 参数复用同一表单、预填原记录，保存成功返回首页 News |
| `.toast` | 普通复制反馈，礼貌播报，约 2.6 秒收起 |
| `.copy-recovery` | 自动复制失败时显示可选择的只读文本；关闭／Escape 后恢复焦点 |

首页和编辑页的宽屏容器统一最大 1480px、每侧至少 48px 留白；桌面左栏 320px。顶部七个导航（含设置）等距排布。Research Interests 独立模块已删除；没有页脚。保留这些用户决定，不自动恢复。

## 数据与交互流

`CONTACTS` 的键固定为 `phone`、`email`、`wechat`、`instagram`、`xiaohongshu`、`bilibili`，源文件默认值全部为空字符串；文件保存值在页面加载后填入同名键。社交图标目前**复制账号或链接，不打开平台页面**，也没有微信二维码功能。

```text
点击联系图标
  → 按 data-contact 读取 CONTACTS
  → 空值：提示待提供，不复制占位文案
  → 有值：优先 Clipboard API，再尝试临时 textarea 兼容复制
  → 成功：显示反馈
  → 两种方式均失败：显示持续保留的手动复制面板
```

`notify()` 管理联系提示，`copyText()` 与 `closeRecovery()` 保留原行为。`public/assets/js/profile.js` 通过 `SiteStorage` 异步读取／提交完整资料；设置表单提交后返回主页，更新英文名、左栏、About、六类联系信息和简历状态。保存核对 `profileRevision`，旧页面不能覆盖新资料。照片 JPG／PNG／WebP≤1 MB、PDF≤2 MB，表单保留原附件预览和移除行为；文件落地后 JSON 仅保存 `{name,path,type,size}` 引用。

About 全文由用户填写，最多 10000 字符，保留换行。`introduction` 为纯文本，`introductionRuns` 为 `{text,bold,color}` 结构化片段；只接受十六进制颜色，不保存用户 HTML，不直接拼接 HTML 渲染。空内容仍显示占位；校验、网络或磁盘失败时保留当前输入。主页重新显示／重新可见时读取最新文件。旧浏览器 `academic-homepage.profile.v1` 与两个 IndexedDB 的 entries 只用于显式迁移；迁移前先在 `.local/backups/` 保存含附件的原始快照，迁移后旧数据库不删除。用户真实内容是否迁移以设置页状态为准，模拟测试不能证明已迁移。

所有设备读取同一电脑文件；电脑服务停止时无法访问，清除浏览器数据不会删除已迁移文件。手机局域网地址只读，不能读取 Updates 草稿、备份或写入接口。静态托管可读取 `data/site.json` 与公开附件，不能运行 Python 写入接口；公网发布和 GitHub 上传没有自动执行。

## About 收起与展开

`AboutContent.createDisclosure()` 在个人资料渲染后接收完整正文及格式片段。长正文默认收起，双栏时预览容器底部按照片实际底边计算，手机单栏时显示六行；底部 72px（最多预览高度 45%）覆盖向白色渐隐，文字按钮保持清晰。预览在字素边界按实际高度截断，保留可见文字的粗体／颜色，末尾同行“...展开”；展开时移除限高与渐隐，完整文字末尾同行“收起”。按钮支持鼠标和原生 Enter／Space 键盘激活，具有 aria-expanded／aria-controls，切换后保留焦点。

News 保持文档流，随 About 高度自然上下移动，不预留展开高度。切换不写存储，全文与格式片段始终保留；短文本直接完整显示，无渐隐、开关或固定高度。视窗、字体或照片尺寸变化后重新计算；手机六行规则不使用上方照片的页面坐标。交互不增加高度动画，减少动态设置仍正常工作。

## News 数据与附件

`public/assets/js/news.js` 通过共享 `public/assets/js/file-store.js` 读取 `data/site.json` 的 news 列表。每条保留 `{id,date,body,createdAt,updatedAt,image,file}`，无标题；附件在文件中保存引用，读取后转换为 Blob 供原列表／表单使用。日期有效、正文纯文本≤2000字；图片 JPG／PNG／WebP≤5 MB，文件≤10 MB。图片仍左文右图，附件以原文件名下载，编辑时保留未改附件。

首页仅显示最新三条，news.html 全量展示；列表数量限制不删除文件记录。新增／编辑保存成功才返回，`from=news` 保留原返回列表行为。服务端核对原 `updatedAt`，拒绝覆盖新版本或复活已删记录；删除需原确认、成功后才移除。错误保留表单和已存记录。BroadcastChannel／修订通知、pageshow／重新可见继续刷新列表。没有后台登录或自动公网发布。

## Updates 数据与边界

site-pages.js 是顶部导航和更新跳转的共用页面目录，登记板块、真实页面与可选锚点。当前 Home 的 About／News 与探索广场门户有真实目标，其余四个栏目明确待建立；探索三个空内容子页不登记为 Updates 目标。添加真实内容后登记目录才能启用。Updates 保存 pageId／anchorId，不允许直接填写任意 URL；首页点击中心图在当前标签页进入同一页面，编辑页测试跳转使用新标签页。

updates-store.js 通过 file-store.js 使用本地文件，每条为 {id,date,sectionId,pageId,anchorId,body,imageAlt,image,status,createdAt,updatedAt}；文件中的图片为 {name,path,type,size} 引用，前端转换为 {name,blob}，保留现有组件接口。独立 id 支持同日多条，日期降序、同日创建时间降序；日期轴每个日期一个位置，当天多条在日期轴下方显示1、2、3小编号，点击或滚轮切换，默认最新一条为1。日期轴及编号滚轮先遍历当天条目，再平滑进入相邻自然日，空日保留原占位；预览区域滚轮不带动外页，包括节流中与内容边界。draft 不出现在主页；published 仅表示本机主页展示，需有效目标与正文，不表示公网发布。

独立 updates-edit.html 左表单、右实时预览，支持日期（1900—2100年）、板块、纯文本正文≤500字、真实页面／登记锚点、一张 JPG／PNG／WebP≤5 MB、图片说明≤160字。图片解码通过后接收，保留原附件或明确移除；无图用文字预览。目标未建立时可存草稿；保存草稿留在编辑页，保存并展示成功返回主页并选中新记录。updates-manage.html 显示全部本机记录与草稿，编辑复用同页，删除需确认。

展示中的 Updates 存入 `data/site.json`；草稿存入 `.local/drafts.json`，草稿图片在 `.local/uploads/`，不返回给手机或静态访客。保存／删除核对版本，失败保留输入。每次有效修改前自动备份旧 JSON；先写临时文件再原子替换，并用事务日志恢复跨公开／草稿文件的中断。一个项目只允许一个写入进程。支持设置页下载完整 ZIP（含公开内容、草稿和引用附件），不自动执行 Git；尚无栏目自动记录、云端同步或公网编辑。文件模式与普通静态预览不允许保存。

## 探索卡牌管理（EXPLORE-005）

设置侧栏的“探索广场”进入explore-manage.html，按板块而非18张重复卡牌列出标题／介绍／配图及编辑、删除；点击编辑进入explore-edit.html?id=固定ID。标题≤24字、介绍≤160字且必填，可上传单张JPG／PNG／WebP≤5 MB或恢复默认图。保存返回管理列表并通过变更通知同步转盘各重复卡面、底部介绍及对应子页文字；不改变路由或已有动画。

在site.json中新增explore集合，固定原三板块ID、文件目标与材质，编辑只改name／description／image。旧文件没有explore字段时从public/data/explore-defaults.json读取默认内容，不自动覆盖实际文件；空数组表示主动全部删除，永不重新补回。删除带确认，保留页面文件；剩余板块仍重复铺满18卡，全部删除显示空状态。已删板块直接访问其URL显示移除提示。没有本次新增板块功能，不把子页空内容当成完成。

更新和删除核对updatedAt，旧页不能覆盖新值或复活已删项；保留原备份及只读边界，上传图片纳入完整ZIP。长标题／介绍在卡面有限空间内截断，完整值保存在文件；默认配图仍为临时页面示意。局部证据见TASKS E48。

## 已实现与缺失的边界

已经实现的是**展示框架和基础交互**，并不是已填入真实资料的可发布成品。本地照片／简历选择和PDF下载机制、探索广场门户已验证；真实公开简历、其余四个栏目、探索子板块真实内容、照片／介绍／联系方式／动态仍待补齐。News已支持本机新增／编辑／删除，尚未提供公开发布。详细状态与测试范围见[TASKS.md](TASKS.md)。

## 文档维护与信息优先级

- 本文件维护当前项目事实；[TASKS.md](TASKS.md) 维护任务与验证证据；[ROADMAP.md](ROADMAP.md) 是建议计划，不代表开工或完成。
- [DESIGN.md](DESIGN.md) 维护完整视觉规范；[CHANGELOG.md](CHANGELOG.md) 记录已发生的变更；[requirements.md](requirements.md) 记录目标。
- 代码、需求与文档冲突时，分别记录“当前实际行为”和“用户期望”，未核实的原因标记待确认，不用猜测解决冲突。
- 线上地址、托管服务、域名、公开联系方式、最终语言和栏目内容待用户确认。未来扩展不预设框架迁移、后台或数据库。
