#!/usr/bin/env python3
"""生成数治理方 P1 短信模版 Excel（11条·深色主题）"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\数治理方短信模版_P1_正式版.xlsx"

BG   = "0f172a"
CARD = "1e293b"
HDR  = "1a2234"
TXT  = "e2e8f0"
DIM  = "94a3b8"

BLUE  = "3b82f6"
YELLOW= "f59e0b"
GREEN = "10b981"
ORANGE= "f97316"
PURPLE= "8b5cf6"

thin = Border(
    left=Side('thin','334155'), right=Side('thin','334155'),
    top=Side('thin','334155'), bottom=Side('thin','334155'))

def sc(cell, sz=10, bold=False, color=TXT, bg=None, align='left'):
    cell.font = Font(name='Microsoft YaHei', size=sz, bold=bold, color=color)
    if bg: cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type='solid')
    cell.alignment = Alignment(horizontal=align, vertical='center', wrap_text=True)
    cell.border = thin

def hdr_row(ws, row, n, cat_color=None):
    for c in range(1, n+1):
        sc(ws.cell(row=row, column=c), sz=11, bold=True, color='ffffff',
           bg=cat_color or HDR, align='center')

def aw(ws, mn=12, mx=70):
    for col in ws.columns:
        lt = get_column_letter(col[0].column)
        lens = [max(len(l) for l in str(c.value or '').split('\n')) for c in col]
        ws.column_dimensions[lt].width = min(max(max(lens)+2, mn), mx)

def info_row(ws, r, cat, color, ncols):
    """在表头前插入分类信息行"""
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=ncols)
    c = ws.cell(row=r, column=1)
    sc(c, sz=10, bold=True, color=color, bg=BG)
    # tab color bar
    for col in range(1, ncols+1):
        sc(ws.cell(row=r, column=col), sz=10, bold=True, color=color, bg=BG)

def write_sheet(ws, title, cat_color, headers, rows, notes=""):
    ncols = len(headers)

    # 分类标题行
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    c = ws.cell(row=1, column=1, value="【个信数治信用】| http://shuzhilifang.vip/${code} | 单向通知 | " + notes)
    sc(c, sz=10, bold=False, color=DIM, bg=BG)

    # 表头
    for i, h in enumerate(headers, 1):
        ws.cell(row=2, column=i, value=h)
    hdr_row(ws, 2, ncols, cat_color)

    # 数据
    for r, row in enumerate(rows, 3):
        for c, val in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=val)
            bg_c = CARD if r%2==1 else BG
            sc(cell, sz=10, color=TXT, bg=bg_c)
            if c == 1:  # 编号列高亮
                sc(cell, sz=10, bold=True, color=cat_color, bg=bg_c)

    ws.freeze_panes = 'A3'
    aw(ws)

wb = openpyxl.Workbook()
if "Sheet" in wb.sheetnames: del wb["Sheet"]

# ═══════════════════════════════════════
# Sheet 1: 平台引导类
# ═══════════════════════════════════════
ws1 = wb.create_sheet("1-平台引导类")
ws1.sheet_properties.tabColor = BLUE
write_sheet(ws1, "一、平台引导类", BLUE,
    ["编号","模板名称","触发条件","发送方式","短信内容"],
    [
        ["1.1","平台上线通知","物业授权后，首批业主名单导入平台","批量发送",
         "【个信数治信用】${community}小区业主您好，小区已启用在线服务平台。\n报修、投诉、建议均可在线提交，处理进度随时可查。\nhttp://shuzhilifang.vip/${code}"],
        ["1.2","业主注册引导","物业提供业主信息后，引导未注册业主","批量发送",
         "【个信数治信用】${community}小区业主您好，${community}物业已开通线上服务。\n您可通过平台提交诉求、查看处理进度。\nhttp://shuzhilifang.vip/${code}"],
    ], "平台引导类·批量")

# ═══════════════════════════════════════
# Sheet 2: 工单通知类
# ═══════════════════════════════════════
ws2 = wb.create_sheet("2-工单通知类")
ws2.sheet_properties.tabColor = YELLOW
write_sheet(ws2, "二、工单通知类（P1核心）", YELLOW,
    ["编号","模板名称","触发条件","发送方式","短信内容"],
    [
        ["2.1","工单确认通知","业主通过平台成功提交诉求","实时·提交触发",
         "【个信数治信用】您的诉求已记录，工单编号${wo_id}。\n处理进度可在平台查看。\nhttp://shuzhilifang.vip/${code}"],
        ["2.2","处理结果已提交","物业提交工单处理结果","实时·物业提交触发",
         "【个信数治信用】您的${type}处理结果已提交。\n如有疑问可在平台查看或反馈。\nhttp://shuzhilifang.vip/${code}"],
        ["2.3","超时自动确认","工单完成推送后72h业主未评价","定时·72h触发",
         "【个信数治信用】您的${type}工单因超时未验收，系统已自动确认完成。\n如有疑问请联系物业服务中心。"],
        ["2.4","工单重开通知","业主反馈问题未解决，工单重新进入处理","实时·重开触发",
         "【个信数治信用】您反馈${type}未解决，已重新进入处理流程。\n请关注后续进度。"],
    ], "工单闭环·系统触发")

# ═══════════════════════════════════════
# Sheet 3: 回访评价类
# ═══════════════════════════════════════
ws3 = wb.create_sheet("3-回访评价类")
ws3.sheet_properties.tabColor = GREEN
write_sheet(ws3, "三、回访评价类", GREEN,
    ["编号","模板名称","触发条件","发送方式","短信内容"],
    [
        ["3.1","回访邀请","工单完成后，邀请业主评价","定时·完成后触发",
         "【个信数治信用】您的工单${wo_id}已完结。\n请对本次服务进行评价。\nhttp://shuzhilifang.vip/${code}"],
        ["3.2","月度服务简报","每月向已注册业主推送","定时·每月1日",
         "【个信数治信用】${community}${month}物业服务简报：\n本月处理工单${count}单，平均响应${duration}，满意度${percent}%。\nhttp://shuzhilifang.vip/${code}"],
    ], "回访评价·定时")

# ═══════════════════════════════════════
# Sheet 4: 特殊场景类
# ═══════════════════════════════════════
ws4 = wb.create_sheet("4-特殊场景类")
ws4.sheet_properties.tabColor = ORANGE
write_sheet(ws4, "四、特殊场景类", ORANGE,
    ["编号","模板名称","触发条件","发送方式","短信内容"],
    [
        ["4.1","节假日关怀","法定节假日前一天","定时·节假日前日",
         "【个信数治信用】${festival}快乐！${community}物业祝您阖家安康。\n在线服务平台可随时提交需求。\nhttp://shuzhilifang.vip/${code}"],
        ["4.2","极端天气提醒","气象预警发布时","实时·预警触发",
         "【个信数治信用】${community}物业提醒：${weather}，请注意安全。\n如需帮助可在线提交：http://shuzhilifang.vip/${code}"],
        ["4.3","停水停电通知","物业发布停水停电公告","实时·公告触发",
         "【个信数治信用】${community}物业通知：${date}${time_slot}将进行${event}，影响范围${scope}。\n详情：http://shuzhilifang.vip/${code}"],
    ], "特殊场景·定时/实时")

# ═══════════════════════════════════════
# Sheet 5: 变量说明
# ═══════════════════════════════════════
ws5 = wb.create_sheet("5-变量说明")
ws5.sheet_properties.tabColor = "64748b"
write_sheet(ws5, "五、变量说明", "64748b",
    ["变量名","含义","示例","来源"],
    [
        ["${community}","小区名称","阳光花园","系统配置"],
        ["${room}","房号","3-1502","业主数据"],
        ["${wo_id}","工单编号","GD20260701001","系统自动生成"],
        ["${type}","问题分类","水管漏水","工单系统标签"],
        ["${date}","日期","6月25日","系统时间"],
        ["${month}","月份","6月","系统时间"],
        ["${count}","统计数","128","统计数据"],
        ["${duration}","响应时长","32分钟","统计数据"],
        ["${percent}","百分比","96%","统计数据"],
        ["${festival}","节日","中秋","系统日历"],
        ["${weather}","天气预警类型","台风黄色预警","气象接口"],
        ["${event}","事件名称","电力检修","物业录入"],
        ["${scope}","影响范围","1-6栋","物业录入"],
        ["${time_slot}","时间段","14:00-16:00","物业录入"],
    ], "变量定义")

# ═══════════════════════════════════════
# Sheet 6: 发送策略
# ═══════════════════════════════════════
ws6 = wb.create_sheet("6-发送策略")
ws6.sheet_properties.tabColor = "64748b"
write_sheet(ws6, "六、发送策略", "64748b",
    ["场景分类","发送时间窗口","发送方式","频率限制","短信类型"],
    [
        ["平台引导类","10:00-18:00","批量","每小区每轮1条","通知短信"],
        ["工单确认","提交即时","实时","—","通知短信"],
        ["处理结果","物业提交即时","实时","—","通知短信"],
        ["超时确认","定时触发","定时","—","通知短信"],
        ["工单重开","差评即时","实时","—","通知短信"],
        ["回访邀请","工单完成后","定时","单月每业主≤2条","通知短信"],
        ["月度报告","每月1日 09:00","定时","每月1条","通知短信"],
        ["节假日关怀","节假日前日 08:00-10:00","定时","—","通知短信"],
        ["极端天气","预警即时","实时","—","通知短信"],
        ["停水停电","公告即时","实时","—","通知短信"],
    ], "发送策略")

# ═══════════════════════════════════════
# Sheet 7: 语言规则与禁词
# ═══════════════════════════════════════
ws7 = wb.create_sheet("7-语言规则")
ws7.sheet_properties.tabColor = "ef4444"
write_sheet(ws7, "七、语言规则与禁词", "ef4444",
    ["类型","内容","说明"],
    [
        ["✅ 能说","已记录、已提交至物业、已生成工单、已分配、处理结果已提交、可在平台查看","平台事实"],
        ["✅ 能说","系统已自动确认完成","系统自身行为"],
        ["✅ 能说","客服将跟进","客服可控的行为"],
        ["","",""],
        ["❌ 禁止","将跟进处理、进入处理流程、上门处理","替物业承诺"],
        ["❌ 禁止","计划XX日XX时上门处理","替物业定时间"],
        ["❌ 禁止","已处理完毕","'完毕'是结果判断"],
        ["❌ 禁止","后续有进展会同步更新","不确定有无进展"],
        ["❌ 禁止","滞纳金、影响门禁、影响停车、限制权限","催收威胁（禁）"],
        ["❌ 禁止","影响信用记录、影响征信、拉黑名单","信用恐吓（禁）"],
        ["❌ 禁止","越拖越多、逾期超过X天、建议尽快","后果施压（禁）"],
        ["❌ 禁止","即刻、专人、我们将、预计、尽快","主动承诺（禁）"],
        ["","",""],
        ["📏 风格","短句，主体不超过2行","简洁"],
        ["📏 风格","说'已记录'不说'已为您记录'","去客套"],
        ["📏 风格","链接裸放，不包裹引导语","不诱导点击"],
        ["📏 风格","签名固定【个信数治信用】","统一标签"],
        ["📏 风格","链接固定 http://shuzhilifang.vip/${code} 裸域名","不加参数"],
    ], "语言红线和风格")

# ═══════════════════════════════════════
# Sheet 8: 已删除模板（仅供参考）
# ═══════════════════════════════════════
ws8 = wb.create_sheet("8-已删除模板")
ws8.sheet_properties.tabColor = "475569"
write_sheet(ws8, "八、已删除模板（仅供参考，P1不启用）", "475569",
    ["编号","模板名称","原用途","删除原因"],
    [
        ["—","工单已分派","通知业主管家已接单","业主无需知晓内部分派信息"],
        ["—","满意度收集(短信交互版)","要求业主回复数字评分","无AI外呼，做不到短信交互"],
        ["—","挂机短信","AI外呼挂断后自动发送","P1不启用AI外呼"],
        ["—","未接通通知","AI外呼未接通后发送","P1不启用AI外呼"],
        ["—","草稿推送","客服创建草稿后推送业主确认","P1不启用AI外呼"],
        ["—","差评回访","业主差评后自动触发回访短信","P1不启用AI外呼"],
        ["—","信用分变动通知","物业信用分变动→推业主","P1不做信用类功能"],
        ["—","公告发布通知","物业发布公告→推业主","P1不做信用类功能"],
        ["—","物业履约提示(内部)","工单超时→通知物业经理","内部通知，非业主短信"],
        ["—","缴费类短信","催缴/提醒缴费","P2功能，P1不做"],
    ], "已删除·不启用")

wb.save(OUT)
print(f"✅ 已生成：{OUT}")
print(f"📊 共 {len(wb.sheetnames)} 个 Sheet：")
for i,n in enumerate(wb.sheetnames,1): print(f"   {i}. {n}")
total = sum(1 for ws in wb.worksheets for r in ws.iter_rows(min_row=3) for c in r if c.value and str(c.value)[0].isdigit() and '.' in str(c.value)[:3])
print(f"📱 共 11 条短信模板")
