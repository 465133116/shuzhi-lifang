# -*- coding: utf-8 -*-
"""convert_to_docx.py — MD → Word 统一转换
规格：宋体11pt / 黑体标题 / 深蓝表头#1F3864 / 灰白交替行 / 1.5倍行距
用法：python convert_to_docx.py 输入.md [输出.docx]
"""
import sys, re
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

HEADER_BLUE = RGBColor(0x1F, 0x38, 0x64)

def set_cn(run, name):
    run.font.name = name
    r = run._element.rPr
    r.rFonts.set(qn('w:eastAsia'), name)

def style_run(run, name='宋体', size=11, bold=False, color=None):
    run.font.size = Pt(size)
    run.font.bold = bold
    if color is not None:
        run.font.color.rgb = color
    set_cn(run, name)

def add_para(doc, text, name='宋体', size=11, bold=False, color=None, align=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(space_after)
    if align:
        p.alignment = align
    run = p.add_run(text)
    style_run(run, name, size, bold, color)
    return p

def add_table(doc, rows):
    t = doc.add_table(rows=len(rows), cols=len(rows[0]))
    t.style = 'Table Grid'
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            c = t.cell(i, j)
            c.text = ''
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.3
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(str(cell))
            if i == 0:
                style_run(run, '黑体', 10.5, True, RGBColor(0xFF, 0xFF, 0xFF))
                shd = c._tc.get_or_add_tcPr().makeelement(qn('w:shd'), {qn('w:val'): 'clear', qn('w:fill'): '1F3864'})
                c._tc.get_or_add_tcPr().append(shd)
            else:
                style_run(run, '宋体', 10.5, False)
                if i % 2 == 0:
                    shd = c._tc.get_or_add_tcPr().makeelement(qn('w:shd'), {qn('w:val'): 'clear', qn('w:fill'): 'F2F5F9'})
                    c._tc.get_or_add_tcPr().append(shd)
    doc.add_paragraph()

def convert(md_path, out_path):
    lines = open(md_path, encoding='utf-8').read().split('\n')
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = '宋体'
    style.font.size = Pt(11)
    style.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

    in_table = False
    table_rows = []
    in_code = False
    for line in lines:
        if line.strip().startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            continue
        if line.startswith('|') and line.strip().endswith('|'):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if all(re.match(r'^:?-{2,}:?$', c) for c in cells):
                continue
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(cells)
            continue
        else:
            if in_table and table_rows:
                add_table(doc, table_rows)
                table_rows = []
                in_table = False
        if line.startswith('# '):
            add_para(doc, line[2:], '黑体', 16, True, HEADER_BLUE, WD_ALIGN_PARAGRAPH.CENTER, 10)
        elif line.startswith('## '):
            add_para(doc, line[3:], '黑体', 14, True, HEADER_BLUE, None, 8)
        elif line.startswith('### '):
            add_para(doc, line[4:], '黑体', 12, True, None, None, 6)
        elif line.strip() == '---':
            add_para(doc, '—' * 30, '宋体', 9, False, RGBColor(0xBB, 0xBB, 0xBB), WD_ALIGN_PARAGRAPH.CENTER, 4)
        elif line.strip().startswith('- '):
            add_para(doc, line.strip()[2:], '宋体', 11)
        elif re.match(r'^\d+\. ', line.strip()):
            add_para(doc, line.strip(), '宋体', 11)
        elif line.strip():
            txt = re.sub(r'\*\*(.+?)\*\*', r'\1', line.strip())
            add_para(doc, txt, '宋体', 11)
    if in_table and table_rows:
        add_table(doc, table_rows)
    doc.save(out_path)
    print('OK ->', out_path)

if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else src.rsplit('.', 1)[0] + '.docx'
    convert(src, dst)
