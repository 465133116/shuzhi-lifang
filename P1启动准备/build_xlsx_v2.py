import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

wb = openpyxl.Workbook()

# ============================================================
# Styles
# ============================================================
header_font = Font(name='微软雅黑', size=11, bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
sub_header_fill = PatternFill(start_color='334155', end_color='334155', fill_type='solid')
title_font = Font(name='微软雅黑', size=14, bold=True, color='1E293B')
section_font = Font(name='微软雅黑', size=12, bold=True, color='1E293B')
body_font = Font(name='微软雅黑', size=10)
note_font = Font(name='微软雅黑', size=9, italic=True, color='64748B')
bold_font = Font(name='微软雅黑', size=10, bold=True)
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
wrap_align = Alignment(wrap_text=True, vertical='center')
center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)

color_fills = {
    'A': PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid'),
    'B': PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid'),
    'C': PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid'),
    'D': PatternFill(start_color='FFEDD5', end_color='FFEDD5', fill_type='solid'),
    'E': PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid'),
    'F': PatternFill(start_color='EDE9FE', end_color='EDE9FE', fill_type='solid'),
}

color_fonts = {
    'A': Font(name='微软雅黑', size=10, color='92400E'),
    'B': Font(name='微软雅黑', size=10, color='065F46'),
    'C': Font(name='微软雅黑', size=10, color='475569'),
    'D': Font(name='微软雅黑', size=10, color='9A3412'),
    'E': Font(name='微软雅黑', size=10, color='991B1B'),
    'F': Font(name='微软雅黑', size=10, color='5B21B6'),
}

def style_header(ws, row, ncols, fill=None):
    if fill is None: fill = header_fill
    for col in range(1, ncols+1):
        cell = ws.cell(row=row, column=col)
        cell.font = header_font; cell.fill = fill
        cell.alignment = center_align; cell.border = thin_border

def style_body(ws, start_row, end_row, ncols):
    for r in range(start_row, end_row+1):
        for c in range(1, ncols+1):
            cell = ws.cell(row=r, column=c)
            cell.font = body_font; cell.alignment = wrap_align; cell.border = thin_border

def add_title(ws, title, row=1, merge_to=None):
    ws.cell(row=row, column=1, value=title).font = title_font
    if merge_to: ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=merge_to)
    row += 1
    ws.cell(row=row, column=1, value=f'数治理方 P1 · 业主分类细化模版 · {datetime.now().strftime("%Y-%m-%d")}').font = note_font
    if merge_to: ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=merge_to)
    return row + 2

def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

def write_section(ws, row, title, merge_to=None):
    ws.cell(row=row, column=1, value=title).font = section_font
    if merge_to: ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=merge_to)
    return row + 2

# ============================================================
# Sheet 1: 分类总览
# ============================================================
ws1 = wb.active
ws1.title = '1-分类结构总览'
r = add_title(ws1, '业主画像分类细化模版 V8.0', merge_to=7)

# 1.1 分类模型
r = write_section(ws1, r, '一、分类模型')
ws1.cell(row=r, column=1, value='每个业主输出：主分类(1个·含子类型+强度) + 辅助信号(0~N个·含强度) + 交叉模式(0~1个) + 响应级别(1个)').font = bold_font
r += 1
ws1.cell(row=r, column=1, value='判定优先级：F > E > A > B > D > C。取最高优先级有信号者为主分类，其余为辅助。').font = body_font
r += 1
ws1.cell(row=r, column=1, value='信号独立开关：各信号独立产生/消除，独立时间衰减(工单类30天半衰、通话类14天半衰)。').font = body_font
r += 2

# 1.2 六类总表
r = write_section(ws1, r, '二、六类·子类型·细分维度', merge_to=8)
headers = ['主类', '含义', '主分类判定顺序', '子类型', '细分维度', '细分依据', '独立做主分类?', 'P1']
row_h = r
for i, h in enumerate(headers, 1):
    ws1.cell(row=row_h, column=i, value=h)
style_header(ws1, row_h, len(headers))

data = [
    ['F', '无法服务', '①(最高)', '号码无效 / 未覆盖 / 产权变更 / 继承纠纷 / 出租', 'lb关键词', '情况特殊，先独立拎出', '是', '✓'],
    ['E', '对抗态度', '②', 'E1拒接型 / E2攻击型 / E3拒缴型 / E4差评累积型', '对抗方式', '不同对抗方式处置策略不同', '是', '✓'],
    ['A', '有具体争议', '③', '报修型 / 投诉型 / 混合型 / 反复型 / 高优先级型 / 首次型', '工单结构+频次+新鲜度', '区分首次vs老问题，频次驱动紧急度', '是', '✓'],
    ['B', '经济困难', '④', 'B1自述 / B2反复 / B3可验证     × 临时/长期 × 有/无协商意愿', '证据等级+持续性+协商意愿', '临时困难可分期，长期困难需帮扶', 'B2/B3是，B1仅辅助', '✓'],
    ['D', '承诺不兑现', '⑤', 'D1轻度(1-2次) / D2中度(3-4次) / D3重度(≥5次) / D4沉默型', '失约次数+是否失联', '阶梯式升级处置', '是', '✓'],
    ['C', '无明确信号', '⑥(兜底)', 'C1从众 / C2拖延 / C3对比 / C4信任缺失 / C5已解决 / C6信息不足', '心理动机', '不同动机不同处置方向', '是(兜底)', '✓'],
]

for i, d in enumerate(data):
    row = row_h + 1 + i
    for j, v in enumerate(d):
        ws1.cell(row=row, column=j+1, value=v)
    cat = d[0]
    if cat in color_fills:
        ws1.cell(row=row, column=1).fill = color_fills[cat]
        ws1.cell(row=row, column=1).font = color_fonts[cat]
        ws1.cell(row=row, column=2).fill = color_fills[cat]
style_body(ws1, row_h+1, row_h+len(data), len(headers))

set_widths(ws1, [8, 14, 18, 45, 22, 35, 20, 8])
ws1.sheet_properties.tabColor = '1E293B'

# ============================================================
# Sheet 2: 主分类判定流水线
# ============================================================
ws2 = wb.create_sheet('2-主分类判定规则')
r = add_title(ws2, '主分类判定规则', merge_to=6)

r = write_section(ws2, r, '一、判定原则')
ws2.cell(row=r, column=1, value='原则：取当前最该处理的信号作为主分类。F>E>A>B>D>C。').font = bold_font
r += 1
ws2.cell(row=r, column=1, value='每次事件(新工单/新通话/工单闭环)后重新走判定表。重算=重新检查所有信号→重新判定主分类→更新辅助维度。').font = body_font
r += 2

r = write_section(ws2, r, '二、判定表（从上到下，命中即停）', merge_to=6)
headers2 = ['步骤', '条件', '主分类', '理由', '示例']
row_h2 = r
for i, h in enumerate(headers2, 1):
    ws2.cell(row=row_h2, column=i, value=h)
style_header(ws2, row_h2, len(headers2))

flow = [
    ['1', '有F信号(无论是否有其他信号)', 'F', '情况特殊，先单独拎出，其他信号暂挂', 'lb含"已搬家"→F，即使同时有A信号也归F'],
    ['2', '无F信号 · 有E信号', 'E', '对抗态度优先处理。不解决态度问题其他无从谈起', '拒接3次→E，即使同时报了修也归E'],
    ['3', '无F/E · 有A信号', 'A', '有具体问题先解决问题。解决问题本身就是最好的沟通', '业主报修水管→A·报修型'],
    ['4', '无F/E/A · 同时有B和D信号', 'B', '困难+惯性并存→先协商。协商失败再走约束', '反复表达困难+承诺不兑现→B为主'],
    ['5', '无F/E/A · 仅有B信号', 'B', '经济困难', '通话中表达困难→B'],
    ['6', '无F/E/A/B · 有D信号', 'D', '承诺不兑现', '多次通话说交但无行动→D'],
    ['7', '无任何信号 · 无A消除历史', 'C·未触达', '兜底默认', '纯新业主，无任何接触→C·未触达'],
    ['8', '无任何信号 · 有A消除历史', 'C·已解决', '问题刚解决，等待反馈', 'A类工单闭环后→C·已解决'],
]

for i, d in enumerate(flow):
    row = row_h2 + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
    cls_cell = ws2.cell(row=row, column=3)
    cls_val = d[2]
    cat_key = cls_val[0] if cls_val[0] in color_fills else 'C'
    cls_cell.fill = color_fills[cat_key]
    cls_cell.font = color_fonts[cat_key]
    cls_cell.alignment = center_align
style_body(ws2, row_h2+1, row_h2+len(flow), len(headers2))

# 二值信号规则
r2 = row_h2 + len(flow) + 3
r2 = write_section(ws2, r2, '三、各信号开关规则（产生/消除）', merge_to=6)
sig_headers = ['信号', '产生条件', '消除条件', '特殊规则']
row_sh = r2
for i, h in enumerate(sig_headers, 1):
    ws2.cell(row=row_sh, column=i, value=h)
style_header(ws2, row_sh, len(sig_headers))

sig_data = [
    ['F', 'lb含"已搬家""产权变更""出租""继承"等关键词', 'lb被清除或修改', 'F信号一旦产生，立即成为主分类'],
    ['E', '拒接≥3次 / 攻击性投诉 / 明确拒缴 / 态度差评≥3次', '拒接：接通一次归零。攻击/拒缴：工单闭环后消除。态度差评：近30天<3次', '拒接修正：拒接有效计数=拒接次数-min(拒接次数,小程序工单数)'],
    ['A', '有未闭环的报修/投诉工单(含客服草稿)', '问题解决+修后照片+满意度≥3星', '差评非"问题没解决"→A消除但产生副作用(态度差评+1/D计数+1)'],
    ['B', '最近一次通话含困难关键词', '最近一次通话不含困难关键词(新通话覆盖旧)', 'B1自述仅辅助不做主分类；B2反复/B3可验证可做主分类'],
    ['D', '无争议承诺累计≥2次(经衰减后有效计数)', '业主登录小程序→D消除(行为覆盖承诺)', '7天无新承诺→有效计数-1；28天归零→D完全消除'],
    ['C', '无其他任何信号', '出现任何其他信号', 'C是"剩余态"：其他分越高C越低。有F信号→C归零'],
]

for i, d in enumerate(sig_data):
    row = row_sh + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
    cat = d[0]
    if cat in color_fills:
        ws2.cell(row=row, column=1).fill = color_fills[cat]
        ws2.cell(row=row, column=1).font = color_fonts[cat]
style_body(ws2, row_sh+1, row_sh+len(sig_data), len(sig_headers))

# 重算时机
r2 = row_sh + len(sig_data) + 3
r2 = write_section(ws2, r2, '四、重算触发事件', merge_to=4)
recalc_headers = ['事件', '影响信号', '是否触发重算']
row_rh = r2
for i, h in enumerate(recalc_headers, 1):
    ws2.cell(row=row_rh, column=i, value=h)
style_header(ws2, row_rh, len(recalc_headers), fill=sub_header_fill)

recalc = [
    ['业主提交小程序工单', 'A产生 / E可能产生(攻击性投诉)', '是'],
    ['客服建草稿', 'A产生(仅当无小程序工单时)', '是'],
    ['客服打完电话写记录', 'B产生或消除 / D计数累加 / E计数累加', '是'],
    ['工单闭环+满意度≥3星', 'A消除', '是'],
    ['客服接通之前拒接的业主', 'E拒接计数归零', '是'],
    ['客服修改lb', 'F产生或消除', '是'],
    ['业主登录小程序', 'D消除 / E拒接计数-1', '是'],
]
for i, d in enumerate(recalc):
    row = row_rh + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
style_body(ws2, row_rh+1, row_rh+len(recalc), len(recalc_headers))

set_widths(ws2, [10, 55, 28, 45, 40])
ws2.sheet_properties.tabColor = '1E293B'

# ============================================================
# Sheet 3: C类细分
# ============================================================
ws3 = wb.create_sheet('3-C类细分')
r = add_title(ws3, 'C类六分法 · 判定与定义', merge_to=6)

r = write_section(ws3, r, '一、旧版 vs V8.0', merge_to=7)
old_new = [
    ['旧版(V7.0)', 'C·未触达', 'C·已解决', 'C·沉睡(>30天)', '—', '—', '—'],
    ['V8.0', 'C1·从众观望', 'C2·拖延观望', 'C3·对比观望', 'C4·信任缺失', 'C5·已解决', 'C6·信息不足'],
]
for i, d in enumerate(old_new):
    row = r + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
    for c in range(1, 8):
        ws3.cell(row=row, column=c).border = thin_border
        ws3.cell(row=row, column=c).alignment = center_align
        if i == 0:
            ws3.cell(row=row, column=c).fill = sub_header_fill
            ws3.cell(row=row, column=c).font = header_font
        else:
            ws3.cell(row=row, column=c).fill = color_fills['C']
            ws3.cell(row=row, column=c).font = color_fonts['C']
r += 4

r = write_section(ws3, r, '二、C1~C6 判定条件', merge_to=5)
c_headers = ['子类型', '含义', '触发条件(AND逻辑)', '自动/人工', '后续动作']
row_ch = r
for i, h in enumerate(c_headers, 1):
    ws3.cell(row=row_ch, column=i, value=h)
style_header(ws3, row_ch, len(c_headers))

c_data = [
    ['C1·从众观望', '等待社会证明——"别人交我才交"', '①无A/B/D/E/F信号\n②通话nt含从众关键词:"别人交我就交""大家都交了吗""有多少人交了""邻居交了我就交"', '自动(语音检测)', '保持C1直到出现新信号或通话覆盖'],
    ['C2·拖延观望', '无紧迫感——"不急/再看吧"', '①无A/B/D/E/F信号\n②通话nt含拖延关键词:"不急""再看吧""到时候再说""随大流""过段时间"', '自动(语音检测)', '保持C2直到出现新信号或通话覆盖'],
    ['C3·对比观望', '觉得本小区不如别的小区', '①无A/B/D/E/F信号\n②通话nt含对比关键词:"隔壁小区""人家那边""凭什么我们""别的小区"', '自动(语音检测)', '保持C3直到出现新信号或通话覆盖'],
    ['C4·信任缺失', '不满但不够A类(未提交正式投诉)', '①无A/B/D/E/F信号\n②历史工单满意度<3星 OR 通话nt含不满关键词("物业不管""服务差""以前...")\n③无正式投诉工单(tp≠tousu)', '自动', '保持C4。如果提交正式投诉→转为A·投诉型'],
    ['C5·已解决', 'A类消除后的过渡态', '①无B/D/E/F信号\n②有A消除记录(工单闭环+满意度≥3星)', '自动', '60天内无新行为→转为C6·信息不足'],
    ['C6·信息不足', '纯默认，真正未知', '①无任何信号\n②无工单+无通话+无标签', '自动(兜底)', '首次外呼后根据通话内容重新分类'],
]

for i, d in enumerate(c_data):
    row = row_ch + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
    ws3.cell(row=row, column=1).fill = color_fills['C']
    ws3.cell(row=row, column=1).font = color_fonts['C']
style_body(ws3, row_ch+1, row_ch+len(c_data), len(c_headers))

# C类判定流水线
r3 = row_ch + len(c_data) + 3
r3 = write_section(ws3, r3, '三、C类判定流水线（从上到下，命中即停）', merge_to=5)
cf_headers = ['步骤', '检查条件', '→ 子类型', '判定依据']
row_cf = r3
for i, h in enumerate(cf_headers, 1):
    ws3.cell(row=row_cf, column=i, value=h)
style_header(ws3, row_cf, len(cf_headers), fill=sub_header_fill)

cf_data = [
    ['1', '有A消除记录 AND 无B/D/E/F信号', 'C5·已解决', '刚经历过正面体验'],
    ['2', '通话nt含从众关键词', 'C1·从众观望', '"别人交我就交""大家都交了吗"等'],
    ['3', '通话nt含拖延关键词', 'C2·拖延观望', '"不急""再看吧""到时候再说"等'],
    ['4', '通话nt含对比关键词', 'C3·对比观望', '"隔壁小区""凭什么我们"等'],
    ['5', '(满意度<3星 OR 含不满关键词) AND 无正式投诉工单', 'C4·信任缺失', '不满但不够A类'],
    ['6', '无任何信号(无工单+无通话+无标签)', 'C6·信息不足', '纯默认兜底'],
]
for i, d in enumerate(cf_data):
    row = row_cf + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
    ws3.cell(row=row, column=3).fill = color_fills['C']
    ws3.cell(row=row, column=3).font = color_fonts['C']
style_body(ws3, row_cf+1, row_cf+len(cf_data), len(cf_headers))

# C类从众/拖延/对比关键词库
r3 = row_cf + len(cf_data) + 3
r3 = write_section(ws3, r3, '四、关键词检测库（C1~C3依赖语音检测）', merge_to=3)
kw_headers = ['子类型', '关键词', '匹配模式']
row_kw = r3
for i, h in enumerate(kw_headers, 1):
    ws3.cell(row=row_kw, column=i, value=h)
style_header(ws3, row_kw, len(kw_headers), fill=sub_header_fill)

kw_data = [
    ['C1·从众', '"别人交我就交" "大家都交了吗" "交的人多吗" "有多少人交了" "别人也没交" "都拖着呢" "等别人先交" "邻居交了我就交" "随大流"', 'OR匹配，任意命中'],
    ['C2·拖延', '"不急" "再看吧" "到时候再说" "过段时间" "再说" "不急这一时" "不着急" "等等看" "观望一下"', 'OR匹配，任意命中'],
    ['C3·对比', '"隔壁小区" "人家那边" "凭什么我们" "别的小区" "人家小区" "别的地方" "我们小区不如" "看看人家"', 'OR匹配，任意命中'],
]
for i, d in enumerate(kw_data):
    row = row_kw + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
style_body(ws3, row_kw+1, row_kw+len(kw_data), len(kw_headers))

set_widths(ws3, [18, 50, 20, 35, 28])
ws3.sheet_properties.tabColor = '94A3B8'

# ============================================================
# Sheet 4: D类+E类细分
# ============================================================
ws4 = wb.create_sheet('4-D类E类细分')
r = add_title(ws4, 'D类四级惯性 + E类四型对抗', merge_to=8)

# D类
r = write_section(ws4, r, '一、D类四级惯性', merge_to=8)
d_headers = ['子类型', '条件', '含义', '处置策略', '升级条件', '降级/衰减规则']
row_dh = r
for i, h in enumerate(d_headers, 1):
    ws4.cell(row=row_dh, column=i, value=h)
style_header(ws4, row_dh, len(d_headers))

d_data = [
    ['D1·轻度惯性', '无争议承诺 1~2次', '刚出现失约苗头', '温和提醒+设置明确时间节点', '7天内无新承诺→保持D1;\n14天内无改善→D2', '7天无新承诺→有效计数-1;\n登录小程序→降一级;\n创建工单→D转辅助'],
    ['D2·中度惯性', '无争议承诺 3~4次', '已形成模式，需要约束', '留痕+短信确认+约束升级', '14天内无改善→D3', '同D1衰减;\n28天无新承诺→D消除'],
    ['D3·重度惯性', '无争议承诺 ≥5次', '惯犯，需正式处置', '发正式函件+业委会抄送', '函件发出后保留D3等待回应', '不衰减;\n业主缴费(P2)→D消除'],
    ['D4·沉默型', 'D≥D2 AND 最近14天拒接≥2次', '失联回避，主动切断沟通', '不电话外呼，改短信+上门+标记风险', '上门后仍无回应→标记R4静默', '上门接通→按实际态度重分类;\n不自动衰减'],
]

for i, d in enumerate(d_data):
    row = row_dh + 1 + i
    for j, v in enumerate(d):
        ws4.cell(row=row, column=j+1, value=v)
    ws4.cell(row=row, column=1).fill = color_fills['D']
    ws4.cell(row=row, column=1).font = color_fonts['D']
style_body(ws4, row_dh+1, row_dh+len(d_data), len(d_headers))

# D衰减
r4 = row_dh + len(d_data) + 2
r4 = write_section(ws4, r4, 'D类衰减时间线', merge_to=4)
decay_headers = ['距上次无争议承诺天数', 'D有效计数变化', '子类型可能变化', '动作']
row_dd = r4
for i, h in enumerate(decay_headers, 1):
    ws4.cell(row=row_dd, column=i, value=h)
style_header(ws4, row_dd, 4, fill=sub_header_fill)

decay = [
    ['0-6天', '不变', '不变', '正常跟进'],
    ['7-13天', '-1', 'D2→D1, D1→消除', '温和提醒'],
    ['14-20天', '-1(再减)', 'D2→D1, D1→消除', '再提醒一次'],
    ['21-27天', '-1(再减)', 'D2→消除', '最后确认'],
    ['≥28天', '归零', 'D完全消除', '从画像移除D信号'],
]
for i, d in enumerate(decay):
    row = row_dd + 1 + i
    for j, v in enumerate(d):
        ws4.cell(row=row, column=j+1, value=v)
style_body(ws4, row_dd+1, row_dd+len(decay), 4)

# E类
r4 = row_dd + len(decay) + 3
r4 = write_section(ws4, r4, '二、E类四型对抗', merge_to=8)
e_headers = ['子类型', '触发条件', '含义', '处置策略', '降级路径', '升级条件']
row_eh = r4
for i, h in enumerate(e_headers, 1):
    ws4.cell(row=row_eh, column=i, value=h)
style_header(ws4, row_eh, len(e_headers))

e_data = [
    ['E1·拒接型', '拒接≥3次 AND 无攻击投诉 AND 无明确拒缴', '可能不好意思、不想沟通', '换时段/换号码/短信触达。不持续拨号。间隔≥3天，≤3次/月', '接通+态度软化→A或C5;\n登录小程序→拒接计数-1', '连续2月拒接→标记R4静默'],
    ['E2·攻击型', '含攻击性投诉(辱骂/威胁/群内攻击)', '情绪对抗，可能扩散影响他人', '升级主管+法律留痕。不正面冲突。不主动拨打，被动接听', '60天无新攻击+无拒接→C5;\n客服手动覆盖', '扩散到业主群→业委会介入;\n威胁→法律评估'],
    ['E3·拒缴型', '通话明确说"不交""死也不交"', '原则性拒缴，非情绪对抗', '了解原因→归入争议或法律途径。不硬催。≤1次/月确认态度', '原因解决(如产权澄清)→A或C;\n持续≥90天→法律评估', '启动法律评估→函件+业委会抄送'],
    ['E4·差评累积型', '态度差评≥3次 AND 无拒接/攻击/拒缴', '对服务不满累积，尚愿沟通', '先解决服务问题，再谈其他。用服务切入，不提争议', '连续3次工单闭环好评→降级C5', '再获差评→升级E1'],
]

for i, d in enumerate(e_data):
    row = row_eh + 1 + i
    for j, v in enumerate(d):
        ws4.cell(row=row, column=j+1, value=v)
    ws4.cell(row=row, column=1).fill = color_fills['E']
    ws4.cell(row=row, column=1).font = color_fonts['E']
style_body(ws4, row_eh+1, row_eh+len(e_data), len(e_headers))

# E降级路径
r4 = row_eh + len(e_data) + 3
r4 = write_section(ws4, r4, 'E类降级路径汇总', merge_to=4)
ed_headers = ['路径类型', '条件', '降到哪里', '备注']
row_ed = r4
for i, h in enumerate(ed_headers, 1):
    ws4.cell(row=row_ed, column=i, value=h)
style_header(ws4, row_ed, 4, fill=sub_header_fill)

ed_data = [
    ['时间驱动', '连续60天无新攻击+拒接归零', 'C5·已解决', '适用于E2/E3/E4'],
    ['行为驱动·接通', '接通+态度明确软化', 'A(如有工单)或C5', '适用于E1/E4'],
    ['行为驱动·工单', '提交非攻击性报修', 'A·报修型(E转辅助)', '适用于E1/E4'],
    ['行为驱动·登录', '登录小程序', 'E维持但拒接计数-1', '适用于E1'],
    ['客服手动', '通话后判断态度软化', '手动覆盖(覆盖所有自动判定)', '适用于所有E类'],
    ['服务修复', 'E4连续3次工单闭环好评', 'C5·已解决', '仅适用于E4'],
]
for i, d in enumerate(ed_data):
    row = row_ed + 1 + i
    for j, v in enumerate(d):
        ws4.cell(row=row, column=j+1, value=v)
style_body(ws4, row_ed+1, row_ed+len(ed_data), 4)

set_widths(ws4, [18, 40, 22, 35, 35, 30])
ws4.sheet_properties.tabColor = 'F97316'

# ============================================================
# Sheet 5: A类+F类+B类
# ============================================================
ws5 = wb.create_sheet('5-A类B类F类细分')
r = add_title(ws5, 'A类 / B类 / F类 子类型', merge_to=5)

# A类
r = write_section(ws5, r, '一、A类子类型（V7.0保留 + V8.0新增）', merge_to=6)
a_headers = ['子类型', '条件', '策略', '版本', '备注']
row_ah = r
for i, h in enumerate(a_headers, 1):
    ws5.cell(row=row_ah, column=i, value=h)
style_header(ws5, row_ah, len(a_headers))

a_data = [
    ['A·报修型', '报修≥1, 投诉=0', '等待物业处理，待验收时回访', 'V7.0保留', '最常见'],
    ['A·投诉型', '投诉≥1, 报修=0', '联系业主了解投诉内容', 'V7.0保留', ''],
    ['A·混合型', '报修≥1, 投诉≥1', '确认投诉后等物业处理，验收时回访', 'V7.0保留', ''],
    ['A·反复型', '同问题≥3次', '回访时重点问是否彻底解决，记录反复原因', 'V7.0保留', '高风险信号'],
    ['A·高优先级型', '未闭环≥3 OR 超SLA≥7天', '24h内响应，升级R0', 'V8.0新增', '频次/时效驱动的紧急标记'],
    ['A·首次型', '第一次产生A信号(无历史A消除记录)', '黄金窗口期，24h内响应', 'V8.0新增', '首次快速响应大幅提升满意度'],
]
for i, d in enumerate(a_data):
    row = row_ah + 1 + i
    for j, v in enumerate(d):
        ws5.cell(row=row, column=j+1, value=v)
    ws5.cell(row=row, column=1).fill = color_fills['A']
    ws5.cell(row=row, column=1).font = color_fonts['A']
style_body(ws5, row_ah+1, row_ah+len(a_data), len(a_headers))

# A消除条件
r5 = row_ah + len(a_data) + 3
r5 = write_section(ws5, r5, 'A类消除条件', merge_to=5)
ae_headers = ['工单闭环结果', 'A信号', '副作用', '后续处理']
row_ae = r5
for i, h in enumerate(ae_headers, 1):
    ws5.cell(row=row_ae, column=i, value=h)
style_header(ws5, row_ae, len(ae_headers), fill=sub_header_fill)

ae_data = [
    ['修后照片+结果+满意度≥3星', '消除', '—', '正常闭环'],
    ['差评·原因="问题没解决"', '保持', '工单自动重开', 'A信号不消除'],
    ['差评·原因="态度不好"', '消除', '态度差评+1，累计3→E', '记录态度事件'],
    ['差评·原因="太慢"', '消除', 'D计数+1', '记录履约延迟'],
    ['差评·原因="其他"', '消除', '—', '记录'],
    ['修后照片缺失', '保持', '证据不完整', '等待证据补全'],
]
for i, d in enumerate(ae_data):
    row = row_ae + 1 + i
    for j, v in enumerate(d):
        ws5.cell(row=row, column=j+1, value=v)
style_body(ws5, row_ae+1, row_ae+len(ae_data), len(ae_headers))

# B类
r5 = row_ae + len(ae_data) + 3
r5 = write_section(ws5, r5, '二、B类：证据等级 + 持续性×协商意愿', merge_to=5)

# B证据等级
r5 += 1
ws5.cell(row=r5, column=1, value='证据等级（V7.0保留）').font = Font(name='微软雅黑', size=10, bold=True)
r5 += 1
b_headers = ['等级', '证据', '独立做主分类', '对应细化维度']
row_bh = r5
for i, h in enumerate(b_headers, 1):
    ws5.cell(row=row_bh, column=i, value=h)
style_header(ws5, row_bh, 4, fill=sub_header_fill)

b_data = [
    ['B1·自述', '通话中说过一次困难', '否，仅辅助', '临时困难'],
    ['B2·反复', '≥2次困难表达', '是', '长期困难(如有协商意愿) / 临时困难(如首次)'],
    ['B3·可验证', '提供证明文件', '是', '长期困难 + 有协商意愿'],
]
for i, d in enumerate(b_data):
    row = row_bh + 1 + i
    for j, v in enumerate(d):
        ws5.cell(row=row, column=j+1, value=v)
    ws5.cell(row=row, column=1).fill = color_fills['B']
    ws5.cell(row=row, column=1).font = color_fonts['B']
style_body(ws5, row_bh+1, row_bh+len(b_data), 4)

# B矩阵
r5 = row_bh + len(b_data) + 2
ws5.cell(row=r5, column=1, value='持续性 × 协商意愿矩阵（V8.0新增）').font = Font(name='微软雅黑', size=10, bold=True)
r5 += 2
for j, h in enumerate(['', '有协商意愿', '拒绝协商'], 1):
    ws5.cell(row=r5, column=j+1, value=h)
    ws5.cell(row=r5, column=j+1).font = header_font
    ws5.cell(row=r5, column=j+1).fill = header_fill
    ws5.cell(row=r5, column=j+1).alignment = center_align
    ws5.cell(row=r5, column=j+1).border = thin_border

b_matrix = [
    ['临时困难(首次)', '可协商临时困难 → 分期方案', '消极临时困难 → 了解顾虑'],
    ['长期困难(历史)', '可协商长期困难 → 公益援助+分期', '僵持长期困难 → 转社区帮扶'],
]
for i, d in enumerate(b_matrix):
    row = r5 + 1 + i
    ws5.cell(row=row, column=2, value=d[0]).font = bold_font
    ws5.cell(row=row, column=2).fill = color_fills['B']
    ws5.cell(row=row, column=2).alignment = center_align
    ws5.cell(row=row, column=2).border = thin_border
    for j in range(2):
        ws5.cell(row=row, column=3+j, value=d[j+1])
        ws5.cell(row=row, column=3+j).font = body_font
        ws5.cell(row=row, column=3+j).fill = color_fills['B']
        ws5.cell(row=row, column=3+j).alignment = wrap_align
        ws5.cell(row=row, column=3+j).border = thin_border

# F类
r5 = row + 3
r5 = write_section(ws5, r5, '三、F类细分', merge_to=5)
f_headers = ['子类型', 'lb关键词', '处置方式', '说明']
row_fh = r5
for i, h in enumerate(f_headers, 1):
    ws5.cell(row=row_fh, column=i, value=h)
style_header(ws5, row_fh, len(f_headers))

f_data = [
    ['F·号码无效', '空号/停机/错号', '标记+找其他联系方式', ''],
    ['F·未覆盖', '非服务范围', '标记+不处理', ''],
    ['F·产权变更', '"已搬家""已出售""产权变更""新业主"', '确认新业主信息→更新系统', '部分关键词可能同时触发C类检测'],
    ['F·继承纠纷', '"继承""遗产""过户中"', '暂不催收+定期跟进产权状态', ''],
    ['F·出租', '"出租""租客""不在这住"', '联系租客(服务型)+联系业主(费用型)', ''],
]
for i, d in enumerate(f_data):
    row = row_fh + 1 + i
    for j, v in enumerate(d):
        ws5.cell(row=row, column=j+1, value=v)
    ws5.cell(row=row, column=1).fill = color_fills['F']
    ws5.cell(row=row, column=1).font = color_fonts['F']
style_body(ws5, row_fh+1, row_fh+len(f_data), len(f_headers))

set_widths(ws5, [20, 35, 30, 18, 18])
ws5.sheet_properties.tabColor = 'F59E0B'

# ============================================================
# Sheet 6: 信号强度+交叉模式+响应级别
# ============================================================
ws6 = wb.create_sheet('6-强度+交叉+响应')
r = add_title(ws6, '信号强度 / 交叉模式 / 响应级别', merge_to=7)

# 强度
r = write_section(ws6, r, '一、信号强度五级（统一定义）', merge_to=7)
str_headers = ['强度', '图标', '得分区间', 'A类对应', 'B类对应', 'D类对应', 'E类对应']
row_st = r
for i, h in enumerate(str_headers, 1):
    ws6.cell(row=row_st, column=i, value=h)
style_header(ws6, row_st, len(str_headers))

str_data = [
    ['0·无', '○', '0', '无未闭环工单', '无困难表达', '无承诺记录', '无拒接/攻击/拒缴'],
    ['1·弱', '◐', '1-25', '1个未闭环', '通话提1次困难(B1)', '1次无争议承诺', '拒接1-2次'],
    ['2·中', '◑', '26-50', '2个未闭环', '≥2次困难(B2)', '2-3次无争议承诺', '拒接3-4次'],
    ['3·强', '●', '51-75', '3-4个未闭环/超SLA', '提供证明(B3)', '4-5次无争议承诺', '拒接5+次/攻击投诉'],
    ['4·极强', '⬤', '76-100', '≥5未闭环/超SLA>14天', '长期困难+拒协商', '≥6次无争议承诺', '攻击+拒缴+群扩散'],
]
for i, d in enumerate(str_data):
    row = row_st + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v)
style_body(ws6, row_st+1, row_st+len(str_data), len(str_headers))

# 交叉模式
r6 = row_st + len(str_data) + 3
r6 = write_section(ws6, r6, '二、交叉模式（8种预设组合，自动识别）', merge_to=7)
cp_headers = ['交叉模式', '信号组合(同时满足)', '风险等级', '说明']
row_cp = r6
for i, h in enumerate(cp_headers, 1):
    ws6.cell(row=row_cp, column=i, value=h)
style_header(ws6, row_cp, len(cp_headers))

cp_data = [
    ['争议+困难', '主A AND 辅B(得分≥40)', '中', '有具体问题且经济困难。先解决问题，再协商'],
    ['争议+惯性', '主A AND 辅D(得分≥50)', '中高', '可能用报修当拖延借口。解决问题时留痕设期限'],
    ['对抗+困难', '主E AND 辅B(得分≥40)', '高', '对抗但确实困难。先降对抗再协商'],
    ['对抗+惯性', '主E AND 辅D(得分≥50)', '极高', '最难处理组合。升级主管+法律评估'],
    ['困难+惯性', '主B AND 辅D(得分≥50)', '中', '困难且失约。协商分期+留痕'],
    ['恶化中', '近7天分类向差迁移≥1级(C→A/C→E/A→E)', '高', '正在变差，24h内响应'],
    ['好转中', '近7天分类向好迁移≥1级(E→A/A→C/D→C)', '低', '正在改善，趁热打铁'],
    ['首次信号', '任何类别首次触发(无历史记录)', '低', '新行为信号，黄金窗口期'],
]
for i, d in enumerate(cp_data):
    row = row_cp + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v)
    risk = d[2]
    risk_map = {'低':'D1FAE5','中':'FEF3C7','中高':'FFEDD5','高':'FEE2E2','极高':'FECACA'}
    if risk in risk_map:
        ws6.cell(row=row, column=3).fill = PatternFill(start_color=risk_map[risk], end_color=risk_map[risk], fill_type='solid')
style_body(ws6, row_cp+1, row_cp+len(cp_data), len(cp_headers))

# 响应级别
r6 = row_cp + len(cp_data) + 3
r6 = write_section(ws6, r6, '三、响应级别 R0~R4', merge_to=6)
rl_headers = ['级别', '名称', '触发条件', '时效', '优先级加成', '说明']
row_rl = r6
for i, h in enumerate(rl_headers, 1):
    ws6.cell(row=row_rl, column=i, value=h)
style_header(ws6, row_rl, len(rl_headers))

rl_data = [
    ['R0', '紧急', 'A类+未闭环≥3 | E类新触发(<7天) | 交叉模式=恶化中', '24h内', '+20', '暂停其他任务，优先处理'],
    ['R1', '优先', '主分类得分≥70 | 交叉模式∈{争议+惯性,对抗+困难}', '48h内', '+10', '排在R2之前'],
    ['R2', '常规', '普通活跃信号(A/B/D/E但得分<70)', '本周内', '0', '正常流程'],
    ['R3', '观察', 'C类(除C5) | 得分<40', '不设时限', '-5', '排在后面，倾向批量短信'],
    ['R4', '静默', 'C6沉睡>60天 | F类 | E1连续2月拒接', '不主动', '-20', '不主动外呼，等待业主主动联系'],
]
for i, d in enumerate(rl_data):
    row = row_rl + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v)
style_body(ws6, row_rl+1, row_rl+len(rl_data), len(rl_headers))

set_widths(ws6, [12, 28, 28, 16, 14, 30])
ws6.sheet_properties.tabColor = '8B5CF6'

# ============================================================
# Sheet 7: 数据模型
# ============================================================
ws7 = wb.create_sheet('7-数据模型')
r = add_title(ws7, '数据模型 · 字段定义', merge_to=5)

r = write_section(ws7, r, '一、分类输出对象', merge_to=5)
out_headers = ['字段名', '类型', '说明', '示例值', '来源']
row_oh = r
for i, h in enumerate(out_headers, 1):
    ws7.cell(row=row_oh, column=i, value=h)
style_header(ws7, row_oh, len(out_headers))

out_data = [
    ['owner_id', 'string', '业主唯一标识', '"O001"', '系统'],
    ['name', 'string', '业主姓名', '"张建国"', '导入'],
    ['room', 'string', '房号', '"3-1502"', '导入'],
    ['phone', 'string', '手机号', '"13800001111"', '导入'],
    ['role', 'string', '角色: 业主/家属/租客/未知', '"业主"', '第零层·AI+人工'],
    ['main_class', 'string', '主分类 A~F', '"A"', '分类引擎'],
    ['cls_sub', 'string', '细分子类型', '"A·报修型" / "C1·从众观望" / "D2·中度惯性"', '分类引擎'],
    ['signal_strength', 'object', '各信号强度 0~4', '{"A":3,"B":1,"C":0,"D":2,"E":0,"F":0}', '分类引擎'],
    ['aux_signals', 'string[]', '辅助信号列表', '["B","D"]', '分类引擎'],
    ['aux_strength', 'object', '辅助信号各自强度', '{"B":1,"D":2}', '分类引擎'],
    ['cross_pattern', 'string|null', '交叉模式名称', '"争议+困难" / null', '分类引擎'],
    ['response_level', 'string', '响应级别 R0~R4', '"R1"', '分类引擎'],
    ['trajectory_recent_3', 'string[]', '近3次主分类', '["C","C","A"]', '历史记录'],
    ['trajectory_trend', 'string', '趋势', '"worsening"/"stable"/"improving"', '分类引擎'],
    ['trajectory_speed', 'string', '迁移速度', '"fast"/"slow"/"stable"', '分类引擎'],
    ['freshness', 'string', '最近事件新鲜度', '"just_now"/"recent"/"this_week"/"stale"', '分类引擎'],
    ['last_event', 'string', '最近影响分类的事件描述', '"06-25 水管漏水报修"', '系统'],
    ['priority_score', 'int', '优先级分(含响应加成)', '95', '计算公式'],
    ['suggested_action', 'string', '一行建议动作', '"等待物业处理，待验收时回访"', '策略引擎'],
    ['personalityType', 'string', '沟通性格', '"配合型"/"挑剔型"/"情绪型"/"消极型"', 'AI+人工标注'],
    ['communicationPreference', 'string', '触达偏好', '"电话优先"/"短信优先"/"微信优先"', 'AI+人工标注'],
]
for i, d in enumerate(out_data):
    row = row_oh + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
style_body(ws7, row_oh+1, row_oh+len(out_data), len(out_headers))

# 判定函数签名
r7 = row_oh + len(out_data) + 3
r7 = write_section(ws7, r7, '二、核心函数签名', merge_to=5)
fn_headers = ['函数', '输入', '输出', '说明']
row_fn = r7
for i, h in enumerate(fn_headers, 1):
    ws7.cell(row=row_fn, column=i, value=h)
style_header(ws7, row_fn, len(fn_headers), fill=sub_header_fill)

fn_data = [
    ['sigs(owner)', 'owner对象(含工单+通话+标签)', '六信号二值: {A:bool, B:bool, C:bool, D:bool, E:bool, F:bool}', '规则模式。信号检测层·Layer1'],
    ['mcls(owner)', 'sigs()返回值', '主分类: {main:"A", sub:"A·报修型"}', '规则模式。F>E>A>B>D>C流水线'],
    ['score(owner)', 'owner对象', '六类得分: {A:0-100, B:0-100, ...}', '加权模式。12特征×权重×时间衰减。P1后期启用'],
    ['strength(owner)', 'owner对象', '信号强度: {A:0-4, B:0-4, ...}', '将得分/计数映射到0-4五级强度'],
    ['cross(owner)', '主分类+辅助信号+轨迹', '交叉模式: string|null', '检测8种预设组合'],
    ['response(owner)', '主分类+得分+交叉模式', '响应级别: "R0"~"R4"', '综合判断拨打优先级'],
    ['classify(owner)', 'owner对象', '完整分类输出对象', '聚合以上所有函数的综合输出'],
]
for i, d in enumerate(fn_data):
    row = row_fn + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
style_body(ws7, row_fn+1, row_fn+len(fn_data), len(fn_headers))

# P1/P2分界
r7 = row_fn + len(fn_data) + 3
r7 = write_section(ws7, r7, '三、P1 vs P2 实施分界', merge_to=4)
pi_headers = ['层级', '模块', 'P1状态', 'P1后期', 'P2']
row_pi = r7
for i, h in enumerate(pi_headers, 1):
    ws7.cell(row=row_pi, column=i, value=h)
style_header(ws7, row_pi, len(pi_headers), fill=sub_header_fill)

pi_data = [
    ['Layer1·信号检测', 'sigs() 二值信号 + 信号开关规则', '✓ 实现', '—', '—'],
    ['Layer1·信号检测', 'mcls() 规则模式主分类判定', '✓ 实现', '—', '—'],
    ['Layer1·信号检测', '子类型判定(C1~C6/D1~D4/E1~E4/A·首次等)', '✓ 本次细化', '—', '—'],
    ['Layer1·信号检测', '响应级别 R0~R4', '✓ 本次细化', '—', '—'],
    ['Layer1·信号检测', '信号强度五级映射(简化版)', '○ 本次可选', '✓ 完整', '—'],
    ['Layer1·信号检测', '交叉模式(规则版8种)', '○ 本次可选', '✓ 完整', '—'],
    ['Layer2·状态推断', 'score() 加权评分(12特征)', '✗', '✓ ≥20业主', '✓ 完整'],
    ['Layer2·状态推断', 'infer() 隐藏状态(S/W/A/T/O)', '✗', '○ 预留字段', '✓ ≥50业主'],
    ['Layer2·状态推断', '时间衰减 + 迁移速度', '✗', '○ 预留', '✓'],
    ['Layer3·策略推荐', 'recommend() 话术方向+时效建议', '✗', '✗', '✓'],
    ['Layer3·策略推荐', '群体效应分析(楼栋交叉影响)', '✗', '✗', '✓'],
]
for i, d in enumerate(pi_data):
    row = row_pi + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
style_body(ws7, row_pi+1, row_pi+len(pi_data), len(pi_headers))

set_widths(ws7, [24, 22, 35, 25, 14])
ws7.sheet_properties.tabColor = '2563EB'

# ============================================================
# Save
# ============================================================
output_path = r'E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\业主分类细化模版_V8.0.xlsx'
wb.save(output_path)
print(f'OK - saved to: {output_path}')
print(f'Sheets ({len(wb.sheetnames)}):')
for i, s in enumerate(wb.sheetnames, 1):
    print(f'  {i}. {s}')
