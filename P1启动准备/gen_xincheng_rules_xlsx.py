# -*- coding: utf-8 -*-
"""数治理方草稿工单推送判定规则 Excel 生成器（信诚智慧物业版）
运行: /c/Python314/python gen_xincheng_rules_xlsx.py
输出: P1启动准备/数治理方草稿工单推送判定规则.xlsx（12 Sheet）
⚠️ 内容必须与 gen_xincheng_docs.py（docx版）保持同步
"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os

OUTPUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\数治理方草稿工单推送判定规则.xlsx"

BG_DARK = "0f172a"; BG_DARK2 = "1e293b"; BG_HEAD = "1a2332"
TEXT = "e2e8f0"; TEXT_MUTED = "94a3b8"
CLR_REPAIR = "38bdf8"     # 报修单-蓝
CLR_COMPLAINT = "f59e0b"  # 投诉单-黄
CLR_SUGGEST = "10b981"    # 建议单-绿
CLR_RULE = "8b5cf6"       # 总则-紫
CLR_DISPOSE = "f97316"    # 处置-橙
CLR_LAW = "64748b"        # 法规-灰
CLR_GREEN = "10b981"; CLR_YELLOW = "f59e0b"; CLR_RED = "ef4444"

thin_border = Border(
    left=Side(style='thin', color='334155'), right=Side(style='thin', color='334155'),
    top=Side(style='thin', color='334155'), bottom=Side(style='thin', color='334155'))

def hf(): return Font(name='Microsoft YaHei', size=11, bold=True, color='ffffff')
def tf(): return Font(name='Microsoft YaHei', size=15, bold=True, color='ffffff')
def bf(): return Font(name='Microsoft YaHei', size=10, color=TEXT)
def mf(): return Font(name='Microsoft YaHei', size=9, color=TEXT_MUTED)
def af(c=None): return Font(name='Microsoft YaHei', size=10, bold=True, color=c or TEXT)
def bfl(): return PatternFill(start_color=BG_DARK, end_color=BG_DARK, fill_type='solid')
def afl(): return PatternFill(start_color=BG_DARK2, end_color=BG_DARK2, fill_type='solid')
def sfl(c): return PatternFill(start_color=c, end_color=c, fill_type='solid')
center = Alignment(horizontal='center', vertical='center', wrap_text=True)
left = Alignment(horizontal='left', vertical='center', wrap_text=True)

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

def add_data_table(ws, start_row, headers, data, accent, judge_col=None):
    cols = len(headers)
    for ci, h in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=ci, value=h)
        cell.font = hf(); cell.fill = sfl(accent); cell.alignment = center; cell.border = thin_border
    ws.row_dimensions[start_row].height = 26
    for ri, rd in enumerate(data):
        rn = start_row + 1 + ri; alt = (ri % 2 == 1)
        for ci, v in enumerate(rd, 1):
            cell = ws.cell(row=rn, column=ci, value=str(v) if v else '')
            cell.border = thin_border; cell.fill = afl() if alt else bfl()
            if judge_col and ci == judge_col:
                s = str(v)
                if s.startswith('✅'): cell.font = af(CLR_GREEN)
                elif s.startswith('⚠️'): cell.font = af(CLR_YELLOW)
                elif s.startswith('❌'): cell.font = af(CLR_RED)
                else: cell.font = bf()
                cell.alignment = center
            elif ci == 1:
                cell.font = af(accent); cell.alignment = center
            else:
                cell.font = bf(); cell.alignment = left
        maxlines = max(str(v).count('\n') for v in rd) + 1
        ws.row_dimensions[rn].height = max(30, 15 * maxlines)
    return start_row + 1 + len(data)

def add_note(ws, row, cols, text, height=30, color=TEXT_MUTED):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=cols)
    c = ws.cell(row=row, column=1, value=text)
    c.font = Font(name='Microsoft YaHei', size=10, color=color)
    c.fill = bfl(); c.alignment = Alignment(horizontal='left', vertical='center', wrap_text=True)
    ws.row_dimensions[row].height = height
    for cc in range(1, cols + 1):
        ws.cell(row=row, column=cc).border = thin_border
    return row + 1

def make_sheet(wb, name, title, subtitle, headers, data, widths, accent, tab, judge_col=None, notes=None):
    ws = wb.create_sheet(name)
    cols = len(headers)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=cols)
    c = ws.cell(row=1, column=1, value=title); c.font = tf(); c.fill = bfl()
    c.alignment = Alignment(horizontal='left', vertical='center')
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=cols)
    c2 = ws.cell(row=2, column=1, value=subtitle)
    c2.font = mf(); c2.fill = bfl(); c2.alignment = Alignment(horizontal='left', vertical='center')
    ws.row_dimensions[1].height = 34; ws.row_dimensions[2].height = 20
    row = add_data_table(ws, 3, headers, data, accent, judge_col=judge_col)
    if notes:
        for n in notes:
            row = add_note(ws, row, cols, n[0], height=n[1])
    set_col_widths(ws, widths)
    ws.freeze_panes = 'A4'
    ws.sheet_properties.tabColor = tab
    return ws

# ═══════════ 数据（与 gen_xincheng_docs.py 同步） ═══════════

REPAIR_PUSH = [
    ['共用部位维修养护类', '共用部位、共用场地的日常维修、养护', '楼道灯不亮、单元门禁故障、公共区域地面破损（局部）、公区卫生设施', '条例第2条\n民法典第942条'],
    ['共用设施设备日常维修类', '共用设施设备的日常故障维修、维护保养', '监控摄像头故障、二次供水设施异常、消防设施日常维保问题（灭火器过期、烟感故障）、配电设施异常、电梯日常故障（异响、停运、关门异常）', '条例第2条、第55条'],
    ['相邻关系协调类', '户内问题影响他人或公共部分，物业出面协调', '楼上漏水渗至楼下（定位为协调类，不承诺修复）', '民法典第288条\n条例第2条（秩序维护）'],
]
REPAIR_NOPUSH = [
    ['户内专有部分维修', '户内自用部位，由业主自行负责', '户内水管漏水、户内电路故障、户内门锁损坏、户内空调故障、户内下水道堵塞', '民法典第271条', '自行维修或联系物业特约服务（场景七-1）'],
    ['保修期内质量问题', '保修期内由建设单位承担的保修责任', '外墙渗漏、屋面渗水、门窗质量问题、给排水管道渗漏（保修期内）', '建工条例第40条', '转开发商保修（场景七-2）'],
    ['专营单位管线设施', '专营单位负责维修养护的管线和设施', '市政停水停电、电表前线路故障、集中供热问题、燃气管道', '条例第51条', '告知专营单位报修渠道（场景七-3）'],
    ['维修资金范围的大修更新改造', '保修期满后共用部位、共用设施设备的大修、更新、改造', '电梯大修或整机更换、屋面大修、外墙整体翻新、消防系统更新、路面整体翻新', '条例第53条\n民法典第278条', '转物业/业委会按业主共同决定程序（场景七-4）'],
]
REPAIR_LABELS = [
    ['电梯故障', '⚠️ 视内容', '日常故障（异响、停运、关门异常）→可推（条例第2条）；大修或整机更换→维修资金程序（条例第53条、民法典第278条），不推'],
    ['水管漏水', '⚠️ 视位置', '公共管道（楼道立管、公区管路）→可推；户内管道→专有部分，不推（场景七-1）'],
    ['门禁门锁', '⚠️ 视位置', '单元门禁、公共门锁→可推；户内门锁→不推（场景七-1）'],
    ['墙面渗水', '⚠️ 视原因', '外墙渗漏且保修期内→开发商保修，不推（建工条例第40条，场景七-2）；保修期满→维修资金程序，不推（场景七-4）；楼上渗水→相邻关系，可推（协调类，不承诺修复）'],
    ['公区设施', '✅ 可推送', '共用设施设备日常维修（条例第2条）'],
    ['停水停电', '⚠️ 视原因', '市政或专营单位→不推，告知专营单位抢修电话（条例第51条，场景七-3）；小区内部二次供水、配电设施→可推'],
    ['下水道堵塞', '⚠️ 视位置', '公共下水道→可推；户内下水道→不推（场景七-1）'],
    ['楼道照明', '✅ 可推送', '共用部位设施维修（条例第2条）'],
    ['安防监控', '✅ 可推送', '共用设施设备维修（条例第2条、第46条）'],
    ['消防设施', '⚠️ 视内容', '日常维保（灭火器过期、烟感故障、消火栓渗漏）→可推；整体更新改造→维修资金程序，不推（场景七-4）'],
    ['地面破损', '⚠️ 视内容', '局部破损→可推；大面积翻新改造→维修资金程序，不推（场景七-4）'],
    ['暖通空调', '⚠️ 视内容', '户内空调/户内采暖设施→专有部分，不推（场景七-1）；集中供暖→供热专营单位，不推（条例第51条，场景七-3）；公区暖通设备→可推'],
    ['电路故障', '⚠️ 视位置', '户内电路→专有部分，不推（场景七-1）；公区及楼宇配电设施→可推；电表前线路→供电公司，不推（场景七-3）'],
    ['其他报修', '⚠️ 视内容', '按四问判定'],
]

COMPLAINT_PUSH = [
    ['物业服务行为投诉类', '对物业服务人员、服务质量、处理时效的投诉', '服务态度差、报修处理不及时、公区管理不到位', '条例第35条'],
    ['公共秩序维护类', '物业有劝阻、制止、报告职责的事项', '噪音扰民、停车秩序混乱、遛狗不牵绳、装修噪音与占道（劝阻制止部分）', '条例第45条\n民法典第286条'],
    ['公共区域安全隐患类', '公共区域隐患，物业有巡查、警示、应急处理职责', '消防通道堵塞、公区电线裸露、公共设施破损有伤人风险', '条例第46条、第55条'],
]
COMPLAINT_NOPUSH = [
    ['物业服务收费争议', '收费项目、标准争议及催缴事项', '对收费不合理有异议、欠费催缴', '条例第40条、第41条', '客服诠释收费依据+记录转达（场景七-6）'],
    ['违法违规行为的强制处理', '需要行政执法权或司法权处理的事项', '违法建设拆除、强制清退违规装修、治安刑事案件', '条例第45条（物业职责限于劝阻、制止、报告）', '引导行政投诉/报警，物业配合报告（场景七-5）'],
    ['房屋主体结构安全隐患', '主体结构安全需专业鉴定并走法定程序', '承重结构异常、墙体结构性开裂', '条例第55条\n建工条例第40条', '引导专业鉴定及维修资金程序（场景七-4）'],
]
COMPLAINT_LABELS = [
    ['服务态度差', '✅ 可推送', '物业人员服务行为属履约行为（条例第35条），投诉进入工单'],
    ['处理不及时', '✅ 可推送', '处理时效是物业服务履约内容'],
    ['收费不合理', '❌ 不推送', '收费依物业服务合同约定（条例第40条）；平台工单不承载收费争议（系统边界），但客服须诠释收费依据、记录转达业主意见（沟通义务）——按场景七-6处理，不以一句话踢给物业或价格部门'],
    ['公区管理差', '✅ 可推送', '公区环境卫生与秩序维护是物业法定职责（条例第2条）'],
    ['噪音扰民', '✅ 可推送', '物业有劝阻制止职责（条例第45条、民法典第286条）；同时告知情节严重可报警'],
    ['安全隐患', '⚠️ 视内容', '公区消防通道堵塞、电线裸露、设施破损→可推（条例第46条、第55条）；房屋主体结构安全→不推，引导专业鉴定及维修资金程序（场景七-4）'],
    ['停车管理', '✅ 可推送', '车辆停放秩序属物业管理区域秩序维护职责（条例第2条）'],
    ['装修管理', '⚠️ 视内容', '装修噪音、占道、违规施工的劝阻制止→可推（条例第52条、装修管理办法）；需强制拆除处罚→物业报告行政部门，不推（场景七-5）'],
    ['宠物管理', '✅ 可推送', '违规养宠劝阻制止是物业职责（条例第45条、民法典第286条）'],
    ['其他投诉', '⚠️ 视内容', '按四问判定'],
]

SUGGEST_PUSH = [
    ['物业职责范围内改善建议', '属物业服务职责范围的改进建议', '环境卫生改善、绿化养护建议、停车优化建议、便民服务建议、社区活动建议、安全管理建议、信息公开建议', '条例第2条\n民法典第942条、第943条'],
    ['日常小修小补类设施改善', '小件设施的更新与补充', '公共座椅、楼道照明、标识标牌', '条例第2条'],
]
SUGGEST_NOPUSH = [
    ['新增设施与整体改造', '新增设施、整体改造需业主共同决定或动用维修资金', '健身器材、充电桩、监控系统升级、大面积绿化改造', '民法典第278条\n条例第53条', '转物业/业委会评估，按共同决定程序（场景七-4）'],
    ['业主自治事项', '属业主大会/业委会职权范围内的事项', '公共收益分配方案、业委会选举、管理规约修订', '条例第11条\n民法典第278条', '引导业主大会/业委会渠道'],
]
SUGGEST_LABELS = [
    ['安全管理', '✅ 可推送', '属物业安全防范职责范围的改进建议'],
    ['环境卫生', '✅ 可推送', '属物业保洁与公区维护职责范围'],
    ['设施改善', '⚠️ 视内容', '日常小修小补（座椅、照明、标牌）→可推；新增设施、整体改造（健身器材、充电桩、监控升级）→涉及业主共同决定或维修资金，不推，转物业/业委会评估（场景七-4）'],
    ['社区活动', '✅ 可推送', '物业可组织开展社区文化活动'],
    ['绿化景观', '✅ 可推送', '日常绿化养护属物业职责；大面积改造另议'],
    ['停车建议', '✅ 可推送', '属秩序维护职责范围的优化建议'],
    ['便民服务', '✅ 可推送', '物业评估后引入（第三方合作或特约服务）'],
    ['信息公开', '✅ 可推送', '公共收益、维修资金、合同明细的公示是物业法定义务（民法典第943条）'],
    ['其他建议', '⚠️ 视内容', '按四问判定'],
]

FOUR_QUESTIONS = [
    ['第一问\n位置', '诉求发生在共用部位/共用设施设备，还是业主专有部分内部？', '共用部位、共用设施设备', '业主专有部分内部问题，不推草稿，按场景七-1引导'],
    ['第二问\n责任', '该部位/设施由谁维修养护？', '物业（法定职责或合同约定）', '专营单位、建设单位或其他责任主体的，不推草稿，按场景七-2/六-3引导'],
    ['第三问\n性质', '属于日常维修养护，还是保修期满后的大修、更新、改造？', '日常维修养护', '需动用专项维修资金的大修、更新、改造，不推草稿，按场景七-4引导'],
    ['第四问\n程序', '处理该事项是否需要业主共同决定或行政主管部门介入？', '无需共同决定，无需行政职权', '需表决或需执法的，不推草稿，按场景七-4/六-5引导'],
]
BASIC_NOTES = [
    ['草稿工单机制：客服在通话中记录业主诉求，将诉求整理为工单草稿，推送至业主小程序，由业主登录确认后生成正式工单，物业在平台侧收到处理。客服不直接创建正式工单。草稿工单按单据类型分为报修单、投诉单、建议单三类。', 44],
    ['核心判定标准：草稿工单只承载物业法定职责或《物业服务合同》约定职责范围内的事项。推送草稿的前提是——该诉求有明确的责任主体，且物业有权、有能力处理。业主确认后的工单如果落空，损害的是平台公信力：宁可不推，不可乱推。', 44],
    ['不可推 ≠ 不管：判定为不可推的事项，客服仍须完成诠释、出谋划策、疏导三件事（见处置规范Sheet），完整话术见《数治理方客服沟通话术手册》场景七。', 32],
]

DISPOSE = [
    ['户内专有部分维修', '诠释专有部分自费原则；给出特约服务路径；记录诉求，涉及公共/相邻部分时转协调类草稿', '话术手册场景七-1'],
    ['保修期内质量问题', '诠释保修期与保修责任；引导开发商报修；记录并转达物业配合', '话术手册场景七-2'],
    ['专营单位管线设施', '诠释专营单位责任；提供报修电话；记录诉求', '话术手册场景七-3'],
    ['维修资金范围大修', '诠释业主共同决定程序；记录并转达物业/业委会；告知业主提议权', '话术手册场景七-4'],
    ['违法/治安事项', '诠释物业劝阻报告职责边界；引导行政投诉/报警；记录并转达物业配合', '话术手册场景七-5'],
    ['收费争议', '诠释收费依据（合同+价格政策）；记录并转达物业；告知核实渠道与异议权利', '话术手册场景七-6'],
]

LAWS = [
    ['《物业管理条例》', '第2条', '物业管理是对房屋及配套的设施设备和相关场地进行维修、养护、管理，维护环境卫生和相关秩序', '物业职责总纲，判定「物业管什么」'],
    ['《物业管理条例》', '第11条', '筹集和使用专项维修资金、改建重建等由业主共同决定', '业主自治事项的判定依据'],
    ['《物业管理条例》', '第34条', '物业服务合同对物业管理事项、服务质量、双方权利义务等内容进行约定', '合同是服务范围的最终依据'],
    ['《物业管理条例》', '第35条', '物业服务企业应当按照物业服务合同约定提供相应服务', '物业履约义务的判定依据'],
    ['《物业管理条例》', '第40条', '物业服务收费应当遵循合理、公开以及费用与服务水平相适应的原则，由业主和物业服务企业按收费办法在合同中约定', '收费争议诠释的依据'],
    ['《物业管理条例》', '第43条', '物业服务企业可以根据业主委托提供合同约定以外的服务项目，服务报酬由双方约定', '特约服务的依据'],
    ['《物业管理条例》', '第45条', '对违反治安、环保、装饰装修和使用等方面法律法规的行为，物业应当制止并及时报告', '噪音、养宠、违规装修等劝阻制止报告职责的依据'],
    ['《物业管理条例》', '第46条', '物业应当协助做好安全防范工作，发生安全事故时采取应急措施并报告', '公共区域安全隐患工单的依据'],
    ['《物业管理条例》', '第51条', '供水、供电、供气、供热、通信、有线电视等单位承担相关管线和设施设备维修养护责任', '专营单位事项不推草稿的依据'],
    ['《物业管理条例》', '第52条', '业主装修应事先告知物业，物业应告知禁止行为和注意事项', '装修管理工单的依据'],
    ['《物业管理条例》', '第53条', '专项维修资金专项用于保修期满后共用部位、共用设施设备的维修和更新、改造', '大修更新改造需走维修资金程序的依据'],
    ['《物业管理条例》', '第55条', '物业存在安全隐患危及公共利益及他人合法权益时，责任人应当及时维修养护', '安全隐患责任主体的判定依据'],
    ['《民法典》', '第271条', '业主对专有部分享有所有权，对共有部分享有共有和共同管理权利', '专有/共有的划分依据'],
    ['《民法典》', '第278条', '使用维修资金、改建重建等由业主共同决定', '需表决事项不推草稿的依据'],
    ['《民法典》', '第286条', '对噪音、违规养宠、违章搭建、侵占通道等行为，有权请求停止侵害，可向行政主管部门报告投诉', '违规行为劝阻报告职责的依据'],
    ['《民法典》', '第288条', '处理相邻关系应当遵循有利生产、方便生活、团结互助、公平合理的原则', '相邻关系协调类工单的依据'],
    ['《民法典》', '第942条', '物业服务人应妥善维修、养护、清洁、绿化共有部分，维护基本秩序，保护业主人身财产安全', '物业法定义务的总依据'],
    ['《民法典》', '第943条', '物业服务人应定期公开服务事项、收费项目标准、维修资金使用、公共收益等情况', '信息公开类建议工单的依据'],
    ['《建设工程质量管理条例》', '第40条', '屋面防水等保修期为5年，电气管线、给排水管道、装修工程为2年，地基基础和主体结构为设计文件规定的合理使用年限', '保修期内问题由建设单位负责的依据'],
    ['《住宅室内装饰装修管理办法》', '第15-17条', '物业对装修活动履行告知、巡查、劝阻、报告职责', '装修管理类工单的依据'],
    ['属地规定', '—', '浙江省、宁波市物业管理条例等属地法规有更细规定的，从其规定', '属地优先的兜底说明'],
]

SUB = '数治理方草稿工单推送判定规则 V1.2 ｜ 中建物业版 ｜ 配套《数治理方客服沟通话术手册》'

if __name__ == '__main__':
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    wb = openpyxl.Workbook(); wb.remove(wb.active)

    # 1 判定总则
    ws = make_sheet(wb, '1-判定总则', '一、判定总则：四问判定', SUB,
                    ['步骤', '问题', '通过条件', '不通过时的处理'], FOUR_QUESTIONS,
                    [12, 42, 26, 44], CLR_RULE, CLR_RULE,
                    notes=BASIC_NOTES + [('结论：四问全部通过 → 推送草稿工单；任一问不通过 → 不推送，按「处置规范」Sheet 执行（诠释·出谋划策·疏导）。', 30)])

    # 2-7 报修单
    make_sheet(wb, '2-报修-可推', '二、报修单 · 可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据'], REPAIR_PUSH,
               [20, 32, 44, 22], CLR_REPAIR, CLR_GREEN)
    make_sheet(wb, '3-报修-不可推', '三、报修单 · 不可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据', '处置去向'], REPAIR_NOPUSH,
               [20, 28, 34, 20, 26], CLR_REPAIR, CLR_RED)
    make_sheet(wb, '4-报修-逐条判定', '四、报修单 · 14个标签逐条判定', SUB,
               ['标签', '判定', '判定要点'], REPAIR_LABELS,
               [14, 12, 88], CLR_REPAIR, CLR_REPAIR, judge_col=2)

    # 8-10 投诉单
    make_sheet(wb, '5-投诉-可推', '五、投诉单 · 可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据'], COMPLAINT_PUSH,
               [20, 32, 44, 22], CLR_COMPLAINT, CLR_GREEN)
    make_sheet(wb, '6-投诉-不可推', '六、投诉单 · 不可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据', '处置去向'], COMPLAINT_NOPUSH,
               [20, 28, 34, 20, 26], CLR_COMPLAINT, CLR_RED)
    make_sheet(wb, '7-投诉-逐条判定', '七、投诉单 · 10个标签逐条判定', SUB,
               ['标签', '判定', '判定要点'], COMPLAINT_LABELS,
               [14, 12, 88], CLR_COMPLAINT, CLR_COMPLAINT, judge_col=2)

    # 11-13 建议单
    make_sheet(wb, '8-建议-可推', '八、建议单 · 可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据'], SUGGEST_PUSH,
               [20, 32, 44, 22], CLR_SUGGEST, CLR_GREEN)
    make_sheet(wb, '9-建议-不可推', '九、建议单 · 不可以推送', SUB,
               ['类别', '范围说明', '典型示例', '主要依据', '处置去向'], SUGGEST_NOPUSH,
               [20, 28, 34, 20, 26], CLR_SUGGEST, CLR_RED)
    make_sheet(wb, '10-建议-逐条判定', '十、建议单 · 9个标签逐条判定', SUB,
               ['标签', '判定', '判定要点'], SUGGEST_LABELS,
               [14, 12, 88], CLR_SUGGEST, CLR_SUGGEST, judge_col=2)

    # 14 处置规范
    make_sheet(wb, '11-处置规范', '十一、不可推事项的处置规范', '不推草稿 ≠ 挂断电话 ｜ 完整话术见《数治理方客服沟通话术手册》场景七',
               ['不可推类别', '判定后动作（诠释·出谋划策·疏导）', '沟通话术位置'], DISPOSE,
               [22, 78, 24], CLR_DISPOSE, CLR_DISPOSE,
               notes=[('重要区分：平台不承载缴费类业务，是系统边界；客服诠释费用事项、记录转达业主意见，是沟通义务。两者不冲突——工单不承载收费争议，但客服不能以一句「不涉及费用」把业主打发走。', 40)])

    # 15 法规依据
    make_sheet(wb, '12-法规依据', '十二、法规依据', '《物业管理条例》（2018年第三次修订）等现行有效版本 ｜ 属地规定优先',
               ['法规', '条款', '条款要点', '在本规则中的用途'], LAWS,
               [26, 10, 58, 32], CLR_LAW, CLR_LAW)

    wb.save(OUTPUT)
    print('OK ' + OUTPUT)
    print('   %d Sheets: %s' % (len(wb.sheetnames), ', '.join(wb.sheetnames)))
