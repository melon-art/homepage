# Product — 产品上下文兼容摘要

<!-- impeccable:product-schema 1 -->

现行项目事实与状态统一见 [docs/PROJECT.md](docs/PROJECT.md) 和 [docs/TASKS.md](docs/TASKS.md)。本文件保留在根目录供 Impeccable 读取；迁移前原文见 [历史存档](docs/archive/PRODUCT-2026-11-02.md)。

## Platform

web

## Stack

原生单文件 HTML、内嵌 CSS 与 JavaScript，无框架、构建、后台或数据库。

## Product Purpose

个人学术主页。当前已完成首页框架与基础交互，真实资料、简历下载和五个栏目页面尚未完成；线上发布状态待确认。

## Capabilities and Constraints

- 个人资料、About 和 News 展示；当前全部为明确占位，六个 CONTACTS 值为空。
- 六个横排图标复制资料，保留空值提示、兼容复制及失败后手动复制。复制机制已用模拟值验证，不代表真实账号已填入。
- 五个内容栏目只显示待更新；简历缺少 PDF 且禁用，没有实际下载链接。
- 无页脚，Research Interests 独立模块已删除；About 内研究兴趣文字仍保留。
- 桌面／手机响应式；白底、暖金、衬线标题。完整规范见 [docs/DESIGN.md](docs/DESIGN.md)。
- 不编造个人资料、学术成果、计划完成状态或部署网址。不确定事实先记待确认。

## Open Decisions

真实资料、公开联系方式、PDF、News、栏目内容、页面最终语言和托管／域名待确认。是否采用框架或后台不是已确定计划。
