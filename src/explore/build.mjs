import {build} from 'esbuild';
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,'../..');
const publicFolder=join(root,'public'),output=join(publicFolder,'explore');
await mkdir(output,{recursive:true});
await build({absWorkingDir:folder,entryPoints:['main.jsx'],bundle:true,minify:true,outfile:join(output,'app.js'),legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
await Promise.all([
  copyFile(join(folder,'header.css'),join(output,'header.css')),
  copyFile(join(folder,'food-map/fonts.css'),join(output,'food-map-fonts.css')),
  Promise.all(['style.css','food-map/FoodMap.css'].map(file=>readFile(join(folder,file),'utf8')))
    .then(styles=>writeFile(join(output,'style.css'),styles.join('\n')))
]);
async function version(file){return createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12)}
const [app,style,header,directory,storage,navigation,navigationScript,typography]=await Promise.all([
  ...['app.js','style.css','header.css'].map(file=>version(join(output,file))),
  version(join(publicFolder,'assets/js/site-pages.js')),version(join(publicFolder,'assets/js/file-store.js')),
  version(join(publicFolder,'assets/css/navigation.css')),version(join(publicFolder,'assets/js/navigation.js')),
  version(join(publicFolder,'assets/css/typography.css'))
]);
// All routes share the approved site face, including in-document navigation.
const pages={'explore.html':'探索广场','food-map.html':'美食地图 · 探索广场','food-map-darongcheng.html':'大融城推荐 · 美食地图','food-map-wudaokou.html':'五道口推荐 · 美食地图','guaban-read.html':'瓜瓣READ · 探索广场','concepts.html':'概念集 · 探索广场'};
for(const [file,title] of Object.entries(pages)){
  const html=`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="探索广场：美食地图、瓜瓣READ、概念集。">
  <title>${title}</title>
  <link rel="stylesheet" href="explore/style.css?v=${style}">
  <link rel="stylesheet" href="explore/header.css?v=${header}">
  <link rel="stylesheet" href="assets/css/navigation.css?v=${navigation}">
  <link rel="stylesheet" href="assets/css/typography.css?v=${typography}">
  <script src="assets/js/file-store.js?v=${storage}" defer></script>
  <script src="assets/js/site-pages.js?v=${directory}" defer></script>
  <script src="assets/js/navigation.js?v=${navigationScript}" defer></script>
  <script src="explore/app.js?v=${app}" defer></script>
</head>
<body><div id="root"></div><noscript>请启用 JavaScript 浏览探索广场。<a href="index.html">返回主页</a></noscript></body>
</html>
`;
  await writeFile(join(publicFolder,file),html);
}
