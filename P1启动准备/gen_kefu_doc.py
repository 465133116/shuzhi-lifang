#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""数治理方 - 客服端 产品设计文档生成器"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUTPUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\客服端_产品设计文档.docx"
FONT_BODY = '宋体'; FONT_TITLE = '黑体'

doc = Document()
style = doc.styles['Normal']
style.font.name = FONT_BODY; style.font.size = Pt(11)
style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)
style.paragraph_format.line_spacing = 1.5; style.paragraph_format.space_after = Pt(4)
for s in doc.sections:
    s.top_margin = Cm(2.5); s.bottom_margin = Cm(2.5)
    s.left_margin = Cm(2.8); s.right_margin = Cm(2.8)

def scf(cell, text='', bold=False, size=Pt(10), align=WD_ALIGN_PARAGRAPH.LEFT, color=None):
    cell.text = ''; p = cell.paragraphs[0]; p.alignment = align
    p.paragraph_format.space_before = Pt(2); p.paragraph_format.space_after = Pt(2)
    r = p.add_run(str(text)); r.bold = bold; r.font.size = size
    r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)
    if color: r.font.color.rgb = color

def add_title(text, size=Pt(22)):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(24); p.paragraph_format.space_after = Pt(16)
    r = p.add_run(text); r.bold = True; r.font.size = size
    r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)

def add_subtitle(text):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after = Pt(20)
    r = p.add_run(text); r.font.size = Pt(12); r.font.color.rgb = RGBColor(100,116,139)
    r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)

def add_h1(text):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(18); p.paragraph_format.space_after = Pt(10)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(16)
    r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)

def add_h2(text):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(12); p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(13)
    r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)

def add_body(text, indent=True, bold=False):
    p = doc.add_paragraph()
    if indent: p.paragraph_format.first_line_indent = Pt(22)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(11)
    r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)

def shade_cells(row, color="D9E2F3"):
    for c in row.cells:
        s = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
        c._tc.get_or_add_tcPr().append(s)

def add_table(headers, rows, col_widths=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        scf(t.rows[0].cells[i], h, bold=True, size=Pt(9.5), align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255,255,255))
    shade_cells(t.rows[0], "1F3864")
    for ri, rd in enumerate(rows):
        for ci, v in enumerate(rd):
            scf(t.rows[ri+1].cells[ci], str(v) if v is not None else '', size=Pt(9))
        if ri % 2 == 1: shade_cells(t.rows[ri+1], "F2F2F2")
    if col_widths:
        for row in t.rows:
            for i, w in enumerate(col_widths):
                if i < len(row.cells): row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return t

def add_page_break(): doc.add_page_break()

# ════ 封面 ════
doc.add_paragraph(); doc.add_paragraph()
add_title('数治理方 · 客服端')
add_subtitle('产品设计文档')
doc.add_paragraph(); doc.add_paragraph()
add_table(
    ['项目', '内容'],
    [['文档版本', 'V1.0'], ['编制日期', '2026年7月'],
     ['适用系统', '数治理方社区治理平台'],
     ['接入形态', '网页端（PC浏览器）'],
     ['端口定位', '客服端（生态运营者·触达激活）'],
     ['核心能力', '外呼触达·草稿创建·回访跟进·多小区管理'],
     ['生态位置', '独立外部运营系统·只读接入平台']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 目录 ════
add_h1('目录')
for ch in ['一、端口概述与定位','二、AI×客服分工','三、客服工作台','四、小区总览与业主管理','五、快捷草稿系统','六、待跟进工单与回访','七、消息提醒与沟通记录','八、话术红线','九、与生态其他端口的关系']:
    add_body(ch, indent=False)
add_page_break()

# ════ 一、端口概述 ════
add_h1('一、端口概述与定位')
add_h2('1.1 客服端是什么')
add_body('客服端是数治理方七端生态中的"发动机"——它是整个生态的运营激活器。AI负责扫面（批量初筛、排除错号空号），客服负责攻坚（争议回访、草稿创建与确认引导、工单后回访）。')
add_body('客服端定位为独立外部运营系统，只读接入数治理方平台数据。它不创建正式工单、不修改工单状态、不处理工单——它的职责是"触达"和"激活"：把业主从"被动沉默"状态拉入"主动参与"轨道。')

add_h2('1.2 生态位置')
add_body('客服端在生态中处于"入口层"——它是业主接触平台的第一触点。欠费业主可能从未打开过小程序，客服是第一个让业主知道"平台上有你楼栋的工单记录"的人。')

add_table(
    ['维度', '说明'],
    [['核心动作', '外呼触达→了解诉求→创建草稿→推送业主确认→回访闭环'],
     ['数据接收(只读)', '业主欠费数据·工单状态·满意度·沟通历史'],
     ['数据输出', '通话记录·草稿工单(推送业主端确认)·回访记录'],
     ['不可做的事', '创建正式工单·修改工单状态·处理工单·执行催收']],
    col_widths=[3, 12.5]
)
add_page_break()

# ════ 二、AI×客服分工 ════
add_h1('二、AI×客服分工')
add_h2('2.1 核心分工原则')
add_body('AI扫面，客服攻坚。AI筛掉70%无效号码和简单场景，客服处理有争议、有情绪、需引导的30%。')

add_table(
    ['AI外呼', '人工客服'],
    [['批量初筛', '精准跟进'],
     ['身份核实', '争议回访'],
     ['排除错号空号', '草稿创建与确认引导'],
     ['基础欠费提醒', '工单后回访'],
     ['意图识别', '情绪安抚与复杂沟通']],
    col_widths=[7.5, 7.5]
)

add_h2('2.2 四阶段闭环')
add_body('客服工作贯穿四个阶段：')
add_body('第一阶段·电话沟通与标签记录：根据工单回访需求和待跟进优先级确定拨打顺序——待验收工单>差评回访>问题未解决>常规回访（而非按欠费天数排序）。客服外呼→AI辅助身份核实→了解业主诉求→归入30个预设标签→记录沟通要点。')
add_body('第二阶段·工单监控（只读）：查看工单状态、超时情况、满意度评分。不创建、不处理、不分派。')
add_body('第三阶段·工单回访：工单关闭后自动生成回访任务。满意度≥4→AI自动回访，满意度3→AI外呼，满意度≤2→人工回访。问题解决则闭环，问题未解决则重新创建诉求草稿。')
add_body('第四阶段·业主触达闭环：电话沟通→标签记录→草稿创建→推送业主端确认→生成正式工单→工单后回访。治理不是催收——客服的核心是激活沉默业主进入平台正循环，用制度代替人情，用沟通代替施压。')
add_page_break()

# ════ 三、客服工作台 ════
add_h1('三、客服工作台')
add_h2('3.1 首屏统计')
add_body('客服工作台首屏展示六维核心统计，让客服一眼看清今日工作量和整体进度：')
add_table(
    ['统计维度', '内容', '用途'],
    [['今日外呼', '当日拨打的电话总数', '评估工作量'],
     ['接通率', '已接通数/已拨打数', '评估触达效率'],
     ['今日草稿', '当日创建的诉求草稿数', '评估转化效果'],
     ['累计拨打', '已拨打业主数/总业主数', '评估覆盖率'],
     ['小程序上线率', '已登录小程序业主占比', '评估激活效果'],
     ['累计外呼', '历史外呼总量', '评估整体运营规模']],
    col_widths=[3, 6, 6]
)

add_h2('3.2 本周/本月统计')
add_body('除今日数据外，工作台同步展示本周和本月的汇总对比——本周外呼数、本周草稿数、本月外呼数、本月草稿数。帮助客服掌握中长周期的工作趋势。')

add_h2('3.3 待跟进标记')
add_body('工作台右上角以橙色角标数字展示待跟进事项数量——包括待验收工单、差评需回访工单、问题未解决工单。点击可进入待跟进列表逐项处理。')
add_page_break()

# ════ 四、小区总览 ════
add_h1('四、小区总览与业主管理')
add_h2('4.1 多小区卡片')
add_body('客服端支持多小区并行管理。首屏以卡片形式展示各小区概览：小区名称·地址·物业经理·欠费户数·已拨打数·未拨打数·已登录小程序数。点击卡片进入该小区详情。')

add_h2('4.2 小区详情与筛选')
add_body('进入小区后展示完整的业主列表，每行包含：房号·姓名·标签·拨打状态（已拨打/未拨打）·登录状态·争议标记。顶部筛选标签：全部/未拨打/已拨打/待确认。')

add_h2('4.3 业主详情与拨号')
add_body('点击业主弹出详情面板，展示该户完整的沟通记录（时间/客服/动作类型/结果/备注）。一键点击号码或拨号按钮直接发起外呼。每次通话后自动记录通话结果和备注。')
add_page_break()

# ════ 五、快捷草稿 ════
add_h1('五、快捷草稿系统')
add_h2('5.1 30个预设标签')
add_body('客服在与业主通话中，可将业主诉求快速归类为30个预设标签之一。每个标签配有预设模板，AI自动生成通话摘要填入描述框，客服可修改后推送至业主端确认。')

add_table(
    ['类型', '数量', '示例'],
    [['投诉类', '9个', '服务态度/处理不及时/噪音扰民/安全隐患/环境卫生/违建/宠物管理/停车纠纷/其他'],
     ['建议类', '8个', '安全管理/设施改善/社区活动/停车管理/绿化养护/服务提升/费用透明/其他'],
     ['报修类', '13个', '电梯故障/水管漏水/门禁门锁/下水道堵塞/照明故障/墙面渗漏/消防设施/空调故障/电路问题/门窗损坏/地面破损/燃气故障/其他']],
    col_widths=[2.5, 2, 11]
)

add_h2('5.2 草稿创建流程')
add_body('通话中了解诉求→选择对应标签→AI自动填入描述→客服修改确认→推送前二次确认弹窗→推送至业主端。业主在业主端收到草稿通知，确认后系统自动生成正式工单并开始全流程流转。')

add_h2('5.3 推送后跟踪')
add_body('草稿推送后，客服端可在沟通记录中查看推送状态（待确认/已确认/已生成工单）。超时未确认（7天）→客服主动回访确认原因。')
add_page_break()

# ════ 六、待跟进 ════
add_h1('六、待跟进工单与回访')
add_h2('6.1 待跟进分类')
add_table(
    ['类型', '触发条件', '客服动作'],
    [['待业主验收', '物业反馈工单完成', '确认业主是否收到处理结果·引导验收'],
     ['差评需回访', '业主评分≤3星', '了解不满原因·记录反馈·推动问题解决'],
     ['问题未解决', '业主反馈处理结果不满意', '重新创建诉求草稿·返回工单流程']],
    col_widths=[3.5, 5, 6.5]
)

add_h2('6.2 回访智能分流')
add_body('工单关闭后系统自动生成回访任务。分流规则：满意度≥4且信用A/B→AI自动回访；满意度3且信用C→AI外呼；满意度≤2且信用D/E→人工回访。问题解决则闭环归档，问题未解决则重新草稿→返回工单流程。')
add_page_break()

# ════ 七、消息提醒 ════
add_h1('七、消息提醒与沟通记录')
add_h2('7.1 消息提醒')
add_body('客服端实时接收三类系统消息：物业完成工单→自动提醒客服进行回访；业主打低分（≤3星）→自动提醒客服跟进；业主反馈问题未解决→自动提醒客服重新介入。点击消息可一键回拨对应业主。')

add_h2('7.2 沟通记录')
add_body('每户业主维护完整的沟通历史记录。记录项包括：时间·客服姓名·动作类型（外呼/建草稿/回访/备注）·通话结果（已接通/拒接/空号/无争议/有争议）·备注内容。推送草稿时自动记录AI摘要和草稿内容，确保沟通全链路可追溯。')
add_page_break()

# ════ 八、话术红线 ════
add_h1('八、话术红线')
add_h2('8.1 客服只做三件事')
add_body('① 引导业主看到服务记录——"平台上有您楼栋的工单处理情况"')
add_body('② 记录业主诉求——"我帮您把问题整理成工单草稿，您打开小程序确认一下就行"')
add_body('③ 确认工单闭环——"处理结果已提交，您可以在平台查看"')

add_h2('8.2 禁用语言')
add_body('治理不是催收。数治理方客服的话术逻辑是"用制度代替人情"，不是"用威胁代替沟通"。')
add_table(
    ['禁用类型', '禁词/句式', '原因'],
    [['滞纳金威胁', '"滞纳金自己承担""滞纳金每天累积"', '催收逻辑，与治理理念冲突'],
     ['权限威胁', '"影响门禁""影响停车""限制权限"', '用公共资源使用权威胁业主'],
     ['信用恐吓', '"影响信用记录""影响征信"', '信用是制度记录不是恐吓工具'],
     ['后果施压', '"越拖越多""建议尽快，不然…"', '不做主动承诺的对立面——不做主动威胁']],
    col_widths=[2.5, 5, 7.5]
)

add_h2('8.3 正确方向')
add_body('把焦点从"你欠了多少钱"转移到"你遇到了什么问题"。客服的话术是引导业主进入平台的正循环——看到服务记录→提出诉求→工单生成→处理→验收→信任建立。')
add_page_break()

# ════ 九、生态关系 ════
add_h1('九、与生态其他端口的关系')
add_h2('9.1 数据流向')
add_table(
    ['关联端口', '接收（输入端）', '输出（发送端）'],
    [['业主端', '业主确认草稿→生成工单', '草稿推送·回访通知'],
     ['物业端', '工单状态·处理结果·满意度', '—（只读不写）'],
     ['业委会端', '—', '—（不直接对接）'],
     ['社区端', '—', '—（不直接对接）'],
     ['近场供应链端', '—', '—（不直接对接）'],
     ['AI端', 'AI预判分级·话术推荐·意图识别', '通话记录·人工标注（回写AI训练）']],
    col_widths=[3, 5.5, 5.5]
)

add_h2('9.2 客服端在闭环中的位置')
add_body('触达闭环：客服外呼→了解诉求→创建草稿→业主确认→工单生成→物业处理→客服回访→闭环。客服端是这条闭环的起点和终点——它激活沉默业主进入平台，又确保每一个闭环有始有终。')

add_h2('9.3 数据边界')
add_body('客服端对平台数据仅具只读权限。不可创建正式工单、不可修改工单状态、不可直接处理工单。客服创建的草稿必须经过业主端确认后才能转化为正式工单——"业主确认"这一步是客服端与平台的隔离墙。')

# 结尾
doc.add_paragraph(); doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('—— 文档结束 ——')
r.font.size = Pt(11); r.font.color.rgb = RGBColor(148,163,184)
r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)

os.makedirs(os.path.dirname(OUTPUT) if os.path.dirname(OUTPUT) else '.', exist_ok=True)
doc.save(OUTPUT)
print(f'Done: {OUTPUT}')
