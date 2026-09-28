# -*- coding: utf-8 -*-
"""生成数治理方短信模版 Excel — 深色主题多Sheet"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUTPUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\数治理方短信模版_P1_v3.xlsx"

# ── 配色 ──
BG_DARK  = "0f172a"
BG_DARK2 = "1e293b"
BG_HEAD  = "1a2332"
TEXT     = "e2e8f0"
TEXT_MUTED = "94a3b8"
ACCENT   = "38bdf8"

CLR = {
    "引导": "38bdf8",
    "工单": "f59e0b",
    "回访": "10b981",
    "信用": "8b5cf6",
    "特殊": "f97316",
    "客服": "06b6d4",
    "变量": "64748b",
    "策略": "38bdf8",
}

# ── 样式 ──
thin_border = Border(
    left=Side(style='thin', color='334155'),
    right=Side(style='thin', color='334155'),
    top=Side(style='thin', color='334155'),
    bottom=Side(style='thin', color='334155'),
)

def header_font(): return Font(name='Microsoft YaHei', size=11, bold=True, color='ffffff')
def title_font():  return Font(name='Microsoft YaHei', size=16, bold=True, color='ffffff')
def body_font():   return Font(name='Microsoft YaHei', size=10, color=TEXT)
def muted_font():  return Font(name='Microsoft YaHei', size=9, color=TEXT_MUTED)
def code_font():   return Font(name='Consolas', size=9, color=TEXT)
def accent_font(c=None): return Font(name='Microsoft YaHei', size=10, bold=True, color=c or ACCENT)

def head_fill():  return PatternFill(start_color=BG_HEAD, end_color=BG_HEAD, fill_type='solid')
def body_fill():  return PatternFill(start_color=BG_DARK, end_color=BG_DARK, fill_type='solid')
def alt_fill():   return PatternFill(start_color=BG_DARK2, end_color=BG_DARK2, fill_type='solid')

center = Alignment(horizontal='center', vertical='center', wrap_text=True)
left   = Alignment(horizontal='left', vertical='center', wrap_text=True)

def style_header_row(ws, row, cols, color=None):
    fill = PatternFill(start_color=color, end_color=color, fill_type='solid') if color else head_fill()
    for c in range(1, cols+1):
        cell = ws.cell(row=row, column=c)
        cell.font = header_font()
        cell.fill = fill
        cell.alignment = center
        cell.border = thin_border

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

# ═══════════════════════════════════════════
LINK = "http://shanghai.shuzhilifang.xin"
SIG  = "【个信数治信用】"

# ── Sheet 1: 平台引导类 ──
guide_templates = [
    ["1.1", "首批导入通知", "物业完成业主名单导入后批量首轮触达", "AI外呼前·批量",
     f"{SIG}${{community}}业主您好，小区在线服务平台已启用。\n报修拍照上传，投诉建议在线提交，进度随时可查。\n{LINK} 点开即用，无需下载注册。"],
    ["1.2", "未激活二次提醒", "首轮短信已读但24h未点击链接", "AI外呼前·批量",
     f"{SIG}${{community}}业主您好，在线报修平台已上线。\n有维修需求拍照提交即可，进度可在平台查看。\n{LINK}"],
    ["1.3", "挂机短信（接通·无诉求）", "AI外呼接通，无具体诉求", "实时·挂断触发",
     f"{SIG}${{community}}在线报修平台已上线。\n报修拍照上传，投诉建议在线提交，进度随时可查。\n{LINK}"],
    ["1.4", "挂机短信（接通·有诉求）", "AI外呼中识别到业主表达了具体诉求", "实时·挂断触发",
     f"{SIG}您提到的${{type}}已记录。\n${{community}}在线平台可查看进度：{LINK}"],
    ["1.5", "未接通通知", "AI外呼未接通（响铃无应答/占线/关机）", "实时·未接通触发",
     f"{SIG}${{community}}在线报修平台已上线。\n报修拍照上传，投诉建议在线提交，进度随时可查。\n{LINK}"],
    ["1.6", "业主已注册·欢迎", "业主首次点击链接进入小程序", "实时·首次登录触发",
     f"{SIG}${{room}}业主您好，欢迎使用小区在线服务平台。\n报修、投诉、建议均可提交，进度随时可查。\n如需帮助请联系物业服务中心。"],
]

# ── Sheet 2: 工单通知类 ──
workorder_templates = [
    ["2.1", "草稿推送（投诉版）", "客服创建投诉类草稿→推送", "实时·客服操作触发",
     f"{SIG}${{room}}业主您好，您反馈的${{type}}已记录。\n请点击确认内容：\n{LINK}"],
    ["2.2", "草稿推送（建议版）", "客服创建建议类草稿→推送", "实时·客服操作触发",
     f"{SIG}${{room}}业主您好，您的建议已记录。\n请点击确认内容：\n{LINK}"],
    ["2.3", "草稿推送（报修版）", "客服创建报修类草稿→推送", "实时·客服操作触发",
     f"{SIG}${{room}}业主您好，您反馈的${{type}}已记录。\n请点击确认，确认后生成工单：\n{LINK}"],
    ["2.4", "草稿过期提醒", "草稿推送后24h未确认", "定时·24h触发",
     f"{SIG}${{room}}业主您好，您有一条${{type}}待确认，将于明天过期。\n如需处理请点击：{LINK}"],
    ["2.5", "工单已分派", "业主确认草稿→工单生成→物业分派", "实时·分派触发",
     f"{SIG}${{room}}业主您好，${{type}}已分配给${{worker}}。\n进度可在平台查看，有疑问请联系物业服务中心。"],
    ["2.6", "工单处理完成·请验收", "物业提交处理结果（含修后照片）", "实时·物业提交触发",
     f"{SIG}${{room}}业主您好，${{type}}处理结果已提交。\n请点击验收并评价：{LINK}"],
    ["2.7", "验收超时自动确认", "工单完成推送后72h业主未评价", "定时·72h触发",
     f"{SIG}${{room}}业主您好，${{type}}工单超时未验收，系统已自动确认。\n有疑问请联系物业服务中心。"],
    ["2.8", "工单重开通知", "业主评价勾选\"问题没解决\"→工单重开", "实时·差评触发",
     f"{SIG}${{room}}业主您好，您反馈${{type}}未解决，工单已重新打开。\n可在平台查看。"],
    ["2.9", "追加处理完成通知", "二次处理完成→推送验收", "实时·物业提交触发",
     f"{SIG}${{room}}业主您好，${{type}}追加处理结果已提交。\n请点击验收：{LINK}"],
]

# ── Sheet 3: 回访评价类 ──
feedback_templates = [
    ["3.1", "满意度回访（AI短信）", "工单闭环后48h", "定时·48h触发",
     f"{SIG}${{room}}业主您好，关于${{date}}的${{type}}，\n对本次服务满意吗？回复1-5分（5最满意），回复0转人工。"],
    ["3.2", "差评回访通知", "业主评价≤2星", "实时·差评触发",
     f"{SIG}${{room}}业主您好，收到您对${{type}}的评价。\n客服将跟进，请留意来电。"],
    ["3.3", "月度服务报告", "每月1日向已注册业主推送", "定时·每月1日",
     f"{SIG}${{community}}${{month}}物业服务报告：\n本月处理${{count}}单工单，平均响应${{duration}}分钟，满意度${{percent}}%。\n{LINK}"],
]

# ── Sheet 4: 信用公示类 ──
credit_templates = [
    ["4.1", "信用分变动通知（业主）", "物业信用分变动→推已注册业主", "实时·分数变动触发",
     f"{SIG}${{community}}物业信用分已更新：${{score}}分（${{grade}}）。\n本月${{plus}}加分，${{minus}}减分。\n{LINK}"],
    ["4.2", "物业履约提示（内部）", "工单超时→通知物业经理", "实时·超时触发",
     f"{SIG}${{community}}有${{count}}单工单已超时，超时记录已计入信用评分。"],
    ["4.3", "公告发布通知", "物业后台发布小区公告", "实时·公告发布触发",
     f"{SIG}${{community}}物业发布公告：${{title}}。\n{LINK}"],
]

# ── Sheet 5: 特殊场景类 ──
special_templates = [
    ["5.1", "节假日关怀", "法定节假日前一天", "定时·节假日前日",
     f"{SIG}${{festival}}快乐！${{community}}物业祝您阖家安康。\n如需报修可随时提交：{LINK}"],
    ["5.2", "极端天气提醒", "气象预警发布后", "实时·天气预警触发",
     f"{SIG}${{weather}}，请注意关好门窗、减少外出。\n紧急情况请拨打物业24小时电话。"],
    ["5.3", "停水停电通知", "计划性停水停电前24h", "定时·提前24h",
     f"{SIG}${{community}}${{building}}${{time}}起进行${{event}}，\n届时将${{scope}}，请提前做好准备。"],
]

# ── Sheet 6: 客服日常发送类 ──
cs_daily_templates = [
    ["6.1", "引导上线", "客服通话后引导业主点击链接进入平台", "实时·客服手动",
     f"{SIG}${{room}}业主您好，小区在线服务平台可提交报修、查看进度。\n{LINK} 点开即用。"],
    ["6.2", "争议已登记", "客服记录业主诉求后发送确认", "实时·客服手动",
     f"{SIG}${{room}}业主您好，您反映的${{type}}已登记。\n可在平台查看：{LINK}"],
    ["6.3", "回访预约确认", "客服与业主约定回访时间后发送", "实时·客服手动",
     f"{SIG}${{room}}业主您好，已预约${{date}}${{time_slot}}回访。\n如需调整请联系客服。"],
    ["6.4", "回访结果通知", "客服回访完成后发送处理结论", "实时·客服手动",
     f"{SIG}${{room}}业主您好，关于${{content}}的回访已完成。\n可联系客服或通过平台查看：{LINK}"],
    ["6.5", "草稿催确认（客服版）", "客服主动提醒业主确认草稿工单", "实时·客服手动",
     f"{SIG}${{room}}业主您好，您有一条${{type}}待确认。\n确认后生成工单：{LINK}"],
    ["6.6", "信息补全", "客服需要业主补充材料或凭证", "实时·客服手动",
     f"{SIG}${{room}}业主您好，关于${{content}}，\n如有凭证可拍照上传至平台：{LINK}"],
    ["6.7", "号码核实", "客服需确认当前号码是否为业主本人", "实时·客服手动",
     f"{SIG}您好，数治理方客服。请问您是${{community}}${{room}}业主本人吗？\n如有疑问请联系物业服务中心。"],
    ["6.8", "无法联系·留言", "多次外呼未接通后的短信留言", "实时·客服手动",
     f"{SIG}${{room}}业主您好，多次致电未接通。\n关于${{content}}，可通过在线平台查看或留言：{LINK}"],
    ["6.9", "处理进度同步", "客服主动告知工单当前状态", "实时·客服手动",
     f"{SIG}${{room}}业主您好，${{type}}当前状态：${{content}}。\n详情可在平台查看：{LINK}"],
]

# ── Sheet 7: 变量说明 ──
variables = [
    ["community", "小区名称", "阳光花园", "系统配置"],
    ["room", "房号", "3-1502", "业主数据"],
    ["type", "问题分类", "水管漏水", "工单系统标签"],
    ["worker", "处理人", "张师傅", "工单分派"],
    ["date", "日期", "6月25日", "系统时间"],
    ["month", "月份", "6月", "系统时间"],
    ["count", "统计数", "128", "统计数据"],
    ["duration", "响应时长", "32分钟", "统计数据"],
    ["score", "信用分", "87", "信用系统"],
    ["grade", "信用等级", "良好", "信用系统"],
    ["plus", "加分", "+5", "信用系统"],
    ["minus", "减分", "-3", "信用系统"],
    ["percent", "百分比", "96%", "统计数据"],
    ["festival", "节日", "中秋", "系统日历"],
    ["weather", "天气预警", "台风黄色预警", "气象接口"],
    ["period", "时限", "24小时内", "SLA配置"],
    ["title", "公告标题", "关于XXX的通知", "物业录入"],
    ["building", "楼栋", "1栋", "楼栋编号"],
    ["time", "时间", "6月25日14:00", "系统时间"],
    ["event", "事件", "电力检修", "物业录入"],
    ["scope", "影响范围", "停电", "物业录入"],
    ["content", "具体事项", "漏水问题已安排", "客服填写"],
    ["time_slot", "时间段", "14:00-16:00", "客服填写"],
]

# ── Sheet 8: 发送策略 ──
strategy = [
    ["平台引导类", "10:00-18:00", "批量", "每业主每轮最多2条", "通知短信"],
    ["挂机短信", "通话结束即时", "实时", "—", "通知短信"],
    ["草稿推送", "客服操作即时", "实时", "单日同类型≤3条", "通知短信"],
    ["客服日常发送", "09:00-18:00", "实时", "—", "通知短信"],
    ["工单通知", "状态变更即时", "实时", "—", "通知短信"],
    ["验收通知", "物业提交即时", "实时", "—", "通知短信"],
    ["回访评价", "09:00-17:00", "定时", "单月每业主≤2条", "通知短信"],
    ["信用公示", "09:00-18:00", "批量", "变动即发", "通知短信"],
    ["特殊场景", "08:00-20:00", "实时/定时", "—", "通知短信"],
    ["节假日关怀", "08:00-10:00", "定时", "—", "通知短信"],
]

# ═══════════════════════════════════════════
# 创建工作簿
# ═══════════════════════════════════════════

wb = openpyxl.Workbook()
wb.remove(wb.active)

def make_title_row(ws, title_text, category, cols):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=cols)
    c = ws.cell(row=1, column=1, value=title_text)
    c.font = title_font()
    c.fill = body_fill()
    c.alignment = Alignment(horizontal='left', vertical='center')
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=cols)
    c2 = ws.cell(row=2, column=1,
        value=f"短信标签: 个信数治信用 ｜ 链接: http://shanghai.shuzhilifang.xin ｜ P1纯物业工单")
    c2.font = muted_font()
    c2.fill = body_fill()
    c2.alignment = Alignment(horizontal='left', vertical='center')
    ws.row_dimensions[1].height = 36
    ws.row_dimensions[2].height = 22

def make_sheet(ws, sheet_title, category, data, headers, col_widths):
    cols = len(headers)
    make_title_row(ws, sheet_title, category, cols)
    HEAD_ROW = 3
    for c_idx, h in enumerate(headers, 1):
        ws.cell(row=HEAD_ROW, column=c_idx, value=h)
    style_header_row(ws, HEAD_ROW, cols, color=CLR.get(category, ACCENT))
    ws.row_dimensions[HEAD_ROW].height = 28
    for r_idx, row_data in enumerate(data):
        row_num = HEAD_ROW + 1 + r_idx
        alt = (r_idx % 2 == 1)
        for c_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=row_num, column=c_idx, value=val)
            if c_idx == len(row_data):
                cell.font = code_font()
            elif c_idx == 1:
                cell.font = accent_font(CLR.get(category, ACCENT))
                cell.alignment = center
            else:
                cell.font = body_font()
                cell.alignment = left
            cell.fill = alt_fill() if alt else body_fill()
            cell.border = thin_border
        ws.row_dimensions[row_num].height = max(56, 14 * str(row_data[-1]).count('\n') + 28)
    set_col_widths(ws, col_widths)
    ws.sheet_properties.tabColor = CLR.get(category, ACCENT)

# ── Sheets ──
ws1 = wb.create_sheet("1-平台引导类")
make_sheet(ws1, "一、平台引导类", "引导", guide_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 18, 28, 16, 68])

ws2 = wb.create_sheet("2-工单通知类")
make_sheet(ws2, "二、工单通知类（P1核心）", "工单", workorder_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 22, 28, 16, 68])

ws3 = wb.create_sheet("3-回访评价类")
make_sheet(ws3, "三、回访评价类", "回访", feedback_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 22, 24, 16, 68])

ws4 = wb.create_sheet("4-信用公示类")
make_sheet(ws4, "四、信用公示类", "信用", credit_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 22, 28, 16, 68])

ws5 = wb.create_sheet("5-特殊场景类")
make_sheet(ws5, "五、特殊场景类", "特殊", special_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 18, 26, 16, 68])

ws6 = wb.create_sheet("6-客服日常发送")
make_sheet(ws6, "六、客服日常发送类", "客服", cs_daily_templates,
    ["编号", "模板名称", "触发条件", "发送方式", "短信内容"], [6, 20, 28, 16, 68])

ws7 = wb.create_sheet("7-变量说明")
make_sheet(ws7, "七、变量说明", "变量", variables,
    ["变量名", "含义", "示例", "备注"], [18, 18, 20, 36])

ws8 = wb.create_sheet("8-发送策略")
make_sheet(ws8, "八、发送策略", "策略", strategy,
    ["场景分类", "发送时间窗口", "发送方式", "频率限制", "短信类型"], [16, 20, 14, 24, 24])

for ws in [ws1, ws2, ws3, ws4, ws5, ws6]:
    ws.freeze_panes = 'A4'
ws7.freeze_panes = 'A4'
ws8.freeze_panes = 'A4'

wb.save(OUTPUT)
print(f"✅ {OUTPUT}")
print(f"   Sheets: {len(wb.sheetnames)} — {', '.join(wb.sheetnames)}")
