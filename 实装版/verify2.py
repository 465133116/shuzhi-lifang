"""检查docx中的表格"""
from docx import Document

doc = Document(r"E:\360MoveData\Users\计算机\Desktop\数治理方\实装版\业主端_产品设计文档.docx")
for ti, table in enumerate(doc.tables):
    for ri, row in enumerate(table.rows):
        cells = [c.text[:50] for c in row.cells]
        if any('投诉' in c or '建议' in c for c in cells):
            print(f"Table[{ti}] Row[{ri}]: {cells}")
