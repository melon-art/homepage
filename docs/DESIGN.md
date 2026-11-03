---
name: "个人学术主页"
description: "依据用户提供的学术主页参考图，记录已实现的白底、衬线标题与克制暖金色系统。"
colors:
  paper: "#ffffff"
  ink: "#242b34"
  body-ink: "#414a54"
  muted: "#626b75"
  gold: "#866b35"
  gold-soft: "#f8f5ed"
  card: "#f8f9fa"
  line: "#e4e6e8"
  portrait-ground: "#40564a"
  error: "#a13c30"
typography:
  identity:
    fontFamily: 'Georgia, "Songti SC", SimSun, serif'
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.3
  section:
    fontFamily: 'Georgia, "Songti SC", SimSun, serif'
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.015em"
  body:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.5
  meta:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: ".9375rem"
  hint:
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: ".8125rem"
rounded:
  photo: "18px"
  card: "10px"
  control: "6px"
  input: "12px"
spacing:
  column-gap: "54px"
  navigation-underline: "72px"
components:
  navigation-current:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7px 13px"
  portrait-placeholder:
    backgroundColor: "{colors.portrait-ground}"
    textColor: "{colors.paper}"
    rounded: "{rounded.photo}"
    width: "min(290px, 100%)"
  contact-icon:
    backgroundColor: "transparent"
    textColor: "#53606d"
    rounded: "{rounded.control}"
    width: "36px"
    height: "36px"
  cv-button:
    width: "min(290px, 100%)"
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold}"
    rounded: "{rounded.control}"
    padding: "8px 22px"
  settings-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
  about-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    typography: "{typography.body}"
    padding: "0"
  about-editor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.input}"
    padding: "14px 16px"
    minHeight: "280px"
  settings-save:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold}"
    rounded: "{rounded.control}"
    padding: "10px 25px"
  news-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.card}"
    padding: "19px 20px 20px"
  news-action:
    backgroundColor: "rgba(248, 245, 237, 0.88)"
    textColor: "{colors.gold}"
    rounded: "0"
    padding: "12px 8px"
  news-view-all:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    minHeight: "40px"
  news-add:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.control}"
    width: "40px"
    height: "40px"
  copy-recovery:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "18px"
    width: "min(440px, calc(100% - 32px))"
  status-toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.meta}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
---

# Design System: 个人学术主页

维护基准：2026-11-02；现行完整规范位于本文件。根目录 [DESIGN.md](../DESIGN.md) 的 frontmatter 是供 Impeccable 读取的同步快照；[设计侧车](../.impeccable/design.json) 为组件示例与扩展元数据，不是网站运行依赖。视觉修改时同步三者，普通内容修改不必重建设计系统。

本规范描述当前实现，不代表已填入真实资料或完成发布验收。Research Interests 独立模块已删除，About 全文改为用户自由填写，不保留自动生成的身份或研究兴趣句子。

## Overview

**Creative North Star: "用户提供的学术主页参考图"**

页面以白色画布承载个人信息与学术阅读内容。大幅方形照片区域和居中的身份信息形成左侧锚点，右侧使用衬线章节标题、简短正文和浅色动态卡片。暖金色只承担文字强调、当前导航与交互反馈；页面没有页脚。

本规范记录 `index.html` 中已经使用的设计，不生成新的视觉方向。个人照片和资料仍待提供，因此照片区域保留明确的占位说明；占位底色不构成照片内容或新增品牌色承诺。字体全部来自本地字体栈，不下载外部字体。

**Key Characteristics:**
- 白色阅读背景、深灰文字与克制的暖金色强调。
- 衬线身份及章节标题，搭配本地无衬线正文。
- 大幅方形照片、双栏桌面布局与单栏手机布局。
- 浅灰动态卡片与轻阴影，简历使用浅金底按钮。
- 六个联系图标支持键盘提示和明确的复制反馈。

## Colors

颜色值以 frontmatter 为准；这些颜色名称对应 [index.html](../index.html) 中的同名 CSS 自定义属性，没有另建色阶。

### Primary
- **暖金色（gold）**：学历、日期、行内重点、链接、图标交互态、简历按钮文字与焦点轮廓。
- **浅暖底色（gold-soft）**：简历按钮底色、可交互控件的悬停／焦点底色、提示气泡与恢复面板的关闭按钮。

### Neutral
- **白色画布（paper）**：页面、恢复面板，以及深色状态提示上的反白文字。
- **深灰主墨色（ink）**：身份、标题、动态标题与状态提示背景。
- **正文灰（body-ink）**：介绍段落、常规导航与只读输入框文字。
- **次级灰（muted）**：院系信息与动态补充说明。
- **浅冷灰（card）**：动态卡片。
- **浅边线（line）**：手动复制输入框边框。
- **照片占位深绿（portrait-ground）**：仅用于待提供照片的方形区域。

**The Quiet Accent Rule.** 使用暖金色标记重点与交互状态；保持主体阅读区域为白底和灰阶文字。

## Typography

身份及章节使用 frontmatter 中的衬线字体栈；正文与辅助信息使用本地无衬线字体栈。英文标题的古典字形与中文正文的清晰笔画共同建立层级，不依赖网络字体。

### Hierarchy
- **Identity**：个人姓名，粗衬线，居中；长姓名允许换行。
- **Section**：About、News 等章节标题，粗衬线。
- **Body**：桌面介绍、学历及动态标题的基础字号；动态标题另用字重（600）与行高（1.6）。
- **Label**：导航、院系信息。
- **Meta**：日期、简历入口、动态补充文字和状态反馈；各组件分别确定行高。
- **Hint**：照片占位说明、图标名称提示及待更新提示。

页眉身份入口另用粗衬线（2rem、行高 1.2、字距 -.02em）。日期采用等宽排列数字。About 正文不再施加 73ch 行宽限制，铺满右侧内容栏，与 News 左右边缘对齐；字号、行高和栏间距沿用原值。长名称、链接和无空格文本均允许在容器内换行。

**The Local Font Rule.** 继承当前本地字体栈；身份与章节保持衬线，正文保持无衬线。

## Layout

首页与设置页的宽屏内容壳最大宽度均为（1480px），两侧总留白至少（96px），即每侧至少（48px）。首页与设置页复用左栏宽度（320px）和栏间距；左栏居中展示个人信息，右栏用于介绍与动态。页眉最小高度（92px），主内容顶部留白（34px），底部留白（48px）。照片保持宽高比（1:1）。导航七项（含设置）在同一 Flex 容器内以 space-between 分配空间，项目边缘间距相同；不把设置单独放在导航外。

响应式规则直接来自现有媒体查询：
- **1100px 及以下**：两侧总留白（56px），左栏（29%）、栏间距（36px）；导航改用元信息字号并压缩水平内边距，图标间距收紧。
- **820px 及以下**：两侧总留白（40px），左栏（31%）、栏间距（28px）；页眉转为上下排列，导航左对齐并换行。姓名缩至（1.875rem），联系按钮宽度缩至（32px）。
- **620px 及以下**：两侧总留白（36px）；主内容单栏，纵向间隔（37px）。个人信息最大宽度（366px），照片和简历按钮宽度均取（250px）与容器（80%）的较小值，左右边缘对齐。六个联系图标恢复常规按钮宽度并保留一行。介绍正文与动态卡片标题改为（1rem），介绍行高增至（1.85），章节标题改为（1.875rem），姓名为（2.125rem）。导航仍换行，最小高度（40px）。
- **360px 及以下**：继续压缩导航间距与水平内边距，联系图标间距改为（7px）。

当前主内容以 About 后接 News；不添加页脚。恢复面板与状态提示固定在视窗底部，并限制宽度，避免挤出手机屏幕。

页面根使用 scrollbar-gutter: stable 预留纵向滚动条空间，使 About 展开／收起时页面容器及导航横坐标保持不变。首页和设置页采用相同规则；不支持时使用 overflow-y: scroll 回退，不修改宽屏容器和边距参数。

## Elevation & Depth

深度由浅色面层与轻阴影共同表达。照片阴影比卡片更明显。卡片、名称提示和待更新提示共用轻阴影。顶部导航使用透明背景与金色下划线，不使用悬停填色或阴影框。复制恢复面板使用更强的柔和阴影，使它在底部反馈层中清楚可见。完整阴影值记录于 [侧车](../.impeccable/design.json) 的 `extensions.shadows`。

界面没有卡片悬浮位移或装饰性入场动画。状态提示以透明度和轻微纵向位移过渡（.16s ease-out），普通通知约（2600ms）后收起。系统要求减少动态时关闭平滑滚动及状态提示过渡。

## Shapes

照片为大圆角正方形；卡片使用中等圆角；导航、联系按钮、提示与输入控件使用较小圆角。圆角值见 frontmatter。真实照片填入后以覆盖方式裁切，并继承照片容器圆角。

动态卡片与导航不加外框。细边框用于手动复制与设置页输入框；不以粗线条或硬阴影分隔内容。

## Components

### Navigation

顶部七个导航项均使用透明背景，不显示悬停方框；About 当前项与设置保留金色文字。悬停或键盘聚焦时，在文字下方显示统一 72px 长、2px 高、起点与文字左边缘对齐的金色线，以左侧为原点用 scaleX 从 0 展开至 1，时长 260ms，缓动 cubic-bezier(.16, 1, .3, 1)。移开后收起；开启减少动态时取消过渡、直接显示状态，保留键盘焦点轮廓。每项最小宽度 56px，线条附着于文字 span 而非按钮容器；短标签也不影响线长。1100px 以下导航末端预留 16px，避免较长线条导致横向溢出。五个待开发栏目继续只提示待更新，Escape 可关闭提示；窄屏自然换行。

### About Disclosure

长 About 默认收起：双栏布局中预览容器下边缘与左侧照片下边缘对齐；620px 以下为六行预览。底部以 72px（最多容器高度 45%）的透明到 paper 渐变淡出，按钮与省略号位于渐变上方，保持可读。预览按字素边界截断，保留文字原有粗体／颜色，不改变源资料。短内容自然展示，不强制限高、渐隐或显示开关。

段末使用无边框、无填色的行内金色文字按钮，仅收起态前为“...”，4px 字间距，字形／字号／行高继承正文；省略号与按钮不可拆行。收起态为“...展开”，展开态为全文末尾“收起”；悬停仅下划线，键盘保留通用焦点轮廓及 aria-expanded。News 保持原间距并随内容流自然换位，不预留展开空间。不新增高度动画，切换后焦点仍在按钮，需要时把新位置滚动到可见范围。

### Settings Editor

首页右侧“设置”透明底金色文字入口纳入同一导航组，字号与内边距遵循其余导航项，避免与获奖的间距不同。`settings.html` 继承白底、灰字、本地字体、金色焦点与浅金按钮，不添加装饰卡片。左上为返回主页；桌面左栏 320px、栏距 54px，单一“基本信息”导航使用浅金选中背景。右侧标题后为说明和四组表单：个人资料、About、联系方式、简历；小标题 18px 半粗无衬线。桌面字段双列、24px 间距、宽度上限 820px；分组之间上距 36px、顶内距 28px，以 1px 浅线分隔，不使用卡片。输入框最小高度 52px、12px 圆角、内边距 12px 16px；标签使用 16px 半粗字。保存位于表单下方靠右，最小高度 44px，金色文字、浅金背景，错误／保存提示位于其左侧。保存成功返回主页，失败不跳转且保留输入。

About 内容使用铺满编辑页主体的富文本区域，不受其他字段的 820px 上限限制；外框 12px 圆角、1px 浅边线，编辑区最小高度 280px，内边距 14px 16px、行高 1.8。工具条在上方，以 1px 边线分隔，8px 12px 内边距，控件最小高 36px。工具为“加粗”“金色”“文字颜色”原生选择器、“清除格式”；激活／悬停使用浅金底和金字，窄屏可换行。单一输入覆盖主页 About 全文，最多 10000 字符；选区丢失时保留待操作范围，无选区时提示先选择文字，支持 Ctrl+B／⌘B。主页保留换行／空行、粗体和用户指定文字颜色，不自动拼接身份资料；空值显示明确待填写状态。联系值各用独立标签，不将账号作为链接执行。照片预览 96px 正方形、12px 圆角；文件选择按钮为浅金底／金色字，文件名可换行，“移除”使用金色文字链接式按钮。读取期间保存禁用并显示“正在读取文件…”，错误使用 error 色明确说明恢复操作；保存失败保留草稿。

1100px 以下编辑页边距与首页一致，左栏 29%、栏距 36px；820px 以下编辑侧栏缩为 160px、栏距 28px，字段变为单列；620px 以下变为单栏，导航在字段上方。文案明确本机保存范围。设置页是 Operate 型表单，继承现有视觉身份，不进行替代风格探索。

### Portrait and Profile

大幅照片区域、姓名、学历与院系依次居中排列。照片缺失时显示“个人照片／待提供”，不得用参考图人物或其他照片代替。学历使用暖金色，院系使用次级灰。简历入口使用 gold-soft 填充、gold 文字及下载图标，6px 圆角，最小高度 40px，内边距 8px 22px；宽度始终与上方照片一致（桌面最大 290px、手机最大 250px）；未提供文件时保留禁用与“简历待上传”状态；本机 PDF 保存后显示“下载简历”、指针光标和金色内描边悬停，移除后恢复禁用。联系图标上间距与简历按钮上间距均为 16px。删除研究兴趣面板后不保留占位高度。

### Contact Icons and Tooltips

六个联系按钮水平排列，使用内联描边 SVG（21px），常态为灰色；悬停与键盘焦点共享暖金色与浅暖底色。通用可见焦点为暖金轮廓（2px，偏移 4px）。名称气泡位于图标上方，鼠标悬停或焦点位于按钮时显示，Escape 可收起；离开后重新进入或重新聚焦可再次显示。

激活图标复制其对应资料。空值只显示资料待提供的状态反馈；可用值先尝试 Clipboard API，再尝试兼容复制方式。不得把占位文字写入剪贴板。

### News Cards

动态卡片仅含暖金日期和普通字重正文，不设标题或第三段说明。正文沿用正文灰、桌面 18px／手机 16px、行高 1.7，保留换行；列表间隔 16px，保留浅灰底与轻阴影。左侧文字自适应，右侧图片最大 144px 宽、4:3 缩略框、contain 保留全图、6px 圆角，两侧顶部对齐且相距 24px；620px 以下缩至 96px、间距 14px，最多占卡片内部 32%，保持左文右图。可选文件在正文下以金色下载链接显示文件名，长名可换行。

News 标题旁以 8px 间距放置金色描边加号，垂直居中，透明底、40px 点击区域、21px 图标、1.6px 圆端描边。悬停／键盘聚焦沿用 gold-soft 底色和通用金色焦点；名称为“新增 News”。入口使用真实链接至独立 `news-edit.html`。

每条动态的编辑／删除改为右侧两块并排的半透明操作面板。组合宽度为卡片宽度的 46%，最多 224px，两块等宽，高度随卡片填满，外缘沿用卡片圆角裁切。编辑使用 gold 文字与 rgba(248,245,237,.88) 底色，删除为 error 文字与 rgba(250,242,240,.88) 底色；悬停单项时底色透明度升至 .97。文字 20px、700 字重、居中；键盘轮廓偏移 -6px，防止裁切。面板覆盖卡片右部，不挤动正文或改变卡片高度。

桌面默认面板 translateX(100%)／opacity 0、不接收鼠标；卡片悬停或内部聚焦后，向左滑到 translateX(0)／opacity 1，进入 300ms、离开 180ms，缓动 cubic-bezier(.16,1,.3,1)。不新增模糊、循环或依赖。减少动态时立即切换，保留状态反馈。无悬停／粗指针设备将两块操作放到内容下方常显，至少 48px 高、16px 字，无滑动，不遮挡文字或图片。删除仍使用原生确认框。

### Latest News and Full List

主页最多显示日期倒序的最新三条，少于三条自然显示；标题与加号在左，View All → 通过 margin-left:auto 放在标题栏最右。文字 16px、金色、无边框无填色，与箭头间距 8px；箭头是 18px、1.6px 圆端描边 SVG。最小点击高度 40px。文字下方金线 72×2px，距文字下沿 7px，以左侧为原点 scaleX(0→1)，260ms cubic-bezier(.16,1,.3,1)，鼠标悬停和键盘聚焦均触发。减少动态时直接显示状态。

news.html 沿用白底、页面宽度／边距、衬线 News 标题、返回主页入口与标题旁加号；新闻完整倒序显示，卡片、图片、附件、滑出操作与首页复用 news.css，不建立第二套组件样式。不同屏幕沿用既有 1100／820／620px 断点。

### News Editor

独立 News 页沿用现有白底、本地字体、衬线标题、统一页面宽度及 1100／820／620px 边距断点、稳定滚动条占位。左上是与设置页相同样式的“返回主页”，回到首页 News；标题按模式为“新增 News”或“编辑 News”，编辑预填日期／正文／图片／文件，布局与新增一致。缺失记录明确提示并禁用保存；保存失败保留输入。没有新增第二套编辑布局。这是 Operate 型表单，与设置页分离，不加侧栏或装饰卡片。日期为最多 280px 宽的原生选择器；正文为全宽、最小高 180px 的纯文本输入。输入沿用 52px 最小高、12px 圆角、1px 边线和金色焦点。标签 16px 半粗；可选项为 14px 次级灰。图片／文件桌面并列、间距 24px，620px 以下上下排列；图片预览 144×108px。文件控件、移除链接和右下保存沿用设置页浅金／金字规范。正文最多 2000 字；图片≤5 MB、文件≤10 MB，说明紧邻字段。读取／保存期间禁用保存，错误在对应字段或底部持久显示；存储说明明确仅当前浏览器，成功返回首页 News。

### Status Toast and Copy Recovery

普通反馈为底部居中的深色状态条，文字可换行，使用 `role="status"` 与礼貌播报。复制失败时收起普通反馈，显示白底恢复面板：只读输入框被聚焦并全选，便于手动复制；点击字段可再次全选。

**The Persistent Recovery Rule.** 手动复制恢复面板持续保留，直至用户选择“关闭”或按 Escape；关闭后焦点回到触发复制的图标。不能套用普通通知的自动消失时间。

## Do's and Don'ts

### Do:
- **Do** 延续用户参考图中的白底、衬线身份与章节标题、暖金色强调和浅色面层。
- **Do** 复用已有 CSS 自定义属性和组件规则，响应式变化按现有断点处理。
- **Do** 为图标保留可见焦点、文字名称提示和键盘可达的复制反馈。
- **Do** 保留真实缺失状态，并让手动复制内容可选择、可关闭且持续可见。

### Don't:
- **Don't** 引入外部字体下载、额外页脚或与参考图无关的装饰框。
- **Don't** 把照片占位深绿扩展成全站强调色，或用虚构照片、身份及经历填充空缺。
- **Don't** 为普通内容卡片添加当前实现没有的粗边框、硬阴影或悬停位移。
- **Don't** 让复制失败反馈自动消失，或将未提供的联系方式占位文案作为可复制值。
