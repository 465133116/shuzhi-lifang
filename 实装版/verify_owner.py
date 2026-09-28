"""验证业主端docx中投诉/建议相关段落"""
from docx import Document

doc = Document(r"E:\360MoveData\Users\计算机\Desktop\数治理方\实装版\业主端_产品设计文档.docx")
for i, p in enumerate(doc.paragraphs):
    t = p.text
    if '投诉' in t or '建议' in t:
        print(f"[{i}] {t[:120]}")
