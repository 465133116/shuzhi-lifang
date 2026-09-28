#!/usr/bin/env python3
"""生成三端合并演示包：采购端 + 机器人监控 + 政府端 → 单文件 HTML（iframe srcdoc 内嵌）"""
import os

BASE = r"E:\360MoveData\Users\计算机\Desktop\数治理方"
FILES = [
    ("cai", "🏛 采购端", os.path.join(BASE, "采购端", "采购端.html")),
    ("robot", "🤖 机器人监控", os.path.join(BASE, "物业端_机器人监控.html")),
    ("gov", "🏛 政府端", os.path.join(BASE, "政府端", "政府端.html")),
]
OUT = os.path.join(BASE, "shuzhi_demo_pack.html")


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;")


iframes = []
for key, label, path in FILES:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    iframes.append(
        '<iframe id="f_{}" class="frm" srcdoc="{}"></iframe>'.format(key, esc(content))
    )
body = "\n".join(iframes)

shell = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>数治理方 · 三端演示包</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:#eef1f5;height:100vh;display:flex;flex-direction:column;overflow:hidden}
.hd{background:linear-gradient(90deg,#0f172a,#1e293b);color:#fff;display:flex;align-items:center;gap:6px;padding:10px 16px;flex-shrink:0}
.hd .logo{font-size:15px;font-weight:700;margin-right:auto}
.hd .logo span{color:#22d3ee}
.tab{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#cbd5e1;border-radius:8px;padding:7px 14px;font-size:13px;cursor:pointer;font-family:inherit;transition:.15s}
.tab:hover{background:rgba(255,255,255,.2)}
.tab.on{background:#fff;color:#0f172a;font-weight:700;border-color:#fff}
.wrap{flex:1;position:relative}
.frm{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;display:none}
.frm.on{display:block}
</style>
</head>
<body>
<div class="hd">
  <div class="logo">数治理方 <span>·</span> 三端演示包</div>
  <button class="tab on" id="t_cai" onclick="sw('cai')">🏛 采购端</button>
  <button class="tab" id="t_robot" onclick="sw('robot')">🤖 机器人监控</button>
  <button class="tab" id="t_gov" onclick="sw('gov')">🏛 政府端</button>
</div>
<div class="wrap">
""" + body + """
</div>
<script>
var CUR='cai';
function sw(k){
 CUR=k;
 var tabs=['cai','robot','gov'];
 tabs.forEach(function(t){
  document.getElementById('t_'+t).classList.toggle('on',t===k);
  document.getElementById('f_'+t).classList.toggle('on',t===k);
 });
}
</script>
</body>
</html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(shell)

print("已生成:", OUT)
print("大小: {:.1f} KB".format(os.path.getsize(OUT) / 1024))
