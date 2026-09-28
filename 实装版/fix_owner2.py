"""检查并修复业主端所有工单状态相关描述"""
from docx import Document

DOCX = r"E:\360MoveData\Users\计算机\Desktop\数治理方\实装版\业主端_产品设计文档.docx"
doc = Document(DOCX)

changes = 0
for i, p in enumerate(doc.paragraphs):
    t = p.text
    
    # 报事报修章节中过于细节的进度描述
    if '进度时间轴' in t or '进度跟踪' in t:
        for run in p.runs:
            new = run.text.replace('进度时间轴：', '处理进度：按时间节点展示（')
            if new != run.text:
                run.text = new
                changes += 1
            if '→' in run.text and ('待分派' in run.text or '已分派' in run.text):
                run.text = '提交→分派→接单→处理完成→业主验收），每个节点标注具体时间。'
                changes += 1
    
    # 太技术化的状态流转描述
    if '状态机' in t or '状态流转' in t:
        for run in p.runs:
            if '状态' in run.text and ('流转' in run.text or '机' in run.text):
                run.text = run.text.replace('状态机', '').replace('状态流转', '进度查看')
                changes += 1

doc.save(DOCX)
print(f"Done: {changes} changes")
