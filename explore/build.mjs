import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const folder=dirname(fileURLToPath(import.meta.url)),root=dirname(folder);
await build({absWorkingDir:folder,entryPoints:['src/main.jsx'],bundle:true,minify:true,outfile:'app.js',legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
async function version(file){return createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12)}
const [app,style,header,directory,storage]=await Promise.all([
  ...['app.js','style.css','header.css'].map(file=>version(join(folder,file))),
  version(join(root,'site-pages.js')),version(join(root,'file-store.js'))
]);
const pages={'explore.html':'探索广场','food-map.html':'美食地图 · 探索广场','guaban-read.html':'瓜瓣READ · 探索广场','concepts.html':'概念集 · 探索广场'};
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
  <script src="file-store.js?v=${storage}" defer></script>
  <script src="site-pages.js?v=${directory}" defer></script>
  <script src="explore/app.js?v=${app}" defer></script>
</head>
<body><div id="root"></div><noscript>请启用 JavaScript 浏览探索广场。<a href="index.html">返回主页</a></noscript></body>
</html>
`;
  await writeFile(join(root,file),html);
}
