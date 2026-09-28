import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

wb = openpyxl.Workbook()

# ============================================================
# Style definitions
# ============================================================
header_font = Font(name='微软雅黑', size=11, bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
sub_header_fill = PatternFill(start_color='334155', end_color='334155', fill_type='solid')
title_font = Font(name='微软雅黑', size=14, bold=True, color='1E293B')
body_font = Font(name='微软雅黑', size=10)
note_font = Font(name='微软雅黑', size=9, italic=True, color='64748B')
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
wrap_align = Alignment(wrap_text=True, vertical='center')
center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)

# Category colors
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
    if fill is None:
        fill = header_fill
    for col in range(1, ncols+1):
        cell = ws.cell(row=row, column=col)
        cell.font = header_font
        cell.fill = fill
        cell.alignment = center_align
        cell.border = thin_border

def style_body(ws, start_row, end_row, ncols):
    for r in range(start_row, end_row+1):
        for c in range(1, ncols+1):
            cell = ws.cell(row=r, column=c)
            cell.font = body_font
            cell.alignment = wrap_align
            cell.border = thin_border

def add_title(ws, title, row=1, merge_to=None):
    ws.cell(row=row, column=1, value=title).font = title_font
    if merge_to:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=merge_to)
    row += 1
    date_str = datetime.now().strftime("%Y-%m-%d")
    ws.cell(row=row, column=1, value=f'数治理方 P1 · {date_str}').font = note_font
    if merge_to:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=merge_to)
    return row + 2

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

# ============================================================
# Sheet 1: 六类细分总表
# ============================================================
ws1 = wb.active
ws1.title = '1-六类细分总表'
r = add_title(ws1, '业主画像分类细化方案 V8.0 · 六类细分总表', merge_to=6)

headers1 = ['主类', '含义', 'V7.0子类型', 'V8.0新增子类型', '细分维度', '细分价值', '判定关键字/条件', 'P1优先级']
row_h = r
for i, h in enumerate(headers1, 1):
    ws1.cell(row=row_h, column=i, value=h)
style_header(ws1, row_h, len(headers1))

data1 = [
    ['A', '有具体争议', '报修/投诉/混合/反复', 'A·高优先级型 / A·首次型', '工单频次+时效+新鲜度', '区分刚出问题vs老问题', '未闭环≥3→高优先级; 首次A→首次型', '高'],
    ['B', '经济困难', 'B1自述/B2反复/B3可验证', '临时/长期 × 有协商意愿/拒绝协商', '持续性+协商意愿', '临时困难可协商; 长期困难需帮扶', '首次困难→临时; 历史困难→长期', '中'],
    ['C', '无明确信号', '未触达/已解决/沉睡', 'C1从众/C2拖延/C3对比/C4信任缺失/C5已解决/C6信息不足', '心理动机', '直接影响破冰第一句话', '从众/拖延/对比关键词; 满意度+投诉状态', '最高'],
    ['D', '承诺不兑现', '—', 'D1轻度(1-2次)/D2中度(3-4次)/D3重度(≥5次)/D4沉默型', '失约次数+失联', '1次提醒vs5次发函', '无争议承诺计数; D≥2+拒接→D4', '高'],
    ['E', '对抗态度', '—', 'E1拒接型/E2攻击型/E3拒缴型/E4差评累积型', '对抗方式', '拒接换渠道; 攻击不硬碰', '拒接数+攻击关键词+拒缴关键词+差评数', '高'],
    ['F', '无法服务', '号码无效/未覆盖/lb关键词', 'F·产权变更/F·继承纠纷', 'lb关键词细分', '不同原因不同处置路径', 'lb含"产权变更""继承"等关键词', '低'],
]

for i, d in enumerate(data1):
    row = row_h + 1 + i
    for j, v in enumerate(d):
        ws1.cell(row=row, column=j+1, value=v)
style_body(ws1, row_h+1, row_h+len(data1), len(headers1))
for i, d in enumerate(data1):
    row = row_h + 1 + i
    cat = d[0]
    if cat in color_fills:
        ws1.cell(row=row, column=1).fill = color_fills[cat]
        ws1.cell(row=row, column=1).font = color_fonts[cat]
set_col_widths(ws1, [8, 14, 24, 35, 22, 28, 45, 12])
ws1.sheet_properties.tabColor = '1E293B'

# ============================================================
# Sheet 2: C类六分法（核心）
# ============================================================
ws2 = wb.create_sheet('2-C类六分法(核心)')
r = add_title(ws2, 'C类六分法 —— P1最关键细化', merge_to=9)

# 旧版vs新版
ws2.cell(row=r, column=1, value='一、旧版 vs V8.0').font = Font(name='微软雅黑', size=11, bold=True)
r += 1
old_vs_new = [
    ['旧版(V7.0)', 'C·未触达', 'C·已解决', 'C·沉睡(>30天)', '—', '—', '—'],
    ['V8.0细化', 'C1·从众观望', 'C2·拖延观望', 'C3·对比观望', 'C4·信任缺失', 'C5·已解决', 'C6·信息不足'],
]
for i, d in enumerate(old_vs_new):
    row = r + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
    for c in range(1, 8):
        if i == 0:
            ws2.cell(row=row, column=c).fill = sub_header_fill
            ws2.cell(row=row, column=c).font = header_font
        else:
            ws2.cell(row=row, column=c).fill = color_fills['C']
            ws2.cell(row=row, column=c).font = color_fonts['C']
    for c in range(1, 8):
        ws2.cell(row=row, column=c).border = thin_border
        ws2.cell(row=row, column=c).alignment = center_align

r += 4

# 六类详情表
ws2.cell(row=r, column=1, value='二、C1~C6 判定与策略').font = Font(name='微软雅黑', size=11, bold=True)
r += 2

headers2 = ['子类型', '心理动机', '触发条件', '破冰第一句话', '核心数据武器', '禁用行为', '破冰策略', '话术片段']
row_h2 = r
for i, h in enumerate(headers2, 1):
    ws2.cell(row=row_h2, column=i, value=h)
style_header(ws2, row_h2, len(headers2))

data2 = [
    ['C1·从众观望', '从众心理\n"别人交我就交"', '通话含:"别人交我就交""大家都交了吗""有多少人交了""邻居交了我就交"', '"你们楼栋XX户已经交了，占比X%"', '本楼栋缴费率+邻居缴费案例(脱敏)+缴费趋势', '不要说教;\n如果缴费率<30%别硬说很多人交了', 'L1缴费事实破冰', '"张先生，你们3栋48户已经有32户交了，占比67%。上个月3-5XX的邻居刚交完。"'],
    ['C2·拖延观望', '拖延\n无紧迫感', '通话含:"不急""再看吧""到时候再说""随大流""过段时间"', '"最近小区处理了不少问题，您这边有什么需要帮忙的吗"', '工单闭环+满意度+服务改善案例', '不要在业主没提钱的时候主动提缴费数据', 'L2从众压力破冰', '"没关系张先生，不着急。我就是想让您知道——你们楼栋其实挺多人已经行动了。您有什么需要随时找我。"'],
    ['C3·对比观望', '对比\n不公平感', '通话含:"隔壁小区""人家那边""凭什么我们""别的小区"', '"我们小区最近有这些进步，您看看"', '本小区vs对比小区数据+进步趋势', '不要辩解"我们也不差"', 'L2从众压力破冰', '"理解您的感受。不过最近30天，咱们小区处理了X个问题，满意度X分，趋势是向上的。"'],
    ['C4·信任缺失', '不满\n信任缺失', '历史满意度<3星 或 通话含"物业不管""服务差"但无正式投诉工单', '"之前可能有不到位的地方，您具体说说"', '近期改进数据+具体案例', '不要推卸责任"那是之前的物业"', 'L3服务兜底破冰', '"您说得对，之前可能确实有不到位的地方。您要有什么需要我帮您记下来。"'],
    ['C5·已解决', '正面体验\n等待反馈', 'A类工单闭环≥3星，且无B/D/E/F信号', '"上次修的XX现在用着没问题吧"', '历史工单记录+满意度', '不要直接要钱"那您什么时候缴费"', 'L2从众压力破冰', '"上次帮您修的水管现在用着正常吧？有需要随时说。"'],
    ['C6·信息不足', '未知\n等待发现', '无工单+无通话+无标签+无任何信号', '"您好，有什么需要帮忙的吗"', '无特定数据，以了解为主', '不要预设立场"您是不是不想交"', 'L1缴费事实破冰', '"您好，我是XX小区物业客服。今天主要是想了解一下您住这有什么需要帮忙的。"'],
]

for i, d in enumerate(data2):
    row = row_h2 + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
        if j == 0:
            ws2.cell(row=row, column=j+1).fill = color_fills['C']
            ws2.cell(row=row, column=j+1).font = color_fonts['C']
style_body(ws2, row_h2+1, row_h2+len(data2), len(headers2))

# 判定流水线
r2 = row_h2 + len(data2) + 3
ws2.cell(row=r2, column=1, value='三、C类判定流水线（从上到下，命中即停）').font = Font(name='微软雅黑', size=11, bold=True)
r2 += 2
flow_headers = ['步骤', '检查条件', '命中后', '说明']
row_hf = r2
for i, h in enumerate(flow_headers, 1):
    ws2.cell(row=row_hf, column=i, value=h)
style_header(ws2, row_hf, 4, fill=sub_header_fill)

flow_data = [
    ['1', 'IF 有A消除记录 AND 无B/D/E/F信号', '→ C5·已解决', '刚经历过正面体验'],
    ['2', 'IF 通话含从众关键词', '→ C1·从众观望', '"别人交我就交""大家都交了吗"等'],
    ['3', 'IF 通话含拖延关键词', '→ C2·拖延观望', '"不急""再看吧""到时候再说"等'],
    ['4', 'IF 通话含对比关键词', '→ C3·对比观望', '"隔壁小区""凭什么我们"等'],
    ['5', 'IF (满意度<3星 OR 含不满关键词) AND 无正式投诉工单', '→ C4·信任缺失', '不满但不够A类'],
    ['6', 'IF 无任何信号', '→ C6·信息不足', '纯默认兜底'],
]
for i, d in enumerate(flow_data):
    row = row_hf + 1 + i
    for j, v in enumerate(d):
        ws2.cell(row=row, column=j+1, value=v)
style_body(ws2, row_hf+1, row_hf+len(flow_data), 4)
for j in range(1,5):
    ws2.cell(row=row_hf+len(flow_data), column=j).fill = color_fills['C']

set_col_widths(ws2, [18, 50, 18, 50, 40, 35, 22, 55])
ws2.sheet_properties.tabColor = '94A3B8'

# ============================================================
# Sheet 3: D类四级惯性
# ============================================================
ws3 = wb.create_sheet('3-D类四级惯性')
r = add_title(ws3, 'D类四级惯性细分', merge_to=8)

headers3 = ['子类型', '条件(D有效计数)', '含义', '客服策略', '触达方式', '升级条件', '衰减规则', '示例']
row_h3 = r
for i, h in enumerate(headers3, 1):
    ws3.cell(row=row_h3, column=i, value=h)
style_header(ws3, row_h3, len(headers3))

data3 = [
    ['D1·轻度惯性', '1~2次', '刚出现失约苗头', '温和提醒+设置明确时间节点', '电话为主，72h内联系', '7天内无新承诺→保持D1', '7天无新承诺→计数-1;\n登录小程序→降一级', '"张先生，之前说好的月底，马上到了。您看方便安排吗"'],
    ['D2·中度惯性', '3~4次', '已形成模式，需约束', '留痕+短信确认+约束升级', '电话+短信，48h内联系', '14天内无改善→D3', '同D1衰减;\n创建工单→D转辅助', '"张先生，这已经是第3次了。我需要跟您确认一个具体时间"'],
    ['D3·重度惯性', '≥5次', '惯犯，需正式处置', '发正式函件+业委会抄送', '函件+短信，24h内发函', '函件发出后保留D3等待回应', '缴费(P2)→D消除;\n不衰减', '"根据记录，已多次沟通未果。正式通知函已发出，请查收"'],
    ['D4·沉默型', 'D≥D2 且 最近14天拒接≥2次', '失联回避', '短信+上门+标记风险', '不电话外呼，改短信+上门', '上门后仍无回应→标记R4静默', '上门接通→按实际态度重分类', '"多次联系未果，已安排管家上门。如有不便请告知"'],
]

for i, d in enumerate(data3):
    row = row_h3 + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
        if j == 0:
            ws3.cell(row=row, column=j+1).fill = color_fills['D']
            ws3.cell(row=row, column=j+1).font = color_fonts['D']
style_body(ws3, row_h3+1, row_h3+len(data3), len(headers3))

# 衰减时间线
r3 = row_h3 + len(data3) + 3
ws3.cell(row=r3, column=1, value='D类衰减时间线').font = Font(name='微软雅黑', size=11, bold=True)
r3 += 2
decay_headers = ['距上次承诺天数', 'D有效计数变化', '子类型可能变化', '动作']
row_hd = r3
for i, h in enumerate(decay_headers, 1):
    ws3.cell(row=row_hd, column=i, value=h)
style_header(ws3, row_hd, 4, fill=sub_header_fill)

decay_data = [
    ['0-6天', '不变', '不变', '正常跟进'],
    ['7-13天', '-1', 'D2→D1, D1→消除', '温和提醒'],
    ['14-20天', '-1(再减)', 'D2→D1, D1→消除', '再提醒一次'],
    ['21-27天', '-1(再减)', 'D2→消除', '最后确认'],
    ['≥28天', '归零', 'D完全消除', '从画像移除D信号'],
]
for i, d in enumerate(decay_data):
    row = row_hd + 1 + i
    for j, v in enumerate(d):
        ws3.cell(row=row, column=j+1, value=v)
style_body(ws3, row_hd+1, row_hd+len(decay_data), 4)

set_col_widths(ws3, [18, 22, 22, 28, 24, 26, 30, 45])
ws3.sheet_properties.tabColor = 'F97316'

# ============================================================
# Sheet 4: E类四型对抗
# ============================================================
ws4 = wb.create_sheet('4-E类四型对抗')
r = add_title(ws4, 'E类四型对抗细分', merge_to=9)

headers4 = ['子类型', '触发条件', '含义', '客服策略', '拨打策略', '话术方向', '降级路径', '升级条件', '示例']
row_h4 = r
for i, h in enumerate(headers4, 1):
    ws4.cell(row=row_h4, column=i, value=h)
style_header(ws4, row_h4, len(headers4))

data4 = [
    ['E1·拒接型', '拒接≥3次，无攻击/拒缴', '可能不好意思、不想沟通', '换时段/换号码/短信触达', '间隔≥3天，≤3次/月', '短信为主，给台阶下', '接通+态度软化→A或C5;\n登录小程序→拒接计数-1', '连续2月拒接→R4静默', '"张先生，方便的时候回个电话，有事想跟您沟通"'],
    ['E2·攻击型', '含攻击性投诉\n(辱骂/威胁/群内攻击)', '情绪对抗，可能扩散', '升级主管+法律留痕', '不主动拨打，被动接听', '冷静、不辩解、记录', '60天无新攻击+无拒接→C5;\n客服手动覆盖', '扩散到业主群→业委会介入', '业主在群里骂物业→不回应群消息，私下联系。留痕'],
    ['E3·拒缴型', '通话明确说"不交"\n"死也不交"', '原则性拒缴', '了解原因→法律途径', '≤1次/月确认态度', '了解原因，记录证据', '原因解决(如产权澄清)→A或C;\n持续≥90天→法律评估', '启动法律评估→函件+抄送', '"理解您有您的考虑。您方便说说具体是什么原因吗"'],
    ['E4·差评累积型', '态度差评≥3次\n无拒接/攻击/拒缴', '对服务不满累积', '先解决服务问题', '用服务切入，不提争议', '先解决问题再谈其他', '连续3次工单闭环好评→降级C5', '再获差评→升级E1', '"之前可能让您不太满意。这次我专门跟进，一定帮您处理好"'],
]

for i, d in enumerate(data4):
    row = row_h4 + 1 + i
    for j, v in enumerate(d):
        ws4.cell(row=row, column=j+1, value=v)
        if j == 0:
            ws4.cell(row=row, column=j+1).fill = color_fills['E']
            ws4.cell(row=row, column=j+1).font = color_fonts['E']
style_body(ws4, row_h4+1, row_h4+len(data4), len(headers4))

set_col_widths(ws4, [18, 24, 22, 24, 24, 28, 30, 28, 45])
ws4.sheet_properties.tabColor = 'EF4444'

# ============================================================
# Sheet 5: 交叉模式
# ============================================================
ws5 = wb.create_sheet('5-交叉模式')
r = add_title(ws5, '交叉模式 —— 8种预设组合', merge_to=8)

headers5 = ['交叉模式', '信号组合', '含义', '风险', '组合策略', '话术要点', '时效', '示例']
row_h5 = r
for i, h in enumerate(headers5, 1):
    ws5.cell(row=row_h5, column=i, value=h)
style_header(ws5, row_h5, len(headers5))

data5 = [
    ['争议+困难', '主A+辅B(≥40)', '有具体问题且经济困难', '中', '先解决问题→再协商缴费', '以解决问题为优先，顺带了解困难', 'A工单闭环后3天', '"修好了。上次您提到手头紧，咱们可以商量一个合适的方式"'],
    ['争议+惯性', '主A+辅D(≥50)', '可能用报修当拖延借口', '中高', '解决问题+留痕+设期限', '解决问题时记录承诺，设时间节点', '工单闭环后立即', '"问题帮您解决了。您上次说X月X日之前处理，我帮您备注了"'],
    ['对抗+困难', '主E+辅B(≥40)', '对抗但确实困难', '高', '先降对抗→再协商', '先化解情绪，了解困难真实情况', '7天内降级→协商', '"我理解您的心情。之前可能有误会。您方便说说具体情况吗"'],
    ['对抗+惯性', '主E+辅D(≥50)', '最难处理组合', '极高', '升级主管+法律评估', '不激化，留痕，上报', '24h内升级', '立即升级给客服主管，由主管评估处置路径'],
    ['困难+惯性', '主B+辅D(≥50)', '困难且失约', '中', '协商分期+留痕约束', '先确认困难是否真实，再设分期', '7天内出方案', '"您困难我理解。咱们定个方案：分X次，每次X元，您看行吗"'],
    ['恶化中', '近7天分类向差迁移\n(C→A, C→E, A→E)', '正在变差', '高', '24h内响应+重点跟进', '先了解发生了什么，不预设判断', '24h内联系', 'C→E仅7天→立刻电话："最近是不是遇到什么问题了"'],
    ['好转中', '近7天分类向好迁移\n(E→A, A→C, D→C)', '正在改善', '低', '趁热打铁+正面强化', '肯定正面变化，顺势推进', '48h内跟进', 'E→A转化→"看到您提了报修，沟通顺畅多了。有什么我能帮的"'],
    ['首次信号', '任何类别首次触发', '新出现的行为信号', '低', '黄金窗口期优先响应', '以服务切入，建立第一次正面接触', '24h内响应', '首次A→立刻联系："看到您反馈了XX问题，我马上帮您安排"'],
]

for i, d in enumerate(data5):
    row = row_h5 + 1 + i
    for j, v in enumerate(d):
        ws5.cell(row=row, column=j+1, value=v)
    risk_cell = ws5.cell(row=row, column=4)
    risk_map = {'低': 'D1FAE5', '中': 'FEF3C7', '中高': 'FFEDD5', '高': 'FEE2E2', '极高': 'FECACA'}
    if d[3] in risk_map:
        risk_cell.fill = PatternFill(start_color=risk_map[d[3]], end_color=risk_map[d[3]], fill_type='solid')
style_body(ws5, row_h5+1, row_h5+len(data5), len(headers5))

set_col_widths(ws5, [16, 22, 24, 8, 26, 28, 16, 50])
ws5.sheet_properties.tabColor = '8B5CF6'

# ============================================================
# Sheet 6: 响应级别
# ============================================================
ws6 = wb.create_sheet('6-响应级别')
r = add_title(ws6, '响应级别 R0~R4', merge_to=6)

headers6 = ['级别', '名称', '触发条件', '动作', '时效', '优先级加成', '配色']
row_h6 = r
for i, h in enumerate(headers6, 1):
    ws6.cell(row=row_h6, column=i, value=h)
style_header(ws6, row_h6, len(headers6))

data6 = [
    ['R0', '紧急', 'A类+未闭环≥3 或 E类新触发(<7天)\n或 交叉模式=恶化中', '立即联系，暂停其他任务', '24小时内', '+20', '🔴 #EF4444'],
    ['R1', '优先', '主分类得分≥70\n或 交叉模式∈{争议+惯性,对抗+困难}', '排在R2之前，优先拨打', '48小时内', '+10', '🟠 #F97316'],
    ['R2', '常规', '普通活跃信号(A/B/D/E但得分<70)', '正常流程跟进', '本周内', '+0', '🟡 #F59E0B'],
    ['R3', '观察', 'C类(除C5) 或 得分<40', '排在后面，批量短信触达', '不设时限', '-5', '🟢 #10B981'],
    ['R4', '静默', 'C6·沉睡>60天 或 F类\n或 E1连续2月拒接', '不主动外呼。等待业主主动联系', '不主动', '-20', '⚪ #94A3B8'],
]

for i, d in enumerate(data6):
    row = row_h6 + 1 + i
    for j, v in enumerate(d):
        ws6.cell(row=row, column=j+1, value=v)
style_body(ws6, row_h6+1, row_h6+len(data6), len(headers6))

# 优先级公式说明
r6 = row_h6 + len(data6) + 3
ws6.cell(row=r6, column=1, value='优先级分公式微调：').font = Font(name='微软雅黑', size=10, bold=True)
r6 += 1
ws6.cell(row=r6, column=1, value='原公式 = 紧急度(min0~40) + 恶化风险(min0~35) + 影响力(min0~25)').font = body_font
r6 += 1
ws6.cell(row=r6, column=1, value='V8.0 = 紧急度 + 恶化风险 + 影响力 + 响应窗口加成(R0:+20, R1:+10, R2:0, R3:-5, R4:-20)').font = body_font

set_col_widths(ws6, [10, 10, 38, 28, 14, 14, 15])
ws6.sheet_properties.tabColor = '2563EB'

# ============================================================
# Sheet 7: 信号强度 + B类细化 + A类F类
# ============================================================
ws7 = wb.create_sheet('7-信号强度+B类+A类F类')
r = add_title(ws7, '信号强度五级', merge_to=8)

headers7 = ['强度', '图标', '得分', 'A类条件示例', 'B类条件示例', 'D类条件示例', 'E类条件示例', '视觉']
row_h7 = r
for i, h in enumerate(headers7, 1):
    ws7.cell(row=row_h7, column=i, value=h)
style_header(ws7, row_h7, len(headers7))

data7 = [
    ['0·无', '○', '0', '无工单', '无困难表达', '无承诺记录', '无拒接/攻击/拒缴', '灰色'],
    ['1·弱', '◐', '1-25', '1个未闭环工单', '通话中提1次困难(B1)', '1次无争议承诺', '拒接1-2次', '浅色'],
    ['2·中', '◑', '26-50', '2个未闭环工单', '≥2次困难表达(B2)', '2-3次无争议承诺', '拒接3-4次', '标准色'],
    ['3·强', '●', '51-75', '3-4个未闭环或超SLA', '提供困难证明(B3)', '4-5次无争议承诺', '拒接5+次或攻击性投诉', '深色'],
    ['4·极强', '⬤', '76-100', '≥5个未闭环或超SLA>14天', '长期困难+拒协商', '≥6次无争议承诺', '攻击+拒缴+群内扩散', '红色'],
]

for i, d in enumerate(data7):
    row = row_h7 + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
style_body(ws7, row_h7+1, row_h7+len(data7), len(headers7))

# B类矩阵
r7 = row_h7 + len(data7) + 3
ws7.cell(row=r7, column=1, value='B类细化：持续性 × 协商意愿矩阵').font = Font(name='微软雅黑', size=11, bold=True)
r7 += 2

ws7.cell(row=r7, column=2, value='').border = thin_border
for j, h in enumerate(['', '有协商意愿', '拒绝协商'], 2):
    ws7.cell(row=r7, column=j, value=h)
    ws7.cell(row=r7, column=j).font = header_font
    ws7.cell(row=r7, column=j).fill = header_fill
    ws7.cell(row=r7, column=j).alignment = center_align
    ws7.cell(row=r7, column=j).border = thin_border

b_matrix = [
    ['临时困难(首次)', 'B·可协商临时困难\n→ 分期方案，成功率最高', 'B·消极临时困难\n→ 了解顾虑，等业主开口'],
    ['长期困难(历史)', 'B·可协商长期困难\n→ 公益援助+分期', 'B·僵持长期困难\n→ 转社区帮扶'],
]
for i, d in enumerate(b_matrix):
    row = r7 + 1 + i
    ws7.cell(row=row, column=2, value=d[0]).font = Font(name='微软雅黑', size=10, bold=True)
    ws7.cell(row=row, column=2).fill = color_fills['B']
    ws7.cell(row=row, column=2).alignment = center_align
    ws7.cell(row=row, column=2).border = thin_border
    for j in range(2):
        ws7.cell(row=row, column=3+j, value=d[j+1])
        ws7.cell(row=row, column=3+j).font = body_font
        ws7.cell(row=row, column=3+j).fill = color_fills['B']
        ws7.cell(row=row, column=3+j).alignment = wrap_align
        ws7.cell(row=row, column=3+j).border = thin_border

# A类+F类
r7 = r7 + 4
ws7.cell(row=r7, column=1, value='A类子类型（V7.0保留 + V8.0新增）').font = Font(name='微软雅黑', size=11, bold=True)
r7 += 2
a_headers = ['子类型', '条件', '策略', '版本']
row_ah = r7
for i, h in enumerate(a_headers):
    ws7.cell(row=row_ah, column=i+1, value=h)
style_header(ws7, row_ah, 4, fill=sub_header_fill)

a_data = [
    ['A·报修型', '报修≥1,投诉=0', '等物业处理，待验收回访', 'V7.0保留'],
    ['A·投诉型', '投诉≥1,报修=0', '联系业主了解投诉内容', 'V7.0保留'],
    ['A·混合型', '报修≥1,投诉≥1', '确认投诉后等物业处理', 'V7.0保留'],
    ['A·反复型', '同问题≥3次', '回访问是否彻底解决', 'V7.0保留'],
    ['A·高优先级型', '未闭环≥3或超SLA≥7天', '24h响应，升级R0', 'V8.0新增'],
    ['A·首次型', '首次产生A信号', '黄金窗口，24h响应', 'V8.0新增'],
]
for i, d in enumerate(a_data):
    row = row_ah + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
        if j == 0:
            ws7.cell(row=row, column=j+1).fill = color_fills['A']
            ws7.cell(row=row, column=j+1).font = color_fonts['A']
style_body(ws7, row_ah+1, row_ah+len(a_data), 4)

# F类
r7 = row_ah + len(a_data) + 3
ws7.cell(row=r7, column=1, value='F类细分').font = Font(name='微软雅黑', size=11, bold=True)
r7 += 2
f_headers = ['子类型', 'lb关键词', '处置方式']
row_fh = r7
for i, h in enumerate(f_headers):
    ws7.cell(row=row_fh, column=i+1, value=h)
style_header(ws7, row_fh, 3, fill=sub_header_fill)

f_data = [
    ['F·号码无效', '空号/停机/错号', '标记+找其他联系方式'],
    ['F·未覆盖', '非服务范围', '标记+不处理'],
    ['F·产权变更', '"已搬家""已出售""产权变更""新业主"', '确认新业主信息→更新系统'],
    ['F·继承纠纷', '"继承""遗产""过户中"', '暂不催收+定期跟进产权状态'],
    ['F·出租', '"出租""租客""不在这住"', '联系租客(服务型)+联系业主(费用型)'],
]
for i, d in enumerate(f_data):
    row = row_fh + 1 + i
    for j, v in enumerate(d):
        ws7.cell(row=row, column=j+1, value=v)
        if j == 0:
            ws7.cell(row=row, column=j+1).fill = color_fills['F']
            ws7.cell(row=row, column=j+1).font = color_fonts['F']
style_body(ws7, row_fh+1, row_fh+len(f_data), 3)

set_col_widths(ws7, [18, 30, 30, 18, 24])
ws7.sheet_properties.tabColor = '10B981'

# ============================================================
# Sheet 8: 摘要格式+数据模型
# ============================================================
ws8 = wb.create_sheet('8-摘要格式+数据模型')
r = add_title(ws8, '分类输出格式升级 + 数据模型', merge_to=5)

# 对比
ws8.cell(row=r, column=1, value='一、摘要字段对比：V7.0(5字段) → V8.0(8字段)').font = Font(name='微软雅黑', size=11, bold=True)
r += 2
comp_headers = ['#', 'V7.0字段', 'V8.0字段', '升级说明']
row_ch = r
for i, h in enumerate(comp_headers, 1):
    ws8.cell(row=row_ch, column=i, value=h)
style_header(ws8, row_ch, 4, fill=sub_header_fill)

comp_data = [
    ['1', 'priority(优先级分)', 'response_level(响应级别R0~R4)', '新增独立响应级别维度'],
    ['2', 'main_class+sub_type', 'main_class+sub_type+strength(含强度)', '分类附加0~4强度标识'],
    ['3', 'urgent_flag(紧急标记)', 'aux_signals(辅助信号+各自强度)', '辅助维度从隐式变显式'],
    ['4', 'last_event(最近事件)', 'cross_pattern(交叉模式名称)', '新增预设组合识别'],
    ['5', 'suggested_action(建议)', 'suggested_action(建议动作)', '保留，内容增强'],
    ['6', '—(无)', 'last_event+freshness(最近事件+新鲜度)', '新增时间颗粒度'],
    ['7', '—(无)', 'trajectory_summary(近3次分类+趋势)', '新增轨迹追踪'],
    ['8', '—(无)', 'communication_preference(性格+偏好)', '沟通偏好接入分类'],
]
for i, d in enumerate(comp_data):
    row = row_ch + 1 + i
    for j, v in enumerate(d):
        ws8.cell(row=row, column=j+1, value=v)
style_body(ws8, row_ch+1, row_ch+len(comp_data), 4)

# 数据模型
r8 = row_ch + len(comp_data) + 3
ws8.cell(row=r8, column=1, value='二、数据模型新增字段').font = Font(name='微软雅黑', size=11, bold=True)
r8 += 2
model_headers = ['字段名', '类型', '说明', '示例值', '版本']
row_mh = r8
for i, h in enumerate(model_headers):
    ws8.cell(row=row_mh, column=i+1, value=h)
style_header(ws8, row_mh, 5, fill=sub_header_fill)

model_data = [
    ['cls_sub', 'string', '细分子类型', '"C1","D2","E·攻击型","A·首次型"', 'V8.0新增'],
    ['response_level', 'string', '响应级别R0~R4', '"R1"', 'V8.0新增'],
    ['signal_strength', 'object', '各信号强度0~4', '{A:3, B:1, C:0, D:2, E:0, F:0}', 'V8.0新增'],
    ['cross_pattern', 'string|null', '交叉模式名称', '"争议+困难", null', 'V8.0新增'],
    ['trajectory.recent_3', 'string[]', '近3次主分类', '["C","C","A"]', 'V8.0新增'],
    ['trajectory.trend', 'string', '趋势', '"worsening"/"stable"/"improving"', 'V8.0新增'],
    ['trajectory.speed', 'string', '迁移速度', '"fast"/"slow"/"stable"', 'V8.0新增'],
    ['freshness', 'string', '最近事件新鲜度', '"just_now"/"recent"/"this_week"/"stale"', 'V8.0新增'],
    ['first_signal', 'object', '各信号首次触发时间', '{A:"2026-06-25", B:null, D:"2026-06-15"}', 'V8.0新增'],
    ['personalityType', 'string', '沟通性格(已有，V8.0接入分类)', '"配合型"/"挑剔型"/"情绪型"/"消极型"', '已有·V8.0接入'],
    ['communicationPreference', 'string', '触达偏好(已有，V8.0接入分类)', '"电话优先"/"短信优先"/"微信优先"/"上门优先"', '已有·V8.0接入'],
]
for i, d in enumerate(model_data):
    row = row_mh + 1 + i
    for j, v in enumerate(d):
        ws8.cell(row=row, column=j+1, value=v)
        if d[4] == 'V8.0新增':
            ws8.cell(row=row, column=j+1).fill = PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid')
style_body(ws8, row_mh+1, row_mh+len(model_data), 5)

set_col_widths(ws8, [24, 14, 32, 35, 18])
ws8.sheet_properties.tabColor = 'F59E0B'

# ============================================================
# Sheet 9: 实施步骤
# ============================================================
ws9 = wb.create_sheet('9-实施步骤')
r = add_title(ws9, '实施步骤与优先级', merge_to=8)

headers9 = ['步骤', '模块', '内容', '复杂度', '依赖', '预估工时', '优先级', '对业务影响']
row_h9 = r
for i, h in enumerate(headers9, 1):
    ws9.cell(row=row_h9, column=i, value=h)
style_header(ws9, row_h9, len(headers9))

data9 = [
    ['1', 'C类六分法', 'C1~C6判定+破冰策略', '中', '无', '2天', 'P0·最高', '直接影响破冰成功率'],
    ['2', '响应级别', 'R0~R4规则+优先级加成', '低', '无', '0.5天', 'P0·最高', '客服效率立竿见影'],
    ['3', 'D类四级', 'D1~D4计数+分级+衰减', '低', '无', '1天', 'P1·高', '区分处置手段'],
    ['4', 'E类四型', 'E1~E4判定+策略', '中', '无', '1天', 'P1·高', '不浪费拨打资源'],
    ['5', 'A·首次型', '首次A标记+黄金窗口', '低', '无', '0.5天', 'P1·高', '首次响应决定满意度'],
    ['6', '信号强度', '二值→五级+视觉', '中', '步骤1-5', '1天', 'P2·中', '分类带轻重'],
    ['7', '交叉模式', '8种预设组合识别', '低', '步骤1-5', '0.5天', 'P2·中', '自动策略提醒'],
    ['8', '摘要升级', '5字段→8字段+UI', '低', '步骤1-6', '1天', 'P2·中', '信息密度提升'],
    ['9', 'B类细化', '持续性×协商意愿矩阵', '低', '无', '0.5天', 'P3·低', 'B类占比小'],
    ['10', '时间颗粒度', '新鲜度+迁移速度', '中', '步骤1-5', '1天', 'P3·低', '数据量上来后有价值'],
]

for i, d in enumerate(data9):
    row = row_h9 + 1 + i
    for j, v in enumerate(d):
        ws9.cell(row=row, column=j+1, value=v)
    prio = d[6]
    if 'P0' in prio:
        ws9.cell(row=row, column=7).fill = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid')
    elif 'P1' in prio:
        ws9.cell(row=row, column=7).fill = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
    elif 'P2' in prio:
        ws9.cell(row=row, column=7).fill = PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid')
style_body(ws9, row_h9+1, row_h9+len(data9), len(headers9))

set_col_widths(ws9, [8, 14, 28, 10, 12, 12, 14, 35])
ws9.sheet_properties.tabColor = '2563EB'

# ============================================================
# Sheet 10: V7 vs V8 对比
# ============================================================
ws10 = wb.create_sheet('10-V7vsV8对比')
r = add_title(ws10, 'V7.0 vs V8.0 对比总览', merge_to=4)

headers10 = ['维度', 'V7.0', 'V8.0', '改进说明']
row_h10 = r
for i, h in enumerate(headers10, 1):
    ws10.cell(row=row_h10, column=i, value=h)
style_header(ws10, row_h10, len(headers10))

data10 = [
    ['分类粒度', '6类(A-F)', '6类×29子类型', '从粗分到细分'],
    ['C类', '3种:未触达/已解决/沉睡', '6种:C1~C6各有破冰策略', '每种独立话术方向'],
    ['D类', '无细分', '4级:D1轻度~D4沉默型', '阶梯式升级处置'],
    ['E类', '无细分', '4型:E1拒接~E4差评累积', '不同对抗不同策略'],
    ['A类', '4种子类型', '4种保留+高优先级型+首次型', '新增频次和新鲜度'],
    ['B类', '3层:B1/B2/B3', '3层+持续性×协商意愿矩阵', '增加策略指导'],
    ['F类', '3种', '5种:新增产权变更/继承', '不同lb不同处置'],
    ['信号表示', '二值(on/off)', '五级(0~4强度)', '不只判断有无，还判断轻重'],
    ['交叉组合', '无', '8种预设交叉模式', '自动识别组合+策略'],
    ['拨打优先级', '单一优先级分', '优先级分+R0~R4响应级别', '分离紧急度和拨打顺序'],
    ['摘要字段', '5字段', '8字段', '一屏获取完整决策信息'],
    ['时间维度', '30天单一阈值', '5级新鲜度+迁移速度', '精细时间管理'],
    ['沟通偏好', '未参与分类', '接入分类微调策略', '话术匹配业主性格'],
]

for i, d in enumerate(data10):
    row = row_h10 + 1 + i
    for j, v in enumerate(d):
        ws10.cell(row=row, column=j+1, value=v)
    ws10.cell(row=row, column=3).fill = PatternFill(start_color='D1FAE5', end_color='D1FAE5', fill_type='solid')
style_body(ws10, row_h10+1, row_h10+len(data10), len(headers10))

set_col_widths(ws10, [16, 26, 40, 35])
ws10.sheet_properties.tabColor = '10B981'

# ============================================================
# Save
# ============================================================
output_path = r'E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\业主分类细化方案_V8.0.xlsx'
wb.save(output_path)
print(f'OK - saved to: {output_path}')
print(f'Sheets ({len(wb.sheetnames)}): {wb.sheetnames}')
