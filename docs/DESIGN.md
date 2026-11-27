---
name: "个人学术主页"
description: "依据用户提供的学术主页参考图，记录已实现的白底、汉仪唐美人55W与克制暖金色系统。"
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
  explore-display: "oklch(91% .006 88)"
  badge-silver: "#f5f6f7"
  food-map-paper: "#fdf5f0"
  food-map-label: "oklch(47% .025 90)"
  error: "#a13c30"
typography:
  food-map:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "clamp(28px, 2.6vw, 40px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: ".08em"
  food-recommendation:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontWeight: 400
  explore-display:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "21.5vw"
    fontWeight: 600
    letterSpacing: ".025em"
  identity:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.3
  section:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.015em"
  body:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: "1rem"
    lineHeight: 1.5
  meta:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
    fontSize: ".9375rem"
  hint:
    fontFamily: 'HYTangMeiRen55W, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
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
  food-map:
    backgroundColor: "{colors.food-map-paper}"
    textColor: "{colors.food-map-label}"
    layout: "full viewport width; 4830:2730 image ratio; top-left map title; six labels"
    typography: "{typography.food-map}"
    header: "same local font stack, weight, size and line height as homepage"
  food-beacon:
    targetSize: "44px"
    coreSize: "12px"
    glowSize: "42.4264px"
    motion: "1s easeInOut loop; static with reduced motion"
    illustrationWidth: "ART PARK clamp(43.2px,9%,132px); WUDAOKOU clamp(34.56px,7.2%,105.6px)"
    illustrationHover: "scale 1.14 around geographic anchor; 240ms cubic-bezier(.16,1,.3,1); fine hover or keyboard focus; static with reduced motion"
  explore-editor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.input}"
    inputHeight: "52px"
    layout: "settings sidebar 320px / content; list with 128x86 preview and actions; stacked at 620px"
  section-badge:
    backgroundColor: "{colors.badge-silver}"
    textColor: "#232a30"
    rounded: "18px * card-ratio"
    content: "all 18 cards: own name, description, temporary page screenshot"
    motion: "2x pointer foil travel, +/-12deg sweep and variable light strength under copy; static in reduced motion"
  explore-backdrop:
    textColor: "{colors.explore-display}"
    typography: "{typography.explore-display}"
    width: "95vw"
    heightScale: "previous approved height * .75"
  blog-profile:
    directorySidebar: "sticky above 820px, 16px below navigation, independently scrolls when taller than the available viewport"
    layout: "114px background band, 96px circular avatar with soft shadow, adjustable cover crop"
    backgroundColor: "{colors.gold-soft}"
  navigation-shell:
    mobile: "64px scroll-direction bar through 820px; 26.4px icons with 13px side padding; left drawer, 280ms entry, warm-gold Contents heading"
    backgroundColor: "rgba(248,249,250,.76)"
    backdropFilter: "blur(20px) saturate(140%)"
    layout: "fixed full-width surface with reserved flow height; desktop 69px; mobile about previous height * .75; dropdown overflow visible"
    motion: "hide on downward scroll, reveal upward; 440ms cubic-bezier(.22,.61,.36,1); static with reduced motion"
  navigation-current:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7px 13px"
    fontWeight: 600
  home-dropdown:
    backgroundColor: "rgba(248, 245, 237, 0.98)"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.control}"
    width: "156px"
    padding: "0"
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
  updates-editor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.input}"
    inputHeight: "52px"
    layout: "7fr 5fr; stacked at 820px"
  updates-preview:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.control}"
    height: "180px"
    stageHeight: "248px"
    nextOffset: "54px"
    mobileNextOffset: "49px"
    captionGap: "24px"
    numberSize: "12px"
    numberTarget: "24px"
    numberImageGap: "12px + stage inset"
    motion: "360ms cubic-bezier(.16,1,.3,1)"
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

本规范记录 `index.html` 中已经使用的设计，不生成新的视觉方向。个人照片和资料仍待提供，因此照片区域保留明确的占位说明；占位底色不构成照片内容或新增品牌色承诺。主页、导航与姓名使用本地字体栈；美食地图／推荐正文例外使用随仓库保存的WOFF2字库，不依赖运行时外部字体服务。

**Key Characteristics:**
- 白色阅读背景、深灰文字与克制的暖金色强调。
- 衬线身份及章节标题，搭配本地无衬线正文。
- 大幅方形照片、双栏桌面布局与单栏手机布局。
- 浅灰动态卡片与轻阴影，简历使用浅金底按钮。
- 六个联系图标支持键盘提示和明确的复制反馈。

## Colors

颜色值以 frontmatter 为准；这些颜色名称对应 [index.html](../public/index.html) 中的同名 CSS 自定义属性，没有另建色阶。

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

2026-11-27，FONT-001：全站可排版文字统一采用用户确认的汉仪唐美人55W（HYTangMeiRen-55W），覆盖首页、设置、News／Updates、探索卡牌、背景EXPLORE、地图地名和推荐页。标题与正文以既有字号、400／600／700字重、行高和颜色区分；不改布局或动效。

### Hierarchy
- **Identity**：个人姓名，汉仪唐美人粗体，居中；长姓名允许换行。
- **Section**：About、News 等章节标题，汉仪唐美人粗体。
- **Body**：桌面介绍、学历及动态标题的基础字号；动态标题另用字重（600）与行高（1.6）。
- **Label**：导航、院系信息。
- **Meta**：日期、简历入口、动态补充文字和状态反馈；各组件分别确定行高。
- **Hint**：照片占位说明、图标名称提示及待更新提示。

页眉身份入口沿用粗体（2rem、行高 1.2、字距 -.02em）。日期采用等宽排列数字。About 正文不再施加 73ch 行宽限制，铺满右侧内容栏，与 News 左右边缘对齐；字号、行高和栏间距沿用原值。长名称、链接和无空格文本均允许在容器内换行。

**The Local Font Rule.** 全站共用 `public/assets/css/typography.css` 的 `--font-site`，正文／标题／拉丁／地图令牌指向同一字体；表单控件继承字体。优先使用本机已安装的同名55W；未安装时读取本地完整WOFF2（3,619,992字节、9893码点），`font-display:swap`，无远程字体请求。固定400字面沿用浏览器合成加粗，与确认的预览一致。资源采用`.woff2.bin`以兼容既有服务，不改服务白名单；字体来自用户，未声称开放许可。旧地图字库及许可保留为历史资源，当前入口不再内嵌或加载这些旧字体。图片中已栅格化的文字保持原样；独立历史预览保留原试样。下文较早字体决定均由本规则替代。

## Layout

NAV-009（2026-11-27）：主页及探索六个入口的顶部主导航共用assets/css/navigation.css。姓名与导航所在整条页眉使用card浅灰#f8f9fa，延伸到页面两侧，原内容宽度、间距、高度和手机换行不变；通过仅裁切背景伪元素保留下拉溢出，背景不接收指针、不随悬停改变。文字、72px金色扫线、Home下拉及其金色选中反馈继续沿用原规范。不为独立编辑页新增主导航，不修改仓库外草稿。

NAV-010（同日，当前规则）取代以上不透明背景及原92px高度：姓名／导航整条材质为rgba(248,249,250,.76)磨砂玻璃，blur20px、saturate140%，下边两角16px、轻微下投影。独立navigation-shell按ResizeObserver实测高度占位，内层固定顶端，不挤动内容；desktop为69px（92px的3/4），820px以下通过顶部10px、导航上距7px、按钮最小32px／纵向内距2px压至约原高度3/4；字体大小、字形、水平间距不变，顶栏栏目字重600。下滑累计18px隐藏，上滑累计10px显示，靠近页首（高度+16px）始终显示；双向滑动均440ms cubic-bezier(.22,.61,.36,1)，替代首版180／240ms。菜单展开、键盘焦点或精细指针操作时保持显示，Tab恢复隐藏导航；隐藏时inert／aria-hidden防止焦点落入屏幕外。背景保持溢出，Home下拉不裁切。减少动态取消滑动，不支持backdrop-filter时使用不透明浅灰；图片／内容仍由原文件服务提供，不改变数据。共享navigation.js只监听页面滚动，探索转盘及Updates内部滚轮不触发显隐。真实内容较短时没有页面滚动，导航自然常显。当前局部验证见TASKS E65。

首页与设置页的宽屏内容壳最大宽度均为（1480px），两侧总留白至少（96px），即每侧至少（48px）。首页与设置页复用左栏宽度（320px）和栏间距；左栏居中展示个人信息，右栏用于介绍与动态。页眉最小高度（92px），主内容顶部留白（34px），底部留白（48px）。照片保持宽高比（1:1）。导航栏目依次为 Home、研究方向、课程作业、个人博客、获奖、探索广场，设置继续位于其后。导航七项（含设置）在同一 Flex 容器内以 space-between 分配空间，项目边缘间距相同；不把设置单独放在导航外。

响应式规则直接来自现有媒体查询：
- **1100px 及以下**：两侧总留白（56px），左栏（29%）、栏间距（36px）；导航改用元信息字号并压缩水平内边距，图标间距收紧。
- **820px 及以下**：两侧总留白（40px），左栏（31%）、栏间距（28px）；页眉转为上下排列，导航左对齐并换行。姓名缩至（1.875rem），联系按钮宽度缩至（32px）。
- **620px 及以下**：两侧总留白（36px）；主内容单栏，纵向间隔（37px）。个人信息最大宽度（366px），照片和简历按钮宽度均取（250px）与容器（80%）的较小值，左右边缘对齐。六个联系图标恢复常规按钮宽度并保留一行。介绍正文与动态卡片标题改为（1rem），介绍行高增至（1.85），章节标题改为（1.875rem），姓名为（2.125rem）。导航仍换行，最小高度（40px）。
- **360px 及以下**：继续压缩导航间距与水平内边距，联系图标间距改为（7px）。

当前主内容以 About 后接左右 6:4 的 News／Updates，栏间距 36px、顶部间距 38px。1100px 及以下改为 News 在上、Updates 在下，间距 30px；620px 以下顶部间距 30px。两块随 About 收起／展开共同移动；不添加页脚。恢复面板与状态提示固定在视窗底部，并限制宽度，避免挤出手机屏幕。

页面根使用 scrollbar-gutter: stable 预留纵向滚动条空间，使 About 展开／收起时页面容器及导航横坐标保持不变。首页和设置页采用相同规则；不支持时使用 overflow-y: scroll 回退，不修改宽屏容器和边距参数。

## Elevation & Depth

深度由浅色面层与轻阴影共同表达。照片阴影比卡片更明显。卡片、名称提示和待更新提示共用轻阴影。顶部导航使用透明背景与金色下划线，不使用悬停填色或阴影框。复制恢复面板使用更强的柔和阴影，使它在底部反馈层中清楚可见。完整阴影值记录于 [侧车](../.impeccable/design.json) 的 `extensions.shadows`。

普通 News 卡片没有悬浮位移；Updates 采用用户确认的局部立体切换与悬停抬高，其余界面不新增装饰性入场动画。状态提示以透明度和轻微纵向位移过渡（.16s ease-out），普通通知约（2600ms）后收起。系统要求减少动态时关闭平滑滚动及状态提示过渡。

## Shapes

照片为大圆角正方形；卡片使用中等圆角；导航、联系按钮、提示与输入控件使用较小圆角。圆角值见 frontmatter。真实照片填入后以覆盖方式裁切，并继承照片容器圆角。

动态卡片与导航不加外框。细边框用于手动复制与设置页输入框；不以粗线条或硬阴影分隔内容。

## Components

### Navigation

顶部七个导航项均使用透明背景，不显示悬停方框；Home 当前项与设置保留金色文字。悬停或键盘聚焦时，在文字下方显示统一 72px 长、2px 高、起点与文字左边缘对齐的金色线，以左侧为原点用 scaleX 从 0 展开至 1，时长 260ms，缓动 cubic-bezier(.16, 1, .3, 1)。移开后收起；开启减少动态时取消过渡、直接显示状态，保留键盘焦点轮廓。每项最小宽度 56px，线条附着于文字 span 而非按钮容器；短标签也不影响线长。1100px 以下导航末端预留 16px，避免较长线条导致横向溢出。五个待开发栏目继续只提示待更新，Escape 可关闭提示；窄屏自然换行。

Home 使用 disclosure 按钮（aria-expanded／aria-controls），下方 156px 宽、98% 不透明的 gold-soft 面板，6px 圆角、无外部内边距及现有轻阴影，不添加模糊或装饰。按钮与面板之间用 10px 填充区域连接，鼠标可连续移入；面板在普通文档流之上，不推挤内容。两项 About、News 使用 16px 字、最小高 48px、12px 18px 内边距，无项间隙／单项圆角；加深背景从左至右铺满整栏，首尾贴合容器圆角，不留浅色边缘。常态为正文灰，悬停／键盘焦点为 gold 字与 rgba(134,107,53,.16) 加深背景。About 链接主页 index.html，News 链接全部新闻 news.html。鼠标移出整个 Home／下拉区后收起；Enter 点击开关、方向下键进入首项、Tab 导航、Escape 关闭并恢复按钮焦点，焦点离开后关闭；触屏点击切换及外部点击关闭。保留原金色导航下划线，展开时继续显示。

### About Disclosure

长 About 默认收起：双栏布局中预览容器下边缘与左侧照片下边缘对齐；620px 以下为六行预览。底部以 72px（最多容器高度 45%）的透明到 paper 渐变淡出，按钮与省略号位于渐变上方，保持可读。预览按字素边界截断，保留文字原有粗体／颜色，不改变源资料。短内容自然展示，不强制限高、渐隐或显示开关。

段末使用无边框、无填色的行内金色文字按钮，仅收起态前为“...”，4px 字间距，字形／字号／行高继承正文；省略号与按钮不可拆行。收起态为“...展开”，展开态为全文末尾“收起”；悬停仅下划线，键盘保留通用焦点轮廓及 aria-expanded。News 保持原间距并随内容流自然换位，不预留展开空间。不新增高度动画，切换后焦点仍在按钮，需要时把新位置滚动到可见范围。

### Settings Editor

首页右侧“设置”透明底金色文字入口纳入同一导航组，字号与内边距遵循其余导航项，避免与获奖的间距不同。`settings.html` 继承白底、灰字、本地字体、金色焦点与浅金按钮，不添加装饰卡片。左上为返回主页；桌面左栏 320px、栏距 54px，“基本信息”／“探索广场”侧栏中当前项使用浅金选中背景。右侧标题后为说明和四组表单：个人资料、About、联系方式、简历；小标题 18px 半粗无衬线。桌面字段双列、24px 间距、宽度上限 820px；分组之间上距 36px、顶内距 28px，以 1px 浅线分隔，不使用卡片。输入框最小高度 52px、12px 圆角、内边距 12px 16px；标签使用 16px 半粗字。保存位于表单下方靠右，最小高度 44px，金色文字、浅金背景，错误／保存提示位于其左侧。保存成功返回主页，失败不跳转且保留输入。

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

### Updates 日期胶片

学术主页中的网站更新展示，定位为连续、清晰、具有纵深；设计关键词为日期、前景、胶片。沿用 News 的 32px／700 衬线标题（手机 30px），正文 17px（手机 16px），元信息 12px。白底、深灰和暖金色继承现有令牌，不改全页字体或色彩。

标志性动作是中心图正对读者，上下预览缩小并倾斜后退。默认中心 translateZ(8px)、scale(.985)；邻图 translateZ(-45px)、rotateX(±24deg)、scale(.86)。精细指针悬停或键盘 focus-visible 时，中心图向上 5px、translateZ(52px)、scale(1.018)，移开恢复；点击中心图片以原生链接在当前标签页打开对应本项目页面，编辑页预览／测试入口使用新标签页。邻图先切换为中心，再次点击进入。无目标链接的内容明确标记页面待添加，不生成无效链接。

预览高度 180px、舞台 248px，上下邻图偏移均为 54px；620px 以下高度／舞台为 164／232px，上下邻图偏移均为 49px。说明区与舞台间距 24px，下方预览少露出约16px，实际图片到文字约34px，保留中心尺寸和抬高动作，上方邻图露出同步收短，避免挤占小编号。圆角 6px；局部柔和阴影为 0 14px 22px -9px rgb(24 33 38 / .26), 0 3px 7px rgb(24 33 38 / .08)，不叠描边。舞台固定高度，动画不推挤 News 或说明文字。

顶部连续日期只展示日号，中心选中，边缘遮罩渐隐；有更新的日期用金色与圆点双重标记。日期字形由 20px 按接近中心程度缩放至 34px；月标显示 YYYY / MM。支持点击、滚轮、鼠标拖动、手机横滑及左右／Home／End 键；预览支持上下键、滚轮、邻图点击与触屏选择。Updates 不设 View All，不恢复滑动提示或说明区箭头；保留分类、完整日期、简短正文。

切换与抬高仅过渡 transform／opacity，360ms cubic-bezier(.16,1,.3,1)，不自动轮播。减少动态时取消 transform 过渡和日期平滑滚动，只保留 100ms 淡入。可见焦点、ARIA 日期选中状态、隐藏卡片 inert、空日期／无记录状态和图片失败的文字回退均保留。

共享本地文件服务保存按 id 区分的多条记录；每个日期可有多条，多条日期在日期轴下方显示居中的1、2、3小编号，说明区不再显示“当天更新”及下拉框。编号12px、点击区域至少24px、间隔4px，金字加细下划线标记当前项，编号行下方留12px并结合舞台内边距与图片分开。当天按创建时间倒序编号，默认最新一条为1；保存后可选中新记录。日期轴与小编号共用顺序滚轮：先逐条切换当天编号，再平滑进入相邻自然日；向后进入前一天最后一条以便反向遍历。无更新日期仍显示原占位预览，不跳日；拖动、点击与原键盘规则保留。图片区域保留原记录切换方式，但普通滚轮事件一律先阻止页面滚动，包括动画中、极小／横向滚动、首尾边界和空占位；Ctrl缩放不拦截，移出预览仍可正常滚动页面。编号支持点击、触屏、原生键盘激活及左右／Home／End，只有一条或没有更新时隐藏。滚轮以48px累积并将单事件推进量限制为一项；日期轴／编号按自然日与当天条目形成有序停靠点，图片仍按实际记录切换。rAF持续平滑跟随目标（42ms指数响应，追赶速度最多每80ms一项），动画中继续接收输入，反向取消未完成的旧方向目标；不使用固定冷却等待。受控滚轮期间暂停原生吸附及scrollend选择，结束后恢复，点击／键盘／拖动可中断；减少动态时直接定位，保留文字淡入。预览所有非缩放滚轮在处理输入前先拦截页面滚动。存在多条日期时保留编号行占位，空日／单条只隐藏数字、不挤动图片；全部日期边界可继续滚动页面。页面目标由 site-pages.js 共用目录解析，正文／图片说明使用纯文本；草稿不显示，目标未建立不可展示。未有真实内容时显示“暂无更新”，不展示示例；不读写个人资料或 News，不自动收集其他栏目变化。

本次局部检查（2026-11-03，基线 9ca6181 后）：Edge 1536／1100／820／390px，6:4、标题一致、默认／悬停／移开、日期操作、图片跳转、空日期、减少动态与触屏通过；中心默认高度约 178.98px，悬停约 195.18px。About、Home 下拉、联系空值及 News 最新三条／全量／编辑预填回归通过；已目视桌面和手机截图。设计符合已选方向，无新增通用 SaaS 结构；此为局部检查，非全站或多浏览器验收。证据见 TASKS E23。

### Updates Editor and Management

编辑采用独立页面，左上返回主页、右上管理入口。桌面左侧表单7fr／右侧预览5fr，间距clamp(36px,6vw,96px)，1100px以下6:4／36px；820px以下上下排列，预览在表单后。复用1480px内容壳与现有48／28／20／18px响应式边距，右预览最大520px、sticky top30px，手机取消粘性。标题32px衬线、正文16px本地字体，白底暖金，不使用仪表盘卡片包裹表单。

表单依次为日期与板块（桌面并排）、正文、跳转页面、可选锚点、图片、图片说明。输入52px高、12px圆角，字段间24px；正文最小128px，纯文本最多500字。目标字段显示待建立状态并禁用相应选项，测试跳转仅在有效时出现。图片≤5 MB，支持更换／移除／解码失败提示。右侧共享UpdatesView，保留原字体、日期轴与悬停动作；不在预览中自动保存。

保存区在表单底部右对齐，“保存草稿”为透明金字，“保存并展示”为gold-soft底／gold字、至少44px高；读取／保存／无效附件期间阻止提交。失败持久提示并保留草稿；离开未保存内容由原生浏览器确认。管理页用简洁行列表，显示日期、草稿／已展示、正文、目标、编辑和删除；手机操作换行。主页标题旁加号复用News尺寸，右侧小型“管理”；选中记录的编辑／删除在悬停／键盘焦点显示，触屏常显。

本次为局部编辑功能，继承已确认的学术主页风格与日期胶片动作；不引入新视觉主题或模板布局。实际验证范围见TASKS E25，不将模拟资料检查解释为真实栏目或公网发布完成。

### News Editor

独立 News 页沿用现有白底、本地字体、衬线标题、统一页面宽度及 1100／820／620px 边距断点、稳定滚动条占位。左上是与设置页相同样式的“返回主页”，回到首页 News；标题按模式为“新增 News”或“编辑 News”，编辑预填日期／正文／图片／文件，布局与新增一致。缺失记录明确提示并禁用保存；保存失败保留输入。没有新增第二套编辑布局。这是 Operate 型表单，与设置页分离，不加侧栏或装饰卡片。日期为最多 280px 宽的原生选择器；正文为全宽、最小高 180px 的纯文本输入。输入沿用 52px 最小高、12px 圆角、1px 边线和金色焦点。标签 16px 半粗；可选项为 14px 次级灰。图片／文件桌面并列、间距 24px，620px 以下上下排列；图片预览 144×108px。文件控件、移除链接和右下保存沿用设置页浅金／金字规范。正文最多 2000 字；图片≤5 MB、文件≤10 MB，说明紧邻字段。读取／保存期间禁用保存，错误在对应字段或底部持久显示；存储说明明确保存在本地项目文件，成功返回首页 News。

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
- **Don't** 为普通内容卡片添加当前实现没有的粗边框、硬阴影或悬停位移；Updates 与探索广场是用户明确选择的局部例外，不扩散至普通内容模块。
- **Don't** 让复制失败反馈自动消失，或将未提供的联系方式占位文案作为可复制值。

空内容状态复核（2026-11-03，E24）：真实数据为空，桌面／手机显示“暂无更新”，无预览链接、无金色更新标记；保留日期操作与现有布局。

## Design change record

- 2026-11-27：FONT-001 采纳汉仪唐美人55W为全站字体，统一14个正式入口与探索构建；既有字号、布局、加粗和交互保持，验证见TASKS E68。

- 2026-11-03：UPDATES-001 将已确认的日期胶片与悬停抬高集成到主页；字体／配色延用原规范，新增 6:4 内容分区与 Updates 专属动效。

- 2026-11-03：按用户选择清空示例数据，正式 Updates 显示“暂无更新”，等待真实内容；保留组件样式和交互。

- 2026-11-03：UPDATES-003 新增独立编辑／管理、实时预览、共用页面目录与同日多条选择；复用现有白／金、衬线、本地字体、圆角和焦点规范。

- 2026-11-03：UPDATES-004 减少下方邻图露出，舞台与说明间距由8px增至24px，首页与编辑预览同步。

- 2026-11-03：UPDATES-005 将当天更新下拉框改为日期下方小编号，滚轮先浏览同日再跨日；上方邻图同步缩短露出，保留编号与图片间距。

- 2026-11-03：UPDATES-006 恢复原日期轴自然日平滑切换及空日占位，保留小编号与图文间距，并固定编号行空间以防切换跳动。

- 2026-11-03：UPDATES-007 日期轴也先遍历当天小编号，再平滑跨自然日；预览所有普通滚轮路径阻止外页滚动。

- 2026-11-03：UPDATES-008 移除固定滚轮冷却，逐帧持续跟随并支持中途反向；停靠顺序、空日和滚动隔离保留。


## 探索广场：已确认的局部视觉系统

2026-11-04，EXPLORE-001 将用户确认的圆周卡组接入正式 explore.html。顶部继续使用主页的导航、暖金色下划线与 Home 下拉。主体采用近白画布、巨型浅色 Bahnschrift 背景字、纸色／松绿／纸白卡牌；深绿仅用于阅读卡面，不扩展为全站强调色。EXPLORE 为 oklch(91% .006 88)，保持已确认的宽度与位置，竖向为此前确认高度的 3/4。

18 张卡排列在屏幕下方圆心的完整圆周上；支持旋转吸附、悬停抽出放大、两侧让位与下沉、选中描述。减少动态时取消抽出／放大与让位，保留操作反馈。三个子板块仍为内容待添加页，不虚构真实记录。模块字体、几何、响应式与动效参数见 [src/explore/DESIGN.md](../src/explore/DESIGN.md)，正式接入检查范围见 TASKS E41。

EXPLORE-002 仅将概念集卡面替换为 #f5f6f7 浅银灰金属工牌：金属穿孔、拉丝纹理、原介绍与三张生成的临时页面图。镭射光带／高光由 Framer Motion 跟随指针，位于文案和图片下层；减少动态时保持静态低强度底色，禁用倾斜及光效跟随。美食和阅读卡面、转盘布局与选择规则不变。详细参数见模块规范，局部检查见 TASKS E42。

EXPLORE-003 将光带／高光位移加倍，加入±12°扫光角度和随指针增强的光效强弱；减少动态不变。参数见模块规范，局部检查见 TASKS E43。

EXPLORE-004 将金属工牌与上述增强光效统一至美食地图、瓜瓣READ和概念集全部18张卡，共用 SectionBadge。卡面保留各自介绍、目标和三张对应的临时版式图，转盘／触屏／减少动态沿用原规则。此为现行转盘卡面，取代先前三类不同材质；子页原空内容封面不变。局部检查见 TASKS E44。

NAV-008：探索模块四页顶部Home点击／Enter／触屏点按直接返回主页；保留悬停About／News、方向下键／空格打开及Escape关闭下拉。首页原Home菜单行为不变；不改变导航视觉。验证见TASKS E45。

## 本地文件存储提示（FILE-001）

设置页在表单前增加“本地数据”，沿用白底、现有金色／浅金按钮、细分隔线和正文样式；显示迁移与备份操作，不新增页面或改变原表单结构。未初始化时显示轻量顶部提示，表单暂停保存；仅在用户主动迁移成功后启用。迁移失败持久提示并保留旧浏览器数据。只读设备隐藏News／Updates写入操作，编辑页给出明确说明；电脑仍保留原编辑入口。说明文案明确“本地项目文件，不上传GitHub”，替代此前浏览器存储文案；不更改既有字号／配色令牌或探索动效。

## 探索卡牌编辑（2026-11-05，EXPLORE-005）

Operate设置表面，继承克制、清晰、学术的白底／暖金系统、本地衬线标题与无衬线正文，不新建视觉主题。设置侧栏含基本信息与探索广场，延用320px／54px和既有断点，620px以下改横向导航。列表为缩略图（128×86）、标题／介绍、文字编辑／删除，浅线区分行，无装饰卡片；1100px以下操作移至正文下方。独立编辑页复用Updates的52px圆角输入、24px分组与右下浅金保存；图片旁显示预览，窄屏上下排列。加载／空态／失败有持续反馈，触屏操作常显且44px高，保留焦点轮廓与未保存离开提醒，无新增动效。

转盘仍使用原金属工牌与镭射；名称最多两行，超过10字适当缩字并将介绍限为一行，其余介绍最多两行，避免覆盖图片；底部说明最多三行，完整值保留在文件。编辑不改变动画／路由／几何。桌面编辑及390px管理截图已查看，长文案双档无重叠／溢出。此为功能管理页，沿用列表与原设置结构符合任务；自评9/10，未新增模板式装饰或视觉身份，非完整发布审计。


## 美食地图：正式局部设计系统（2026-11-06，FOOD-001）

**FONT-001后续决定（2026-11-27）：本节早期StarLovePencil／GenRyu字库及内嵌规则已由全站汉仪唐美人55W替代，地图与推荐页当前均遵循上方Typography。**

以模块用户确认的日落城市海报为主视觉，定位为个人探索站点中的地理浏览入口；关键词为日落、纸刊、手写、清晰，标志性动作是地理锚点上的白色呼吸光点。此为地图／推荐正文的局部系统，不改变主页或卡组结构。

- 地图4830×2730 PNG与页面等宽、自然比例完整展示，保留城市文字及OSM署名。标题左上32px／26px（540px下20px／20px），字号clamp(28px,2.6vw,40px)、手机28px；不新增外部说明栏、底栏或装饰卡片。六地名按UTM50N定位，17px、字距2px，540px下26px／0字距（SVG视图单位）；区域文字描边使用map-paper，保证与底图区分。
- 地图纸色#fdf5f0、标签oklch(47% .025 90)，沿用日落橙红底图及建筑插画，不扩散为主站配色。PNG内文字为栅格，保持原样。地图字体为StarLovePencil，标题／地名／错误提示／重试均在food-map-page作用域；推荐正文为GenRyuMin2 TC EL，font-synthesis:none。顶部导航和姓名按本次用户最新指示与主页完全相同，不能让页面专属字库继承到Header。
- 大融城建筑宽clamp(43.2px,9%,132px)，高度87%处对齐锚点；五道口宽clamp(34.56px,7.2%,105.6px)，98%处对齐。两地名下移35个SVG单位。建筑只作形象示意，不表示地图比例／实测轮廓。FOOD-004将建筑和光点合为一个原生链接：精细指针悬停或键盘聚焦时建筑scale1.14，240ms cubic-bezier(.16,1,.3,1)，以地理锚点为缩放原点，移开复位，不改变布局、锚点或光点尺寸。减少动态时建筑保持scale1，保留金色焦点。
- 两个组合入口中的白色光点保留44×44px操作区域、12px核心、约42.43px基准光晕；Framer Motion 1秒easeInOut循环，光晕scale .85→1.4→.85、opacity .55→1→.55，核心scale .9→1.18→.9。减少动态时静态scale1，光晕opacity .8。键盘可见金色焦点、Enter及触屏直接点按建筑／光点均进入独立推荐页，不恢复区域抬起。
- 地图加载前隐藏入口；底图失败显示持续错误及44px重试按钮，重试恢复；单张建筑失败只隐藏该图，不阻断入口。推荐页保持无餐馆的简洁空态、返回地图及锚点，主导航仍可回首页／探索。
- 字体随仓库提供；六个共享探索HTML直接内嵌字体声明、地图手写子集及推荐常用分片，以支持站内切换并省去当前内容的单独字体请求，字库随HTML读取解析。额外汉字分片仍按Unicode请求，导航不使用专属字库。GenRyuMin2 TC EL源自ButTaiwan v2.100，附OFL；StarLovePencil由用户提供，内部声明免费使用且fsType0，未附独立许可条文，不能描述为OFL。当前手写子集130码点／23468字节，新文案需检查覆盖；来源与授权说明位于public/explore/assets/fonts。Newsreader／Noto Serif SC保留为字形加载后备。

实际截图与字形检查见TASKS E54：1440／390／320px无横向溢出、光点44px可点，导航及姓名与主页font样式相同。延续既定海报结构，无通用SaaS布局、重复说明或新增装饰；本次仅做受影响范围检查，保留手机地图文字随整图缩放的用户确认方案，实体手机阅读体验与最终发布验收待QA-001。

## 个人博客文章区（2026-11-27）

头像上方背景区高 114px，默认浅金色，可在博客设置上传图片并调整裁切。两张图分别支持横向／纵向定位、100–300% 缩放及实时预览。默认居中、100%，可单独重置。96px 圆头像位于背景与资料区交界处，使用柔和环绕阴影，未设置时显示头像占位。博客昵称显示于头像下方，可在设置中编辑。博客两张图单独配置，设置沿用现有暖金按钮及移动端单栏布局。

目录与正文共用左侧资料／标签栏、汉仪唐美人55W及磨砂顶栏。1440 CSS px 侧栏卡片与首页290px照片对齐，目录和正文右边距扣除滚动条后为桌面96px、390 CSS px 窄屏36px。目录在大于 820px 的双栏布局中将左侧栏吸附在顶部导航下方 16px，右栏使用页面滚动。标签较多或视口较矮时，超出可视高度的侧栏内容可在栏内滚动。窄屏按侧栏、文章的顺序流式排列。

卡片本身是正文链接。悬停卡片时封面放大1.045倍，悬停标题时标题以文字块中心放大1.04倍，减少动态时关闭两种变换。正文从顶部「个人博客」回到目录。已展示文章底部显示评论。评论输入栏位于列表前方，默认单行，聚焦或有草稿时展开。每条主评论以可展开的回复框承载一级回复。

博客设置左栏使用「博客」下拉，包含「个人信息」和「文章编辑」。子设置页默认展开，标记当前项。文章列表显示标题和状态，编辑表单沿用主站输入框、文章正文长输入区与暖金保存按钮。手机布局将导航放在正文上方。

## 手机主导航（NAV-012）

820px 及以下使用约 64px 磨砂顶栏，手指上滑隐藏，下滑显示。左侧菜单和右侧主页图标均为 26.4px，点击区域为 48.4px，水平内边距为 13px，垂直内边距为 7.8px，必要时水平内边距适配安全区。抽屉顶部用浅金色 #f3ead7 显示分行标题「目录」与「Contents」，栏目列表移除 News。展开后白色菜单从左滑入，宽度为视口的 80% 且最多 320px，背景加暗，沿用站点暖金色和导航目录。可点击关闭按钮、遮罩或按 Escape 关闭，焦点回到菜单按钮。开启减少动态时直接显示菜单。桌面沿用滚动显隐和 Home 下拉。
