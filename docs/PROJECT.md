# 项目总览

核对日期：2026-11-03（Asia/Shanghai）。文档整理基线：`ab371b8`；EDIT-001 建立本机编辑；EDIT-002 扩展主页除 News 外的所有待填字段；EDIT-004 在 `39cae46` 后将 About 改为全文自由填写。

## 定位与当前阶段

这是个人学术主页，面向希望了解站点主人基本情况、研究兴趣、课程与个人活动的访问者。当前阶段为**静态首页草稿，基础界面与交互已实现，真实内容尚未补齐；线上发布状态待确认**。

首页包含个人资料栏、About 和 News，并预留研究方向、课程作业、爱好、活动、获奖五个栏目。目标不是登录系统、内容管理后台或数据库应用。页面语言当前为中文资料与少量英文栏目名，最终语言待确认。

## 技术栈与运行方式

| 项目 | 当前真实实现 |
| --- | --- |
| 页面 | `index.html` 首页、`settings.html` 设置页、`news-edit.html` 独立 News 新增页，原生 HTML |
| 样式 | 同文件内嵌 CSS、自定义属性、Grid／Flex 和媒体查询 |
| 交互 | 首页保留原内联交互；共享 `profile.js` 管理资料、联系信息及本地附件的读取、保存和同步；`about.js` 处理 About 格式编辑、安全渲染与首页收起／展开 |
| 图标、字体 | 内联描边 SVG、本地字体栈，无图标包或网络字体依赖 |
| 数据 | 默认模板在 HTML；资料／个人附件覆盖值在 localStorage；News 与附件在浏览器 IndexedDB，按日期倒序加载；联系方式仍为原六键 CONTACTS |
| 构建和依赖 | 无 `package.json`、框架、构建步骤或应用依赖清单；目前不是 Astro／React 项目 |
| 服务端 | 无 API、后台、服务端数据库或登录；只有当前浏览器本地持久化，不能写入仓库或全站发布 |
| 版本管理 | Git，分支 `main`，已配置 GitHub 远程 `melon-art/homepage` |
| 部署 | 仓库内未发现部署配置、工作流或线上地址记录；是否已有站外托管待确认 |

可直接用浏览器打开根目录 `index.html`。若使用本地 HTTP 预览，在仓库根目录运行：

```text
python -m http.server 8765 --bind 127.0.0.1
```

浏览器地址为 `http://127.0.0.1:8765/`。Python 仅是可选预览工具，不是网站运行依赖。本地预览和 GitHub 上传均不代表已完成公网发布。

## 目录与职责

```text
academic-homepage/
├── news-edit.html              日期、正文及可选图片／文件的独立新增页
├── news.js                     News 本地 IndexedDB、附件、首页展示与同步
├── index.html                  首页与既有联系交互
├── settings.html               基本信息设置页
├── profile.js                  全资料、联系信息和本地附件的保存与同步
├── about.js                    About 文字格式、结构化渲染及收起／展开
├── README.md                   项目和文档入口、预览方法
├── AGENTS.md                   开发者／AI 工作约定
├── PRODUCT.md                  Impeccable 产品上下文兼容摘要
├── DESIGN.md                   Impeccable 根目录令牌兼容快照
├── requirements.md             原需求文档的兼容入口
├── docs/
│   ├── PROJECT.md              当前定位、架构与事实边界
│   ├── ROADMAP.md              建议的阶段与退出条件
│   ├── TASKS.md                实际任务状态、证据与已知问题
│   ├── CHANGELOG.md            重要变更及历史依据
│   ├── DESIGN.md               完整现行视觉设计规范
│   ├── requirements.md         需求与验收目标，不代表完成状态
│   └── archive/                不再维护的历史说明
└── .impeccable/
    ├── design.json             设计扩展元数据和独立组件示例
    └── critique/               历史评审记录，不代表最新代码结论
```

`.impeccable/review/` 在当前工作区有历史截图，已被 Git 忽略，克隆仓库后不保证存在。工作区外的独立 HTML 预览副本、临时测试脚本与截图不是仓库的业务源或可移植测试套件。

## 页面与逻辑组件

以下是页面中的逻辑分区，尚未建立组件框架；`profile.js` 为两页共享的原生脚本。

| 分区／选择器 | 当前内容与行为 |
| --- | --- |
| `header`、`.wordmark` | 英文名可编辑，默认占位；点击跳至 About 标题 |
| `.nav-current` | About 当前页锚点 |
| `.settings-link` | 主页右上角“设置”，跳转设置页 |
| `#profile-form` | 个人资料、About、联系方式、简历四组；保存后返回主页 |
| `.nav-item` | 五个待开发栏目的按钮，只显示“栏目待更新”，不执行页面跳转 |
| `.profile`、`.portrait` | 资料文字和照片占位；可显示本机保存的图片，仓库没有真实照片 |
| `.contacts` | 六个横排图标；名称提示、点击复制及空数据反馈 |
| `.cv-area`、`.cv-button` | 浅金底、金色字、与照片同宽；无 PDF 时 `disabled`；有本机 PDF 时启用并下载该文件 |
| `.about-block` | 用户填写的 About 全文，保留换行／加粗／文字颜色；与 News 同宽，长内容默认收起、段末展开／收起，未填写时明确占位 |
| `.news`、`.news-list` | 从本地 IndexedDB 加载，日期倒序；每条日期与正文，无标题；可选右侧缩略图及文件下载 |
| `.news-add`、`news-edit.html` | 加号进入独立新增表单，日期／正文必填，可选图片／文件，保存成功返回首页 News |
| `.toast` | 普通复制反馈，礼貌播报，约 2.6 秒收起 |
| `.copy-recovery` | 自动复制失败时显示可选择的只读文本；关闭／Escape 后恢复焦点 |

首页和编辑页的宽屏容器统一最大 1480px、每侧至少 48px 留白；桌面左栏 320px。顶部七个导航（含设置）等距排布。Research Interests 独立模块已删除；没有页脚。保留这些用户决定，不自动恢复。

## 数据与交互流

`CONTACTS` 的键固定为 `phone`、`email`、`wechat`、`instagram`、`xiaohongshu`、`bilibili`，源文件默认值全部为空字符串；本机保存值在页面加载后填入同名键。社交图标目前**复制账号或链接，不打开平台页面**，也没有微信二维码功能。

```text
点击联系图标
  → 按 data-contact 读取 CONTACTS
  → 空值：提示待提供，不复制占位文案
  → 有值：优先 Clipboard API，再尝试临时 textarea 兼容复制
  → 成功：显示反馈
  → 两种方式均失败：显示持续保留的手动复制面板
```

`notify()` 管理普通提示；`copyText()` 管理复制；`closeRecovery()` 管理恢复面板关闭与焦点。名称提示由脚本创建，支持悬停／焦点显示和 Escape 关闭。没有业务网络请求或服务器表单提交。`profile.js` 拦截设置表单，在原 localStorage 键 `academic-homepage.profile.v1` 保存 13 个文字字段、可选 `introductionRuns` 格式片段及 `photo`／`cv` 附件对象（`{name, data}`，data 为限定 MIME 的 data URL），读取旧 `{name, degree}` 时保留原值、缺失新字段按空值处理；原 introduction 文本沿用为 About 全文，旧 researchOne／researchTwo／researchQuestion 字段不再参与保存和渲染；保存成功后返回主页，更新英文名、左栏、About、联系信息和简历状态。照片支持 JPG／PNG／WebP≤1 MB，PDF≤2 MB；选择时验证文件大小、图片解码或 PDF 文件头。未保存草稿不影响主页。整份资料使用一次原子写入，配额失败不覆盖上次记录。刷新／返回缓存页会重新读取，同源多个标签页通过 storage 事件同步。About 使用单个可编辑文本区，最多 10000 字符，不再根据个人资料生成句子；换行和空行保留，空值显示“About 内容待填写。”。工具条提供选词加粗、金色、自选颜色和清除格式，保留选区并支持 Ctrl+B／⌘B。`introduction` 保留纯文本兼容，`introductionRuns` 为 `{text, bold, color}` 片段；仅接受十六进制颜色，不保存原始 HTML。旧纯文本自动读取，片段与正文不一致时回退到正文。超限明确阻止保存并保留草稿。其他空值恢复占位；渲染使用 textContent 创建文字及 strong／span；存储失败保留输入并提示，不假报成功。

本机 `file://` 预览通过临时 URL 片段传递文字字段及 About 格式片段，读取后移除片段；不传递图片或 PDF。文件模式禁止新增附件并提供 HTTP 预览入口，避免不同文件的存储隔离和超长 URL。推荐固定使用本地 HTTP 地址预览；不同浏览器、端口、设备或清除站点数据后不会共享修改。这不是管理后台，不会修改 HTML 文件、Git 仓库或所有访客看到的内容。News 由独立页面与 news.js 管理，不写入个人资料键。下载通过浏览器 Blob URL 生成，文件名与内容来自用户选择的 PDF，没有上传接口。

## About 收起与展开

`AboutContent.createDisclosure()` 在个人资料渲染后接收完整正文及格式片段。长正文默认收起，双栏时预览容器底部按照片实际底边计算，手机单栏时显示六行；底部 72px（最多预览高度 45%）覆盖向白色渐隐，文字按钮保持清晰。预览在字素边界按实际高度截断，保留可见文字的粗体／颜色，末尾同行“...展开”；展开时移除限高与渐隐，完整文字末尾同行“收起”。按钮支持鼠标和原生 Enter／Space 键盘激活，具有 aria-expanded／aria-controls，切换后保留焦点。

News 保持文档流，随 About 高度自然上下移动，不预留展开高度。切换不写存储，全文与格式片段始终保留；短文本直接完整显示，无渐隐、开关或固定高度。视窗、字体或照片尺寸变化后重新计算；手机六行规则不使用上方照片的页面坐标。交互不增加高度动画，减少动态设置仍正常工作。

## News 数据与附件

news.js 使用浏览器 IndexedDB 数据库 academic-homepage.news.v1、entries 对象仓库。每条为 `{id, date, body, createdAt, image, file}`，没有 title；附件是 `{name, blob}`，不经 base64 或个人资料 localStorage。正文按纯文本渲染，保留换行，最多 2000 字；日期使用有效 YYYY-MM-DD 和 time／datetime。按日期降序、同日创建时间降序排列。图片最多一张，JPG／PNG／WebP≤5 MB，解码成功才接收；文件最多一个、≤10 MB，以 Blob URL 下载。可同时添加图片和文件；保存前可更换／移除附件。

新增事务提交成功才返回；重复提交受阻，附件读取期间保存禁用；非法附件需重新选择或移除。失败保留本页草稿和已存记录。BroadcastChannel（不可用时回退到独立 localStorage 修订标记）、pageshow 与可见状态变化更新首页。原个人资料键及格式保持不变。News 功能需 HTTP 预览；不提供 file:// 保存、跨浏览器同步、已有动态再编辑／删除或公开发布。

## 已实现与缺失的边界

已经实现的是**展示框架和基础交互**，并不是已填入真实资料的可发布成品。本地照片／简历选择和 PDF 下载机制已验证；真实公开简历、五个内容页面、真实照片／介绍／联系方式／动态仍未完成。News 已支持日期倒序和本机新增，尚未提供已有动态的再编辑／删除或公开发布。详细状态与测试范围见 [TASKS.md](TASKS.md)。

## 文档维护与信息优先级

- 本文件维护当前项目事实；[TASKS.md](TASKS.md) 维护任务与验证证据；[ROADMAP.md](ROADMAP.md) 是建议计划，不代表开工或完成。
- [DESIGN.md](DESIGN.md) 维护完整视觉规范；[CHANGELOG.md](CHANGELOG.md) 记录已发生的变更；[requirements.md](requirements.md) 记录目标。
- 代码、需求与文档冲突时，分别记录“当前实际行为”和“用户期望”，未核实的原因标记待确认，不用猜测解决冲突。
- 线上地址、托管服务、域名、公开联系方式、最终语言和栏目内容待用户确认。未来扩展不预设框架迁移、后台或数据库。
