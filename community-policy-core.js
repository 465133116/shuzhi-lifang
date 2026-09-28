/**
 * 社区端制度导航中心 - 核心数据模型与业务逻辑层
 * 版本: V2.0
 * 架构: Persistence Layer (Storage) -> Business Layer (Service) -> Presentation Layer (UI)
 * 
 * 功能特性:
 * - 完整的规章制度分类体系
 * - 版本管理与更新记录
 * - 时效性标识与提醒
 * - 高级搜索功能
 * - 用户交互（点赞、收藏、评论）
 */

const PolicyDatabase = {
  _data: {
    categories: [
      { id: 'cat_law', name: '国家法律法规', parentId: null, icon: 'fa-balance-scale', description: '全国性法律法规，具有最高效力', order: 1 },
      { id: 'cat_civil', name: '《民法典》', parentId: 'cat_law', icon: 'fa-book', description: '民事法律基本法，包含物权编、合同编等', order: 1 },
      { id: 'cat_civil_ownership', name: '物权编', parentId: 'cat_civil', icon: 'fa-home', description: '关于所有权、用益物权、担保物权的规定', order: 1 },
      { id: 'cat_civil_contract', name: '合同编', parentId: 'cat_civil', icon: 'fa-file-contract', description: '关于合同的订立、履行、变更等规定', order: 2 },
      { id: 'cat_prop', name: '物业管理条例', parentId: 'cat_law', icon: 'fa-gavel', description: '国务院颁布的物业管理行政法规', order: 2 },
      { id: 'cat_prop_fund', name: '维修资金规定', parentId: 'cat_prop', icon: 'fa-coins', description: '专项维修资金的管理与使用规定', order: 1 },
      { id: 'cat_local', name: '地方性法规', parentId: 'cat_law', icon: 'fa-landmark', description: '省、市制定的地方性法规', order: 3 },
      
      { id: 'cat_rule', name: '小区自治制度', parentId: null, icon: 'fa-file-contract', description: '业主共同制定的自治管理规则', order: 2 },
      { id: 'cat_rules_meeting', name: '业主大会议事规则', parentId: 'cat_rule', icon: 'fa-users', description: '业主大会召开、表决的程序规则', order: 1 },
      { id: 'cat_rules_mgmt', name: '管理规约', parentId: 'cat_rule', icon: 'fa-tasks', description: '小区公共事务管理的约定', order: 2 },
      { id: 'cat_rules_fin', name: '维修资金管理办法', parentId: 'cat_rule', icon: 'fa-coins', description: '小区维修资金的具体管理细则', order: 3 },
      { id: 'cat_rules_parking', name: '停车管理规定', parentId: 'cat_rule', icon: 'fa-car', description: '小区停车秩序与车位管理规定', order: 4 },
      { id: 'cat_rules_decor', name: '装修管理规定', parentId: 'cat_rule', icon: 'fa-paint-roller', description: '房屋装修的申报与管理规定', order: 5 },
      { id: 'cat_rules_pet', name: '宠物饲养规定', parentId: 'cat_rule', icon: 'fa-paw', description: '小区宠物饲养的管理规定', order: 6 },
      { id: 'cat_rules_green', name: '绿化管理规定', parentId: 'cat_rule', icon: 'fa-leaf', description: '小区绿化养护与管理规定', order: 7 },
      
      { id: 'cat_contract', name: '合同协议范本', parentId: null, icon: 'fa-file-signature', description: '各类合同协议的标准范本', order: 3 },
      { id: 'cat_cont_prop', name: '物业服务合同', parentId: 'cat_contract', icon: 'fa-building', description: '业主委员会与物业公司签订的服务合同', order: 1 },
      { id: 'cat_cont_park', name: '停车位租赁协议', parentId: 'cat_contract', icon: 'fa-car', description: '车位租赁的标准协议模板', order: 2 },
      { id: 'cat_cont_decor', name: '装修管理协议', parentId: 'cat_contract', icon: 'fa-paint-roller', description: '业主装修前需签署的管理协议', order: 3 },
      
      { id: 'cat_guide', name: '办事指南', parentId: null, icon: 'fa-map-signs', description: '各类事务办理流程指引', order: 4 },
      { id: 'cat_guide_meeting', name: '业主大会召开', parentId: 'cat_guide', icon: 'fa-users-cog', description: '业主大会筹备与召开流程', order: 1 },
      { id: 'cat_guide_vote', name: '投票表决流程', parentId: 'cat_guide', icon: 'fa-vote-yea', description: '业主投票表决的操作流程', order: 2 },
      { id: 'cat_guide_fund', name: '维修资金使用', parentId: 'cat_guide', icon: 'fa-hand-holding-usd', description: '维修资金申请与使用流程', order: 3 },
      { id: 'cat_guide_decor', name: '装修备案流程', parentId: 'cat_guide', icon: 'fa-paint-roller', description: '房屋装修备案办理流程', order: 4 },
      { id: 'cat_guide_rep', name: '报修投诉指引', parentId: 'cat_guide', icon: 'fa-tools', description: '报修与投诉的处理流程', order: 5 },
      { id: 'cat_guide_committee', name: '业委会选举', parentId: 'cat_guide', icon: 'fa-person-booth', description: '业主委员会选举流程', order: 6 },
      
      { id: 'cat_policy', name: '政策解读', parentId: null, icon: 'fa-lightbulb', description: '最新政策法规的解读与分析', order: 5 },
      { id: 'cat_policy_new', name: '新规速递', parentId: 'cat_policy', icon: 'fa-bullhorn', description: '最新发布的法规政策', order: 1 },
      { id: 'cat_policy_case', name: '典型案例', parentId: 'cat_policy', icon: 'fa-gavel', description: '物业管理典型案例分析', order: 2 }
    ],
    
    policies: [
      { 
        id: 'p1', 
        categoryId: 'cat_civil_ownership', 
        title: '《民法典》物权编 - 业主建筑物区分所有权', 
        type: '法律', 
        source: '全国人民代表大会',
        publishDate: '2020-05-28', 
        effectiveDate: '2021-01-01',
        expiryDate: null,
        status: 'effective',
        views: 12580, 
        summary: '明确业主对建筑物专有部分和共有部分的权利义务，是小区治理的根本法律依据。',
        content: `<h3>第二百七十一条 【业主对专有部分和共有部分的权利】</h3>
<p>业主对建筑物内的住宅、经营性用房等专有部分享有所有权，对专有部分以外的共有部分享有共有和共同管理的权利。</p>

<h3>第二百七十二条 【业主对专有部分的权利和义务】</h3>
<p>业主对其建筑物专有部分享有占有、使用、收益和处分的权利。业主行使权利不得危及建筑物的安全，不得损害其他业主的合法权益。</p>

<h3>第二百七十三条 【业主对共有部分的权利和义务】</h3>
<p>业主对建筑物专有部分以外的共有部分，享有权利，承担义务；不得以放弃权利为由不履行义务。</p>
<p>业主转让建筑物内的住宅、经营性用房，其对共有部分享有的共有和共同管理的权利一并转让。</p>

<h3>第二百七十四条 【建筑区划内道路、绿地等设施的权利归属】</h3>
<p>建筑区划内的道路，属于业主共有，但属于城镇公共道路的除外。建筑区划内的绿地，属于业主共有，但属于城镇公共绿地或者明示属于个人的除外。建筑区划内的其他公共场所、公用设施和物业服务用房，属于业主共有。</p>

<h3>第二百七十五条 【车位、车库的权利归属】</h3>
<p>建筑区划内，规划用于停放汽车的车位、车库应当首先满足业主的需要。</p>
<p>建筑区划内，规划用于停放汽车的车位、车库的归属，由当事人通过出售、附赠或者出租等方式约定。</p>
<p>占用业主共有的道路或者其他场地用于停放汽车的车位，属于业主共有。</p>

<h3>第二百七十八条 【业主共同决定事项及表决规则】</h3>
<p>下列事项由业主共同决定：</p>
<p>（一）制定和修改业主大会议事规则；</p>
<p>（二）制定和修改管理规约；</p>
<p>（三）选举业主委员会或者更换业主委员会成员；</p>
<p>（四）选聘和解聘物业服务企业或者其他管理人；</p>
<p>（五）使用建筑物及其附属设施的维修资金；</p>
<p>（六）筹集建筑物及其附属设施的维修资金；</p>
<p>（七）改建、重建建筑物及其附属设施；</p>
<p>（八）改变共有部分的用途或者利用共有部分从事经营活动；</p>
<p>（九）有关共有和共同管理权利的其他重大事项。</p>
<p>业主共同决定事项，应当由专有部分面积占比三分之二以上的业主且人数占比三分之二以上的业主参与表决。决定前款第六项至第八项规定的事项，应当经参与表决专有部分面积四分之三以上的业主且参与表决人数四分之三以上的业主同意。决定前款其他事项，应当经参与表决专有部分面积过半数的业主且参与表决人数过半数的业主同意。</p>`,
        attachments: [
          { name: '民法典全文.pdf', url: '#', size: '2.5MB' },
          { name: '物权编解读.docx', url: '#', size: '156KB' }
        ],
        tags: ['业主权利', '共有部分', '表决规则', '维修资金'],
        relatedPolicies: ['p2', 'p3', 'p4'],
        versions: [
          { version: '1.0', date: '2021-01-01', changes: '首次发布', editor: '系统' }
        ]
      },
      { 
        id: 'p2', 
        categoryId: 'cat_prop', 
        title: '《物业管理条例》', 
        type: '行政法规', 
        source: '国务院',
        publishDate: '2003-06-08', 
        effectiveDate: '2003-09-01',
        expiryDate: null,
        status: 'effective',
        views: 8960, 
        summary: '规范物业管理活动，维护业主和物业服务企业的合法权益的基本行政法规。',
        content: `<h3>第一章 总则</h3>
<h4>第一条</h4>
<p>为了规范物业管理活动，维护业主和物业服务企业的合法权益，改善人民群众的生活和工作环境，制定本条例。</p>

<h4>第二条</h4>
<p>本条例所称物业管理，是指业主通过选聘物业服务企业，由业主和物业服务企业按照物业服务合同约定，对房屋及配套的设施设备和相关场地进行维修、养护、管理，维护物业管理区域内的环境卫生和相关秩序的活动。</p>

<h4>第三条</h4>
<p>国家提倡业主通过公开、公平、公正的市场竞争机制选择物业服务企业。</p>

<h4>第四条</h4>
<p>国家鼓励采用新技术、新方法，依靠科技进步提高物业管理和服务水平。</p>

<h4>第五条</h4>
<p>国务院建设行政主管部门负责全国物业管理活动的监督管理工作。</p>
<p>县级以上地方人民政府房地产行政主管部门负责本行政区域内物业管理活动的监督管理工作。</p>

<h3>第二章 业主及业主大会</h3>
<h4>第六条</h4>
<p>房屋的所有权人为业主。</p>
<p>业主在物业管理活动中，享有下列权利：</p>
<p>（一）按照物业服务合同的约定，接受物业服务企业提供的服务；</p>
<p>（二）提议召开业主大会会议，并就物业管理的有关事项提出建议；</p>
<p>（三）提出制定和修改管理规约、业主大会议事规则的建议；</p>
<p>（四）参加业主大会会议，行使投票权；</p>
<p>（五）选举业主委员会成员，并享有被选举权；</p>
<p>（六）监督业主委员会的工作；</p>
<p>（七）监督物业服务企业履行物业服务合同；</p>
<p>（八）对物业共用部位、共用设施设备和相关场地使用情况享有知情权和监督权；</p>
<p>（九）监督物业共用部位、共用设施设备专项维修资金（以下简称专项维修资金）的管理和使用；</p>
<p>（十）法律、法规规定的其他权利。</p>`,
        attachments: [
          { name: '物业管理条例全文.pdf', url: '#', size: '890KB' }
        ],
        tags: ['物业管理', '业主权利', '业委会'],
        relatedPolicies: ['p1', 'p3'],
        versions: [
          { version: '1.0', date: '2003-09-01', changes: '首次发布', editor: '国务院' },
          { version: '1.1', date: '2007-08-26', changes: '第一次修订', editor: '国务院' },
          { version: '2.0', date: '2018-03-19', changes: '第二次修订，取消资质管理', editor: '国务院' }
        ]
      },
      { 
        id: 'p3', 
        categoryId: 'cat_rules_meeting', 
        title: '业主大会议事规则（示范文本）', 
        type: '议事规则', 
        source: '住房和城乡建设部',
        publishDate: '2021-01-01', 
        effectiveDate: '2021-01-01',
        expiryDate: null,
        status: 'effective',
        views: 3420, 
        summary: '规范业主大会的召开、表决程序，保障业主依法行使共同管理权利。',
        content: `<h3>第一章 总则</h3>
<h4>第一条 制定依据</h4>
<p>为规范业主大会的议事活动，保障业主的合法权益，根据《中华人民共和国民法典》《物业管理条例》等法律法规，制定本议事规则。</p>

<h4>第二条 适用范围</h4>
<p>本议事规则适用于本物业管理区域内业主大会的召开、业主委员会的选举、业主共同决定事项的表决等活动。</p>

<h4>第三条 业主大会的组成</h4>
<p>业主大会由本物业管理区域内的全体业主组成，代表和维护全体业主在物业管理活动中的合法权益。</p>

<h3>第二章 业主大会的召开</h3>
<h4>第四条 会议类型</h4>
<p>业主大会会议分为定期会议和临时会议。</p>
<p>定期会议每年召开不少于一次，召开时间由业主委员会确定。</p>

<h4>第五条 临时会议召开条件</h4>
<p>有下列情形之一的，业主委员会应当及时组织召开业主大会临时会议：</p>
<p>（一）经专有部分占建筑物总面积20%以上且占总人数20%以上业主提议的；</p>
<p>（二）发生重大事故或者紧急事件需要及时处理的；</p>
<p>（三）业主大会议事规则或者管理规约规定的其他情形。</p>

<h4>第六条 会议通知</h4>
<p>召开业主大会会议，业主委员会应当于会议召开15日前，将会议时间、地点、议题、议程等事项书面通知全体业主，并在物业管理区域的显著位置公告。</p>

<h3>第三章 表决规则</h3>
<h4>第七条 表决权计算</h4>
<p>业主的表决权按照下列方式计算：</p>
<p>（一）专有部分面积，按照不动产登记簿记载的面积计算；尚未进行登记的，暂按测绘机构的实测面积计算；尚未进行实测的，暂按房屋买卖合同记载的面积计算；</p>
<p>（二）业主人数，按照专有部分的数量计算，一个专有部分按一人计算。但建设单位尚未出售和虽已出售但尚未交付的部分，以及同一业主拥有一个以上专有部分的，按一人计算。</p>

<h4>第八条 表决方式</h4>
<p>业主可以采用下列方式表决：</p>
<p>（一）现场投票；</p>
<p>（二）书面征求意见；</p>
<p>（三）电子投票。</p>
<p>采用电子投票的，应当确保投票过程可追溯、可查验。</p>`,
        attachments: [
          { name: '议事规则示范文本.docx', url: '#', size: '125KB' },
          { name: '议事规则填写说明.pdf', url: '#', size: '89KB' }
        ],
        tags: ['业主大会', '表决规则', '会议程序'],
        relatedPolicies: ['p1', 'p4'],
        versions: [
          { version: '1.0', date: '2021-01-01', changes: '根据民法典修订发布', editor: '住建部' }
        ]
      },
      { 
        id: 'p4', 
        categoryId: 'cat_rules_mgmt', 
        title: '管理规约（示范文本）', 
        type: '管理规约', 
        source: '住房和城乡建设部',
        publishDate: '2021-01-01', 
        effectiveDate: '2021-01-01',
        expiryDate: null,
        status: 'effective',
        views: 2890, 
        summary: '规范物业管理区域内业主的共同行为准则，维护公共秩序和环境。',
        content: `<h3>第一章 总则</h3>
<h4>第一条 制定目的</h4>
<p>为维护本物业管理区域内全体业主、使用人的合法权益以及公共环境和秩序，保障物业的安全与合理使用，制定本规约。</p>

<h4>第二条 适用范围</h4>
<p>本规约对本物业管理区域内全体业主、使用人具有约束力。全体业主、使用人应当遵守本规约，承担本规约规定的责任，履行本规约规定的义务。</p>

<h3>第二章 物业使用</h3>
<h4>第三条 专有部分使用</h4>
<p>业主对物业专有部分享有占有、使用、收益和处分的权利，但不得妨碍其他业主正常使用物业，不得损害公共利益和其他业主的合法权益。</p>
<p>业主应遵守下列规定：</p>
<p>（一）按照规划用途使用物业，不得擅自改变物业使用性质；</p>
<p>（二）遵守相邻关系，处理邻里关系应当遵循有利生产、方便生活、团结互助、公平合理的原则；</p>
<p>（三）维护物业外观整洁，不得擅自搭建建筑物、构筑物，不得擅自改变门窗、外立面等外观；</p>
<p>（四）不得存放易燃、易爆、剧毒、放射性等危险物品。</p>

<h4>第四条 共有部分使用</h4>
<p>业主使用物业共有部分，应当遵守下列规定：</p>
<p>（一）不得擅自占用、挖掘物业管理区域内的道路、场地；</p>
<p>（二）不得擅自占用、处分物业共有部分；</p>
<p>（三）利用共有部分从事经营活动的，应当经业主大会决定，所得收益属于全体业主。</p>

<h3>第三章 装修管理</h3>
<h4>第五条 装修申报</h4>
<p>业主装修房屋，应当事先告知物业服务企业，并提交下列资料：</p>
<p>（一）装修设计方案；</p>
<p>（二）装修施工单位资质证明；</p>
<p>（三）装修施工人员名单及身份证复印件。</p>

<h4>第六条 装修禁止行为</h4>
<p>装修施工不得有下列行为：</p>
<p>（一）未经原设计单位或者具有相应资质等级的设计单位提出设计方案，变动建筑主体和承重结构；</p>
<p>（二）将没有防水要求的房间或者阳台改为卫生间、厨房间；</p>
<p>（三）扩大承重墙上原有的门窗尺寸，拆除连接阳台的砖、混凝土墙体；</p>
<p>（四）损坏房屋原有节能设施，降低节能效果；</p>
<p>（五）其他影响建筑结构安全和使用安全的行为。</p>`,
        attachments: [
          { name: '管理规约示范文本.docx', url: '#', size: '98KB' }
        ],
        tags: ['管理规约', '物业使用', '装修管理'],
        relatedPolicies: ['p1', 'p3'],
        versions: [
          { version: '1.0', date: '2021-01-01', changes: '根据民法典修订发布', editor: '住建部' }
        ]
      },
      { 
        id: 'p5', 
        categoryId: 'cat_rules_fin', 
        title: '住宅专项维修资金管理办法', 
        type: '部门规章', 
        source: '建设部、财政部',
        publishDate: '2007-12-04', 
        effectiveDate: '2008-02-01',
        expiryDate: null,
        status: 'effective',
        views: 4560, 
        summary: '规范住宅专项维修资金的交存、使用、管理和监督，保障住宅共用部位、共用设施设备的维修和正常使用。',
        content: `<h3>第一章 总则</h3>
<h4>第一条</h4>
<p>为加强对住宅专项维修资金的管理，保障住宅共用部位、共用设施设备的维修和正常使用，维护住宅专项维修资金所有者的合法权益，根据《物权法》、《物业管理条例》等法律法规，制定本办法。</p>

<h4>第二条</h4>
<p>商品住宅、售后公有住房住宅专项维修资金的交存、使用、管理和监督，适用本办法。</p>
<p>本办法所称住宅专项维修资金，是指专项用于住宅共用部位、共用设施设备保修期满后的维修和更新、改造的资金。</p>

<h3>第二章 交存</h3>
<h4>第五条</h4>
<p>商品住房的业主、非住宅的业主按照所拥有物业的建筑面积交存住宅专项维修资金，每平方米建筑面积交存首期住宅专项维修资金的数额为当地住宅建筑安装工程每平方米造价的5%至8%。</p>
<p>直辖市、市、县人民政府建设（房地产）主管部门应当根据本地区情况，合理确定、公布每平方米建筑面积交存首期住宅专项维修资金的数额，并适时调整。</p>

<h4>第六条</h4>
<p>下列物业的业主应当按照本办法的规定交存住宅专项维修资金：</p>
<p>（一）住宅，但一个业主所有且与其他物业不具有共用部位、共用设施设备的除外；</p>
<p>（二）住宅小区内的非住宅或者住宅小区外与单幢住宅结构相连的非住宅。</p>

<h3>第三章 使用</h3>
<h4>第十六条</h4>
<p>住宅专项维修资金的使用，应当遵循方便快捷、公开透明、受益人和负担人相一致的原则。</p>

<h4>第十七条</h4>
<p>住宅专项维修资金的使用，由业主大会决定。业主大会未成立的，由相关业主按照本办法的规定申请使用。</p>

<h4>第十八条</h4>
<p>住宅专项维修资金列支范围内专有部分占建筑物总面积三分之二以上的业主且占总人数三分之二以上的业主讨论通过使用建议后，物业服务企业或者相关业主可以向住宅专项维修资金管理单位提出使用申请。</p>`,
        attachments: [
          { name: '维修资金管理办法.pdf', url: '#', size: '320KB' }
        ],
        tags: ['维修资金', '交存', '使用'],
        relatedPolicies: ['p1', 'p2'],
        versions: [
          { version: '1.0', date: '2008-02-01', changes: '首次发布', editor: '建设部、财政部' }
        ]
      },
      { 
        id: 'p6', 
        categoryId: 'cat_guide_meeting', 
        title: '业主大会召开流程指南', 
        type: '办事指南', 
        source: '社区治理中心',
        publishDate: '2025-01-15', 
        effectiveDate: '2025-01-15',
        expiryDate: null,
        status: 'effective',
        views: 2340, 
        summary: '详细说明业主大会从筹备到召开的完整流程，包括会议形式、通知方式、表决程序等。',
        content: `<h3>一、会议类型</h3>
<p>业主大会会议分为<strong>定期会议</strong>和<strong>临时会议</strong>两种类型：</p>
<ul>
<li><strong>定期会议</strong>：每年至少召开一次，由业主委员会根据议事规则确定时间</li>
<li><strong>临时会议</strong>：满足特定条件时召开</li>
</ul>

<h3>二、临时会议召开条件</h3>
<p>出现以下任一情形，应当召开临时会议：</p>
<ol>
<li>经专有部分面积占比20%以上且人数占比20%以上的业主提议</li>
<li>发生重大事故或紧急事件需要及时处理</li>
<li>业主大会议事规则或管理规约规定的其他情形</li>
</ol>

<h3>三、会议筹备流程</h3>
<div class="flow-chart">
<p><strong>第1步：确定议题</strong> → 业主委员会根据实际需要确定会议议题</p>
<p><strong>第2步：制定方案</strong> → 确定会议时间、地点、形式、议程</p>
<p><strong>第3步：发布公告</strong> → 提前15日通知全体业主</p>
<p><strong>第4步：准备材料</strong> → 准备表决票、会议资料等</p>
<p><strong>第5步：召开会议</strong> → 按照议程进行</p>
<p><strong>第6步：统计结果</strong> → 公布表决结果</p>
<p><strong>第7步：资料归档</strong> → 会议资料存档备查</p>
</div>

<h3>四、会议通知内容</h3>
<p>会议通知应当包含以下内容：</p>
<ul>
<li>会议时间、地点</li>
<li>会议议题及说明</li>
<li>会议议程</li>
<li>表决事项及说明</li>
<li>业主身份确认方式</li>
<li>联系方式</li>
</ul>

<h3>五、表决方式</h3>
<table class="info-table">
<tr><th>方式</th><th>适用场景</th><th>注意事项</th></tr>
<tr><td>现场投票</td><td>业主到会集中的情况</td><td>需当场验票、计票</td></tr>
<tr><td>书面征求意见</td><td>业主分散的情况</td><td>需确保送达和回收</td></tr>
<tr><td>电子投票</td><td>信息化程度高的小区</td><td>需确保身份验证和投票安全</td></tr>
</table>

<h3>六、表决比例要求</h3>
<p>根据《民法典》第278条规定：</p>
<ul>
<li><strong>参与表决门槛</strong>：专有部分面积占比2/3以上且人数占比2/3以上的业主参与表决</li>
<li><strong>一般事项</strong>：参与表决中专有部分面积过半数且人数过半数同意</li>
<li><strong>重大事项</strong>（筹集维修资金、改建重建、改变共有部分用途）：参与表决中专有部分面积3/4以上且人数3/4以上同意</li>
</ul>`,
        attachments: [
          { name: '业主大会召开流程图.pdf', url: '#', size: '256KB' },
          { name: '会议通知模板.docx', url: '#', size: '45KB' }
        ],
        tags: ['业主大会', '召开流程', '表决'],
        relatedPolicies: ['p1', 'p3'],
        versions: [
          { version: '1.0', date: '2025-01-15', changes: '首次发布', editor: '社区治理中心' }
        ]
      },
      { 
        id: 'p7', 
        categoryId: 'cat_guide_fund', 
        title: '维修资金使用申请流程', 
        type: '办事指南', 
        source: '社区治理中心',
        publishDate: '2025-02-01', 
        effectiveDate: '2025-02-01',
        expiryDate: null,
        status: 'effective',
        views: 3120, 
        summary: '详细说明维修资金使用的申请条件、流程、所需材料及注意事项。',
        content: `<h3>一、使用范围</h3>
<p>住宅专项维修资金可用于以下用途：</p>
<ul>
<li>住宅共用部位的维修、更新、改造</li>
<li>共用设施设备的维修、更新、改造</li>
<li>保修期满后的维修项目</li>
</ul>

<h3>二、申请条件</h3>
<ol>
<li>维修项目属于共用部位或共用设施设备</li>
<li>保修期已满</li>
<li>经业主大会或相关业主表决通过</li>
<li>维修资金账户余额充足</li>
</ol>

<h3>三、申请流程</h3>
<div class="flow-chart">
<p><strong>第1步：提出申请</strong> → 物业服务企业或业主委员会提出使用方案</p>
<p><strong>第2步：方案公示</strong> → 在小区显著位置公示7日以上</p>
<p><strong>第3步：业主表决</strong> → 组织相关业主进行表决</p>
<p><strong>第4步：结果公示</strong> → 公示表决结果</p>
<p><strong>第5步：提交审核</strong> → 向维修资金管理部门提交申请材料</p>
<p><strong>第6步：资金划拨</strong> → 审核通过后划拨资金</p>
<p><strong>第7步：工程实施</strong> → 组织施工并验收</p>
<p><strong>第8步：费用结算</strong> → 工程验收合格后结算</p>
</div>

<h3>四、所需材料</h3>
<ul>
<li>维修资金使用申请表</li>
<li>维修更新改造方案</li>
<li>业主表决结果证明</li>
<li>维修工程预算书</li>
<li>施工单位资质证明</li>
<li>其他相关材料</li>
</ul>

<h3>五、表决要求</h3>
<table class="info-table">
<tr><th>项目类型</th><th>表决比例要求</th></tr>
<tr><td>一般维修项目</td><td>参与表决业主中专有部分面积过半数且人数过半数同意</td></tr>
<tr><td>紧急维修项目</td><td>可不经表决，但需事后公示并说明情况</td></tr>
<tr><td>大额维修项目（超过账户余额30%）</td><td>参与表决业主中专有部分面积3/4以上且人数3/4以上同意</td></tr>
</table>

<h3>六、注意事项</h3>
<ul>
<li>维修资金不得挪作他用</li>
<li>维修工程应当进行公开招标或比选</li>
<li>维修工程应当进行验收并保留资料</li>
<li>维修资金使用情况应当定期向业主公示</li>
</ul>`,
        attachments: [
          { name: '维修资金使用申请表.docx', url: '#', size: '56KB' },
          { name: '维修工程预算模板.xlsx', url: '#', size: '34KB' }
        ],
        tags: ['维修资金', '申请流程', '使用'],
        relatedPolicies: ['p1', 'p5'],
        versions: [
          { version: '1.0', date: '2025-02-01', changes: '首次发布', editor: '社区治理中心' }
        ]
      },
      { 
        id: 'p8', 
        categoryId: 'cat_cont_prop', 
        title: '物业服务合同（示范文本）', 
        type: '合同范本', 
        source: '住房和城乡建设部',
        publishDate: '2024-01-01', 
        effectiveDate: '2024-01-01',
        expiryDate: null,
        status: 'effective',
        views: 5670, 
        summary: '规范物业服务合同的主要条款，明确业主委员会与物业服务企业的权利义务。',
        content: `<h3>物业服务合同（示范文本）</h3>

<h4>甲方（委托方）：</h4>
<p>业主委员会</p>
<p>负责人：__________</p>
<p>联系地址：__________</p>

<h4>乙方（受托方）：</h4>
<p>物业服务企业</p>
<p>法定代表人：__________</p>
<p>资质等级：__________</p>
<p>联系地址：__________</p>

<h3>第一条 物业基本情况</h3>
<p>物业名称：__________</p>
<p>坐落位置：__________</p>
<p>物业类型：__________</p>
<p>建筑面积：__________平方米</p>

<h3>第二条 服务内容</h3>
<p>乙方提供的服务内容包括：</p>
<p>（一）物业共用部位、共用设施设备的日常运行、维护和管理；</p>
<p>（二）物业管理区域内的公共秩序维护和安全防范；</p>
<p>（三）物业管理区域内的清洁卫生；</p>
<p>（四）物业管理区域内的绿化养护；</p>
<p>（五）物业档案资料管理；</p>
<p>（六）其他服务事项：__________。</p>

<h3>第三条 服务标准</h3>
<p>乙方提供的服务应当符合以下标准：</p>
<p>（一）__________</p>
<p>（二）__________</p>

<h3>第四条 服务期限</h3>
<p>本合同期限为__________年，自__________年__________月__________日起至__________年__________月__________日止。</p>

<h3>第五条 物业服务费用</h3>
<p>物业服务费标准：</p>
<p>（一）住宅：__________元/月·平方米</p>
<p>（二）商业：__________元/月·平方米</p>
<p>（三）车位：__________元/月·个</p>

<h3>第六条 双方权利义务</h3>
<p>甲方权利义务：</p>
<p>（一）监督乙方的服务质量；</p>
<p>（二）按时交纳物业服务费用；</p>
<p>（三）__________</p>

<p>乙方权利义务：</p>
<p>（一）按照合同约定提供服务；</p>
<p>（二）定期向甲方报告服务情况；</p>
<p>（三）__________</p>`,
        attachments: [
          { name: '物业服务合同示范文本.docx', url: '#', size: '189KB' }
        ],
        tags: ['物业服务', '合同范本', '权利义务'],
        relatedPolicies: ['p2', 'p4'],
        versions: [
          { version: '1.0', date: '2024-01-01', changes: '首次发布', editor: '住建部' }
        ]
      },
      { 
        id: 'p9', 
        categoryId: 'cat_policy_new', 
        title: '《民法典》实施后物业管理新规解读', 
        type: '政策解读', 
        source: '社区治理中心',
        publishDate: '2025-03-01', 
        effectiveDate: '2025-03-01',
        expiryDate: null,
        status: 'effective',
        views: 1890, 
        summary: '解读《民法典》实施对物业管理活动的影响，包括业主权利、表决规则等方面的变化。',
        content: `<h3>一、《民法典》物权编对物业管理的主要影响</h3>

<h4>1. 业主共同决定事项的表决规则调整</h4>
<p><strong>变化要点：</strong></p>
<ul>
<li>参与表决门槛降低：由"双三分之二"参与表决，而非原来的"双三分之二"同意</li>
<li>一般事项通过门槛：参与表决中"双过半"同意</li>
<li>重大事项通过门槛：参与表决中"双四分之三"同意</li>
</ul>
<p><strong>实务影响：</strong>降低了业主大会召开和表决的难度，有利于提高业主参与度。</p>

<h4>2. 业主大会召开条件调整</h4>
<p><strong>变化要点：</strong></p>
<ul>
<li>临时业主大会召开条件：专有部分面积和业主人数均达20%以上可提议召开</li>
<li>取消了原有的"业主委员会不组织召开"时的救济程序限制</li>
</ul>

<h4>3. 维修资金使用规则细化</h4>
<p><strong>变化要点：</strong></p>
<ul>
<li>使用维修资金属于一般事项，参与表决中"双过半"同意即可</li>
<li>筹集维修资金属于重大事项，需要"双四分之三"同意</li>
<li>紧急情况下可不经表决使用维修资金</li>
</ul>

<h3>二、新旧规则对比</h3>
<table class="info-table">
<tr><th>事项</th><th>原规则</th><th>民法典规则</th></tr>
<tr><td>业主大会召开</td><td>双三分之二同意</td><td>双三分之二参与表决</td></tr>
<tr><td>一般事项通过</td><td>双过半同意</td><td>参与表决中双过半同意</td></tr>
<tr><td>重大事项通过</td><td>双三分之二同意</td><td>参与表决中双四分之三同意</td></tr>
<tr><td>临时会议提议</td><td>20%业主提议</td><td>双20%业主提议</td></tr>
</table>

<h3>三、实务建议</h3>
<ol>
<li>及时修订业主大会议事规则和管理规约，与民法典保持一致</li>
<li>完善业主信息登记，确保表决权计算准确</li>
<li>建立电子投票系统，提高业主参与便利性</li>
<li>加强业主委员会培训，提升依法履职能力</li>
</ol>`,
        attachments: [
          { name: '民法典物业管理解读.pdf', url: '#', size: '456KB' }
        ],
        tags: ['民法典', '政策解读', '表决规则'],
        relatedPolicies: ['p1', 'p3'],
        versions: [
          { version: '1.0', date: '2025-03-01', changes: '首次发布', editor: '社区治理中心' }
        ]
      },
      { 
        id: 'p10', 
        categoryId: 'cat_policy_case', 
        title: '典型案例：业委会未经表决动用维修资金被认定违法', 
        type: '案例分析', 
        source: '社区治理中心',
        publishDate: '2025-02-15', 
        effectiveDate: '2025-02-15',
        expiryDate: null,
        status: 'effective',
        views: 2450, 
        summary: '分析业委会未经业主大会表决擅自动用维修资金的典型案例，总结教训与启示。',
        content: `<h3>一、案例简介</h3>
<p><strong>案件背景：</strong></p>
<p>某小区业主委员会在未经业主大会表决的情况下，擅自决定使用维修资金对小区电梯进行大修，涉及金额25万元。部分业主知情后向物业管理部门投诉，要求撤销该决定并追回资金。</p>

<h3>二、争议焦点</h3>
<ol>
<li>业委会是否有权单独决定使用维修资金？</li>
<li>电梯大修是否属于紧急情况可以不经表决？</li>
<li>如何认定业主大会表决的有效性？</li>
</ol>

<h3>三、法律分析</h3>
<h4>1. 业委会的权限边界</h4>
<p>根据《民法典》第278条，使用维修资金属于业主共同决定事项，必须经业主大会表决通过。业委会作为业主大会的执行机构，无权单独决定此类重大事项。</p>

<h4>2. 紧急情况的认定</h4>
<p>根据《住宅专项维修资金管理办法》，只有在发生危及房屋安全等紧急情况时，才可不经表决使用维修资金。本案中，电梯虽需维修，但并非紧急情况，不满足不经表决的条件。</p>

<h4>3. 表决程序要求</h4>
<p>使用维修资金需要满足：</p>
<ul>
<li>专有部分面积占比三分之二以上且人数占比三分之二以上的业主参与表决</li>
<li>参与表决中专有部分面积过半数且人数过半数的业主同意</li>
</ul>

<h3>四、处理结果</h3>
<ol>
<li>物业管理部门认定业委会决定违法，予以撤销</li>
<li>责令业委会追回已拨付的资金</li>
<li>要求业委会按照法定程序重新组织业主表决</li>
<li>对业委会相关责任人进行批评教育</li>
</ol>

<h3>五、案例启示</h3>
<ol>
<li><strong>程序合规是前提</strong>：任何涉及业主共同利益的事项，必须严格按照法定程序进行</li>
<li><strong>信息公开是保障</strong>：维修资金使用方案应提前公示，保障业主知情权</li>
<li><strong>监督机制要健全</strong>：社区应加强对业委会履职的监督指导</li>
<li><strong>档案管理要规范</strong>：业主大会会议资料应完整保存，以备查验</li>
</ol>`,
        attachments: [
          { name: '案例分析报告.pdf', url: '#', size: '234KB' }
        ],
        tags: ['案例分析', '维修资金', '业委会'],
        relatedPolicies: ['p1', 'p5'],
        versions: [
          { version: '1.0', date: '2025-02-15', changes: '首次发布', editor: '社区治理中心' }
        ]
      },
      { 
        id: 'p11', 
        categoryId: 'cat_rules_parking', 
        title: '小区停车管理规定（示范文本）', 
        type: '管理规定', 
        source: '社区治理中心',
        publishDate: '2025-01-20', 
        effectiveDate: '2025-01-20',
        expiryDate: null,
        status: 'effective',
        views: 1980, 
        summary: '规范小区停车秩序，明确车位使用、收费标准及违规处理措施。',
        content: `<h3>第一章 总则</h3>
<h4>第一条 制定目的</h4>
<p>为规范本小区停车秩序，保障业主和使用人的合法权益，根据《民法典》《物业管理条例》等法律法规，结合本小区实际，制定本规定。</p>

<h3>第二章 车位管理</h3>
<h4>第二条 车位类型</h4>
<p>本小区车位分为以下类型：</p>
<ul>
<li>地下车库车位：产权车位，由业主购买或租赁</li>
<li>地面停车位：共有车位，优先满足业主需求</li>
<li>临时停车位：访客临时停车使用</li>
</ul>

<h4>第三条 车位分配原则</h4>
<p>车位分配遵循以下原则：</p>
<ol>
<li>业主优先原则：车位应首先满足本小区业主的需要</li>
<li>公平公正原则：车位分配应当公开透明</li>
<li>先到先得原则：地面共有车位按先到先得使用</li>
</ol>

<h3>第三章 停车收费</h3>
<h4>第四条 收费标准</h4>
<table class="info-table">
<tr><th>车位类型</th><th>收费标准</th></tr>
<tr><td>地下产权车位</td><td>物业费已包含</td></tr>
<tr><td>地面共有车位</td><td>___元/月</td></tr>
<tr><td>临时停车</td><td>___元/小时，每日最高___元</td></tr>
</table>

<h4>第五条 收费用途</h4>
<p>地面共有车位停车费属于全体业主共有，用于：</p>
<ul>
<li>补充专项维修资金</li>
<li>小区公共设施维护</li>
<li>业主大会决定的其他用途</li>
</ul>

<h3>第四章 停车秩序</h3>
<h4>第六条 停车规范</h4>
<ol>
<li>车辆应停放在划定的停车位内，不得占用消防通道、绿化带</li>
<li>不得擅自安装地锁、车位锁</li>
<li>不得长期停放"僵尸车"</li>
<li>货车、工程车等大型车辆不得进入小区停放</li>
</ol>

<h4>第七条 违规处理</h4>
<p>违反本规定的，物业服务企业有权：</p>
<ol>
<li>劝阻并要求改正</li>
<li>记录违规行为并公示</li>
<li>情节严重的，禁止车辆进入小区</li>
</ol>`,
        attachments: [
          { name: '停车管理规定.docx', url: '#', size: '67KB' }
        ],
        tags: ['停车管理', '车位', '收费'],
        relatedPolicies: ['p4'],
        versions: [
          { version: '1.0', date: '2025-01-20', changes: '首次发布', editor: '社区治理中心' }
        ]
      },
      { 
        id: 'p12', 
        categoryId: 'cat_guide_committee', 
        title: '业主委员会选举流程指南', 
        type: '办事指南', 
        source: '社区治理中心',
        publishDate: '2025-02-10', 
        effectiveDate: '2025-02-10',
        expiryDate: null,
        status: 'effective',
        views: 2670, 
        summary: '详细说明业主委员会选举的完整流程，包括候选人条件、选举程序等。',
        content: `<h3>一、业主委员会的组成</h3>
<p>业主委员会由业主大会选举产生，是业主大会的执行机构。业主委员会由5至11人单数组成，设主任1人、副主任1-2人。</p>

<h3>二、候选人条件</h3>
<p>业主委员会成员候选人应当符合以下条件：</p>
<ol>
<li>是本物业管理区域内的业主</li>
<li>具有完全民事行为能力</li>
<li>遵守国家法律法规和业主大会议事规则、管理规约</li>
<li>热心公益事业，责任心强，公正廉洁</li>
<li>具有一定的组织协调能力</li>
<li>书面承诺积极履行职责</li>
</ol>

<h3>三、选举流程</h3>
<div class="flow-chart">
<p><strong>第1步：成立筹备组</strong> → 由街道办事处、社区居委会、业主代表等组成</p>
<p><strong>第2步：制定选举办法</strong> → 确定候选人名额、选举方式、投票规则</p>
<p><strong>第3步：候选人推荐</strong> → 业主自荐或联名推荐</p>
<p><strong>第4步：候选人公示</strong> → 公示候选人名单及基本情况</p>
<p><strong>第5步：投票选举</strong> → 组织业主投票</p>
<p><strong>第6步：结果公示</strong> → 公示选举结果</p>
<p><strong>第7步：备案登记</strong> → 向物业管理部门备案</p>
</div>

<h3>四、投票规则</h3>
<p>业主委员会选举应当经专有部分面积占比三分之二以上的业主且人数占比三分之二以上的业主参与表决，经参与表决专有部分面积过半数的业主且参与表决人数过半数的业主同意。</p>

<h3>五、任期与换届</h3>
<ul>
<li>业主委员会每届任期不超过5年</li>
<li>任期届满前3个月，应当组织换届选举</li>
<li>换届选举前，原业主委员会继续履行职责</li>
</ul>

<h3>六、注意事项</h3>
<ol>
<li>选举过程应当公开透明，接受业主监督</li>
<li>候选人不得有欠缴物业费等不良记录</li>
<li>选举结果应当及时公示并备案</li>
<li>业主对选举结果有异议的，可向物业管理部门投诉</li>
</ol>`,
        attachments: [
          { name: '业委会选举流程图.pdf', url: '#', size: '178KB' },
          { name: '候选人推荐表.docx', url: '#', size: '34KB' }
        ],
        tags: ['业委会', '选举', '流程'],
        relatedPolicies: ['p1', 'p3'],
        versions: [
          { version: '1.0', date: '2025-02-10', changes: '首次发布', editor: '社区治理中心' }
        ]
      }
    ],
    
    userInteractions: {
      likes: { 'p1': 156, 'p2': 89, 'p3': 67, 'p4': 45, 'p5': 78 },
      favorites: {},
      comments: {
        'p1': [
          { user: '业主张先生', content: '这条规定很清楚，解决了我们小区的争议', date: '2025-03-15' }
        ]
      },
      viewHistory: [],
      searchHistory: []
    },
    
    updateLogs: [
      { id: 'log1', policyId: 'p1', date: '2025-03-01', action: '内容更新', description: '补充了民法典物权编完整条款', operator: '系统管理员' },
      { id: 'log2', policyId: 'p3', date: '2025-02-15', action: '版本更新', description: '根据民法典修订议事规则示范文本', operator: '系统管理员' }
    ]
  },

  getCategories: function() {
    return JSON.parse(JSON.stringify(this._data.categories));
  },

  getCategoryById: function(id) {
    const cat = this._data.categories.find(c => c.id === id);
    return cat ? JSON.parse(JSON.stringify(cat)) : null;
  },

  getPoliciesByCategory: function(categoryId) {
    return this._data.policies.filter(p => p.categoryId === categoryId || this.isChildCategory(p.categoryId, categoryId));
  },

  isChildCategory: function(childId, parentId) {
    const categories = this._data.categories;
    let current = categories.find(c => c.id === childId);
    while (current) {
      if (current.parentId === parentId) return true;
      current = categories.find(c => c.id === current.parentId);
    }
    return false;
  },

  getAllPolicies: function() {
    return JSON.parse(JSON.stringify(this._data.policies));
  },

  getPolicyById: function(id) {
    const policy = this._data.policies.find(p => p.id === id);
    return policy ? JSON.parse(JSON.stringify(policy)) : null;
  },

  searchPolicies: function(keyword) {
    if (!keyword) return [];
    const lowerKw = keyword.toLowerCase();
    return this._data.policies.filter(p => 
      p.title.toLowerCase().includes(lowerKw) || 
      p.content.toLowerCase().includes(lowerKw) ||
      p.summary.toLowerCase().includes(lowerKw) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerKw)))
    );
  },

  advancedSearchPolicies: function(criteria) {
    return this._data.policies.filter(p => {
      let match = true;

      if (criteria.keyword) {
        const lowerKw = criteria.keyword.toLowerCase();
        match = match && (
          p.title.toLowerCase().includes(lowerKw) || 
          p.content.toLowerCase().includes(lowerKw) ||
          p.summary.toLowerCase().includes(lowerKw) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerKw)))
        );
      }

      if (criteria.type && criteria.type !== 'all') {
        match = match && (p.type === criteria.type);
      }

      if (criteria.categoryId && criteria.categoryId !== 'all') {
        match = match && (p.categoryId === criteria.categoryId || this.isChildCategory(p.categoryId, criteria.categoryId));
      }

      if (criteria.dateFrom) {
        match = match && (new Date(p.publishDate) >= new Date(criteria.dateFrom));
      }

      if (criteria.dateTo) {
        match = match && (new Date(p.publishDate) <= new Date(criteria.dateTo));
      }

      if (criteria.status && criteria.status !== 'all') {
        match = match && (p.status === criteria.status);
      }

      return match;
    });
  },

  getInteractions: function(policyId) {
    return {
      likes: this._data.userInteractions.likes[policyId] || 0,
      isFavorite: !!this._data.userInteractions.favorites[policyId],
      comments: this._data.userInteractions.comments[policyId] || []
    };
  },

  updateLike: function(policyId, delta) {
    const current = this._data.userInteractions.likes[policyId] || 0;
    this._data.userInteractions.likes[policyId] = Math.max(0, current + delta);
    return this._data.userInteractions.likes[policyId];
  },

  toggleFavorite: function(policyId) {
    const current = !!this._data.userInteractions.favorites[policyId];
    this._data.userInteractions.favorites[policyId] = !current;
    return !current;
  },

  addComment: function(policyId, comment) {
    if (!this._data.userInteractions.comments[policyId]) {
      this._data.userInteractions.comments[policyId] = [];
    }
    this._data.userInteractions.comments[policyId].push({
      user: comment.user || '匿名用户',
      content: comment.content,
      date: new Date().toISOString().split('T')[0]
    });
    return this._data.userInteractions.comments[policyId];
  },

  addViewHistory: function(policyId) {
    const history = this._data.userInteractions.viewHistory;
    const existingIndex = history.findIndex(h => h.policyId === policyId);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift({ policyId, date: new Date().toISOString() });
    if (history.length > 20) {
      history.pop();
    }
    return history;
  },

  getViewHistory: function() {
    return this._data.userInteractions.viewHistory.map(h => ({
      ...h,
      policy: this.getPolicyById(h.policyId)
    })).filter(h => h.policy);
  },

  addSearchHistory: function(keyword) {
    const history = this._data.userInteractions.searchHistory;
    const existingIndex = history.indexOf(keyword);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    history.unshift(keyword);
    if (history.length > 10) {
      history.pop();
    }
    return history;
  },

  getSearchHistory: function() {
    return this._data.userInteractions.searchHistory;
  },

  getUpdateLogs: function(policyId) {
    if (policyId) {
      return this._data.updateLogs.filter(log => log.policyId === policyId);
    }
    return this._data.updateLogs;
  },

  getPolicyVersions: function(policyId) {
    const policy = this.getPolicyById(policyId);
    return policy ? policy.versions : [];
  },

  getHotPolicies: function(limit = 5) {
    return this._data.policies
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },

  getNewPolicies: function(limit = 5) {
    return this._data.policies
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      .slice(0, limit);
  },

  getPolicyTypes: function() {
    const types = [...new Set(this._data.policies.map(p => p.type))];
    return types.sort();
  }
};

const PolicyService = {
  getCategoryTree: function() {
    const categories = PolicyDatabase.getCategories();
    const map = {};
    const tree = [];

    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  },

  getBreadcrumbs: function(categoryId) {
    const categories = PolicyDatabase.getCategories();
    const breadcrumbs = [];
    let current = categories.find(c => c.id === categoryId);
    
    while (current) {
      breadcrumbs.unshift(current);
      current = categories.find(c => c.id === current.parentId);
    }
    
    return breadcrumbs;
  },

  getPolicyDetail: function(id) {
    const policy = PolicyDatabase.getPolicyById(id);
    if (!policy) return null;

    const interactions = PolicyDatabase.getInteractions(id);
    const category = PolicyDatabase.getCategoryById(policy.categoryId);
    const relatedPolicies = policy.relatedPolicies 
      ? policy.relatedPolicies.map(pid => PolicyDatabase.getPolicyById(pid)).filter(p => p)
      : [];
    
    return { 
      ...policy, 
      ...interactions, 
      category,
      relatedPolicies
    };
  },

  search: function(keyword) {
    PolicyDatabase.addSearchHistory(keyword);
    return PolicyDatabase.searchPolicies(keyword);
  },

  advancedSearch: function(criteria) {
    if (criteria.keyword) {
      PolicyDatabase.addSearchHistory(criteria.keyword);
    }
    return PolicyDatabase.advancedSearchPolicies(criteria);
  },

  getListByCategory: function(categoryId) {
    return PolicyDatabase.getPoliciesByCategory(categoryId);
  },

  likePolicy: function(id, isLike) {
    return PolicyDatabase.updateLike(id, isLike ? 1 : -1);
  },

  favoritePolicy: function(id) {
    return PolicyDatabase.toggleFavorite(id);
  },

  addComment: function(id, comment) {
    return PolicyDatabase.addComment(id, comment);
  },

  recordView: function(id) {
    PolicyDatabase.addViewHistory(id);
    const policy = PolicyDatabase.getPolicyById(id);
    if (policy) {
      policy.views += 1;
    }
    return policy;
  },

  getHotPolicies: function(limit) {
    return PolicyDatabase.getHotPolicies(limit);
  },

  getNewPolicies: function(limit) {
    return PolicyDatabase.getNewPolicies(limit);
  },

  getViewHistory: function() {
    return PolicyDatabase.getViewHistory();
  },

  getSearchHistory: function() {
    return PolicyDatabase.getSearchHistory();
  },

  getVersions: function(policyId) {
    return PolicyDatabase.getPolicyVersions(policyId);
  },

  getUpdateLogs: function(policyId) {
    return PolicyDatabase.getUpdateLogs(policyId);
  },

  getPolicyTypes: function() {
    return PolicyDatabase.getPolicyTypes();
  },

  checkExpiry: function() {
    const today = new Date();
    const policies = PolicyDatabase.getAllPolicies();
    return policies.filter(p => {
      if (!p.expiryDate) return false;
      const expiryDate = new Date(p.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
  },

  formatPolicyContent: function(content) {
    return content
      .replace(/<h3>/g, '<h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">')
      .replace(/<h4>/g, '<h4 class="text-base font-semibold text-gray-700 mt-4 mb-2">')
      .replace(/<p>/g, '<p class="text-sm text-gray-600 leading-relaxed mb-2">')
      .replace(/<ul>/g, '<ul class="list-disc list-inside text-sm text-gray-600 mb-2 space-y-1">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside text-sm text-gray-600 mb-2 space-y-1">')
      .replace(/<li>/g, '<li class="text-sm">')
      .replace(/<table/g, '<table class="w-full border-collapse text-sm my-4"')
      .replace(/<th/g, '<th class="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-medium"')
      .replace(/<td/g, '<td class="border border-gray-300 px-3 py-2"')
      .replace(/<strong>/g, '<strong class="font-semibold text-gray-800">');
  }
};

window.PolicyModule = {
  Database: PolicyDatabase,
  Service: PolicyService
};
