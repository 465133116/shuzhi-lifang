#!/usr/bin/env python3
"""生成《数治理方 · 六端完整样貌》正式文档 (.docx)"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

doc = Document()

# ── 页面设置 ──
for sec in doc.sections:
    sec.top_margin = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin = Cm(2.5)
    sec.right_margin = Cm(2.5)

# ── 样式 ──
style = doc.styles['Normal']
style.font.name = '宋体'
style.font.size = Pt(11)
style.paragraph_format.line_spacing = 1.5
style.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
rPr = style.element.get_or_add_rPr()
rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="宋体"/>')
rPr.append(rFonts)

# ── 颜色常量 ──
BLUE_DARK = RGBColor(0x1F, 0x38, 0x64)
BLUE_ACCENT = RGBColor(0x25, 0x63, 0xEB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x33, 0x33, 0x33)
GRAY_TEXT = RGBColor(0x64, 0x74, 0x8B)
GRAY_DARK = RGBColor(0x55, 0x55, 0x55)
GREEN = RGBColor(0x10, 0xB9, 0x81)

# ── 辅助函数 ──

def set_run_font(run, name_cn, size, bold=False, color=None):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.name = name_cn
    rPr = run._element.get_or_add_rPr()
    rFonts_elem = parse_xml(f'<w:rFonts {nsdecls("w")} w:eastAsia="{name_cn}"/>')
    rPr.append(rFonts_elem)
    if color:
        run.font.color.rgb = color

def add_title(text, level=0):
    if level == 0:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        set_run_font(run, '黑体', 22, bold=True, color=BLUE_DARK)
        p.paragraph_format.space_after = Pt(4)
    elif level == 1:
        p = doc.add_paragraph()
        run = p.add_run(text)
        set_run_font(run, '黑体', 16, bold=True, color=BLUE_DARK)
        p.paragraph_format.space_before = Pt(24)
        p.paragraph_format.space_after = Pt(8)
    elif level == 2:
        p = doc.add_paragraph()
        run = p.add_run(text)
        set_run_font(run, '黑体', 13, bold=True, color=BLUE_ACCENT)
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
    elif level == 3:
        p = doc.add_paragraph()
        run = p.add_run(text)
        set_run_font(run, '黑体', 11, bold=True, color=BLACK)
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
    return p

def add_body(text, indent=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_run_font(run, '宋体', 11)
    if indent:
        p.paragraph_format.first_line_indent = Cm(0.7)
    p.paragraph_format.space_after = Pt(4)
    return p

def add_bullet(text, level=0):
    p = doc.add_paragraph()
    prefix = '\u2022 ' if level == 0 else '  \u25e6 '
    run = p.add_run(prefix + text)
    set_run_font(run, '宋体', 10.5)
    p.paragraph_format.left_indent = Cm(0.8 + level * 0.6)
    p.paragraph_format.space_after = Pt(2)
    return p

def add_desc_block(title, desc):
    p = doc.add_paragraph()
    run = p.add_run('\u25a0 ' + title + '\uff1a')
    set_run_font(run, '宋体', 10, bold=True, color=GRAY_TEXT)
    run2 = p.add_run(desc)
    set_run_font(run2, '宋体', 10, color=GRAY_DARK)
    p.paragraph_format.left_indent = Cm(0.8)
    p.paragraph_format.space_after = Pt(3)
    return p

def add_label_line(label, text, label_color=None):
    p = doc.add_paragraph()
    run = p.add_run(label + '  ')
    set_run_font(run, '宋体', 11, bold=True, color=label_color or BLUE_DARK)
    run2 = p.add_run(text)
    set_run_font(run2, '宋体', 11)
    p.paragraph_format.space_after = Pt(2)

def set_cell_bg(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def add_table(headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        run = p.add_run(h)
        set_run_font(run, '黑体', 10, bold=True, color=WHITE)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_bg(cell, '1F3864')
    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = ''
            p = cell.paragraphs[0]
            run = p.add_run(str(val))
            set_run_font(run, '宋体', 9.5)
            if r_idx % 2 == 1:
                set_cell_bg(cell, 'F0F4F8')
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return table

def add_scene(num, title, desc):
    p = doc.add_paragraph()
    run = p.add_run(f'场景 {num}  ')
    set_run_font(run, '宋体', 9, color=GRAY_TEXT)
    run2 = p.add_run(title)
    set_run_font(run2, '宋体', 11, bold=True)
    p.paragraph_format.space_after = Pt(2)
    add_body(desc, indent=True)

def add_usp(icon, title, desc):
    p = doc.add_paragraph()
    run = p.add_run(f'{icon}  {title}')
    set_run_font(run, '黑体', 12, bold=True, color=BLUE_DARK)
    p.paragraph_format.space_after = Pt(2)
    add_body(desc, indent=True)

def add_mode(label, title, desc, active=True):
    status = '\u25cf 当前阶段' if active else '\u25cb 规划中'
    color = GREEN if active else GRAY_TEXT
    p = doc.add_paragraph()
    run = p.add_run(f'{status}  ')
    set_run_font(run, '宋体', 9, bold=True, color=color)
    run2 = p.add_run(title)
    set_run_font(run2, '黑体', 12, bold=True, color=BLUE_DARK)
    p.paragraph_format.space_after = Pt(2)
    add_body(desc, indent=True)

# ═══════════════════════════════════════════════
# 封面
# ═══════════════════════════════════════════════
for _ in range(4):
    doc.add_paragraph()

add_title('数治理方 \u00b7 六端完整样貌', level=0)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('社区制度型信用治理系统平台')
set_run_font(run, '宋体', 14, color=GRAY_TEXT)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('用制度代替人情 \u00b7 用数据代替解释 \u00b7 用信用代替催收')
set_run_font(run, '宋体', 11, color=GRAY_TEXT)

for _ in range(3):
    doc.add_paragraph()

for line in [
    '主体单位：杭州个信数治信用管理有限公司',
    '运营服务：宁波个信商务信息咨询有限公司',
    '平台域名：mingjian.sh.cn',
    '当前阶段：P1 物业入口模式',
    '文档版本：V1.0 \u00b7 2026年7月',
]:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(line)
    set_run_font(run, '宋体', 10, color=GRAY_TEXT)

doc.add_page_break()

# ═══════════════════════════════════════════════
# 一、产品定义
# ═══════════════════════════════════════════════
add_title('一、产品定义', level=1)

add_body(
    '数治理方不是一套物业管理系统，而是一套社区制度型信用治理系统平台。'
    '它不替代物业公司已有的ERP、道闸、门禁——它在这些系统之上，'
    '建立一层制度规则层：让每一次服务都有证据、每一次履约都有记录、每一次违约都有后果。',
    indent=True)

add_body(
    '核心比喻：给社区装一套「制度交通规则」——不是摄像头抓违章，'
    '而是让每个人知道规则、遵守规则、违约有记录。'
    '物业是「路面」，数治理方是「交规+驾照分」。',
    indent=True)

add_body(
    '理论底盘：收费秩序 = 正当性 \u00d7 履约可信度 \u00d7 价值感知度 '
    '\u00d7 守约共识度 \u00d7 分类精准度。五个因子任何一个趋近于零，整体崩塌。'
    '传统物业只抓最后一个（且方法错了），数治理方五个因子同时做功。',
    indent=True)

# ═══════════════════════════════════════════════
# 二、平台形态
# ═══════════════════════════════════════════════
add_title('二、平台形态（三种部署模式）', level=1)

add_mode('P1 物业入口模式',
    'P1 物业入口模式',
    '纯物业通道，工单优先切入。物业公司授权后，数治理方客服以物业名义接触业主，'
    '建工单、做回访、记标签。15个P1字段驱动，不依赖小程序行为数据。',
    active=True)

add_mode('双轨过渡模式',
    '双轨过渡模式',
    '小程序上线后，\U0001f4f1行为轨道 + \U0001f3a7客服轨道并行，'
    '双轨独立计算后OR合并。适用于退管物业交接期，旧数据不丢、新数据续上。',
    active=False)

add_mode('全模式（在管）',
    '全模式（在管）',
    '六端全开，AI六类自动分类+信号强度+交叉模式+响应级别R0~R4+数字秘书SaaS。'
    '五因子同时做功，覆盖业主大会\u2192物业\u2192业委会\u2192社区全链路。',
    active=False)

# ═══════════════════════════════════════════════
# 三、六端入口
# ═══════════════════════════════════════════════
add_title('三、六端入口（系统形态）', level=1)

add_body(
    '数治理方没有物理硬件盒子——它的「形态」是六个独立端口，每个端口对应一类使用者，'
    '各有独立界面、独立权限、独立数据视图。六端通过 ecosystem-bridge.js 跨端通信，'
    '共享 sgzf_ 前缀数据。',
    indent=True)

# --- 1. 业主端 ---
add_title('1. 业主端', level=2)
add_label_line('使用者', '小区业主', BLUE_DARK)
add_label_line('形态', '微信小程序 / 手机H5')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    '手机竖屏，底部四Tab栏：首页（工单卡片+快捷入口）\u00b7 '
    '服务（报修/投诉/建议）\u00b7 消息（工单进度+平台通知）\u00b7 '
    '我的（房屋绑定+服务记录+评价）。顶部小区名+天气，中间滚动卡片流，'
    '底部固定Tab栏56px，适配iPhone安全区。')
add_desc_block('核心交互',
    '一键报修（拍照+语音+定位）、工单进度跟踪（时间轴式）、'
    '验收确认+星级评分、平台短信通知接收。P1阶段通过物业授权的公众号/小程序入口触达。')

add_title('核心能力', level=3)
for item in [
    '一键报修：拍照+语音+选择故障类型，30秒提交',
    '工单全程可视：接单\u2192处理\u2192验收 三阶段时间轴',
    '服务记录存档：历史工单可回溯，形成服务证据链',
    '验收+评价：业主验收确认\u2192星级评分\u2192差评回访触发',
    '平台通知：工单状态变更、处理结果提交，短信+站内信双通道',
    '（P2+）小程序行为轨道：登录频率、浏览深度、工单打开率\u2192自动标签',
]:
    add_bullet(item)

# --- 2. 物业端 ---
add_title('2. 物业端', level=2)
add_label_line('使用者', '物业公司经理/客服/工程人员', BLUE_DARK)
add_label_line('形态', 'PC后台管理')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    '宽屏PC后台，左侧深蓝渐变导航栏（240px），右侧白色操作区。'
    '模块：工作台（概览数据+待办）\u00b7 '
    '工单管理（待处理/处理中/待验收/已完成 四队列+接单/分派/处理/提交验收）\u00b7 '
    '业主管理（业主列表+标签+沟通记录）\u00b7 '
    '数据看板（工单闭环率/响应时效/评价分布）。顶部固定56px头栏显示小区名称+在线状态。')
add_desc_block('退管专用版',
    '独立界面，用于物业更替场景——新物业导入历史欠费数据，旧工单存档只读，退管交接进度跟踪。')

add_title('核心能力', level=3)
for item in [
    '工单全生命周期：接单\u2192分派工程人员\u2192处理\u2192提交验收\u2192闭环',
    '业主标签查看：数治理方客服标记的标签+沟通记录，辅助物业研判',
    '退管数据承接：前物业欠费数据一键导入，历史工单存档',
    '数据看板：闭环率、平均响应时间、评价分布、超时工单预警',
    '信用分查看：业主履约/违约记录\u2192信用分\u2192物业自定响应策略',
    '人员管理：工程人员排班+技能标签+接单量统计',
]:
    add_bullet(item)

# --- 3. 客服端 ---
add_title('3. 客服端', level=2)
add_label_line('使用者', '数治理方客服（宁波个信运营人员）', BLUE_DARK)
add_label_line('形态', 'PC工作台')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    '深色顶栏（#1e293b），下方白色操作区。核心布局：左侧任务队列'
    '（待回访\u2192超时工单\u2192待处理\u2192业主列表，按优先级排列）\u2192 '
    '选中业主后右侧一屏工作区展开：分类网格+双轨详情+通话引导+操作按钮+快捷建单+关联记录。'
    '不做弹窗、不滚动分页，所有操作在一屏完成。')
add_desc_block('来电弹屏',
    '点击业主号码\u2192来电通知弹窗\u2192接听/挂断\u2192'
    '自动选中该业主+加载分类信息+通话引导提示。'
    '弹窗仅用于「来电通知」瞬态事件，核心操作不弹窗。')

add_title('核心能力', level=3)
for item in [
    '任务队列驱动：待回访/超时/待处理三级优先级，自动排序',
    '业主分类研判：P1用sc标签（守约/困难/观望/历史/—），P2+用六类自动分类',
    '一键通话标注：接通/拒接/空号/需回访，点即标注+记日志',
    '内联快捷建单：下拉选类型+输入标题+回车，一键创建草稿',
    '草稿\u2192业主确认\u2192正式工单：客服不替业主做决定，只记录+推送确认',
    '通话引导：基于业主分类展示差异化话术提示（不说催收话术）',
    '短信发送：浮层选模板\u2192即发即记，不离开当前工作页',
    '多小区切换：3个Demo小区（阳光花园/翠苑新村/锦绣家园），数据隔离',
]:
    add_bullet(item)

# --- 4. 业委会端 ---
add_title('4. 业委会端', level=2)
add_label_line('使用者', '业委会委员/主任/秘书', BLUE_DARK)
add_label_line('形态', 'PC后台管理')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    '白色PC后台，左侧紫色主题导航栏（260px），右侧操作区。'
    '模块：监管看板（物业工单闭环率+响应时效+业主满意度趋势，Chart.js图表）\u00b7 '
    '业主档案（分类分布+履约记录+欠费明细，不可编辑仅查看）\u00b7 '
    '会议管理（业主大会/业委会会议纪要+决议追踪+投票记录）\u00b7 '
    '数据上传（历史欠费报表导入+业主名册同步+合同备案）\u00b7 '
    '秘书工作台（P2+）。')

add_title('核心能力', level=3)
for item in [
    '物业监管：工单响应时效+闭环率+差评率，实时可查，超时自动标红',
    '业主履约档案：缴费记录+违约次数+工单评价，分类分布看板',
    '数据上传导入：欠费明细表+业主名册+物业合同，一键导入平台',
    '会议数字化：业委会会议纪要归档+决议追踪+业主大会投票记录',
    '秘书管理：P2+配备数字秘书，接待/工单/催缴/短信 4+1模块',
    '合规基准：基于沪房物业\u3014 2026\u3015 36号文，每月接待日+联席会议记录',
]:
    add_bullet(item)

# --- 5. 社区端 ---
add_title('5. 社区端', level=2)
add_label_line('使用者', '街道/社区网格员/居委会', BLUE_DARK)
add_label_line('形态', 'PC工作台（Vue 3 + Tailwind + ECharts）')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    'Vue 3单页应用，Tailwind浅色主题。核心模块：'
    '社区总览大屏（辖区小区地图+工单热力图+分类分布饼图+欠费率趋势，ECharts可视化）\u00b7 '
    '物业监管（各小区物业工单闭环率排名+超时工单预警列表）\u00b7 '
    '事务协同（联席会议记录+待办事项+政策文件库）\u00b7 '
    '社区工作台（多小区一键切换，网格员管辖范围数据聚合）。')

add_title('核心能力', level=3)
for item in [
    '多小区聚合监管：一个界面看辖区所有小区物业表现排名',
    '工单预警：超时工单自动推送至社区端，触发网格员介入',
    '联席会议协同：居村两委+业委会+物业月度联席会议记录数字化',
    '政策文件库：36号文+地方物业管理条例+街道通知，全文检索',
    '物业治理委员会补位：在管物业缺失时，社区端启动补位救济流程',
    '（P2+）五因子社区级看板：收费正当性/履约可信度/价值感知度 分小区对比',
]:
    add_bullet(item)

# --- 6. AI端 ---
add_title('6. AI端', level=2)
add_label_line('使用者', '平台运营管理员', BLUE_DARK)
add_label_line('形态', 'PC后台 + 外呼面板')

add_title('界面样貌', level=3)
add_desc_block('整体布局',
    '紫色主题PC后台。核心模块：分类引擎监控'
    '（六类业主实时分布+信号强度分布+分类变更日志+双轨溯源面板）\u00b7 '
    '外呼面板（外呼队列+通话记录+接通率+挂机短信触发+差评回访触发）\u00b7 '
    '规则引擎配置（标签规则阈值调节+响应级别R0~R4映射+衰减周期设置）\u00b7 '
    '模型训练（通话文本标注\u2192分类模型迭代\u2192准确率追踪）。')

add_title('核心能力', level=3)
for item in [
    '六类自动分类：基于双轨数据（\U0001f4f1行为+\U0001f3a7通话），AI自动判定F/E/A/B/D/C',
    '信号强度计算：0~4级，标签叠加+衰减+交叉修正',
    '外呼队列管理：待外呼业主优先级排序\u2192自动拨号\u2192通话结果回写客服端',
    '响应级别R0~R4映射：分类+信号\u2192自动匹配响应策略（R0静默观察~R4制度启动）',
    '交叉模式检测：同一业主双轨数据出现矛盾信号\u2192标记交叉模式\u2192人工研判',
    '分类变更追踪：业主从C\u2192D、A\u2192E等迁移路径可视化',
    '（P1暂不启用）P1阶段AI端仅做规则配置+数据查看，不运行自动分类引擎',
]:
    add_bullet(item)

# ═══════════════════════════════════════════════
# 四、核心功能场景清单
# ═══════════════════════════════════════════════
doc.add_page_break()
add_title('四、核心功能场景清单', level=1)

add_title('模块1：工单闭环（6场景）', level=2)
for num, title, desc in [
    ('1.1', '业主报修', '业主小程序拍照+语音+选择故障类型\u2192提交\u2192自动生成工单\u2192推送到物业端'),
    ('1.2', '客服代建草稿', '客服通话中记录业主诉求\u2192建草稿\u2192推送业主确认\u2192业主确认后转正式工单'),
    ('1.3', '物业接单分派', '物业经理查看工单\u2192分派给对应工程人员\u2192设置预计处理时间\u2192业主收到通知'),
    ('1.4', '处理结果提交', '工程人员处理完成\u2192提交处理结果+现场照片\u2192推送业主验收\u2192短信通知业主'),
    ('1.5', '业主验收评价', '业主查看处理结果\u2192确认验收（或拒绝）\u2192星级评分\u2192差评触发客服回访'),
    ('1.6', '超时工单预警', '工单超过承诺处理时间\u2192自动标红\u2192推送物业+业委会+社区\u2192超时记录计入信用'),
]:
    add_scene(num, title, desc)

add_title('模块2：业主分类（6场景 \u00b7 P2+）', level=2)
for num, title, desc in [
    ('2.1', 'F\u00b7历史复杂型识别', '标签含诉讼/信访/媒体/公安关键词\u2192独立判定通道\u2192R4最高响应'),
    ('2.2', 'E\u00b7对抗失信型识别', '拒接\u22653次 或 攻击性语言 或 差评无理由\u2192合并对抗信号\u2192R3响应'),
    ('2.3', 'A\u00b7合理争议型识别', '有未闭环工单+业主明确提出服务问题\u2192暂停催缴\u2192优先解决争议'),
    ('2.4', 'B\u00b7现实困难型识别', '业主表达经济困难（大病/失业/低保）\u2192标记困难\u2192差异化方案'),
    ('2.5', 'D\u00b7惯性失约型识别', '无争议但承诺\u22652次未兑现\u2192失约计数递增\u21927天衰减/28天归零/登录消除'),
    ('2.6', 'C\u00b7观望拖延型细分', '无明确信号\u2192按通话结果分C1~C6子类型（已接通无争议/已接通有争议/未接通\u2026）'),
]:
    add_scene(num, title, desc)

add_title('模块3：数字秘书（P1 MVP 4+1模块）', level=2)
for num, title, desc in [
    ('3.1', '业主接待', '接待日业主来访\u2192秘书查询业主档案+工单记录\u2192记录诉求\u2192转工单或归档'),
    ('3.2', '工单协同', '秘书追踪业委会关注的工单\u2192超时提醒物业\u2192闭环确认\u2192汇报业委会'),
    ('3.3', '催缴辅助', '秘书查看欠费业主分类\u2192按优先级排序\u2192辅助业委会制定沟通策略'),
    ('3.4', '短信发送', '秘书选择模板\u2192填入变量\u2192发送\u2192记录发送日志（11条P1模板，4类场景）'),
    ('3.5', '合规审核', '秘书审核物业提交的工单闭环材料\u2192确认符合36号文规范\u2192归档备查'),
]:
    add_scene(num, title, desc)

add_title('模块4：双轨数据架构（核心基础设施）', level=2)
for num, title, desc in [
    ('4.1', '\U0001f4f1 小程序行为轨道', '记录登录频率+工单打开率+浏览深度+缴费行为\u2192结构化行为数据\u2192自动标签'),
    ('4.2', '\U0001f3a7 客服通话轨道', '记录通话结果+通话备注+情绪标注\u2192非结构化对话数据\u2192人工标签'),
    ('4.3', '双轨OR合并', '两轨独立计算分类\u2192OR合并取更高级别\u2192保留各自快照\u2192交叉模式检测'),
]:
    add_scene(num, title, desc)

# ═══════════════════════════════════════════════
# 五、六端角色与数据权限
# ═══════════════════════════════════════════════
doc.add_page_break()
add_title('五、六端角色与数据权限', level=1)

add_table(
    ['端口', '使用者', '看到的数据', '能做的事', '不能做的事'],
    [
        ['\U0001f4f1 业主端', '小区业主', '自己的工单+自己的服务记录+自己的评价', '报修、验收、评价、查记录', '看其他业主信息、看物业后台'],
        ['\U0001f3e2 物业端', '物业公司', '本小区业主标签+工单全量+信用分+欠费数据', '接单、分派、处理、提交验收、导入数据', '看其他小区、改分类规则、删工单记录'],
        ['\U0001f3a7 客服端', '数治理方客服', '多小区业主标签+双轨数据+外呼队列+工单', '通话标注、建草稿、发短信、分类研判', '替业主做决定、替物业做承诺'],
        ['\U0001f3db 业委会端', '业委会', '物业工单闭环率+响应时效+业主满意度+欠费统计（脱敏）', '监管物业、导入数据、查看档案、会议记录', '编辑业主标签、直接分派工单'],
        ['\U0001f3d8 社区端', '街道/网格员', '多小区物业表现排名+工单热力图+欠费率趋势（聚合级）', '监管多小区、预警介入、联席会议记录', '查看单个业主详情、编辑数据'],
        ['\U0001f9e0 AI端', '平台管理员', '全量分类数据+信号强度+双轨溯源+模型训练数据', '配置规则、训练模型、运营外呼、调阈值', '——（全权限，仅限平台管理员）'],
    ],
    col_widths=[2.2, 2.2, 4.0, 3.8, 3.8])

# ═══════════════════════════════════════════════
# 六、独有核心能力
# ═══════════════════════════════════════════════
add_title('六、独有核心能力', level=1)

add_usp('\U0001f4d0', '五因子乘法模型',
    '收费秩序 = 正当性 \u00d7 履约可信度 \u00d7 价值感知度 \u00d7 '
    '守约共识度 \u00d7 分类精准度。传统物业只做「分类」一个因子（且用错方法），'
    '数治理方五个因子同时做功——任一因子趋零，整体崩塌。')

add_usp('\U0001f500', '双轨数据架构',
    '\U0001f4f1小程序行为轨道 + \U0001f3a7客服通话轨道独立计算，'
    'OR合并后走统一判定流水线。每条信号标注数据来源，双轨交叉验证防数据污染。')

add_usp('\U0001f3f7', '六类精准分类',
    'F\u00b7历史复杂型 / E\u00b7对抗失信型 / A\u00b7合理争议型 / '
    'B\u00b7现实困难型 / D\u00b7惯性失约型 / C\u00b7观望拖延型。'
    '基于实际交互数据判定，不是静态画像。')

add_usp('\u2696', '制度型信用治理（不是催收）',
    '禁滞纳金威胁、禁门禁恐吓、禁信用施压。客服只做三件事：'
    '引导看服务记录、记录诉求、确认工单闭环。'
    '把焦点从「欠多少钱」转移到「遇到什么问题」。')

add_usp('\U0001f469\u200d\U0001f4bc', '数字秘书 SaaS 多小区',
    '秘书不必是业主（法律依据：36号文第4条vs第6条立法区分 + '
    '沪住建建议复\u3014 2018\u3015 23号）。'
    '一个秘书可服务多个小区，SaaS模式低成本覆盖。')

add_usp('\U0001f50c', '开放端口架构',
    '六端通过 ecosystem-bridge.js 跨端通信，业委会/社区/街道可独立接入。'
    '不是封闭系统，是社区治理的基础设施层。')

# ═══════════════════════════════════════════════
# 七、完整工作闭环
# ═══════════════════════════════════════════════
add_title('七、完整工作闭环', level=1)

add_body('数据从哪来 \u2192 经过什么 \u2192 变成什么 \u2192 谁用什么 \u2192 回到哪去')

add_table(
    ['步骤', '环节', '说明'],
    [
        ['\u2460', '数据采集', '业主小程序报修 + 客服通话记录 \u2192 双轨数据入口'],
        ['\u2461', '双轨计算', '\U0001f4f1小程序行为轨道独立计算 + \U0001f3a7客服通话轨道独立计算，互不干扰'],
        ['\u2462', 'OR合并', '两轨分类结果OR合并，取更高级别（F>E>A>B>D>C），保留各自快照'],
        ['\u2463', '六类判定', '合并后走统一判定流水线：先F判定（独立通道）\u2192E\u2192A\u2192B\u2192D\u2192C兜底'],
        ['\u2464', '策略匹配', '分类+信号强度\u2192匹配话术模板+工单优先级+响应级别R0~R4'],
        ['\u2465', '工单执行', '物业接单\u2192分派工程人员\u2192处理\u2192提交验收，全链路可追溯'],
        ['\u2466', '闭环回访', '业主验收+评价\u2192客服回访\u2192超时记录\u2192履约/违约写入信用档案'],
    ],
    col_widths=[1.5, 2.5, 12.0])

add_body('每次闭环的数据回到双轨系统，更新业主标签\u2192下次判定更精准——数据越用越聪明。', indent=True)

# ═══════════════════════════════════════════════
# 八、代际演进
# ═══════════════════════════════════════════════
add_title('八、当前进度与代际演进', level=1)

add_table(
    ['版本', '状态', '核心能力', '覆盖端口', '数据驱动'],
    [
        ['原型 V3.12', '\u2705 已交付', '八端口HTML原型 + localStorage全闭环 + ecosystem-bridge', '8端', 'Demo数据（纯前端）'],
        ['P1 当前', '\u25cf 推进中', '物业工单闭环 + 客服通话标注 + P1标签 + 短信通知', '物业端+客服端（核心）', '15个P1字段\n(sc/cs/cr/ct/li/lb+\nst/rt/rc/sr+tp+t/rs)'],
        ['P2 规划', '\u25cb 待启动', '小程序上线 + 双轨数据启动 + 六类自动分类 + 业主端完整功能', '+业主端+业委会端', '双轨实时数据'],
        ['P3 目标', '\u25cb 待启动', 'AI全自动分类 + 信号强度0~4 + 交叉模式 + R0~R4 + 数字秘书SaaS全模块', '六端全开', '五因子实时计算'],
    ],
    col_widths=[2.0, 2.0, 5.5, 3.0, 3.5])

# ── 尾注 ──
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('\u2014 文档完 \u2014')
set_run_font(run, '宋体', 10, color=GRAY_TEXT)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('数治理方 \u00b7 社区制度型信用治理系统平台 \u00b7 杭州个信数治信用管理有限公司 \u00b7 mingjian.sh.cn')
set_run_font(run, '宋体', 9, color=GRAY_TEXT)

# ── 保存 ──
output_path = r'E:\360MoveData\Users\计算机\Desktop\数治理方\数治理方_六端完整样貌.docx'
doc.save(output_path)
print(f'Done: {output_path}')
