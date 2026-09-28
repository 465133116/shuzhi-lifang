#!/usr/bin/env python3
"""将鄞州区政策版markdown转为docx"""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os

FONT_BODY = '宋体'; FONT_TITLE = '黑体'
MD_DIR = r"E:\360MoveData\Users\计算机\Desktop\数治理方\实装版\鄞州区政策版"

def make_doc():
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = FONT_BODY; style.font.size = Pt(11)
    style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(4)
    for s in doc.sections:
        s.top_margin = Cm(2.5); s.bottom_margin = Cm(2.5)
        s.left_margin = Cm(2.8); s.right_margin = Cm(2.8)
    return doc

def scf(cell, text='', bold=False, size=Pt(10), align=WD_ALIGN_PARAGRAPH.LEFT, color=None):
    cell.text = ''
    p = cell.paragraphs[0]; p.alignment = align
    p.paragraph_format.space_before = Pt(2); p.paragraph_format.space_after = Pt(2)
    r = p.add_run(str(text)); r.bold = bold; r.font.size = size
    r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)
    if color: r.font.color.rgb = color

def shade_cells(row, color="D9E2F3"):
    for c in row.cells:
        s = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
        c._tc.get_or_add_tcPr().append(s)

def add_h1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18); p.paragraph_format.space_after = Pt(10)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(16)
    r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)

def add_h2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12); p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text); r.bold = True; r.font.size = Pt(13)
    r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)

def add_body(doc, text, bold=False):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Pt(22)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(11)
    r.font.name = FONT_BODY; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)

def add_table(doc, headers, rows):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        scf(t.rows[0].cells[i], h, bold=True, size=Pt(9.5), align=WD_ALIGN_PARAGRAPH.CENTER, color=RGBColor(255,255,255))
    shade_cells(t.rows[0], "1F3864")
    for ri, rd in enumerate(rows):
        for ci, v in enumerate(rd):
            scf(t.rows[ri+1].cells[ci], str(v) if v else '', size=Pt(9))
        if ri % 2 == 1:
            shade_cells(t.rows[ri+1], "F2F2F2")
    doc.add_paragraph()

def md_to_docx(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    doc = make_doc()
    
    first_h1 = None
    for line in lines:
        if line.startswith('# '):
            first_h1 = line[2:].strip()
            break
    
    if first_h1:
        doc.add_paragraph()
        doc.add_paragraph()
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(24); p.paragraph_format.space_after = Pt(16)
        r = p.add_run(first_h1); r.bold = True; r.font.size = Pt(22)
        r.font.name = FONT_TITLE; r.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_TITLE)
        
        p2 = doc.add_paragraph(); p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(20)
        r2 = p2.add_run('产品设计文档'); r2.font.size = Pt(12)
        r2.font.color.rgb = RGBColor(100,116,139)
        r2.font.name = FONT_BODY; r2.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_BODY)
    
    doc.add_page_break()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if line.startswith('## '):
            add_h1(doc, line[3:])
        elif line.startswith('### '):
            add_h2(doc, line[4:])
        elif line.startswith('|') and '|' in line[1:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            i -= 1
            if len(table_lines) >= 2:
                headers = [c.strip() for c in table_lines[0].split('|')[1:-1]]
                rows = []
                for tl in table_lines[2:]:
                    if not tl.startswith('|'): continue
                    cells = [c.strip() for c in tl.split('|')[1:-1]]
                    if len(cells) == len(headers):
                        rows.append(cells)
                if headers and rows:
                    add_table(doc, headers, rows)
        elif line.startswith('---'):
            doc.add_page_break()
        elif line and not line.startswith('#') and not line.startswith('>') and not line.startswith('*'):
            text = line
            bold = False
            if line.startswith('**') and line.endswith('**'):
                bold = True
                text = line[2:-2]
            if text.startswith('—') or text.startswith('```'):
                i += 1
                continue
            add_body(doc, text, bold=bold)
        i += 1
    
    os.makedirs(os.path.dirname(docx_path), exist_ok=True)
    doc.save(docx_path)
    return True

for fname in sorted(os.listdir(MD_DIR)):
    if fname.endswith('.md'):
        md_path = os.path.join(MD_DIR, fname)
        docx_path = os.path.join(MD_DIR, fname.replace('.md', '.docx'))
        try:
            md_to_docx(md_path, docx_path)
            size_kb = os.path.getsize(docx_path) / 1024
            print(f"✅ {fname.replace('.md','.docx')} ({size_kb:.0f}KB)")
        except Exception as e:
            print(f"❌ {fname}: {e}")

print("\n全部完成!")
