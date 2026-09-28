数治理方 · 五端生态（桌面便携版 · 8080）
=====================================

【用途】
本文件夹可整体复制到 U 盘、网盘或其它电脑使用。请通过本地 HTTP 服务（端口 8080）在浏览器中打开，避免 file:// 限制，保证五端页面与脚本正常加载。

【使用方法】
1. 将整个「数治理方」文件夹拷贝到目标电脑任意目录（路径可含中文）。
2. 双击 OPEN.bat：
   - 会在新窗口中启动端口 8080 的静态文件服务；
   - 并尝试打开浏览器访问 http://127.0.0.1:8080/
3. 入口一般为 index.html；也可直接访问例如：
   http://127.0.0.1:8080/业主端.html

【环境要求】
- 默认无需安装：Windows 10/11 自带 PowerShell，双击 OPEN.bat 会用同目录下的 serve-8080.ps1 在 8080 端口提供静态站点。
- 若企业策略禁用 PowerShell 或缺少 serve-8080.ps1，OPEN.bat 会依次尝试：py -3、python、npx serve（需自行安装并加入 PATH）。
- 「python-installer」内为可选组件：默认只有说明与「GET-PYTHON-浏览器下载.bat」。需要自带安装包时，请先在本机下载 python-3.12.8-amd64.exe 放入该文件夹（或见其中 README），再整夹拷贝给他人。安装时务必勾选将 Python 加入 PATH。
- 关闭标题为「Eco-8080」的命令行窗口即停止服务。

【网络】
页面可能使用 CDN，建议联网。

【数据】
数据在浏览器 localStorage；换浏览器或清除站点数据会清空。

【说明】
已从体验版「生态」目录复制，已排除各 node_modules 以减小体积。若需在子目录开发 Vue 等，请在对应目录自行 npm install。

【重新生成】
在体验版 3.12 目录执行：
  powershell -ExecutionPolicy Bypass -File .\copy-eco-desktop-ascii.ps1
将重新复制生态并写入 OPEN.bat、serve-8080.ps1、README.txt，并复制 bundled\python-installer 至 python-installer。
