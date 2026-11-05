# 探索广场模块

本目录是局部 React／Framer Motion 源码；首页、设置、News 和 Updates 仍为原生页面。

| 路径 | 职责 |
| --- | --- |
| `main.jsx` | 转盘、卡面、地图／推荐路由及其余占位页 |
| `food-map/` | 地图、商圈推荐空页、投影与字体／样式源码 |
| `style.css`、`header.css` | 本模块样式源文件 |
| `build.mjs` | 打包并生成静态入口，资源版本为内容哈希 |
| `../../public/explore/` | 生成的JS／CSS与默认卡面PNG |
| `../../public/explore.html` | 探索门户生成入口 |
| `../../public/food-map.html`、`food-map-darongcheng.html`、`food-map-wudaokou.html` | 生成的地图与两个推荐空页 |
| `../../public/guaban-read.html`、`concepts.html` | 生成的内容待添加页 |

在仓库根目录执行：

```text
npm ci --prefix src/explore
npm run build --prefix src/explore
```

生成的JS、许可证、三个CSS及六个HTML随仓库保存；源码修改后重新构建，不直接改生成文件。浏览现有站点无需安装Node，继续双击根目录start-local.cmd使用8765服务。node_modules被Git忽略。

共享导航为 `public/assets/js/site-pages.js`，存储适配为 `public/assets/js/file-store.js`。读取同一份本地资料与卡牌内容，不自动迁移或写回英文名。路由仍为explore.html、food-map.html、guaban-read.html、concepts.html；Home／News／设置通过普通链接离开本模块。路径相对网站根目录，可在项目子路径下静态展示。

卡面通过SiteStorage.explore()读取；旧文件缺字段时使用public/data/explore-defaults.json，空数组保持删除态。编辑／删除后同步卡面与描述，剩余类型重复填充18卡；保留旋转、抽出／让位、指针光效、触屏与减少动态。美食卡进入正式地图；两个商圈推荐与另外两子页仍待真实内容。

美食地图使用三张PNG与本地字体，字体CSS只在地图及两个推荐页加载；地图内为StarLovePencil，导航及姓名保持主页字体，推荐页正文为GenRyuMin2 TC EL。字体来源／许可随public/explore/assets/fonts保存。构建不需要早期OSM矢量快照或仓库外生成工具，当前地理锚点与投影由poster-geography.js提供；详见[模块任务](../../docs/modules/explore/food-map.md)。

public/explore/assets/内九张PNG是生成的临时页面版式图，可在设置中替换。图片URL沿用explore/assets/...，与已保存的卡牌数据兼容。

视觉参数见 [DESIGN.md](DESIGN.md)，项目事实与状态见 [PROJECT](../../docs/PROJECT.md) 和 [TASKS](../../docs/TASKS.md)。
