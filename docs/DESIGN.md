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
components:
  navigation-current:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.ink}"
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
  settings-save:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold}"
    rounded: "{rounded.control}"
    padding: "10px 25px"
  news-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "19px 20px 20px"
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

本规范描述当前实现，不代表已填入真实资料或完成发布验收。Research Interests 独立模块已删除，About 正文中的研究兴趣介绍仍保留。

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
- **浅暖底色（gold-soft）**：当前导航、简历按钮底色、可交互控件的悬停／焦点底色、提示气泡与恢复面板的关闭按钮。

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

页眉身份入口另用粗衬线（2rem、行高 1.2、字距 -.02em）。日期采用等宽排列数字。介绍正文最大行宽（73ch），长名称、链接和无空格文本均允许在容器内换行。

**The Local Font Rule.** 继承当前本地字体栈；身份与章节保持衬线，正文保持无衬线。

## Layout

首页与设置页的宽屏内容壳最大宽度均为（1480px），两侧总留白至少（96px），即每侧至少（48px）。首页与设置页复用左栏宽度（320px）和栏间距；左栏居中展示个人信息，右栏用于介绍与动态。页眉最小高度（92px），主内容顶部留白（34px），底部留白（48px）。照片保持宽高比（1:1）。导航七项（含设置）在同一 Flex 容器内以 space-between 分配空间，项目边缘间距相同；不把设置单独放在导航外。

响应式规则直接来自现有媒体查询：
- **1100px 及以下**：两侧总留白（56px），左栏（29%）、栏间距（36px）；导航改用元信息字号并压缩水平内边距，图标间距收紧。
- **820px 及以下**：两侧总留白（40px），左栏（31%）、栏间距（28px）；页眉转为上下排列，导航左对齐并换行。姓名缩至（1.875rem），联系按钮宽度缩至（32px）。
- **620px 及以下**：两侧总留白（36px）；主内容单栏，纵向间隔（37px）。个人信息最大宽度（366px），照片和简历按钮宽度均取（250px）与容器（80%）的较小值，左右边缘对齐。六个联系图标恢复常规按钮宽度并保留一行。介绍正文与动态卡片标题改为（1rem），介绍行高增至（1.85），章节标题改为（1.875rem），姓名为（2.125rem）。导航仍换行，最小高度（40px）。
- **360px 及以下**：继续压缩导航间距与水平内边距，联系图标间距改为（7px）。

当前主内容以 About 后接 News；不添加页脚。恢复面板与状态提示固定在视窗底部，并限制宽度，避免挤出手机屏幕。

## Elevation & Depth

深度由浅色面层与轻阴影共同表达。照片阴影比卡片更明显。卡片、名称提示和待更新提示共用轻阴影。复制恢复面板使用更强的柔和阴影，使它在底部反馈层中清楚可见。完整阴影值记录于 [侧车](../.impeccable/design.json) 的 `extensions.shadows`。

界面没有卡片悬浮位移或装饰性入场动画。状态提示以透明度和轻微纵向位移过渡（.16s ease-out），普通通知约（2600ms）后收起。系统要求减少动态时关闭平滑滚动及状态提示过渡。

## Shapes

照片为大圆角正方形；卡片使用中等圆角；导航、联系按钮、提示与输入控件使用较小圆角。圆角值见 frontmatter。真实照片填入后以覆盖方式裁切，并继承照片容器圆角。

动态卡片与导航不加外框。细边框用于手动复制与设置页输入框；不以粗线条或硬阴影分隔内容。

## Components

### Navigation

当前 About 项为浅暖底色与深灰文字。其余五个栏目保留按钮形态，悬停或键盘焦点时变为暖金色文字与浅暖底色；激活后显示“栏目待更新”的就地状态提示，不跳转至缺失页面。Escape 隐藏该提示。窄屏允许换行，保持栏目顺序。

### Settings Editor

首页右侧“设置”浅金底文字入口纳入同一导航组，字号与内边距遵循其余导航项，避免与获奖的间距不同。`settings.html` 继承白底、灰字、本地字体、金色焦点与浅金按钮，不添加装饰卡片。左上为返回主页；桌面左栏 320px、栏距 54px，单一“基本信息”导航使用浅金选中背景。右侧标题后为说明、姓名和学历字段；字段组间距 27px、宽度上限 820px。输入框最小高度 52px、12px 圆角、内边距 12px 16px；标签使用 16px 半粗字。保存位于表单下方靠右，最小高度 44px，金色文字、浅金背景，错误／保存提示位于其左侧。保存成功返回主页，失败不跳转且保留输入。

1100px 以下编辑页边距与首页一致，左栏 29%、栏距 36px；820px 以下编辑侧栏缩为 160px、栏距 28px；620px 以下变为单栏，导航在字段上方。文案明确本机保存范围。设置页是 Operate 型表单，继承现有视觉身份，不进行替代风格探索。

### Portrait and Profile

大幅照片区域、姓名、学历与院系依次居中排列。照片缺失时显示“个人照片／待提供”，不得用参考图人物或其他照片代替。学历使用暖金色，院系使用次级灰。简历入口使用 gold-soft 填充、gold 文字及下载图标，6px 圆角，最小高度 40px，内边距 8px 22px；宽度始终与上方照片一致（桌面最大 290px、手机最大 250px）；未提供文件时保留禁用与“简历待上传”状态。联系图标上间距与简历按钮上间距均为 16px。删除研究兴趣面板后不保留占位高度。

### Contact Icons and Tooltips

六个联系按钮水平排列，使用内联描边 SVG（21px），常态为灰色；悬停与键盘焦点共享暖金色与浅暖底色。通用可见焦点为暖金轮廓（2px，偏移 4px）。名称气泡位于图标上方，鼠标悬停或焦点位于按钮时显示，Escape 可收起；离开后重新进入或重新聚焦可再次显示。

激活图标复制其对应资料。空值只显示资料待提供的状态反馈；可用值先尝试 Clipboard API，再尝试兼容复制方式。不得把占位文字写入剪贴板。

### News Cards

动态卡片使用浅冷灰底、轻阴影和清楚的日期／标题／说明层级；标题字重较正文更重。动态列表间隔（16px）；卡片既不整块可点击，也没有悬停变形。

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
