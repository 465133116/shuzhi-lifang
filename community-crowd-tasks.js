/**
 * 社区端众包任务：AI 拆分模板面向「社区治理与公共服务」场景（网格、民情、调解等），
 * 与业委会端「小区共有事务/工程物业」类任务类型区分。
 */
(function (global) {
  'use strict';

  function estimateTaskHours(template, taskType) {
    var baseHours = {
      网格巡查: 3,
      政策宣传: 3,
      民情走访: 4,
      邻里调解: 5,
      文明创建: 4,
      一老一小服务: 4,
      数据填报与台账: 3,
      应急协助: 3,
      其他: 4
    };
    var priorityMultiplier = { high: 1.5, medium: 1.0, low: 0.7 };
    var base = baseHours[taskType] || 4;
    var multiplier = priorityMultiplier[template.priority] || 1.0;
    return Math.round(base * multiplier);
  }

  function enhanceTemplatesWithAI(templates, taskDesc, taskRequirements) {
    var keywords = {
      调研: ['调研', '调查', '摸底', '问卷', '访谈', '登记'],
      设计: ['设计', '规划', '方案', '布置', '安排'],
      财务: ['经费', '报销', '物资', '采购'],
      管理: ['协调', '组织', '联络', '对接', '排班', '志愿者'],
      文案: ['撰写', '编辑', '宣传', '通知', '简报', '台账'],
      工程: ['设施', '场所', '场地', '安全隐患', '消防'],
      法律: ['法规', '政策', '合规', '告知书', '法律']
    };
    var combinedText = ((taskDesc || '') + ' ' + (taskRequirements || '')).toLowerCase();
    templates.forEach(function (template) {
      var matchedKeywords = [];
      for (var skill in keywords) {
        if (!keywords.hasOwnProperty(skill)) continue;
        var skillKeywords = keywords[skill];
        for (var i = 0; i < skillKeywords.length; i++) {
          if (combinedText.indexOf(skillKeywords[i]) !== -1) {
            matchedKeywords.push(skill);
            break;
          }
        }
      }
      if (matchedKeywords.length > 0 && template.skills) {
        var newSkills = template.skills.concat(matchedKeywords);
        var uniqueSkills = [];
        for (var j = 0; j < newSkills.length; j++) {
          if (uniqueSkills.indexOf(newSkills[j]) === -1) uniqueSkills.push(newSkills[j]);
        }
        template.skills = uniqueSkills.slice(0, 3);
      }
    });
    return templates;
  }

  /**
   * 就地更新 task：生成 subTasks，status → 待确认
   * @returns {object} task（同引用）
   */
  function runAiSplit(task) {
    var subTasks = [];
    var taskType = task.type;
    var people = task.people || 3;
    var totalPoints = task.rewardPoints || 100;
    var taskDesc = task.desc || '';
    var taskRequirements = task.requirements || '';

    var splitRules = {
      网格巡查: [
        { name: '巡查路线与频次确认', skills: ['管理'], desc: '明确网格范围、巡查点位与频次，同步工作群提醒', priority: 'high' },
        { name: '现场走访与问题采集', skills: ['调研'], desc: '入户或沿街走访，记录环境卫生、秩序及异常情况', priority: 'high' },
        { name: '事件上报与流转', skills: ['文案'], desc: '按规范在网格平台或台账中上报，跟踪处置节点', priority: 'high' },
        { name: '回访与结案核对', skills: ['管理'], desc: '对已办事项回访居民满意度，完善闭环材料', priority: 'medium' }
      ],
      政策宣传: [
        { name: '宣传要点梳理', skills: ['文案'], desc: '提炼惠民政策、办理渠道与时限，避免口径偏差', priority: 'high' },
        { name: '物料与渠道准备', skills: ['管理'], desc: '准备折页、海报或线上推文，协调物业/业委会张贴点位', priority: 'medium' },
        { name: '定点宣讲或入户告知', skills: ['管理'], desc: '组织小型宣讲或上门告知，收集居民疑问', priority: 'high' },
        { name: '答疑汇总与二次推送', skills: ['文案'], desc: '整理高频问题，补充问答口径并再次推送', priority: 'low' }
      ],
      民情走访: [
        { name: '走访名单与提纲设计', skills: ['管理'], desc: '确定重点户、独居老人等名单，设计走访提纲', priority: 'high' },
        { name: '入户访谈与需求记录', skills: ['调研'], desc: '实地走访记录诉求，注意隐私与沟通技巧', priority: 'high' },
        { name: '诉求分类与转办建议', skills: ['管理'], desc: '区分物业、业委会、街道科室职责，提出转办建议', priority: 'high' },
        { name: '民情台账更新', skills: ['文案'], desc: '更新民情日记或系统字段，便于后续督办', priority: 'medium' }
      ],
      邻里调解: [
        { name: '矛盾事实与双方诉求核实', skills: ['调研'], desc: '分别沟通了解经过，避免偏听偏信', priority: 'high' },
        { name: '现场或线上协调', skills: ['管理'], desc: '组织面对面或电话协调，引导理性表达', priority: 'high' },
        { name: '协议或口头约定确认', skills: ['法律'], desc: '形成简单书面记录或约定事项，双方确认', priority: 'medium' },
        { name: '回访巩固与风险预警', skills: ['管理'], desc: '约定时间回访，必要时上报综治或警务室', priority: 'medium' }
      ],
      文明创建: [
        { name: '活动方案与分工', skills: ['管理'], desc: '明确主题、时间、志愿者岗位与安全要点', priority: 'high' },
        { name: '现场组织与秩序维护', skills: ['管理'], desc: '签到、分工执行、拍照留痕与物资回收', priority: 'high' },
        { name: '宣传报道与材料整理', skills: ['文案'], desc: '撰写简讯，整理照片用于文明创建台账', priority: 'medium' },
        { name: '问题整改清单跟踪', skills: ['管理'], desc: '对照测评标准自查短板，列出整改与时限', priority: 'medium' }
      ],
      一老一小服务: [
        { name: '服务对象与风险摸排', skills: ['调研'], desc: '确认高龄、独居、困境儿童等名单及紧急联系人', priority: 'high' },
        { name: '探访或活动执行', skills: ['管理'], desc: '上门探访、助餐协助或儿童课堂秩序维护', priority: 'high' },
        { name: '需求转介与资源链接', skills: ['管理'], desc: '对接卫健、民政、学校等资源，记录转介结果', priority: 'medium' },
        { name: '服务记录与隐私保护', skills: ['文案'], desc: '规范记录服务内容，注意个人信息保护', priority: 'high' }
      ],
      数据填报与台账: [
        { name: '表样与字段口径确认', skills: ['管理'], desc: '核对上级表格版本、统计口径与截止时间', priority: 'high' },
        { name: '数据采集与交叉校验', skills: ['调研'], desc: '从网格、物业等渠道汇总数据，交叉验证异常值', priority: 'high' },
        { name: '系统录入与备份', skills: ['文案'], desc: '录入政务或内部系统，导出备份留存', priority: 'medium' },
        { name: '归档与备查索引', skills: ['管理'], desc: '按档案规范编号归档，便于督查抽查', priority: 'low' }
      ],
      应急协助: [
        { name: '响应启动与信息通报', skills: ['管理'], desc: '接收指令后快速通报网格与物业，明确集合点', priority: 'high' },
        { name: '现场疏散或物资协助', skills: ['管理'], desc: '协助引导、发放物资或临时值守', priority: 'high' },
        { name: '情况续报与日志记录', skills: ['文案'], desc: '按模板续报动态，保存时间线记录', priority: 'high' },
        { name: '事后总结与物资归还', skills: ['管理'], desc: '清点物资、总结经验并更新应急预案要点', priority: 'medium' }
      ],
      其他: [
        { name: '任务目标与边界澄清', skills: ['管理'], desc: '与科室或居民确认任务范围、完成标准与时间', priority: 'high' },
        { name: '执行与多方联络', skills: ['管理'], desc: '推进执行，协调物业、业委会或共建单位配合', priority: 'high' },
        { name: '结果反馈与资料归档', skills: ['文案'], desc: '提交结果说明，整理过程材料归档', priority: 'medium' }
      ]
    };

    var templates = splitRules[taskType] || splitRules['其他'];
    if (taskDesc && taskDesc.length > 50) {
      templates = enhanceTemplatesWithAI(templates.slice(), taskDesc, taskRequirements);
    }
    if (people < templates.length) {
      templates = templates.slice(0, Math.max(2, people));
    }

    var priorityWeights = { high: 1.3, medium: 1.0, low: 0.7 };
    var totalWeight = templates.reduce(function (sum, t) {
      return sum + (priorityWeights[t.priority] || 1.0);
    }, 0);

    templates.forEach(function (template, index) {
      var weight = priorityWeights[template.priority] || 1.0;
      var taskPoints = Math.round((totalPoints * weight) / totalWeight);
      subTasks.push({
        id: 'st_' + task.id + '_' + (index + 1),
        name: template.name,
        desc: template.desc,
        skills: template.skills,
        points: taskPoints,
        priority: template.priority || 'medium',
        estimatedHours: estimateTaskHours(template, taskType),
        status: '待确认',
        assignee: null,
        assigneeRoom: null,
        progress: 0,
        progressHistory: [],
        createTime: new Date().toISOString()
      });
    });

    task.subTasks = subTasks;
    task.status = '待确认';
    task.aiSplitTime = new Date().toISOString();
    task.aiSplitVersion = (task.aiSplitVersion || 0) + 1;
    return task;
  }

  global.CommunityCrowdTasks = {
    runAiSplit: runAiSplit,
    estimateTaskHours: estimateTaskHours,
    enhanceTemplatesWithAI: enhanceTemplatesWithAI
  };
})(typeof window !== 'undefined' ? window : this);
