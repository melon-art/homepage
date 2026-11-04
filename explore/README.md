# 探索广场模块

入口为仓库根目录explore.html，三个卡牌目标food-map.html、guaban-read.html、concepts.html仍是内容待添加页。主站首页、设置、News与Updates保持原生实现。

src/main.jsx为React／Framer Motion源码，style.css与header.css为本模块样式。只修改源码后重建，不直接修改app.js或四个生成HTML。

首次开发，在本目录执行：

```text
npm ci
npm run build
```

生成的app.js、app.js.LEGAL.txt及根目录四个HTML随仓库保存，资源版本使用内容哈希。浏览现有站点不需要安装Node或构建，继续使用主站8765服务。node_modules不纳入版本控制。

顶部导航和Updates共用根site-pages.js；通过根file-store.js读取文件资料的englishName，支持pageshow／内容变化刷新，不写入或自行迁移资料。卡面内容读取SiteStorage.explore()（site.json.explore，旧文件兼容data/explore-defaults.json），设置侧栏探索广场可编辑／删除；原板块路由不变，剩余类型仍重复填充18卡，全空显示明确空态；跨标签变更同步。全部站内路径相对站点根目录文件，可部署于项目子路径。动态页面切换只处理探索模块自己的四个HTML，Home／News／设置通过普通链接离开模块。

页面设计见[DESIGN.md](DESIGN.md)，整体项目事实与验证见[PROJECT.md](../docs/PROJECT.md)和[TASKS.md](../docs/TASKS.md)。

三类卡面统一为浅银灰金属工牌，共用 SectionBadge，指针镭射与高光不覆盖文字；减少动态时静止。assets/内concept-preview、food-preview、read-preview各01至03共九张PNG是本地生成的临时页面版式截图，供后续替换，不是实际内容。各卡保留原名称、介绍和目标页面。
