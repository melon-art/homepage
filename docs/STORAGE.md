# 本地文件保存

FILE-001，2026-11-04。只在电脑本地保存，不执行Git提交或上传GitHub。首次迁移必须从原浏览器、原来源地址读取旧内容；测试使用隔离样例，不会代替迁移真实资料。

## 日常使用

双击项目根目录start-local.cmd，或运行 `python server/server.py --port 8765`。电脑编辑使用 `http://127.0.0.1:8765/`；保持服务运行。电脑需要Python 3.9+，不需要第三方包。普通静态预览服务不能写入文件，file://不再支持编辑。只看空白界面可运行 `python -m http.server 8770 --bind 127.0.0.1 --directory public`；它读取 public/data 中的模板，不会自动包含外侧的真实资料／附件。日常查看和编辑真实内容请使用文件服务，不要把普通静态服务开在项目根目录。

手机连接同一网络，用电脑当前IPv4地址访问8765端口。手机只读，读取电脑文件中的已保存内容；草稿、备份、写入接口只允许电脑回环地址使用。没有手机编辑、登录系统、云端同步或公网部署。网络／防火墙导致的手机访问问题需根据实际环境确认。

## 迁移旧浏览器内容

1. 在原来填写内容的浏览器打开原地址的设置页，默认 `http://127.0.0.1:8765/settings.html`。顶部“本地数据”会显示当前浏览器的个人资料、News和Updates数量；数量不符时先回原浏览器／原地址，不使用空白文件初始化。
2. 可先点击“下载浏览器备份”，得到含图片／附件编码的JSON。
3. 点击“备份并迁移至本地文件”。服务器先在.local/backups/migration-*中保留原始浏览器快照，再写文件。个人资料、About样式、News附件、Updates目标和草稿均保留。
4. 成功后页面刷新为文件模式，表单可保存；旧localStorage和两个IndexedDB不删除，但之后编辑不会写回它们。文件已初始化时，不会重复用旧浏览器数据覆盖。

原数据库名称为academic-homepage.profile.v1、academic-homepage.news.v1、academic-homepage.updates.v1。首次仅迁移当前来源中的记录；不自动合并其他端口或浏览器。旧内容为空时提供“使用空白文件开始”，操作前提示可能还有其他来源数据。

## 文件与附件

2026-11-05目录整理后，网页位于 public/，服务位于 server/。以下真实内容、附件和备份的物理位置没有变化，浏览器仍用原8765地址，既有JSON中的路径也不改写。public/data/只存可提交的空白模板和原卡牌默认配置。

| 路径 | 内容 |
| --- | --- |
| data/site.json | schemaVersion、revision、initialized、profileRevision、profile、news、updates、explore |
| assets/uploads/ | 公开展示所引用的图片／PDF／文件，文件名为内容哈希 |
| .local/drafts.json | Updates草稿，与公开updates列表分离 |
| .local/uploads/ | 草稿图片，仅本机API可读取 |
| .local/backups/ | 有效修改前的site／drafts快照；首次迁移另含browser-snapshot.json |
| .local/transaction.json | 保存事务日志，异常中断后启动时恢复 |

探索卡牌集合通过设置内探索广场管理，旧文件缺explore时读取public/data/explore-defaults.json；空数组表示用户已全部删除。编辑只改标题／介绍／图片，原目标固定，卡牌图片也纳入ZIP。默认示意图随源码保留，不拷进上传目录。

JSON附件结构为 `{name,path,type,size}`，正文不内嵌图片编码。前端适配层仍向现有组件提供Blob或data URL，保留已有表单与渲染接口。本地填写的数据、上传附件和备份均不纳入本次Git同步：data/site.json、assets/uploads/和.local被Git忽略。仓库只提供空白public/data/site.example.json和原卡牌默认配置，首次启动文件服务自动建立本地文件；静态预览缺少site.json时读取空白模板。以后若需公开内容，应单独决定范围。

照片≤1 MB、简历PDF≤2 MB、News／Updates图片≤5 MB、News文件≤10 MB，沿用现有约束。删除／更换后旧附件暂不清理，便于历史备份仍引用原内容；没有自动附件垃圾回收。

## 保存与备份

设置页“下载完整文件备份”生成ZIP，含当前公开内容、草稿和引用附件。每次修改前还会自动保留旧JSON；文件采用临时写入后原子替换，跨公开／草稿文件用事务日志保护。磁盘或网络错误不假报成功，表单保留输入；资料／记录版本冲突会明确拒绝旧页面覆盖。

自动备份在同一磁盘，不替代异地备份。建议定期下载ZIP并复制到其他位置。尚无一键恢复或导入备份界面；恢复可在停止服务、另存当前项目副本后，将完整ZIP中的data/site.json、assets/uploads和.local中的草稿／附件按原路径放回，再重启。仅恢复某次JSON快照时须同时恢复对应site和drafts，并保留它们引用的附件。

## 验证与范围

`python -m unittest discover -s tests -p test_storage.py -v`使用临时目录，覆盖迁移、文件、版本冲突、磁盘失败／日志恢复和HTTP边界。浏览器样例检查还覆盖原数据库保留、各表单保存、备份ZIP、跨浏览器及手机只读、断网后输入保留。真实浏览器的首次迁移状态仍须看设置页，手机硬件可达性与公网部署另行验收。
