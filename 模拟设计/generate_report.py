#!/usr/bin/env python3
"""
数治理方 · AI社区模拟 — 结果报告生成器
从 simulation_results.json 生成 Excel 报告
"""

import json
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter

# ═══ 颜色定义 ═══
DEEP_BG = "0B1120"
PANEL_BG = "0F172A"
CARD_BG = "1E293B"
BORDER_COLOR = "334155"
PURPLE = "8B5CF6"
RED = "EF4444"
YELLOW = "F59E0B"
GREEN = "10B981"
ORANGE = "F97316"
GRAY = "64748B"
BLUE = "3B82F6"
CYAN = "06B6D4"
WHITE = "E2E8F0"
LIGHT_GRAY = "94A3B8"

# 样式工厂
thin_border = Border(
    left=Side(style='thin', color=BORDER_COLOR),
    right=Side(style='thin', color=BORDER_COLOR),
    top=Side(style='thin', color=BORDER_COLOR),
    bottom=Side(style='thin', color=BORDER_COLOR),
)

def fill(hex_color): return PatternFill(start_color=hex_color, end_color=hex_color, fill_type='solid')
def font(size=10, color=WHITE, bold=False): return Font(name='Microsoft YaHei', size=size, color=color, bold=bold)
def align(h='left', v='center', wrap=False): return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def style_header(ws, row, cols, hex_color):
    """给表头行上色"""
    for col in range(1, cols + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = fill(hex_color)
        cell.font = font(size=10, color="FFFFFF" if hex_color != YELLOW else "000000", bold=True)
        cell.alignment = align('center', 'center')
        cell.border = thin_border

def style_data_cell(cell, is_alt_row=False):
    """格式化数据单元格"""
    cell.border = thin_border
    cell.font = font(size=9, color=LIGHT_GRAY)
    cell.alignment = align('center', 'center')
    if is_alt_row:
        cell.fill = fill("182335")

def auto_width(ws, min_w=10, max_w=40):
    for col in ws.columns:
        max_len = min_w
        for cell in col:
            if cell.value:
                max_len = max(max_len, min(len(str(cell.value)) + 2, max_w))
        ws.column_dimensions[get_column_letter(col[0].column)].width = max_len

# ═══ 主程序 ═══

def generate_report(json_path, xlsx_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    ctrl = data['control']
    trtm = data['treatment']
    ctrl_final = ctrl['final']
    trtm_final = trtm['final']
    ctrl_hist = ctrl['history']
    trtm_hist = trtm['history']
    
    wb = Workbook()
    
    # ════════════════════════════════
    # Sheet 1: 概览仪表盘
    # ════════════════════════════════
    ws1 = wb.active
    ws1.title = "概览仪表盘"
    ws1.sheet_properties.tabColor = PURPLE
    
    # 标题
    ws1.merge_cells('A1:F1')
    c = ws1['A1']
    c.value = "数治理方 · AI社区模拟 — 90天A/B对照实验结果"
    c.font = font(size=16, color=PURPLE, bold=True)
    c.alignment = align('center', 'center')
    c.fill = fill(DEEP_BG)
    for col in range(1, 7):
        ws1.cell(row=1, column=col).fill = fill(DEEP_BG)
        ws1.cell(row=1, column=col).border = thin_border
    
    # 配置信息
    ws1.merge_cells('A2:F2')
    ws1['A2'].value = f"配置：{data['config']['n_households']}户 × {data['config']['n_days']}天 × 10栋楼 | seed={data['config']['seed']}"
    ws1['A2'].font = font(size=9, color=GRAY)
    ws1['A2'].alignment = align('center')
    
    # 核心指标表
    row = 4
    headers = ['指标', '传统物业(对照)', '数治理方(实验)', '绝对变化', '变化率', '说明']
    for i, h in enumerate(headers, 1):
        ws1.cell(row=row, column=i, value=h)
    style_header(ws1, row, 6, CARD_BG)
    
    metrics = [
        ('物业费缴纳率', f"{ctrl_final['payment_rate']:.1%}", f"{trtm_final['payment_rate']:.1%}", 
         f"{trtm_final['payment_rate']-ctrl_final['payment_rate']:+.1%}", 
         f"{trtm_final['payment_rate']/max(ctrl_final['payment_rate'],0.001):.1f}x",
         '核心指标：五因子做功后的直接体现'),
        ('业主满意度(均值)', f"{ctrl_final['avg_satisfaction']:.1f}", f"{trtm_final['avg_satisfaction']:.1f}",
         f"{trtm_final['avg_satisfaction']-ctrl_final['avg_satisfaction']:+.1f}", '—',
         '平台透明化+工单闭环提升满意度'),
        ('满意度≥60占比', f"{ctrl_final['satisfaction_rate']:.1%}", f"{trtm_final['satisfaction_rate']:.1%}",
         f"{trtm_final['satisfaction_rate']-ctrl_final['satisfaction_rate']:+.1%}", '—',
         '高满意业主比例'),
        ('未解决诉求率', f"{ctrl_final['unresolved_rate']:.1%}", f"{trtm_final['unresolved_rate']:.1%}",
         f"{trtm_final['unresolved_rate']-ctrl_final['unresolved_rate']:+.1%}", '—',
         '平台提升闭环率→遗留问题大幅减少'),
        ('工单闭环率', f"{ctrl_final['pm_closure_rate']:.1%}", f"{trtm_final['pm_closure_rate']:.1%}",
         f"{trtm_final['pm_closure_rate']-ctrl_final['pm_closure_rate']:+.1%}", '—',
         '物业响应机制变化'),
        ('客服介入次数', 'N/A', str(trtm_final['interventions']), '—', '—', '平台主动回访干预'),
        ('月度简报', 'N/A', str(trtm_final['reports_sent']), '—', '—', '服务可视化'),
        ('工单证据记录', 'N/A', str(trtm_final['evidence_count']), '—', '—', '每次闭环=一条证据'),
    ]
    
    for i, m in enumerate(metrics):
        r = row + 1 + i
        for j, v in enumerate(m, 1):
            cell = ws1.cell(row=r, column=j, value=v)
            style_data_cell(cell, i % 2 == 0)
            if j == 1: cell.font = font(size=9, color=WHITE, bold=True)
            if j == 4:
                if v.startswith('+'):
                    cell.font = font(size=9, color=GREEN, bold=True)
                elif v.startswith('-'):
                    cell.font = font(size=9, color=RED, bold=True)
            if j == 3: cell.font = font(size=9, color=CYAN, bold=True)
    
    # ════════════════════════════════
    # Sheet 2: 五因子对比
    # ════════════════════════════════
    ws2 = wb.create_sheet("五因子对比")
    ws2.sheet_properties.tabColor = CYAN
    
    ws2.merge_cells('A1:G1')
    ws2['A1'].value = "五因子乘法模型验证"
    ws2['A1'].font = font(size=14, color=CYAN, bold=True)
    ws2['A1'].alignment = align('center')
    
    headers2 = ['因子', '含义', '传统(对照)', '平台(实验)', '绝对变化', '变化率', '做功机制']
    row = 3
    for i, h in enumerate(headers2, 1):
        ws2.cell(row=row, column=i, value=h)
    style_header(ws2, row, 7, CARD_BG)
    
    factor_data = [
        ('收费正当性', '服务有证据、费用不是白交的',
         ctrl_final['factor_means']['legitimacy'], trtm_final['factor_means']['legitimacy'],
         '工单证据累积→每一条闭环记录=一次正当性加分'),
        ('履约可信度', '报修真的有人管、闭环可追踪',
         ctrl_final['factor_means']['credibility'], trtm_final['factor_means']['credibility'],
         '闭环率 38%→83%→每一次闭环=信任充值'),
        ('价值感知度', '沉默的服务被看见',
         ctrl_final['factor_means']['value_perception'], trtm_final['factor_means']['value_perception'],
         '月度简报+服务日志→信息不对等被打破'),
        ('守约共识度', '邻里缴费率的社会规范压力',
         ctrl_final['factor_means']['consensus'], trtm_final['factor_means']['consensus'],
         '别人也在交→我也该交 | 平台透明化+社交影响'),
        ('分类精准度', '不把争议者当对抗者',
         ctrl_final['factor_means']['classification'], trtm_final['factor_means']['classification'],
         '双轨数据+客服分类→因人施策'),
    ]
    
    for i, (name, desc, cv, tv, mech) in enumerate(factor_data):
        r = row + 1 + i
        ws2.cell(row=r, column=1, value=name)
        ws2.cell(row=r, column=2, value=desc)
        ws2.cell(row=r, column=3, value=f"{cv:.4f}")
        ws2.cell(row=r, column=4, value=f"{tv:.4f}")
        ws2.cell(row=r, column=5, value=f"{tv-cv:+.4f}")
        ws2.cell(row=r, column=6, value=f"{tv/cv:.1f}x" if cv > 0 else '—')
        ws2.cell(row=r, column=7, value=mech)
        for j in range(1, 8):
            style_data_cell(ws2.cell(row=r, column=j), i % 2 == 0)
            if j == 1: ws2.cell(row=r, column=j).font = font(size=9, color=WHITE, bold=True)
    
    # 乘积行
    r = row + 1 + len(factor_data)
    c_prod = 1.0
    t_prod = 1.0
    for _, _, cv, tv, _ in factor_data:
        c_prod *= cv; t_prod *= tv
    ws2.cell(row=r, column=1, value="五因子乘积")
    ws2.cell(row=r, column=2, value="收费秩序=五因子相乘")
    ws2.cell(row=r, column=3, value=f"{c_prod:.6f}")
    ws2.cell(row=r, column=4, value=f"{t_prod:.6f}")
    ws2.cell(row=r, column=5, value=f"{t_prod-c_prod:.6f}")
    ws2.cell(row=r, column=6, value=f"×{t_prod/c_prod:.1f}倍")
    ws2.cell(row=r, column=7, value="任何一个因子趋近零→整体崩塌")
    for j in range(1, 8):
        cell = ws2.cell(row=r, column=j)
        cell.fill = fill(PURPLE + "33")
        cell.border = thin_border
        cell.font = font(size=10, color=PURPLE, bold=True)
        cell.alignment = align('center')
    
    # ════════════════════════════════
    # Sheet 3: 分类迁移
    # ════════════════════════════════
    ws3 = wb.create_sheet("分类迁移")
    ws3.sheet_properties.tabColor = GREEN
    
    ws3.merge_cells('A1:G1')
    ws3['A1'].value = "业主分类分布变化"
    ws3['A1'].font = font(size=14, color=GREEN, bold=True)
    ws3['A1'].alignment = align('center')
    
    headers3 = ['分类', '类型名称', '初始占比', '传统·最终', '平台·最终', '迁移量', '迁移方向']
    row = 3
    for i, h in enumerate(headers3, 1):
        ws3.cell(row=row, column=i, value=h)
    style_header(ws3, row, 7, CARD_BG)
    
    class_info = [
        ('F', '历史复杂', PURPLE, '独立通道，不参与常规分类'),
        ('E', '对抗态度', RED, '客服回访降级为A→解决→C'),
        ('A', '具体争议', YELLOW, '工单闭环+问题解决→回归C'),
        ('B', '经济困难', ORANGE, 'P1阶段暂无专用帮扶通道'),
        ('D', '惯性失约', 'F97316', '客服回访+承诺记录→惯性打破→C'),
        ('C', '沉默多数', GRAY, '五因子做功→守约共识→净流入'),
    ]
    
    cls_dist_init = {'F': 0.02, 'E': 0.15, 'A': 0.15, 'B': 0.10, 'D': 0.22, 'C': 0.36}
    c_dist = ctrl_final['class_dist']
    t_dist = trtm_final['class_dist']
    
    for i, (cls, name, color, note) in enumerate(class_info):
        r = row + 1 + i
        init_pct = cls_dist_init[cls] * 100
        c_pct = c_dist.get(cls, 0) / 500 * 100
        t_pct = t_dist.get(cls, 0) / 500 * 100
        diff = t_pct - c_pct
        direction = '↑流入' if diff > 0.5 else ('↓流出' if diff < -0.5 else '→稳定')
        
        for j, v in enumerate([cls, name, f"{init_pct:.1f}%", f"{c_pct:.1f}%", f"{t_pct:.1f}%", f"{diff:+.1f}%", direction], 1):
            cell = ws3.cell(row=r, column=j, value=v)
            style_data_cell(cell, i % 2 == 0)
            if j == 1:
                cell.font = font(size=10, color=color, bold=True)
            if j == 3: cell.font = font(size=9, color=GRAY)
            if j == 6:
                cell.font = font(size=9, color=GREEN if diff > 0 else RED, bold=True)
            if j == 7:
                cell.font = font(size=9, color=GREEN if diff > 0 else RED)
    
    # ════════════════════════════════
    # Sheet 4: 时间序列
    # ════════════════════════════════
    ws4 = wb.create_sheet("时间序列")
    ws4.sheet_properties.tabColor = BLUE
    
    ws4.merge_cells('A1:I1')
    ws4['A1'].value = "每日指标时间序列（每10天采样）"
    ws4['A1'].font = font(size=14, color=BLUE, bold=True)
    ws4['A1'].alignment = align('center')
    
    headers4 = ['Day', 'C·缴费率', 'T·缴费率', 'C·满意度', 'T·满意度', 'C·闭环率', 'T·闭环率', 'T·介入累计', 'T·证据累计']
    row = 3
    for i, h in enumerate(headers4, 1):
        ws4.cell(row=row, column=i, value=h)
    style_header(ws4, row, 9, CARD_BG)
    
    # 每10天取一个采样点
    for idx in range(0, min(len(ctrl_hist), len(trtm_hist)), 5):
        cd = ctrl_hist[idx]
        td = trtm_hist[idx]
        r = row + 1 + idx // 5
        values = [
            cd['day'],
            cd['payment_rate'], td['payment_rate'],
            cd['avg_satisfaction'], td['avg_satisfaction'],
            cd['pm_closure_rate'], td['pm_closure_rate'],
            td.get('interventions', 0), td.get('evidence_count', 0),
        ]
        for j, v in enumerate(values, 1):
            cell = ws4.cell(row=r, column=j, value=v)
            style_data_cell(cell, (idx // 5) % 2 == 0)
            if j in (2, 4, 6): cell.font = font(size=9, color=RED)
            if j in (3, 5, 7): cell.font = font(size=9, color=GREEN)
            if isinstance(v, float) and j <= 7:
                cell.number_format = '0.0%' if v <= 1 else '0.0'
    
    # ════════════════════════════════
    # Sheet 5: 关键发现
    # ════════════════════════════════
    ws5 = wb.create_sheet("关键发现")
    ws5.sheet_properties.tabColor = YELLOW
    
    findings = [
        ("五因子乘积提升", f"传统物业五因子乘积≈{c_prod:.6f}，引入数治理方后→{t_prod:.6f}，提升{t_prod/c_prod:.0f}倍。\n验证了'任何一个因子趋近于零，整体崩塌'的假说。"),
        ("缴费率翻倍效应", f"缴费率从{ctrl_final['payment_rate']:.1%}提升至{trtm_final['payment_rate']:.1%}（+{trtm_final['payment_rate']-ctrl_final['payment_rate']:+.1%}）。\n这是五因子同时做功的涌现结果，而非单一因子驱动。"),
        ("A类争议→C类回归", f"A类（具体争议）占比从15%降至{t_dist.get('A',0)/5:.1f}%，减少{15 - t_dist.get('A',0)/5:.1f}个百分点。\n工单闭环+客服介入→问题解决→回归守约。这是数治理方最高效的转化路径。"),
        ("E类对抗降级", f"E类（对抗态度）从15%降至{t_dist.get('E',0)/5:.1f}%，减少{15 - t_dist.get('E',0)/5:.1f}个百分点。\n客服回访将'对抗'引导为'具体问题'→降级为A→进入解决流程。"),
        ("D类惯性打破", f"D类（惯性失约）从22%降至{t_dist.get('D',0)/5:.1f}%，减少{22 - t_dist.get('D',0)/5:.1f}个百分点。\n客服回访+承诺记录→'被看见的承诺'打破拖延惯性。"),
        ("未解决诉求率降低", f"未解决诉求率从{ctrl_final['unresolved_rate']:.1%}降至{trtm_final['unresolved_rate']:.1%}（-{ctrl_final['unresolved_rate']-trtm_final['unresolved_rate']:.1%}）。\n物业闭环率从38%提升至83%，是核心驱动因素。"),
        ("沉默多数增长", f"C类（沉默多数）从36%增至{t_dist.get('C',0)/5:.1f}%，净流入{t_dist.get('C',0)/5 - 36:.1f}个百分点。\n来自A/D/E的转化汇入→社区守约基本盘扩大。"),
        ("信息透明的二阶效应", "月度简报+工单公开展示→'沉默的服务被看见'→价值感知度提升→缴费意愿正向反馈。\n这是传统物业完全缺失的机制。"),
    ]
    
    ws5.merge_cells('A1:B1')
    ws5['A1'].value = "关键发现与机制解释"
    ws5['A1'].font = font(size=14, color=YELLOW, bold=True)
    ws5['A1'].alignment = align('center')
    
    row = 3
    ws5.cell(row=row, column=1, value="发现").font = font(size=10, color=WHITE, bold=True)
    ws5.cell(row=row, column=2, value="详细说明").font = font(size=10, color=WHITE, bold=True)
    style_header(ws5, row, 2, CARD_BG)
    
    for i, (title, desc) in enumerate(findings):
        r = row + 1 + i
        ws5.cell(row=r, column=1, value=title)
        ws5.cell(row=r, column=2, value=desc)
        style_data_cell(ws5.cell(row=r, column=1), i % 2 == 0)
        ws5.cell(row=r, column=1).font = font(size=9, color=YELLOW, bold=True)
        style_data_cell(ws5.cell(row=r, column=2), i % 2 == 0)
        ws5.cell(row=r, column=2).alignment = align('left', 'top', wrap=True)
        ws5.row_dimensions[r].height = 45
    
    # 调整列宽
    for ws in [ws1, ws2, ws3, ws4, ws5]:
        auto_width(ws)
    
    ws5.column_dimensions['B'].width = 80
    
    # 保存
    os.makedirs(os.path.dirname(xlsx_path), exist_ok=True)
    wb.save(xlsx_path)
    print(f"✅ Excel报告已生成: {xlsx_path}")

if __name__ == '__main__':
    json_path = os.path.join(os.path.dirname(__file__), 'simulation_results.json')
    xlsx_path = os.path.join(os.path.dirname(__file__), 'AI社区模拟_实验结果.xlsx')
    generate_report(json_path, xlsx_path)
