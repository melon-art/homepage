# Product — 产品上下文兼容摘要

<!-- impeccable:product-schema 1 -->

现行项目事实与状态统一见 [docs/PROJECT.md](docs/PROJECT.md) 和 [docs/TASKS.md](docs/TASKS.md)。本文件保留在根目录供 Impeccable 读取；迁移前原文见 [历史存档](docs/archive/PRODUCT-2026-11-02.md)。

## Platform

web

## Stack

原生 HTML 首页与设置页、内嵌 CSS、共享资料 JavaScript 与轻量 About 格式编辑脚本，无框架、构建、后台或数据库。

## Product Purpose

个人学术主页。当前已完成首页框架与基础交互，真实资料、公开简历和五个栏目页面尚未完成；线上发布状态待确认。

## Capabilities and Constraints

- News 标题旁的加号进入独立 `news-edit.html`；仅有标题与返回主页，主体按要求留空，尚无 News 填写或保存功能。

- 个人资料、About 和 News 展示；源文件默认值仍为明确占位，六个 CONTACTS 默认值为空。设置值可覆盖当前浏览器的资料展示。
- 六个横排图标复制资料，保留空值提示、兼容复制及失败后手动复制。复制机制已用模拟值验证，不代表真实账号已填入。
- 五个内容栏目只显示待更新；未选择 PDF 时简历禁用，选择并保存后支持当前浏览器下载。真实公开简历与线上路径仍待确认。
- 设置页支持主页全部待填资料（News 除外）：姓名、英文名、学历、学校／院系／专业、自由填写的 About 全文、六种联系方式、照片及 PDF。沿用原 localStorage 键，兼容旧姓名／学历记录；仅当前浏览器保存，不修改仓库或向全部访客发布。照片≤1 MB、PDF≤2 MB；文件预览只兼容文字，附件编辑使用 HTTP 预览。
- 无页脚，Research Interests 独立模块已删除；About 全文由用户填写，不自动生成研究或身份介绍；正文与 News 同宽，支持选词加粗、自选文字颜色及清除格式。长内容默认收起，桌面渐隐区域与照片底部对齐，手机六行预览；段末同行展开／收起，News 随之上下移动。
- 桌面／手机响应式；白底、暖金、衬线标题。完整规范见 [docs/DESIGN.md](docs/DESIGN.md)。
- 不编造个人资料、学术成果、计划完成状态或部署网址。不确定事实先记待确认。

## Open Decisions

真实资料、公开联系方式、PDF、News、栏目内容、页面最终语言和托管／域名待确认。是否采用框架或后台不是已确定计划。
