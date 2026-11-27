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

# 设计规范兼容入口

完整、现行的视觉规范统一维护于 [docs/DESIGN.md](docs/DESIGN.md)。本文件只保留同一份 frontmatter 的同步快照，供默认读取根目录的 Impeccable 工具使用，不另行维护设计叙述。

视觉参数改变时，同时更新完整规范、本文件 frontmatter 与 `.impeccable/design.json`。冲突时先比对实际代码，并将未确认差异记入 [TASKS.md](docs/TASKS.md)，不要静默选择任意版本。
