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

# 设计规范兼容入口

完整、现行的视觉规范统一维护于 [docs/DESIGN.md](docs/DESIGN.md)。本文件只保留同一份 frontmatter 的同步快照，供默认读取根目录的 Impeccable 工具使用，不另行维护设计叙述。

视觉参数改变时，同时更新完整规范、本文件 frontmatter 与 `.impeccable/design.json`。冲突时先比对实际代码，并将未确认差异记入 [TASKS.md](docs/TASKS.md)，不要静默选择任意版本。
