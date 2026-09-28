#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""数治理方 - AI端 产品设计文档生成器"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

OUTPUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\AI端_产品设计文档.docx"
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
add_title('数治理方 · AI端')
add_subtitle('产品设计文档')
doc.add_paragraph(); doc.add_paragraph()
add_table(
    ['项目', '内容'],
    [['文档版本', 'V1.0'], ['编制日期', '2026年7月'],
     ['适用系统', '数治理方社区治理平台'],
     ['接入形态', '无独立用户界面·能力通过平台API层嵌入各端'],
     ['端口定位', 'AI端（智能神经系统·平台基础设施）'],
     ['核心能力', '27项：分类·分派·计算·预测·生成·推荐·检测·调优'],
     ['技术路线', 'V1-V3纯规则引擎·V4引入ML·规则引擎始终兜底']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 目录 ════
add_h1('目录')
for ch in ['一、端口概述与定位','二、设计原则','三、服务业主端的AI能力','四、服务物业端的AI能力','五、服务业委会端的AI能力','六、服务社区端的AI能力','七、服务运营/客服端的AI能力','八、跨端基础设施','九、故障降级','十、与生态其他端口的关系']:
    add_body(ch, indent=False)
add_page_break()

# ════ 一、端口概述 ════
add_h1('一、端口概述与定位')
add_h2('1.1 AI端是什么')
add_body('AI端是数治理方七端生态中的"智能神经系统"。它没有独立用户界面——所有能力通过平台API层嵌入业主端、物业端、业委会端、社区端、客服端，在背后做分类、分派、计算、预测、生成，让每只手知道该往哪里伸、什么时候伸、伸多长。')
add_body('AI端不是某个端口内嵌的AI功能模块。它是一个独立的技术层，拥有27项核心能力，覆盖全部端口。技术路线：V1-V3阶段使用纯规则引擎（确定性高、可解释性强），V4阶段引入机器学习模型，但规则引擎始终作为兜底——ML挂了规则引擎顶上，不会全线崩溃。')

add_h2('1.2 AI端 vs 客服端AI外呼')
add_body('客服端提到的"AI外呼"是运营工具——批量拨号、识别错号空号、基础意图识别。AI端是平台基础设施——分类引擎、信用计算、合同解析、会议审核、故障预测。前者是"AI帮人干活"，后者是"AI替人思考和计算"。')

add_h2('1.3 生态位置')
add_body('AI端在生态中处于"底层"。它不是业务角色——不发起工单、不处理工单、不审批、不决策。它在每个端口背后运行，做三件事：①计算（分类/信用/评分），②预测（故障/争议/舆情），③生成（报告/纪要/函件）。')

add_table(
    ['维度', '说明'],
    [['接入方式', '无独立界面·平台API层注入各端'],
     ['数据权限', '全端可读·可计算·可写回（分类/评分/预警/生成内容）'],
     ['不可做的事', '替代人做终局决策·修改原始业务数据·批量转嫁审核至其他端口'],
     ['兜底机制', '规则引擎始终运行·ML故障时自动降级·关键路径不依赖ML']],
    col_widths=[3, 12.5]
)
add_page_break()

# ════ 二、设计原则 ════
add_h1('二、设计原则')
add_table(
    ['原则', '说明', '为什么重要'],
    [['规则引擎始终兜底', 'V1-V3纯规则引擎，V4引入ML。ML故障时规则引擎自动顶上', '不能因为一个模型挂了导致工单分派停摆'],
     ['不做终局决策', '分类→推荐（带置信度）→物业确认。合同解析→展示标准→业委会确认', 'AI是参谋不是将军——责任始终在人'],
     ['可解释性', '每项输出附带置信度和依据。信用加减分附带"因为什么事件"', '黑箱AI在治理领域不可接受——业委会需要解释给业主听'],
     ['不转嫁', '数据量大时保持"待处理"状态。不得批量转至其他端口让人工兜底', 'AI不能把自己的工作量甩给人'],
     ['分房屋独立', 'A小区欠费不影响B小区信用分。楼栋画像不跨小区混合', '不同小区是不同的治理生态']],
    col_widths=[3, 7, 5.5]
)
add_page_break()

# ════ 三、服务业主端的AI能力 ════
add_h1('三、服务业主端的AI能力')
add_table(
    ['能力', '功能描述'],
    [['表单预填', '语音/文字/图片→识别类型+子类+紧急度+位置→业主确认/修改后提交'],
     ['NLP工单预处理', '语音/文字→实体提取（类型+子类+位置）→意图分类（报修/投诉/咨询）→情感分析（正面/中性/负面/愤怒/焦虑）→紧急度判断→生成结构化草稿'],
     ['智能客服', '多轮对话·自然语言理解·上下文保持。业主说"我家水管漏了"→追问"哪个房间？漏水量大吗？"→确认生成工单。异常关键词触发（"经理""投诉"）→自动转人工。覆盖：报修引导·缴费咨询·政策问答·进度查询'],
     ['多语言翻译', '非中文报修自动翻译→正常生成工单'],
     ['推荐引擎', '服务推荐（基于业主画像）+积分兑换推荐（基于历史）+缴费提醒时间推荐（基于响应数据）']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 四、服务物业端的AI能力 ════
add_h1('四、服务物业端的AI能力')
add_table(
    ['能力', '功能描述'],
    [['智能分派', '按类型+内容+责任主体自动分派至物业/业委会/社区。分派即计时——从AI分派时刻开始计算履约时长。5分钟免罚改派窗口（同工单最多2次）'],
     ['设备故障预测', '电梯/水泵/消防→预测未来30/60/90天故障概率+推荐维保时间+备件需求预测。维保完整度缺失>30%降低置信度'],
     ['报告自动生成', '收缴率/工单效率/欠费结构→填充模板→原因分析+下月建议→预览→导出PDF'],
     ['分类反馈学习', '物业每次确认/驳回分类标签→记录→训练XGBoost修正模型→月度准确率报告→自动调参。准确率>规则引擎则采纳ML建议'],
     ['预测性维护', 'IoT实时数据（电梯开门次数/水泵电流/烟感值）+历史维保+环境因素→时序预测模型→推荐维保时间']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 五、服务业委会端的AI能力 ════
add_h1('五、服务业委会端的AI能力')
add_table(
    ['能力', '功能描述'],
    [['合同条款对比', '新旧物业服务合同自动对比→差异高亮标注'],
     ['会议审核', '业主端提交会议申请→AI自动评分（基本信息完整性+时间合理性+时长合理性+内容合规性+发起人历史记录，总分100）。≥70分自动通过，<70分自动拒绝'],
     ['自然语言生成', '自动生成：裁决书初稿（基于争议历史+证据+法规）·会议纪要（所有类型）·业主通知（公告/提醒/政策解读）·报表叙述（"本月收缴率下降3%，主要原因是X栋群体欠费"）']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 六、服务社区端的AI能力 ════
add_h1('六、服务社区端的AI能力')
add_table(
    ['能力', '功能描述'],
    [['舆情AI升级', '深度情感分析（五分类+强度0-100）+主题聚类（LDA/BERTopic自动发现热点主题）+趋势预测（未来3天走势）+情感断崖检测（24h内负面强度>60且增幅>30%→自动预警）+舆情报告自动化'],
     ['异常检测', '八类异常：费用异常（突增/突降）·工单模式异常（某楼栋突增）·满意度突变（某人员评分骤降）·投票异常（短时间大量/IP集中）·API调用异常（频率突增）·服务商行为异常（报价异常/好评潮）·外呼行为异常（频繁跳过节点）·数据一致性异常（台账与支付记录不符）']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 七、服务运营/客服端的AI能力 ════
add_h1('七、服务运营/客服端的AI能力')
add_table(
    ['能力', '功能描述'],
    [['沟通时机调度', '基于历史接电话时间+发薪日+情绪状态+楼栋动态→推荐最佳拨打时间。含失败记忆——上次什么时间打没人接，下次避开'],
     ['话术实时推荐', '通话中实时检测情绪/关键词→弹窗提示（争议型/困难型/对抗型/情绪上升）。每月生成采纳率报告，采纳率>60%→自动调整推荐权重'],
     ['敏感场景检测', '检测"去世""不在了"等关键词→弹窗"哀悼+暂缓外呼"提示'],
     ['沟通话术动态推荐', '根据业主画像（性格/沟通偏好/关键事件）+楼栋画像+当前沟通节点+历史沟通→动态生成话术骨架（开场白+核心论点+收尾）+沟通策略建议+风险提示'],
     ['楼栋画像与策略自适应', '根据年龄结构/户型/缴费习惯→自动调整沟通策略。季度阈值自动校准']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 八、跨端基础设施 ════
add_h1('八、跨端基础设施')
add_body('以下能力不是服务于单一端口，而是作为平台基础设施，被全部端口调用：')
add_table(
    ['能力', '功能描述'],
    [['分类引擎', '关键词扫描→数字计算→决策树→输出F/E/A/B/D/C六型标签+置信度+依据。标签2.0多维向量——现实世界不是六种人能概括的'],
     ['信用计算', '业主四维（缴费40%+配合30%+参与15%+修复15%·初始350分）。物业四维（履约40%+响应30%+透明20%+争议10%）。每日02:00全量重算。可解释展示——每项加减分附带原因事件ID'],
     ['证据自动归集', '争议触发→检索近3月工单/巡检/投诉/协商→自动生成核验报告初稿'],
     ['数据交叉验证', '工单描述 vs 硬件记录（GPS/记录仪/时间戳）→不一致自动标注'],
     ['偏见检测', '按楼栋/年龄/户型分组统计分类准确率→识别潜在偏见→季度可信度报告'],
     ['知识图谱', '四张图谱：法规图谱（法规→条款→场景→判例）·社区关系图谱（业主→房屋→楼栋→业委会→服务商→事件）·设备图谱（设备→维保→故障→备件→服务商）·沟通图谱（画像→沟通→策略→结果）。支持多跳推理'],
     ['推荐引擎（统一）', '服务推荐·模板推荐·服务商推荐·积分兑换推荐·缴费提醒时间推荐'],
     ['自动调优', '沟通策略自动优化·分派算法自动优化·信用模型自动校准·预警阈值自动调整·模型性能监控（准确率衰减检测+自动触发再训练）']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 九、故障降级 ════
add_h1('九、故障降级')
add_body('AI端设计时假定它一定会出故障。每项关键能力都有明确的降级方案：')
add_table(
    ['能力', '降级方案'],
    [['工单分派', 'AI不可用→工单保持pending状态·物业手动认领'],
     ['会议审核', 'AI不可用→会议申请进入待审核队列·AI恢复后补审'],
     ['智能客服', 'AI不可用→降为菜单导航+留言表单'],
     ['报修识别', 'AI不可用→业主手动填写类型和描述·文字/图片提交'],
     ['信用计算', '计算中断→保留最近一次计算结果·恢复后补算'],
     ['分类引擎', '规则引擎出现未覆盖场景→标记"待人工分类"·推送物业端人工标注']],
    col_widths=[3.5, 12]
)
add_page_break()

# ════ 十、生态关系 ════
add_h1('十、与生态其他端口的关系')
add_h2('10.1 能力注入矩阵')
add_table(
    ['端口', 'AI端在该端口发挥的作用'],
    [['业主端', '表单预填·NLP工单处理·智能客服·多语言翻译·推荐引擎'],
     ['物业端', '智能分派·设备故障预测·报告生成·分类反馈学习·预测性维护'],
     ['业委会端', '合同条款对比·会议审核·自然语言生成·法规匹配·决策路径引导'],
     ['社区端', '舆情分析·异常检测·政策解读·态势报告生成'],
     ['客服端', '沟通时机调度·话术推荐·敏感场景检测·楼栋画像·意图识别']],
    col_widths=[3, 12.5]
)

add_h2('10.2 数据流向')
add_body('AI端无独立界面，所有输入来自各端API调用，所有输出通过平台API层注入对应端口：')
add_table(
    ['端口', 'AI端接收（输入端）', 'AI端输出（发送端）'],
    [['业主端', '报修内容(语音/文字/图片)·身份认证材料·会议申请', '工单预填结果·智能客服回复·多语言翻译·推荐结果'],
     ['物业端', '工单处理记录·设备传感器数据·业主沟通记录', '工单分派结果·分类标签(含置信度)·故障预测·AI月报'],
     ['业委会端', '合同文件·会议申请·分类修正·人工决策结果', '合同解析结果·会议审核评分·法规匹配·预警推送·裁决书初稿'],
     ['社区端', '研判反馈·人工修正结果', '分类结果·合规扫描·舆情分析·预警推送·态势报告'],
     ['客服端', '通话记录·人工标注', '预判分级·话术推荐·意图识别·敏感场景检测·拨打时机建议'],
     ['近场供应链端', '数据交叉验证需求', '供应商信用评分·六层漏斗筛选结果·信用事件告警']],
    col_widths=[2.5, 6, 6.5]
)

add_h2('10.3 AI端在闭环中的位置')
add_body('AI端不直接参与任何业务闭环——但每个闭环的运转都依赖AI端的计算能力：')
add_body('工单闭环：AI分派是起点——工单交给物业/业委会/社区，由AI决定。分派即计时。')
add_body('议事闭环：AI审核会议申请——哪些能开、哪些不能开，由AI初筛。AI在会中进行三次阶段性小结。')
add_body('采购闭环：六层数据漏斗（含行政合规层）由AI驱动——几百家供应商由AI筛到候选池。')
add_body('信用闭环：每日02:00全量重算——业主四维、物业四维、供应商外部+内部——全部由AI计算。')

# 结尾
doc.add_paragraph(); doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('—— 文档结束 ——')
r.font.size = Pt(11); r.font.color.rgb = RGBColor(148,163,184)
r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)

os.makedirs(os.path.dirname(OUTPUT) if os.path.dirname(OUTPUT) else '.', exist_ok=True)
doc.save(OUTPUT)
print(f'Done: {OUTPUT}')
