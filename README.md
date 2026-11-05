# 个人学术主页

个人资料、About、News、Updates 与探索广场组成的学术主页草稿。首页和编辑页使用原生 HTML／CSS／JavaScript；探索广场局部使用 React／Framer Motion。真实内容与公网发布状态仍待确认。

## 目录怎么找

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

网页、脚本和样式集中在 `public/`；原生页面直接使用该目录中的源码，无需构建。探索模块修改 `src/explore/` 后构建到 `public/explore/`，不要直接改生成文件。服务只公开网站目录及已保存的展示附件；本地数据与代码分开。页面网址仍是 `/`、`settings.html`、`explore.html` 等，无需在网址中添加 `public/`。原需求统一保存在 [docs/requirements.md](docs/requirements.md)，移除重复的根目录入口。

## 启动与首次迁移

1. 双击根目录 `start-local.cmd`，保持服务运行；需要 Python 3.9+，无需安装第三方包。
2. 用原来填写资料的浏览器打开 `http://127.0.0.1:8765/settings.html`。
3. 在“本地数据”点击“备份并迁移至本地文件”。会先保存含附件的浏览器快照，再迁移资料、News、Updates及草稿；旧浏览器数据不删除。
4. 之后继续使用原编辑界面保存，内容直接写入电脑项目文件。设置页可下载含草稿、附件的完整 ZIP 备份。

已经迁移过的项目直接启动即可；此次目录整理无需再次迁移、重新填写或清理浏览器。

也可在项目根目录运行：

```text
python server/server.py --port 8765
```

如果提示端口占用，先关闭原来的普通预览服务再启动。普通 `python -m http.server` 和直接打开 HTML 不能提供文件保存。请固定原电脑地址完成首次迁移；不同浏览器／端口中的旧内容不会自行合并。

手机连接同一 Wi-Fi／热点后，用电脑当前 IPv4 地址替换127.0.0.1，只读预览同一份已保存内容。电脑服务需持续运行；本地运行不代表公网发布。更多说明见 [本地存储](docs/STORAGE.md)。

## 文件保存在哪里

| 路径 | 内容 |
| --- | --- |
| `data/site.json` | 个人资料、News、展示中的Updates、探索卡牌，含About格式与跳转目标 |
| `assets/uploads/` | 图片、PDF、News文件，JSON中保留引用 |
| `.local/drafts.json`、`.local/uploads/` | Updates草稿与草稿图片 |
| `.local/backups/` | 每次修改前的备份、首次迁移原始快照 |

`data/site.json`、`assets/uploads/`和`.local/`均被Git忽略，填写内容及附件保留在电脑。仓库提供空白`public/data/site.example.json`；首次启动文件服务会自动建立本地数据文件。静态预览缺少本地文件时读取空白模板，仅用于界面展示。没有自动Git提交、上传或公开发布；内容是否公开另行决定。已迁移内容不依赖浏览器缓存。

## 已有功能

- 设置页编辑姓名、英文名、学历、学校／院系／专业、六类联系方式、照片、PDF和About全文。About支持加粗与文字颜色；主页长内容可展开／收起。照片≤1 MB、PDF≤2 MB。
- 六个联系图标点击复制，缺值有提示；简历缺失时禁用，已保存PDF可下载。
- News独立新增／编辑／删除，日期与正文必填，无标题；可附图片≤5 MB和文件≤10 MB。首页仅最新三条，View All打开全部新闻；触屏与键盘保留操作。
- Updates独立编辑／管理，可保存草稿或选择有效站内目标并展示；图片≤5 MB。主页保留6:4布局、日期轴、同日编号、立体预览和滚轮浏览。草稿仅电脑本机可见，无真实记录时显示“暂无更新”。
- 设置侧栏“探索广场”可管理原有三个板块：编辑标题、介绍、图片或删除；编辑保存后同步全部重复卡面。删除保留页面文件，支持空状态，图片与资料一起备份。
- Home下拉含About和News；探索广场18张金属工牌支持旋转、悬停抽出、两侧让位、减少动态与手机点按。美食地图、瓜瓣READ、概念集仍为内容待添加页。

探索模块构建产物已保存，浏览无需安装Node；修改其源码后执行 `npm ci --prefix src/explore`、`npm run build --prefix src/explore`，见 [模块说明](src/explore/README.md)。不据此重写首页及编辑页。

## 项目文档

| 文档 | 用途 |
| --- | --- |
| [PROJECT](docs/PROJECT.md) | 当前架构、数据流与事实边界 |
| [ROADMAP](docs/ROADMAP.md) | 后续阶段与依赖 |
| [TASKS](docs/TASKS.md) | 实际状态、问题和验证依据 |
| [CHANGELOG](docs/CHANGELOG.md) | 已发生的重要变更 |
| [DESIGN](docs/DESIGN.md) | 视觉和交互规范 |
| [STORAGE](docs/STORAGE.md) | 启动、迁移、文件和备份 |
| [需求](docs/requirements.md) | 验收目标，不代表完成情况 |
| [AGENTS](AGENTS.md) | 开工阅读、验证和更新约定 |

## 存储检查

在项目根目录运行（只使用临时目录，不修改用户内容）：

```text
python -m unittest discover -s tests -p test_storage.py -v
```

覆盖文件迁移、附件、草稿隔离、版本冲突、失败恢复与接口边界；不等同于真实内容／全站发布验收。草稿阶段只做受影响范围的必要检查，完整交付验收由用户安排。
