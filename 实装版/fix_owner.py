"""修复业主端工单描述——去掉状态机，改为时间节点展示"""
from docx import Document

DOCX = r"E:\360MoveData\Users\计算机\Desktop\数治理方\实装版\业主端_产品设计文档.docx"
doc = Document(DOCX)

# Find paragraphs to fix
for p in doc.paragraphs:
    t = p.text
    
    # 1. 五、我的工单 - 状态跟踪 → 处理情况查看
    if '5.2 状态跟踪' in t or '5.2 工单状态跟踪' in t:
        for run in p.runs:
            if '状态跟踪' in run.text:
                run.text = run.text.replace('状态跟踪', '处理情况查看')
    
    # 2. Replace detailed status description with time-node view
    if '待分派→已分派→处理中→待验收→已完成' in t and '任一阶段' in t:
        for run in p.runs:
            run.text = '工单提交后可查看处理情况：基本信息（工单编号、类型、提交时间、紧急程度）、处理进度（按时间节点展示——提交→分派→接单→处理完成→业主验收，每个节点标注具体时间）、处理意见（物业填写的处理说明及现场照片）。业主关注的是"事情办到哪一步了、什么时候能好"，而非底层状态机流转。'
            break

# Save
doc.save(DOCX)
print("Done")
