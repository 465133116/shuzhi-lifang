# -*- coding: utf-8 -*-
"""md → docx 转换（催收分配系统文档统一格式）
格式：宋体11pt正文 / 微软雅黑加粗标题 / 深蓝表头#1F3864白字 / 灰白交替行 / 1.5倍行距
用法：python md_to_docx.py <输入.md> [输出.docx]
"""
import re, sys, os
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

DARK_BLUE = RGBColor(0x1F, 0x38, 0x64)
BODY_COLOR = RGBColor(0x33, 0x33, 0x33)
GRAY = RGBColor(0x88, 0x88, 0x88)

def set_font(run, name_cn, size, bold=False, color=BODY_COLOR):
    run.font.name = name_cn
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    r = run._element.rPr.rFonts
    r.set(qn('w:eastAsia'), name_cn)

def para(doc, style_func, text, **kw):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    p.paragraph_format.space_after = Pt(kw.get('space_after', 6))
    p.paragraph_format.space_before = Pt(kw.get('space_before', 0))
    if kw.get('indent') is not None:
        p.paragraph_format.left_indent = Cm(kw['indent'])
    if kw.get('center'):
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if style_func is not None:
        style_func(p, text, **kw)
    return p

def add_runs(p, text, size, color=BODY_COLOR, base_bold=False, font='宋体'):
    """处理 **加粗** 内联标记"""
    parts = re.split(r'(\*\*.+?\*\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            r = p.add_run(part[2:-2])
            set_font(r, '微软雅黑' if base_bold else font, size, True, color)
        else:
            r = p.add_run(part)
            set_font(r, font, size, base_bold, color)

def add_table(doc, rows):
    n_cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=n_cols)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(rows):
        for j in range(n_cols):
            cell = table.cell(i, j)
            cell.text = ''
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
            text = row[j] if j < len(row) else ''
            if i == 0:
                r = p.add_run(text)
                set_font(r, '微软雅黑', 10.5, True, RGBColor(0xFF, 0xFF, 0xFF))
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:fill'), '1F3864')
                cell._tc.get_or_add_tcPr().append(shd)
            else:
                add_runs(p, text, 10.5)
                if i % 2 == 0:
                    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear')
                    shd.set(qn('w:fill'), 'F2F2F2')
                    cell._tc.get_or_add_tcPr().append(shd)
    return table

def convert(md_path, out_path):
    with open(md_path, encoding='utf-8') as f:
        lines = f.read().split('\n')
    doc = Document()
    for section in doc.sections:
        section.top_margin = Cm(2.5); section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.8); section.right_margin = Cm(2.8)

    i = 0
    in_code = False
    code_buf = []
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith('```'):
            if in_code:
                for cl in code_buf:
                    p = para(doc, lambda d, t, **k: None, '', indent=0.6, space_after=0)
                    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                    r = p.add_run(cl)
                    set_font(r, 'Consolas', 9, color=RGBColor(0x55, 0x55, 0x55))
                in_code = False; code_buf = []
            else:
                in_code = True; code_buf = []
            i += 1; continue
        if in_code:
            code_buf.append(line); i += 1; continue
        if not s:
            i += 1; continue
        if s == '---':
            i += 1; continue
        if s.startswith('# '):
            p = para(doc, None, '', space_before=12, space_after=10, center=True)
            add_runs(p, s[2:], 16, DARK_BLUE, base_bold=True)
        elif s.startswith('## '):
            p = para(doc, None, '', space_before=14, space_after=8)
            add_runs(p, s[3:], 14, DARK_BLUE, base_bold=True)
        elif s.startswith('### '):
            p = para(doc, None, '', space_before=10, space_after=6)
            add_runs(p, s[4:], 12, DARK_BLUE, base_bold=True)
        elif s.startswith('>'):
            p = para(doc, None, '', indent=0.5, space_after=6)
            add_runs(p, s.lstrip('> '), 10.5, GRAY)
        elif s.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                t = lines[i].strip().strip('|')
                if set(t.replace('|', '').replace('-', '').replace(':', '').replace(' ', '')):
                    rows.append([c.strip() for c in t.split('|')])
                i += 1
            if rows:
                doc.add_paragraph().paragraph_format.space_after = Pt(0)
                add_table(doc, rows)
                doc.add_paragraph().paragraph_format.space_after = Pt(0)
            continue
        elif re.match(r'^[-•] ', s):
            p = para(doc, None, '', indent=0.6, space_after=3)
            add_runs(p, s[2:], 11)
        elif re.match(r'^\d+[.、] ', s):
            p = para(doc, None, '', indent=0.6, space_after=3)
            add_runs(p, s, 11)
        else:
            p = para(doc, None, '', space_after=6)
            add_runs(p, s, 11)
        i += 1

    doc.save(out_path)
    print('OK ->', out_path)

if __name__ == '__main__':
    md = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else md.rsplit('.', 1)[0] + '.docx'
    convert(md, out)
