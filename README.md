# 个人学术主页

原生 HTML／CSS／JavaScript 静态首页。**当前是可预览的页面草稿：基础布局和复制交互已实现，真实资料、简历下载和五个内容栏目尚未完成；线上发布状态待确认。**

## 从这里开始

| 文档 | 用途 |
| --- | --- |
| [PROJECT](docs/PROJECT.md) | 当前定位、技术栈、页面与逻辑架构 |
| [ROADMAP](docs/ROADMAP.md) | 建议阶段、依赖与退出条件 |
| [TASKS](docs/TASKS.md) | 已完成、进行中、待办、已知问题及验证证据 |
| [CHANGELOG](docs/CHANGELOG.md) | 本次起持续维护的变更与 Git 历史摘要 |
| [DESIGN](docs/DESIGN.md) | 完整配色、字体、布局、组件和交互规范 |
| [需求说明](docs/requirements.md) | 需求与验收目标，不代表当前完成情况 |
| [开发约定](AGENTS.md) | 开工阅读、最小变更、验证和文档更新规则 |

## 预览

直接用浏览器打开 `index.html`，无需安装应用依赖或构建。也可在本目录运行：

```text
python -m http.server 8765 --bind 127.0.0.1
```

在浏览器访问 `http://127.0.0.1:8765/`。Python 是可选预览工具。本地预览和 GitHub 推送均不代表公网发布。

## 主要实现

`index.html` 是唯一业务源，包含页面、样式、内联 SVG 和交互脚本。个人介绍／News 直接写在 HTML，联系方式写在 `CONTACTS`。当前六个值全部为空；未提供资料时只提示待提供。没有独立组件工程、数据库或后台。

简历目前只有禁用入口；必须加入真实 PDF、接通下载并测试后才能标记完成。五个栏目当前只有待更新提示。News 当前为一条占位卡片，没有自动排序代码。

## 项目维护

先按 AGENTS 阅读相关文档，选定任务与验收范围；完成后更新 TASKS、CHANGELOG 及受影响规范。草稿阶段只做必要检查，完整发布验收留待用户要求。未知状态明确待确认。

根 `PRODUCT.md`、`DESIGN.md` 和 `requirements.md` 保留为兼容入口／摘要；现行管理文档在 `docs`。`.impeccable/design.json` 是设计侧车，不是运行依赖。远程仓库为 `melon-art/homepage`，分支 `main`；托管地址与部署方式尚待确认。
