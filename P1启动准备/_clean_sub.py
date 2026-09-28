# -*- coding: utf-8 -*-
"""开发文档清理：删除 C1/C2、D1-D3 子级标签设计"""
import openpyxl
from openpyxl.styles import Font

PATH = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\催收分配逻辑_V3.0_开发文档.xlsx"
OUT = r"E:\360MoveData\Users\计算机\Desktop\数治理方\P1启动准备\催收分配逻辑_V3.0_开发文档_tmp.xlsx"
FONT = Font(name='微软雅黑', size=10)

wb = openpyxl.load_workbook(PATH)

# ---------- Sheet 03 枚举定义 ----------
ws = wb['03枚举定义']
# 找 c_level / d_level 行删除
to_del = []
for r in range(1, ws.max_row + 1):
    v = ws.cell(row=r, column=1).value
    if v and ('c_level' in str(v) or 'd_level' in str(v)):
        to_del.append(r)
for r in sorted(to_del, reverse=True):
    ws.delete_rows(r)
# C 标签行备注改（去掉 C1/C2）
for r in range(1, ws.max_row + 1):
    if ws.cell(row=r, column=2).value == 'C' and '观望' in str(ws.cell(row=r, column=3).value or ''):
        ws.cell(row=r, column=4).value = '搭便车/从众拖延（单级，不分子级）'
        ws.cell(row=r, column=4).font = FONT

# ---------- Sheet 04 数据模型 ----------
ws = wb['04数据模型']
to_del = []
for r in range(1, ws.max_row + 1):
    v = ws.cell(row=r, column=1).value
    if v and str(v).strip() in ('c_level', 'd_level'):
        to_del.append(r)
for r in sorted(to_del, reverse=True):
    ws.delete_rows(r)

# ---------- Sheet 06 标签引擎对接 ----------
ws = wb['06标签引擎对接']
for r in range(1, ws.max_row + 1):
    lbl = ws.cell(row=r, column=1).value
    if lbl == 'C':
        ws.cell(row=r, column=4).value = 'EV×0.15先验，正常排队；首次触达重点了解'
        ws.cell(row=r, column=6).value = '从众信号(别人没交/大家都)作判定线索，不单独成级'
        for c in (4, 6):
            ws.cell(row=r, column=c).font = FONT
    if lbl == 'D':
        ws.cell(row=r, column=4).value = 'EV×0.18先验，正常排队；失约≥5次启动函告(策略)'
        ws.cell(row=r, column=6).value = '失约计数为数据字段，不做D1/D2/D3分级；28天阶梯衰减'
        for c in (4, 6):
            ws.cell(row=r, column=c).font = FONT

# ---------- Sheet 15 开发分期 ----------
ws = wb['15开发分期']
for r in range(1, ws.max_row + 1):
    v = ws.cell(row=r, column=2).value
    if v and 'C分级/D分级' in str(v):
        ws.cell(row=r, column=2).value = '正向跟单+定时任务全量+标签引擎对接细化+意向池全规则'
        ws.cell(row=r, column=2).font = FONT

wb.save(OUT)
print('OK')
