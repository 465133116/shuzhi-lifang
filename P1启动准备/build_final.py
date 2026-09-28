import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

wb = openpyxl.Workbook()

# ============================================================
# Styles
# ============================================================
hdr_font = Font(name='微软雅黑', size=11, bold=True, color='FFFFFF')
hdr_fill = PatternFill(start_color='0f172a', end_color='0f172a', fill_type='solid')
sub_fill = PatternFill(start_color='1e293b', end_color='1e293b', fill_type='solid')
title_font = Font(name='微软雅黑', size=15, bold=True, color='f8fafc')
section_font = Font(name='微软雅黑', size=12, bold=True, color='94a3b8')
body_font = Font(name='微软雅黑', size=10, color='e2e8f0')
note_font = Font(name='微软雅黑', size=9, color='64748b')
bold_font = Font(name='微软雅黑', size=10, bold=True, color='e2e8f0')
thin_border = Border(
    left=Side(style='thin', color='1e293b'),
    right=Side(style='thin', color='1e293b'),
    top=Side(style='thin', color='1e293b'),
    bottom=Side(style='thin', color='1e293b')
)
wrap = Alignment(wrap_text=True, vertical='center')
center = Alignment(horizontal='center', vertical='center', wrap_text=True)
dark_bg = PatternFill(start_color='0b1120', end_color='0b1120', fill_type='solid')
card_bg = PatternFill(start_color='0f172a', end_color='0f172a', fill_type='solid')

# Category accent fills
ca = {
    'F': PatternFill(start_color='1e1b4b', end_color='1e1b4b', fill_type='solid'),
    'E': PatternFill(start_color='1f1118', end_color='1f1118', fill_type='solid'),
    'A': PatternFill(start_color='1f180a', end_color='1f180a', fill_type='solid'),
    'B': PatternFill(start_color='0a1e16', end_color='0a1e16', fill_type='solid'),
    'D': PatternFill(start_color='1f1208', end_color='1f1208', fill_type='solid'),
    'C': PatternFill(start_color='14171c', end_color='14171c', fill_type='solid'),
}
cf = {
    'F': Font(name='微软雅黑', size=10, color='a78bfa'),
    'E': Font(name='微软雅黑', size=10, color='f87171'),
    'A': Font(name='微软雅黑', size=10, color='fbbf24'),
    'B': Font(name='微软雅黑', size=10, color='34d399'),
    'D': Font(name='微软雅黑', size=10, color='fb923c'),
    'C': Font(name='微软雅黑', size=10, color='94a3b8'),
}
track_mp = PatternFill(start_color='0f2744', end_color='0f2744', fill_type='solid')
track_cs = PatternFill(start_color='2d1a3a', end_color='2d1a3a', fill_type='solid')
green_bg = PatternFill(start_color='0a1e16', end_color='0a1e16', fill_type='solid')

def hdr(ws, row, n, f=None):
    for c in range(1, n+1):
        cell = ws.cell(row=row, column=c)
        cell.font = hdr_font; cell.fill = f or hdr_fill
        cell.alignment = center; cell.border = thin_border

def bd(ws, r1, r2, n):
    for r in range(r1, r2+1):
        for c in range(1, n+1):
            cell = ws.cell(row=r, column=c)
            cell.font = body_font; cell.alignment = wrap; cell.border = thin_border

def ttl(ws, title, row=1, m=None):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=m or 8)
    ws.cell(row=row, column=1, value=title).font = title_font
    ws.cell(row=row, column=1).fill = dark_bg
    row += 1
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=m or 8)
    ws.cell(row=row, column=1, value=f'数治理方 P1 · 业主分类逻辑 · {datetime.now().strftime("%Y-%m-%d")}').font = note_font
    ws.cell(row=row, column=1).fill = dark_bg
    return row + 2

def sec(ws, row, title, m=None):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=m or 8)
    ws.cell(row=row, column=1, value=title).font = section_font
    ws.cell(row=row, column=1).fill = dark_bg
    return row + 2

def wd(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

def cat_cell(ws, row, col, cat, val):
    c = ws.cell(row=row, column=col, value=val)
    if cat in ca: c.fill = ca[cat]; c.font = cf[cat]
    c.border = thin_border; c.alignment = center
    return c

# ============================================================
# Sheet 1: 总览
# ============================================================
ws1 = wb.active
ws1.title = '1-总览'
ws1.sheet_properties.tabColor = '0f172a'
r = ttl(ws1, '业主分类逻辑 · 总览', m=6)
wd(ws1, [16,30,30,30,22,28])

r = sec(ws1, r, '▌核心流程', m=6)

# Flow strip
flow = ['双轨数据采集', '→', '信号合并(OR)', '→', 'F>E>A>B>D>C', '→', '辅助维度', '→', '分类输出']
frow = r
for i, f in enumerate(flow):
    ws1.cell(row=frow, column=i+1, value=f).font = Font(name='微软雅黑', size=11, bold=True, color='94a3b8' if f=='→' else 'e2e8f0')
    ws1.cell(row=frow, column=i+1).alignment = center
    ws1.cell(row=frow, column=i+1).fill = dark_bg
    ws1.cell(row=frow, column=i+1).border = thin_border
r += 3

# Two tracks
r = sec(ws1, r, '▌两大数据轨道', m=6)

# Track MP header row
ws1.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
ws1.cell(row=r, column=1, value='📱 小程序轨道').font = Font(name='微软雅黑', size=13, bold=True)
ws1.cell(row=r, column=1).fill = track_mp; ws1.cell(row=r, column=1).alignment = center
ws1.cell(row=r, column=1).border = thin_border
for c in range(2,4): ws1.cell(row=r, column=c).fill = track_mp; ws1.cell(row=r, column=c).border = thin_border

ws1.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
ws1.cell(row=r, column=4, value='🎧 客服轨道').font = Font(name='微软雅黑', size=13, bold=True)
ws1.cell(row=r, column=4).fill = track_cs; ws1.cell(row=r, column=4).alignment = center
ws1.cell(row=r, column=4).border = thin_border
for c in range(5,7): ws1.cell(row=r, column=c).fill = track_cs; ws1.cell(row=r, column=c).border = thin_border
r2 = r + 1

mp_data = [
    ['核心问题', '业主做了什么', '行为数据', '业主说了什么', '对话数据'],
    ['数据性质', '结构化(工单系统+埋点)', '', '非结构化(通话记录+文本)', ''],
    ['关键字段', 'li,tp,st,rt,de,ca,sr,ct', '', 'rs,nt,t', ''],
    ['可产生信号', 'A · E(攻击/差评) · C4 · C5', '', 'B · D · E(拒接/拒缴) · C1~C3', ''],
    ['不能产生', 'B · D · C1~C3(需通话内容)', '', 'C5(需工单闭环事件)', ''],
    ['衰减周期', '30天半衰', '工单类信号', '14天半衰', '通话类信号'],
    ['交叉影响', '登录→D消除 | 工单→E修正', '', '新nt→覆盖B | 无争议→D+1', ''],
    ['数据更新', '事件驱动(提交/闭环/登录)', '', '每次通话后实时更新', ''],
]
row_labels = ['核心问题','数据性质','关键字段','可产生信号','不能产生','衰减周期','交叉影响','数据更新']
for i, d in enumerate(mp_data):
    row = r2 + i
    ws1.cell(row=row, column=1, value=d[0]).font = bold_font
    ws1.cell(row=row, column=1).fill = track_mp; ws1.cell(row=row, column=1).alignment = center
    ws1.cell(row=row, column=1).border = thin_border
    ws1.cell(row=row, column=2, value=d[1]).font = body_font; ws1.cell(row=row, column=2).fill = track_mp
    ws1.cell(row=row, column=2).border = thin_border
    ws1.cell(row=row, column=3, value=d[2]).font = body_font; ws1.cell(row=row, column=3).fill = track_mp
    ws1.cell(row=row, column=3).border = thin_border
    ws1.cell(row=row, column=4, value=d[3]).font = body_font; ws1.cell(row=row, column=4).fill = track_cs
    ws1.cell(row=row, column=4).border = thin_border
    ws1.cell(row=row, column=5, value=d[4]).font = body_font; ws1.cell(row=row, column=5).fill = track_cs
    ws1.cell(row=row, column=5).border = thin_border
    ws1.cell(row=row, column=6, value='').fill = track_cs; ws1.cell(row=row, column=6).border = thin_border
r += 13

# Decision pipeline summary
r = sec(ws1, r, '▌判定流水线 F>E>A>B>D>C', m=6)
pipe_data = [
    ['① F', 'lb含特殊关键词?', 'F·历史复杂', '独立通道，不参与后续', '5子类型', '—'],
    ['② E', '有对抗信号?', 'E·对抗态度', '拒接≥3/攻击/拒缴/差评≥3', 'E1-E4 四型', '—'],
    ['③ A', '有未闭环工单?', 'A·有具体争议', '报修/投诉工单(含客服草稿)', '6子类型', '📱'],
    ['④ B', '通话中表达困难?', 'B·经济困难', 'nt含困难关键词·B2/B3可做主分类', 'B1-B3 + 矩阵', '🎧'],
    ['⑤ D', '无争议承诺≥2次?', 'D·惯性失约', 'rs=无争议有效计数≥2', 'D1-D4 四级', '🎧'],
    ['⑥ C', '以上全否 → C细分', 'C·无信号(兜底)', 'C1-C6 六类判定流水线', '6子类型', '—'],
]
row_p = r
for i, d in enumerate(pipe_data):
    row = row_p + i
    cat = d[2][0]
    for j, v in enumerate(d):
        c = ws1.cell(row=row, column=j+1, value=v)
        c.border = thin_border
        if j == 2: c.fill = ca.get(cat, dark_bg); c.font = cf.get(cat, body_font); c.alignment = center
        elif j == 5: c.fill = track_mp if '📱' in v else track_cs if '🎧' in v else card_bg; c.alignment = center
    ws1.cell(row=row, column=1).font = bold_font
hdr(ws1, row_p, 6, sub_fill)

# ============================================================
# Sheet 2: 小程序轨道
# ============================================================
ws2 = wb.create_sheet('2-📱小程序轨道')
ws2.sheet_properties.tabColor = '3b82f6'
r = ttl(ws2, '📱 小程序轨道 · 行为数据', m=5)
wd(ws2, [14,18,22,35,35])

r = sec(ws2, r, '▌采集的原始字段', m=5)
mp_headers = ['字段', '含义', '取值', '用途', '影响信号']
row_h = r
for i, h in enumerate(mp_headers):
    ws2.cell(row=row_h, column=i+1, value=h)
hdr(ws2, row_h, 5, sub_fill)

mp_fields = [
    ['li', '是否登录小程序', 'true / false', 'D消除 · 触达能力判断', 'D消除 · E修正'],
    ['tp', '工单类型', 'baoxiu / tousu / jianyi', 'A信号判定', 'A'],
    ['st', '工单状态', 'pending / processing / waitReview / done', 'A信号是否消除', 'A'],
    ['rt', '满意度评分', '1~5 星', 'A消除条件 · C4信任缺失判定', 'A · C4 · E4'],
    ['ct', '工单创建时间', '日期', '时间衰减计算(30天半衰)', '全部信号'],
    ['de', '工单描述文本', '字符串', '攻击性投诉检测(E2) · 反复型判断', 'E2 · A·反复型'],
    ['sr', '工单来源', 'owner / draft', 'A信号生成权重差异', 'A'],
    ['ca', '问题分类', '水管漏水 / 电梯故障 / ...', '同问题反复检测', 'A·反复型'],
]
for i, d in enumerate(mp_fields):
    row = row_h + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v).fill = track_mp
        ws2.cell(row=row, column=j+1).font = body_font
        ws2.cell(row=row, column=j+1).border = thin_border

r = row_h + len(mp_fields) + 3

r = sec(ws2, r, '▌本轨道可独立产生的信号', m=5)
mp_sig_headers = ['信号', '产生规则', '消除规则', '信号强度计算', '备注']
row_sh = r
for i, h in enumerate(mp_sig_headers):
    ws2.cell(row=row_sh, column=i+1, value=h)
hdr(ws2, row_sh, 5, sub_fill)

mp_sigs = [
    ['A', 'tp∈{baoxiu,tousu} AND st≠done → A=on\nsr=draft AND 无小程序工单 → A=on', 'st=done AND rt≥3星 → A消除\n差评非"问题没解决"→A消除但产生副作用', '未闭环数×40 + 报修数×15\n+ 投诉数×20 − 满意度×10', '最核心的小程序信号'],
    ['E·攻击', 'de含攻击关键词(辱骂/威胁/群内攻击)\n→ E2·攻击型触发', '工单闭环后消除', '攻击投诉数×35', '通过工单描述文本检测'],
    ['E·差评', '态度差评(rt≤2·原因=态度)累计≥3次\n→ E4·差评累积型触发', '近30天态度差评<3次→消除', '态度差评数×20', '注意区分"问题没解决"差评'],
    ['C4', '历史rt<3星 AND 无tousu工单\n→ C4·信任缺失', '提交正式投诉→转A·投诉型\n工单闭环好评→消除', '—', '不满但不够A类程度'],
    ['C5', 'A消除后自动产生\n→ C5·已解决', '60天无新行为→C6·信息不足\n出现新信号→重新分类', '—', 'A消除后的过渡态'],
]
for i, d in enumerate(mp_sigs):
    row = row_sh + 1 + i
    for j, v in enumerate(d):
        c = ws2.cell(row=row, column=j+1, value=v)
        c.fill = track_mp; c.font = body_font; c.border = thin_border
        if j == 0: c.font = bold_font; c.alignment = center

r = row_sh + len(mp_sigs) + 3

r = sec(ws2, r, '▌交叉影响（小程序→客服轨道）', m=4)
ci_headers = ['影响', '触发条件', '效果', '说明']
row_ci = r
for i, h in enumerate(ci_headers):
    ws2.cell(row=row_ci, column=i+1, value=h)
hdr(ws2, row_ci, 4, sub_fill)

ci_data = [
    ['D消除', 'li = true', 'D信号立即消除，D计数归零', '登录行为被认为是最强的履约意愿信号，覆盖一切承诺记录'],
    ['E拒接修正', '小程序工单数 > 0', '拒接有效计数 = 拒接次数 − min(拒接次数, 小程序工单数)', '有工单行为的业主，拒接不完全算对抗——可能只是不想接电话但愿意用小程序'],
    ['A·反复型', '同ca的工单 ≥ 3次', '标记A·反复型，回访时重点询问根因', '同问题反复出现=物业没修好或业主挑剔，需人判'],
    ['A·高优先级', '未闭环 ≥ 3 或 超SLA ≥ 7天', '标记A·高优先级型，响应级别→R0', '频次/时效驱动的紧急标记'],
    ['A·首次型', '首次产生A信号(无历史A消除)', '标记A·首次型，24h黄金窗口', '首次问题快速响应大幅提升满意度'],
]
for i, d in enumerate(ci_data):
    row = row_ci + 1 + i
    for j, v in enumerate(d):
        c = ws2.cell(row=row, column=j+1, value=v)
        c.fill = track_mp; c.font = body_font; c.border = thin_border

# ============================================================
# Sheet 3: 客服轨道
# ============================================================
ws3 = wb.create_sheet('3-🎧客服轨道')
ws3.sheet_properties.tabColor = 'a855f7'
r = ttl(ws3, '🎧 客服轨道 · 对话数据', m=5)
wd(ws3, [14,18,22,35,35])

r = sec(ws3, r, '▌采集的原始字段', m=5)
cs_headers = ['字段', '含义', '取值', '用途', '影响信号']
row_ch = r
for i, h in enumerate(cs_headers):
    ws3.cell(row=row_ch, column=i+1, value=h)
hdr(ws3, row_ch, 5, sub_fill)

cs_fields = [
    ['rs', '通话结果', '已接通 / 拒接 / 无争议 / 有争议', 'D信号 · E信号判定', 'D · E1'],
    ['nt', '通话备注文本', '自由文本(客服录入+语音识别)', 'B信号 · C1~C4判定 · 关键词检测', 'B · C1~C4 · E2/E3'],
    ['t', '通话时间', '日期', '时间衰减计算(14天半衰)', '全部信号'],
    ['tp', '通话类型', '外呼 / 呼入', '标识', '—'],
    ['ag', '客服人员', '字符串', '质检追踪', '—'],
]
for i, d in enumerate(cs_fields):
    row = row_ch + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v).fill = track_cs
        ws3.cell(row=row, column=j+1).font = body_font
        ws3.cell(row=row, column=j+1).border = thin_border

r = row_ch + len(cs_fields) + 3

r = sec(ws3, r, '▌本轨道可独立产生的信号', m=5)
cs_sig_headers = ['信号', '产生规则', '消除规则', '信号强度计算', '备注']
row_csh = r
for i, h in enumerate(cs_sig_headers):
    ws3.cell(row=row_csh, column=i+1, value=h)
hdr(ws3, row_csh, 5, sub_fill)

cs_sigs = [
    ['B', 'nt含困难关键词("手头紧""失业""困难""没钱""交不起"…) → B产生\n≥2次困难表达 → B2·反复，可做主分类', '下次通话nt不含困难关键词 → B消除\n(新通话覆盖旧通话)', '困难表达次数×35 + (1−li)×15', 'B1仅辅助不做主分类\nB2/B3可做主分类'],
    ['D', 'rs=无争议 → 无争议承诺计数+1\n有效计数≥2 → D信号产生\n(有效计数=原始计数−衰减)', 'li=true → D立即消除\n28天无新承诺 → D归零消除\n7天无新承诺 → 有效计数-1', '有效计数×30 + (1−li)×20', '核心客服轨道信号\n衰减7天一步'],
    ['E·拒接', 'rs=拒接 累计≥3次 → E1·拒接型', '接通一次 → 拒接计数归零\n登录小程序 → 拒接计数-1', '拒接次数×25', '注意：有工单行为时\n拒接有修正(见小程序轨道)'],
    ['E·拒缴', 'nt含"不交""死也不交"→ E3·拒缴型', '原因解决后(产权澄清等)\n→ A或C 消除', '明确拒缴次数×30', '原则性拒缴\n非情绪对抗'],
    ['E·攻击', 'nt含攻击关键词 → E2·攻击型', '60天无新攻击+无拒接 → C5', '攻击通话次数×35', '需升级主管处理'],
    ['C1', 'nt含从众关键词 → C1·从众观望', '新通话覆盖 → 重判', '—', '语音检测匹配'],
    ['C2', 'nt含拖延关键词 → C2·拖延观望', '新通话覆盖 → 重判', '—', '语音检测匹配'],
    ['C3', 'nt含对比关键词 → C3·对比观望', '新通话覆盖 → 重判', '—', '语音检测匹配'],
    ['C4', 'nt含不满关键词 AND 无投诉工单 → C4', '提交投诉→A·投诉型', '—', '不满但不够A类'],
]
for i, d in enumerate(cs_sigs):
    row = row_csh + 1 + i
    for j, v in enumerate(d):
        c = ws3.cell(row=row, column=j+1, value=v)
        c.fill = track_cs; c.font = body_font; c.border = thin_border
        if j == 0: c.font = bold_font; c.alignment = center

r = row_csh + len(cs_sigs) + 3

r = sec(ws3, r, '▌C类关键词检测库（仅客服轨道·nt文本匹配）', m=3)
kw_headers = ['→ 子类型', '关键词（OR匹配，任意命中）', '匹配优先级']
row_kw = r
for i, h in enumerate(kw_headers):
    ws3.cell(row=row_kw, column=i+1, value=h)
hdr(ws3, row_kw, 3, sub_fill)

kw_data = [
    ['C1·从众观望', '"别人交我就交" "大家都交了吗" "交的人多吗" "有多少人交了" "别人也没交" "都拖着呢" "等别人先交" "邻居交了我就交" "随大流"', '1(最高)'],
    ['C2·拖延观望', '"不急" "再看吧" "到时候再说" "过段时间" "再说" "不急这一时" "不着急" "等等看" "观望一下"', '2'],
    ['C3·对比观望', '"隔壁小区" "人家那边" "凭什么我们" "别的小区" "人家小区" "别的地方" "我们小区不如" "看看人家"', '3'],
]
for i, d in enumerate(kw_data):
    row = row_kw + 1 + i
    for j, v in enumerate(d):
        c = ws3.cell(row=row, column=j+1, value=v)
        c.fill = track_cs; c.font = body_font; c.border = thin_border

# ============================================================
# Sheet 4: 判定流水线
# ============================================================
ws4 = wb.create_sheet('4-判定流水线')
ws4.sheet_properties.tabColor = 'f59e0b'
r = ttl(ws4, '判定流水线 F>E>A>B>D>C', m=8)
wd(ws4, [8,6,24,36,40,30,18,14])

r = sec(ws4, r, '▌判定原则', m=8)
ws4.cell(row=r, column=1, value='从上到下，命中即停。取最高优先级有信号者为主分类，其余信号转为辅助维度。').font = bold_font
r += 1
ws4.cell(row=r, column=1, value='每次事件（新工单/新通话/工单闭环/修改lb/登录）后重新走完整流水线。').font = body_font
r += 1
ws4.cell(row=r, column=1, value='两轨道各自算完信号后取OR合并：任一轨道有=信号on。衰减各自独立（工单30天/通话14天）。').font = body_font
r += 2

r = sec(ws4, r, '▌判定表', m=8)
pipe_headers = ['步', '轨', '判定问句', '触发条件（详细）', '命中→主分类', '子类型', '说明', '下一判定']
row_ph = r
for i, h in enumerate(pipe_headers):
    ws4.cell(row=row_ph, column=i+1, value=h)
hdr(ws4, row_ph, 8, sub_fill)

pipe = [
    ['①', '—', 'lb含特殊关键词?', 'lb含"已搬家""产权变更""出租""继承"\n或 号码无效/未覆盖/非服务范围', 'F·历史复杂', '号码无效/产权变更/继承/出租/未覆盖', '独立通道，不参与后续。有则直接F，其他信号暂挂', '结束'],
    ['②', '—', '有对抗信号?', '拒接≥3次 / 含攻击投诉(小程序或通话)\n/ 明确拒缴 / 态度差评≥3次', 'E·对抗态度', 'E1拒接/E2攻击/E3拒缴/E4差评累积', '对抗优先处理。不解决态度，其他无从谈起', '→③'],
    ['③', '📱', '有未闭环工单?', 'tp∈{baoxiu,tousu} AND st≠done\n含客服草稿(当无小程序工单时)\n建议≥1且报修=投诉=0 → 不归A', 'A·有具体争议', '报修/投诉/混合/反复/高优先级/首次型', '有具体问题先解决。解决问题就是最好的沟通', '→④'],
    ['④', '🎧', '通话中表达经济困难?', 'nt含困难关键词\nAND 证据等级≥B2(反复或可验证)\n(同时有B和D时B优先于D)', 'B·经济困难', 'B1自述/B2反复/B3可验证\n× 临时/长期 × 有/无协商意愿', '困难+惯性并存→先协商。协商失败再走约束', '→⑤'],
    ['⑤', '🎧', '无争议承诺≥2次?', 'rs=无争议 有效计数≥2\n(有效计数=原始计数−7天衰减)\nli=false 加成', 'D·惯性失约', 'D1轻度1-2次/D2中度3-4次\n/D3重度≥5次/D4沉默型', '承诺不兑现。按次数阶梯升级处置', '→⑥'],
    ['⑥', '—', '以上全否 → C细分', 'C类判定流水线:\n1.有A消除?→C5\n2.从众关键词?→C1\n3.拖延关键词?→C2\n4.对比关键词?→C3\n5.不满但无投诉?→C4\n6.无任何信号→C6', 'C·无信号(兜底)', 'C1从众/C2拖延/C3对比\n/C4信任缺失/C5已解决/C6信息不足', 'C是"剩余态"。其他分越高C越低。\n有F信号→C归零', '结束'],
]
for i, d in enumerate(pipe):
    row = row_ph + 1 + i
    cat = d[4][0]
    for j, v in enumerate(d):
        c = ws4.cell(row=row, column=j+1, value=v)
        c.border = thin_border
        if j == 4: c.fill = ca.get(cat, card_bg); c.font = cf.get(cat, body_font); c.alignment = center
        elif j == 1: c.fill = track_mp if '📱' in str(v) else track_cs if '🎧' in str(v) else card_bg; c.alignment = center
    ws4.cell(row=row, column=2).font = bold_font

# ============================================================
# Sheet 5: 信号合并
# ============================================================
ws5 = wb.create_sheet('5-信号合并')
ws5.sheet_properties.tabColor = 'f59e0b'
r = ttl(ws5, '信号合并 · OR逻辑', m=8)
wd(ws5, [8,8,14,30,30,20,20,20])

r = sec(ws5, r, '▌合并规则', m=8)
ws5.cell(row=r, column=1, value='原则：两轨道各自独立计算信号（开/关），然后取 OR 合并。任一轨道有 = 信号 on。').font = bold_font
r += 1
ws5.cell(row=r, column=1, value='强度计算：两轨道各自算出得分后相加（上限100），再映射到0-4五级强度。').font = body_font
r += 1
ws5.cell(row=r, column=1, value='衰减各自独立：工单类信号（A/E/C4/C5）走30天半衰，通话类信号（B/D/E/C1~C3）走14天半衰。').font = body_font
r += 2

r = sec(ws5, r, '▌各信号来源与合并表', m=8)
mg_headers = ['信号', '轨', '小程序可否产生', '客服可否产生', '小程序产生方式', '客服产生方式', '合并逻辑', '备注']
row_mh = r
for i, h in enumerate(mg_headers):
    ws5.cell(row=row_mh, column=i+1, value=h)
hdr(ws5, row_mh, 8, sub_fill)

mg_data = [
    ['F', '🎧', '✗', '✓', '—', 'lb含特殊关键词', '仅客服。独立通道', '有则直接主分类=F'],
    ['E', '📱🎧', '✓', '✓', '攻击性投诉工单 / 态度差评≥3', '拒接≥3 / 明确拒缴 / 攻击通话', 'OR合并 → 按E1-E4细分', '唯一双轨都能产生的信号'],
    ['A', '📱🎧', '✓', '✓', '未闭环报修/投诉工单', '客服草稿(当无小程序工单时)', 'OR合并。小程序工单优先', '草稿权重低于业主自提'],
    ['B', '🎧', '✗', '✓', '—', 'nt含困难关键词', '仅客服。新通话覆盖旧', 'B1仅辅助，B2/B3可做主分类'],
    ['D', '🎧', '✗', '✓', '—', 'rs=无争议 有效计数≥2', '仅客服。但小程序登录可消除D', '小程序li=true→D立即消除'],
    ['C1', '🎧', '✗', '✓', '—', 'nt含从众关键词', '仅客服。语音检测', ''],
    ['C2', '🎧', '✗', '✓', '—', 'nt含拖延关键词', '仅客服。语音检测', ''],
    ['C3', '🎧', '✗', '✓', '—', 'nt含对比关键词', '仅客服。语音检测', ''],
    ['C4', '📱🎧', '✓', '✓', '历史rt<3 且 无tousu', 'nt含不满关键词 且 无投诉工单', 'OR合并。都要求"无投诉工单"', '小程序验证是否真有投诉'],
    ['C5', '📱', '✓', '✗', 'A消除后自动产生', '—', '仅小程序', '工单闭环事件触发'],
    ['C6', '—', '—', '—', '两轨道均无任何信号', '两轨道均无任何信号', '兜底默认', '最终兜底'],
]
for i, d in enumerate(mg_data):
    row = row_mh + 1 + i
    cat = d[0][0] if d[0] else 'C'
    for j, v in enumerate(d):
        c = ws5.cell(row=row, column=j+1, value=v)
        c.border = thin_border
        if j == 0: c.fill = ca.get(cat, card_bg); c.font = cf.get(cat, body_font); c.alignment = center
        elif j == 1: c.fill = track_mp if '📱' in str(v) else track_cs if '🎧' in str(v) else card_bg; c.alignment = center
        elif j in (2,3): c.fill = green_bg if v=='✓' else card_bg; c.alignment = center

# ============================================================
# Sheet 6: 辅助维度
# ============================================================
ws6 = wb.create_sheet('6-辅助维度')
ws6.sheet_properties.tabColor = '64748b'
r = ttl(ws6, '辅助维度 · 强度 / 交叉 / 响应 / 轨迹', m=7)
wd(ws6, [14,10,14,35,35,24,14])

# Signal strength
r = sec(ws6, r, '▌信号强度五级', m=7)
str_headers = ['强度', '图标', '得分区间', 'A类对应示例', 'D类对应示例', 'E类对应示例', '视觉']
row_sh = r
for i, h in enumerate(str_headers):
    ws6.cell(row=row_sh, column=i+1, value=h)
hdr(ws6, row_sh, 7, sub_fill)

str_data = [
    ['0·无', '○', '0', '无工单', '无承诺记录', '无拒接/攻击/拒缴', '灰色'],
    ['1·弱', '◐', '1-25', '1个未闭环', '1次无争议承诺', '拒接1-2次', '浅色'],
    ['2·中', '◑', '26-50', '2个未闭环', '2-3次无争议承诺', '拒接3-4次', '标准色'],
    ['3·强', '●', '51-75', '3-4个未闭环/超SLA', '4-5次无争议承诺', '拒接5+次/攻击投诉', '深色'],
    ['4·极强', '⬤', '76-100', '≥5未闭环/超SLA>14天', '≥6次无争议承诺', '攻击+拒缴+群扩散', '红色'],
]
for i, d in enumerate(str_data):
    row = row_sh + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v).border = thin_border

r = row_sh + len(str_data) + 3

# Cross patterns
r = sec(ws6, r, '▌交叉模式（8种预设组合）', m=5)
cp_headers = ['交叉模式', '信号组合(同时满足)', '风险', '说明', '触发条件']
row_cp = r
for i, h in enumerate(cp_headers):
    ws6.cell(row=row_cp, column=i+1, value=h)
hdr(ws6, row_cp, 5, sub_fill)

cp_data = [
    ['争议+困难', '主A AND 辅B(得分≥40)', '中', '有具体问题且经济困难', '同时存在A和B信号'],
    ['争议+惯性', '主A AND 辅D(得分≥50)', '中高', '可能用报修当拖延借口', '同时存在A和D信号'],
    ['对抗+困难', '主E AND 辅B(得分≥40)', '高', '对抗但确实困难', '同时存在E和B信号'],
    ['对抗+惯性', '主E AND 辅D(得分≥50)', '极高', '最难处理组合', '同时存在E和D信号'],
    ['困难+惯性', '主B AND 辅D(得分≥50)', '中', '困难且失约', '同时存在B和D信号'],
    ['恶化中', '近7天分类向差≥1级', '高', '正在变差，需紧急干预', 'C→A / C→E / A→E等'],
    ['好转中', '近7天分类向好≥1级', '低', '正在改善，趁热打铁', 'E→A / A→C / D→C等'],
    ['首次信号', '任何类别首次触发', '低', '新行为信号，黄金窗口', '无该类别历史记录'],
]
for i, d in enumerate(cp_data):
    row = row_cp + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v).border = thin_border
    risk = d[2]
    risk_fill = {'低':PatternFill(start_color='0a1e16',end_color='0a1e16',fill_type='solid'),
                 '中':PatternFill(start_color='1f180a',end_color='1f180a',fill_type='solid'),
                 '中高':PatternFill(start_color='1f1208',end_color='1f1208',fill_type='solid'),
                 '高':PatternFill(start_color='1f1118',end_color='1f1118',fill_type='solid'),
                 '极高':PatternFill(start_color='2d0a0a',end_color='2d0a0a',fill_type='solid')}
    ws6.cell(row=row, column=3).fill = risk_fill.get(risk, card_bg)
    ws6.cell(row=row, column=3).alignment = center

r = row_cp + len(cp_data) + 3

# Response levels
r = sec(ws6, r, '▌响应级别 R0~R4（拨号优先级）', m=6)
rl_headers = ['级别', '名称', '触发条件', '时效', '优先级加成', '说明']
row_rl = r
for i, h in enumerate(rl_headers):
    ws6.cell(row=row_rl, column=i+1, value=h)
hdr(ws6, row_rl, 6, sub_fill)

rl_data = [
    ['R0', '紧急', 'A类+未闭环≥3 | E类新触发(<7天) | 恶化中', '24h内', '+20', '暂停其他，优先处理'],
    ['R1', '优先', '主分类得分≥70 | 交叉=争议+惯性/对抗+困难', '48h内', '+10', '排在R2之前'],
    ['R2', '常规', '普通活跃信号(A/B/D/E 得分<70)', '本周内', '+0', '正常流程'],
    ['R3', '观察', 'C类(除C5) | 得分<40', '不设时限', '-5', '批量短信优先'],
    ['R4', '静默', 'C6沉睡>60天 | F类 | E1连续2月拒接', '不主动', '-20', '等待业主主动联系'],
]
for i, d in enumerate(rl_data):
    row = row_rl + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v).border = thin_border
        if j == 0: ws6.cell(row=row, column=j+1).font = bold_font; ws6.cell(row=row, column=j+1).alignment = center

r = row_rl + len(rl_data) + 3

# Trajectory
r = sec(ws6, r, '▌轨迹追踪', m=4)
tr_headers = ['维度', '取值', '含义', '示例']
row_tr = r
for i, h in enumerate(tr_headers):
    ws6.cell(row=row_tr, column=i+1, value=h)
hdr(ws6, row_tr, 4, sub_fill)

tr_data = [
    ['近3次分类', '数组 ["C","C","A"]', '最近3次主分类快照', '["C","C","A"]'],
    ['趋势', 'worsening / stable / improving', '向好还是向坏', '"worsening"'],
    ['迁移速度', 'fast / slow / stable', '7天内恶化≥2级=快', '"fast"'],
    ['新鲜度', 'just_now / recent / this_week / stale', '最近事件距今时间', '"just_now"'],
]
for i, d in enumerate(tr_data):
    row = row_tr + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v).border = thin_border

# ============================================================
# Sheet 7: 输出结构
# ============================================================
ws7 = wb.create_sheet('7-输出结构')
ws7.sheet_properties.tabColor = '10b981'
r = ttl(ws7, '分类输出 · classify(owner) 返回值', m=5)
wd(ws7, [20,16,40,30,18])

r = sec(ws7, r, '▌输出对象字段定义', m=5)
out_headers = ['字段名', '类型', '说明', '示例值', '来源轨道']
row_oh = r
for i, h in enumerate(out_headers):
    ws7.cell(row=row_oh, column=i+1, value=h)
hdr(ws7, row_oh, 5, sub_fill)

out_data = [
    ['main_class', 'string', '主分类 A~F', '"A"', '合并判定'],
    ['cls_sub', 'string', '细分子类型(29种)', '"A·报修型" / "C1·从众观望" / "D2·中度惯性"', '合并判定'],
    ['signal_strength', 'object', '各信号强度 0~4', '{"A":3,"B":1,"C":0,"D":2,"E":0,"F":0}', '合并计算'],
    ['aux_signals', 'string[]', '辅助信号列表', '["B","D"]', '合并判定'],
    ['aux_strength', 'object', '辅助信号各自强度', '{"B":1,"D":2}', '合并计算'],
    ['cross_pattern', 'string|null', '交叉模式名称', '"争议+困难" / null', '合并判定'],
    ['response_level', 'string', '响应级别 R0~R4', '"R1"', '合并判定'],
    ['trajectory_recent_3', 'string[]', '近3次主分类', '["C","C","A"]', '历史记录'],
    ['trajectory_trend', 'string', '趋势', '"worsening"/"stable"/"improving"', '历史记录'],
    ['trajectory_speed', 'string', '迁移速度', '"fast"/"slow"/"stable"', '历史记录'],
    ['freshness', 'string', '最近事件新鲜度', '"just_now"/"recent"/"this_week"/"stale"', '系统'],
    ['priority_score', 'int', '优先级分(含响应加成)', '95', '计算公式'],
    ['suggested_action', 'string', '一行建议动作', '"等待物业处理，待验收时回访"', '策略引擎'],
    ['source_breakdown', 'object', '双轨溯源: 每个信号来自哪条轨道', '{A:{mp:true,cs:false}, B:{mp:false,cs:true}}', '双轨记录'],
    ['mp_snapshot', 'object', '📱 小程序轨道快照', '{work_orders_open:1, avg_satisfaction:4.2, logged_in:true, signals:{A:true}}', '📱 小程序'],
    ['cs_snapshot', 'object', '🎧 客服轨道快照', '{total_calls:3, answered:2, rejected:0, last_call_nt:"...", signals:{B:true,D:false}}', '🎧 客服'],
    ['personalityType', 'string', '沟通性格', '"配合型"/"挑剔型"/"情绪型"/"消极型"', 'AI+人工'],
    ['communicationPreference', 'string', '触达偏好', '"电话优先"/"短信优先"/"微信优先"/"上门优先"', 'AI+人工'],
]
for i, d in enumerate(out_data):
    row = row_oh + 1 + i
    for j, v in enumerate(d):
        c = ws7.cell(row=row, column=j+1, value=v)
        c.border = thin_border
        if j == 4:
            if '📱' in str(v) and '🎧' in str(v): c.fill = PatternFill(start_color='1e1b4b',end_color='1e1b4b',fill_type='solid')
            elif '📱' in str(v): c.fill = track_mp
            elif '🎧' in str(v): c.fill = track_cs
            c.alignment = center
    ws7.cell(row=row, column=1).font = Font(name='Consolas', size=10, color='94a3b8')

r = row_oh + len(out_data) + 3
r = sec(ws7, r, '▌核心函数签名', m=5)
fn_headers = ['函数', '输入', '输出', '说明', 'P1状态']
row_fn = r
for i, h in enumerate(fn_headers):
    ws7.cell(row=row_fn, column=i+1, value=h)
hdr(ws7, row_fn, 5, sub_fill)

fn_data = [
    ['sigs(owner)', 'owner对象(工单+通话+标签)', '{A:bool,B:bool,...}', '信号检测层。规则模式', '✓ 已实现'],
    ['mcls(owner)', 'sigs()返回值', '{main:"A",sub:"A·报修型"}', '主分类判定。F>E>A>B>D>C', '✓ 已实现'],
    ['cls_subtype(owner)', 'owner对象', '"C1·从众观望"', '子类型判定。C1-C6/D1-D4/E1-E4等', '✓ 本次新增'],
    ['response_level(owner)', 'owner对象', '"R1"', '响应级别 R0-R4', '✓ 本次新增'],
    ['cross_pattern(owner)', '主分类+辅信号+轨迹', '"争议+困难"', '交叉模式检测', '○ 本次可选'],
    ['strength(owner)', 'owner对象', '{A:3,B:1,...}', '信号强度五级映射', '○ 本次可选'],
    ['score(owner)', 'owner对象', '{A:55,B:35,...}', '加权评分。12特征。P1后期启用', '✗ P1后期'],
    ['classify(owner)', 'owner对象', '完整分类输出对象', '聚合以上所有函数的综合输出', '✓ 持续迭代'],
]
for i, d in enumerate(fn_data):
    row = row_fn + 1 + i
    for j, v in enumerate(d):
        c = ws7.cell(row=row, column=j+1, value=v)
        c.border = thin_border
        if j == 4:
            if '✓' in str(v): c.fill = green_bg
            elif '○' in str(v): c.fill = PatternFill(start_color='1f180a',end_color='1f180a',fill_type='solid')
    ws7.cell(row=row, column=1).font = Font(name='Consolas', size=10, color='94a3b8')

# ============================================================
# Sheet 8: P1实施清单
# ============================================================
ws8 = wb.create_sheet('8-P1实施清单')
ws8.sheet_properties.tabColor = '10b981'
r = ttl(ws8, 'P1 实施清单', m=7)
wd(ws8, [8,20,35,10,12,12,30])

r = sec(ws8, r, '▌实施步骤（按优先级排序）', m=7)
imp_headers = ['步', '模块', '内容', '复杂度', '工时', '优先级', '备注']
row_ih = r
for i, h in enumerate(imp_headers):
    ws8.cell(row=row_ih, column=i+1, value=h)
hdr(ws8, row_ih, 7, sub_fill)

imp_data = [
    ['1', '信号检测 sigs()', '二值信号+信号开关规则(含两轨道OR合并)', '低', '1天', 'P0', '基础必须先做'],
    ['2', '主分类 mcls()', 'F>E>A>B>D>C流水线判定', '低', '0.5天', 'P0', '基于sigs()输出'],
    ['3', 'C类细分判定', 'C1~C6判定流水线+关键词匹配', '中', '1.5天', 'P0', '对P1破冰效果提升最大'],
    ['4', 'D类细分判定', 'D1~D4四级+衰减时间线', '低', '0.5天', 'P1', '阶梯处置'],
    ['5', 'E类细分判定', 'E1~E4四型+降级路径', '中', '1天', 'P1', '不同对抗不同策略'],
    ['6', '响应级别', 'R0~R4规则+优先级分加成', '低', '0.5天', 'P1', '提高客服效率'],
    ['7', 'A类新增子类型', 'A·高优先级型 + A·首次型', '低', '0.5天', 'P1', ''],
    ['8', '信号强度五级', '得分区间→0~4映射', '低', '0.5天', 'P2', '可简化先做'],
    ['9', '交叉模式', '8种预设组合检测', '低', '0.5天', 'P2', ''],
    ['10', '数据模型升级', 'owner对象新增字段+双轨快照', '低', '0.5天', 'P2', ''],
    ['11', 'UI摘要升级', '5字段→8字段+筛选器升级', '低', '1天', 'P2', ''],
    ['12', 'B类细化', '持续性×协商意愿矩阵', '低', '0.5天', 'P3', 'B类占比小'],
    ['13', '轨迹追踪', '近3次+趋势+速度', '低', '0.5天', 'P3', '需数据积累'],
    ['14', '加权评分 score()', '12特征×权重×时间衰减', '中', '2天', 'P1后期', '需≥20业主数据'],
]
for i, d in enumerate(imp_data):
    row = row_ih + 1 + i
    for j, v in enumerate(d):
        ws8.cell(row=row, column=j+1, value=v).border = thin_border
    prio = d[5]
    pf = {'P0':PatternFill(start_color='1f1118',end_color='1f1118',fill_type='solid'),
          'P1':PatternFill(start_color='1f180a',end_color='1f180a',fill_type='solid'),
          'P2':PatternFill(start_color='0a1e16',end_color='0a1e16',fill_type='solid'),
          'P3':PatternFill(start_color='14171c',end_color='14171c',fill_type='solid'),
          'P1后期':PatternFill(start_color='1f1208',end_color='1f1208',fill_type='solid')}
    ws8.cell(row=row, column=6).fill = pf.get(prio, card_bg)
    ws8.cell(row=row, column=6).alignment = center

# ============================================================
# Save
# ============================================================
path = r'E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\业主分类逻辑.xlsx'
wb.save(path)
print(f'Done: {path}')
print(f'{len(wb.sheetnames)} sheets:')
for i, s in enumerate(wb.sheetnames, 1): print(f'  {i}. {s}')
