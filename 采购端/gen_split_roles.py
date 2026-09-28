#!/usr/bin/env python3
"""把采购端.html 拆成 4 个角色视角文件（数据联动：localStorage + BroadcastChannel）
输出：采购端_物业.html / 采购端_业委会.html / 采购端_社区.html / 采购端_商家.html
"""
import os

BASE = r"E:\360MoveData\Users\计算机\Desktop\数治理方\采购端"
SRC = os.path.join(BASE, "采购端.html")

with open(SRC, encoding="utf-8") as f:
    c = f.read()

ROLES = [
    ("wy", "🏢", "物业", "物业=发起/比价/验收申报 · 业委会=审批/定标/验收确认 · 社区=备案/审计", "采购端_物业.html"),
    ("yw", "⚖️", "业委会", "物业=发起/比价/验收申报 · 业委会=审批/定标/验收确认 · 社区=备案/审计", "采购端_业委会.html"),
    ("sq", "🏘", "社区", "社区=备案/审计 · 只读监督 · 物业/业委会执行采购与审批", "采购端_社区.html"),
    ("sj", "🏪", "商家", "商家=询价响应/报价/履约上报/结算 · 信用档案自动记录·可申诉", "采购端_商家.html"),
]

PERSIST = """var _lastSaved='';
var SYNC=null;
try{SYNC=new BroadcastChannel('sgzf_cg_sync');SYNC.onmessage=function(m){if(m.data==='upd'){loadState();var _busy=document.querySelector('.ov')||window._busyDetail||(document.getElementById('actMask')&&document.getElementById('actMask').classList.contains('show'))||(document.activeElement&&['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName)>=0)||(Date.now()-_lastPtr<600);if(!_busy)render()}if(m.data==='reset'){window._resetting=true;try{var _ks=[];for(var _i=0;_i<localStorage.length;_i++){var _k=localStorage.key(_i);if(_k&&_k.indexOf('sgzf_')===0)_ks.push(_k)}for(var _j=0;_j<_ks.length;_j++)localStorage.removeItem(_ks[_j])}catch(e){}_lastSaved='';location.reload()}}}catch(e){}
try{window.addEventListener('storage',function(e){if(e.key==='sgzf_cg_state_v1'){if(e.newValue===null){window._resetting=true;location.reload();return}loadState();var _busy=document.querySelector('.ov')||window._busyDetail||(document.activeElement&&['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName)>=0)||(Date.now()-_lastPtr<600);if(!_busy)render()}})}catch(e){}
function saveState(){if(window._resetting)return;
 try{
  var st={v:32,ORDERS:ORDERS,VENDORS:VENDORS,GOODS:GOODS,QUOTES:QUOTES,CONTRACTS:CONTRACTS,APPROVALS:APPROVALS,
   ACCEPTS:ACCEPTS,ACC_PEND:ACC_PEND,T2_APPS:T2_APPS,PROFILES:PROFILES,SJ_LOGIN:SJ_LOGIN,SJ_ACCOUNTS:SJ_ACCOUNTS,PERF_FILES:PERF_FILES,SJ_DEMO:SJ_DEMO,CHATS:CHATS,GATE_CFG:GATE_CFG,THRESH_LOG:THRESH_LOG};
  var js=JSON.stringify(st);
  if(js===_lastSaved)return;
  _lastSaved=js;
  localStorage.setItem('sgzf_cg_state_v1',js);
  try{if(SYNC)SYNC.postMessage('upd')}catch(e2){}
 }catch(e){}
}
function loadState(){
 try{
  var s=JSON.parse(localStorage.getItem('sgzf_cg_state_v1')||'null');
  if(!s||s.v!==32)return;
  if(s.ORDERS)ORDERS=s.ORDERS;
  if(s.VENDORS)VENDORS=s.VENDORS;
  if(s.GOODS)GOODS=s.GOODS;
  if(s.QUOTES)QUOTES=s.QUOTES;
  if(s.CONTRACTS)CONTRACTS=s.CONTRACTS;
  if(s.APPROVALS)APPROVALS=s.APPROVALS;
  if(s.ACCEPTS)ACCEPTS=s.ACCEPTS;
  if(s.ACC_PEND)ACC_PEND=s.ACC_PEND;
  if(s.T2_APPS)T2_APPS=s.T2_APPS;
  if(s.PROFILES)PROFILES=s.PROFILES;
  if(s.SJ_LOGIN!==undefined&&s.SJ_LOGIN!==null)SJ_LOGIN=s.SJ_LOGIN;
  if(s.SJ_ACCOUNTS)SJ_ACCOUNTS=s.SJ_ACCOUNTS;
  if(s.PERF_FILES)PERF_FILES=s.PERF_FILES;
  if(s.SJ_DEMO){SJ_DEMO=s.SJ_DEMO;SJ.rfqs=SJ_DEMO.rfqs;SJ.quotes=SJ_DEMO.quotes;SJ.orders=SJ_DEMO.orders;SJ.settles=SJ_DEMO.settles;}
  if(s.CHATS)CHATS=s.CHATS;
  if(s.GATE_CFG)GATE_CFG=s.GATE_CFG;
  if(s.THRESH_LOG)THRESH_LOG=s.THRESH_LOG;
   try{_lastSaved=localStorage.getItem('sgzf_cg_state_v1')||''}catch(e){}
 }catch(e){}
}
function resetDemo(){
 window._resetting=true;
 try{
  var ks=[];for(var i=0;i<localStorage.length;i++){var k2=localStorage.key(i);if(k2&&k2.indexOf('sgzf_')===0)ks.push(k2)}
  for(var j=0;j<ks.length;j++)localStorage.removeItem(ks[j]);
 }catch(e){}
 _lastSaved='';
 try{SYNC.postMessage('reset')}catch(e){}
 location.reload();
}
var _lastPtr=0;document.addEventListener('pointerdown',function(){_lastPtr=Date.now()});
/* ===== 登录界面（四端统一 · 独立全屏页 · 默认账号密码已填入） ===== */
var _GATE={wy:{acc:'wy',name:'物业',icon:'🏢',tip:'物业张经理'},yw:{acc:'yw',name:'业委会',icon:'⚖️',tip:'业委会王主任'},sq:{acc:'sq',name:'社区',icon:'🏘',tip:'社区网格员'},sj:{acc:'',name:'商家',icon:'🏪',tip:'商家账号'}};
function gateInit(){
 if(localStorage.getItem('sgzf_login_'+ROLE)==='1')return;
 var g=_GATE[ROLE];if(!g)return;
 var d=document.createElement('div');d.id='loginPage';
 var accHtml='';
 if(ROLE==='sj'){
  accHtml='<div class="fld"><label>商家账号</label><select id="lgU">'+SJ_ACCOUNTS.map(function(n){return '<option value="'+n+'">'+n+(n==='通力电梯'||n==='金盾消防'?'（演示商家）':'（新入驻 · T1）')+'</option>'}).join('')+'</select></div>';
 }else{
  accHtml='<div class="fld"><label>账号</label><input id="lgU" value="'+g.acc+'"></div>';
 }
 var subTxt=g.tip+' · 账号密码验证后进入';
 var footTxt='';
 if(ROLE==='sq'){
  subTxt='街道网格员 · 监督查阅本街道全部小区采购';
  footTxt='<div class="lg-duty">监督职责：查阅每一笔采购明细 · 唯一操作 = L3 大额采购备案接收</div>';
 }
 d.innerHTML='<div class="lgwrap"><div class="lgbox"><div class="lg-brand">数治理方</div><div class="lg-ic">'+g.icon+'</div><h3>'+(ROLE==='sq'?'社区监督端':g.name+'端')+'</h3>'+
 footTxt+
 accHtml+
 '<div class="fld"><label>密码</label><input id="lgP" type="password" value="123456"></div>'+
 '<button class="btn g" style="width:100%;justify-content:center" onclick="gateLogin()">登录进入系统</button>'+
 (ROLE==='sj'?'<button class="btn o" style="width:100%;justify-content:center;margin-top:8px" onclick="gateApply()">📝 新商家 · 申请入驻</button>':'')+
 '</div></div>';
 document.body.appendChild(d);
}
function gateClose(){var d=document.getElementById('loginPage');if(d)d.remove()}
function gateLogin(){
 var g=_GATE[ROLE];if(!g)return;
 var u=(document.getElementById('lgU')||{}).value.trim();
 var p=(document.getElementById('lgP')||{}).value;
 if(ROLE==='sj'){
  if(p!=='123456'){toast('密码错误（演示密码：123456）');return}
  localStorage.setItem('sgzf_login_sj','1');
  var _lg=document.getElementById('lgSel');if(_lg)_lg.value=u;
  sjLogin();
  gateClose();
  return;
 }
 if(u!==g.acc||p!=='123456'){toast('账号或密码错误（演示账号：'+g.acc+' / 123456）');return}
 localStorage.setItem('sgzf_login_'+ROLE,'1');
 gateClose();
 toast('✅ 登录成功 · 欢迎回来，'+g.tip);
 render();
}
function gateApply(){
 if(ROLE!=='sj')return;
 gateClose();
 TAB='apply';buildNav();render();
}
function gateLogout(){
 localStorage.removeItem('sgzf_login_'+ROLE);
 if(ROLE==='sj'){SJ_LOGIN=null;TAB='gate';buildNav();render();setTimeout(gateInit,50);return}
 location.reload();
}
try{setTimeout(gateInit,0)}catch(e){}



window.addEventListener('focus',function(){loadState();render()});
/* 演示数据恢复 · 隐蔽入口：右上角小区选择器连续点击5次（间隔<800ms）触发，页面无任何可见痕迹 */
(function(){var _cc=0,_ct=0;var cs=document.getElementById('commSel');if(cs){function _tap(){var n=Date.now();if(n-_ct<800){_cc++;if(_cc>=5){_cc=0;resetDemo()}}else{_cc=1}_ct=n}cs.addEventListener('pointerdown',_tap);cs.addEventListener('click',_tap)}})();
"""

for role, icon, label, ftrole, outname in ROLES:
    d = c

    # 1. 标题
    d = d.replace("<title>数治理方 · 采购端</title>", "<title>数治理方 · 采购端 · %s</title>" % label)

    # 2. 角色固定
    d = d.replace("var ROLE='wy', TAB='over';", "var ROLE='%s', TAB='%s';" % (role, 'gate' if role == 'sj' else 'over'))

    # 3. 角色切换按钮 → 固定徽标
    old_seg = """    <div class="seg" id="roleSeg">
      <button class="on" onclick="setRole('wy')">🏢 物业视角</button>
      <button onclick="setRole('yw')">⚖️ 业委会视角</button>
      <button onclick="setRole('sq')">🏘 社区视角</button>
      <button onclick="setRole('sj')">🏪 商家视角</button>
    </div>"""
    new_seg = """    <div class="seg" id="roleSeg">
      <button class="on">%s %s</button>
    </div>""" % (icon, label)
    assert old_seg in d, "roleSeg 区块未匹配"
    d = d.replace(old_seg, new_seg)

    # 4. 页脚角色说明 + 重置按钮
    old_ft = '<span><b>角色权限</b>：<span id="ftRole">物业=发起/比价/验收申报 · 业委会=审批/定标/验收确认 · 社区=备案/审计</span></span>'
    new_ft = '<span><b>当前角色</b>：%s</span>' % ftrole
    assert old_ft in d, "页脚角色说明未匹配"
    d = d.replace(old_ft, new_ft)

    # 3.5 setRole 的 roleSeg 高亮 → no-op（固定角色文件无切换，避免误伤徽标与 rst 按钮）
    old_hl = "document.querySelectorAll('#roleSeg button').forEach(function(b,i){b.classList.toggle('on',(r==='wy'&&i===0)||(r==='yw'&&i===1)||(r==='sq'&&i===2)||(r==='sj'&&i===3))});"
    new_hl = "/* 固定角色文件：角色徽标静态高亮，无切换逻辑 */"
    assert old_hl in d, "setRole 高亮锚点未匹配"
    d = d.replace(old_hl, new_hl)

    # 3.6 社区文件：导航删发起采购（模块名与其他角色一致）
    if role == "sq":
        old_nav = "['over','📊 采购总览','状态机'],['apply','➕ 发起采购','五道闸'],['quote','⚖️ 比价看板','留痕'],"
        new_nav = "['over','📊 采购总览','状态机'],['quote','⚖️ 比价看板','留痕'],"
        assert old_nav in d, "社区导航锚点1未匹配"
        d = d.replace(old_nav, new_nav)

    # 4.5 setRole 里 ftRole 引用改为空安全（页脚 ftRole 已被"当前角色"替换）
    old_fr = "document.getElementById('ftRole').textContent=m[r][1];"
    new_fr = "var _fr=document.getElementById('ftRole');if(_fr)_fr.textContent=m[r][1];"
    assert old_fr in d, "ftRole 引用未找到"
    d = d.replace(old_fr, new_fr)

    # 5. 注入持久化层（脚本开头，数据定义之后不好定位——直接放在 var ROLE 行后）
    anchor = "var ROLE='%s', TAB='%s';" % (role, 'gate' if role == 'sj' else 'over')
    assert anchor in d
    d = d.replace(anchor, anchor + "\n" + PERSIST, 1)

    # 6. render() 出口自动保存
    old_render = " document.getElementById('main').innerHTML=body;\n}"
    new_render = " document.getElementById('main').innerHTML=body;\n saveState();\n}"
    assert d.count(old_render) == 1, "render 出口匹配数=%d" % d.count(old_render)
    d = d.replace(old_render, new_render)

    # 7. 启动：loadState 后渲染（锚点=脚本末尾的启动行，紧邻 </script>）
    old_boot = "buildNav();render();\n</script>"
    new_boot = "loadState();setRole(ROLE);buildNav();render();\n</script>"
    assert old_boot in d, "启动锚点未找到"
    d = d.replace(old_boot, new_boot, 1)

    out = os.path.join(BASE, outname)
    with open(out, "w", encoding="utf-8") as f:
        f.write(d)
    print("已生成:", outname, "{:.1f} KB".format(os.path.getsize(out) / 1024))
