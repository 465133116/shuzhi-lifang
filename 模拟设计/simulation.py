#!/usr/bin/env python3
"""
数治理方 · AI社区模拟 POC
═══════════════════════════════════════════
Level 1: 规则驱动的智能体模型 (Rule-driven ABM)
验证五因子乘法模型在社区治理中的涌现效应

实验设计：
  对照组（传统物业） vs 实验组（引入数治理方）
  500户 × 90天 × 10栋楼
  唯一变量：是否引入数治理方平台
"""

import random
import json
import math
from collections import defaultdict
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional

# ═══════════════════════════════════════════
# 全局配置
# ═══════════════════════════════════════════

SEED = 42
N_HOUSEHOLDS = 500
N_DAYS = 90
N_BUILDINGS = 10
HOUSEHOLDS_PER_BUILDING = N_HOUSEHOLDS // N_BUILDINGS

# 初始分类分布（对齐P1数据）
CLASS_DIST = {
    'F': 0.02,  # 历史复杂
    'E': 0.15,  # 对抗态度
    'A': 0.15,  # 具体争议
    'B': 0.10,  # 经济困难
    'D': 0.22,  # 惯性失约
    'C': 0.36,  # 沉默多数
}

# 分类→基础缴费概率（无平台时每个分类的天然倾向）
CLASS_BASE_PAY_PROB = {
    'F': 0.05,   # 历史复杂→极低
    'E': 0.15,   # 对抗→很低
    'A': 0.30,   # 有争议→低（问题解决前不交）
    'B': 0.20,   # 经济困难→低（真没钱）
    'D': 0.40,   # 惯性→中低（习惯性拖延）
    'C': 0.70,   # 沉默多数→中高
}

# 五因子初始值（传统物业）
TRAD_FACTOR_INIT = {
    'legitimacy':      0.12,  # 收费正当性：服务无证据，业主认为"白交钱"
    'credibility':     0.18,  # 履约可信度：报修石沉大海，闭环率低
    'value_perception': 0.10,  # 价值感知度：保洁保安"看不见"，月度无报告
    'consensus':       0.15,  # 守约共识度：业主群里都在骂，"大家都不交"
    'classification':   0.20,  # 分类精准度：一刀切催缴，把A当E对待
}

# 五因子目标值（数治理方平台介入后可达）
PLATFORM_FACTOR_TARGET = {
    'legitimacy':      0.72,  # 收费正当性：工单闭环证据链，"物业确实干了活"
    'credibility':     0.78,  # 履约可信度：高闭环率+响应时效，信任重建
    'value_perception': 0.65,  # 价值感知度：月度简报+服务日志，沉默服务被看见
    'consensus':       0.68,  # 守约共识度：数据透明化→邻里参照→社会规范
    'classification':   0.82,  # 分类精准度：双轨数据+客服分类，因人施策
}

# 因子增长速率（平台介入后每天提升的量）
FACTOR_RAMP_RATE = {
    'legitimacy':      0.015,  # 每个闭环工单累积证据
    'credibility':     0.012,  # 闭环率逐步提升
    'value_perception': 0.010,  # 月度简报效果
    'consensus':       0.008,  # 社交共识慢热
    'classification':   0.014,  # 分类信号积累
}

# 物业基础参数
PM_BASE_RESPONSE_DAYS = 5.0       # 传统：平均5天响应
PM_PLATFORM_RESPONSE_DAYS = 1.5   # 平台：平均1.5天
PM_BASE_CLOSURE_RATE = 0.38       # 传统：38%闭环
PM_PLATFORM_CLOSURE_RATE = 0.85   # 平台：85%闭环

# 事件概率（每天每户）
DAILY_COMPLAINT_PROB = 0.005       # 每天报修/投诉概率（上调以增加工单量）
DAILY_PAYMENT_CHECK_PROB = 1.0     # 每天检查是否缴费（实际按月，简化为每日概率调整）

# 社交影响参数
NEIGHBOR_INFLUENCE_WEIGHT = 0.45    # 邻居行为对个人的影响权重（上调）

# ═══════════════════════════════════════════
# Agent 定义
# ═══════════════════════════════════════════

@dataclass
class Owner:
    """业主智能体"""
    id: int
    building: int
    floor: int
    classification: str  # F/E/A/B/D/C
    
    # 动态状态
    satisfaction: float = 50.0       # 0-100，对物业满意度
    trust: float = 30.0              # 0-100，对物业的信任
    has_unresolved_issue: bool = False  # 是否有未解决的诉求
    issue_age_days: int = 0          # 诉求搁置天数
    complaints_filed: int = 0        # 历史投诉次数
    payment_promises: int = 0        # 承诺缴费次数（D类关键字段）
    promises_broken: int = 0         # 失信次数
    economic_hardship: bool = False  # 是否真有经济困难（B类标记）
    consecutive_paid: int = 0        # 连续缴费月数
    
    # 五因子感知值（每个业主对5个因子的主观感知）
    perceived_legitimacy: float = 0.12
    perceived_credibility: float = 0.18
    perceived_value_perception: float = 0.10
    perceived_consensus: float = 0.15
    perceived_classification: float = 0.20
    
    # 当月缴费状态
    paid_this_month: bool = False
    
    def total_factor_score(self) -> float:
        """五因子乘积"""
        return (self.perceived_legitimacy * 
                self.perceived_credibility * 
                self.perceived_value_perception * 
                self.perceived_consensus * 
                self.perceived_classification)
    
    def community_health(self) -> float:
        """社区健康指数 = 五因子几何平均
        几何平均保留了"任何一个因子过低都会拖垮整体"的特性，
        但不会像纯乘积那样量级崩塌。
        传统：~0.15 → 平台后：~0.73
        """
        prod = self.total_factor_score()
        return prod ** (1/5)
    
    def payment_willingness(self) -> float:
        """缴费意愿
        用几何平均的社区健康指数映射到缴费概率倍率：
        health 0.15 → 倍率~0.35（传统：只发挥35%的自然缴费倾向）
        health 0.73 → 倍率~0.95（平台：恢复到95%的自然缴费倾向）
        """
        health = self.community_health()
        # 映射：health从0.1→0.8 映射到倍率0.25→1.05
        multiplier = 0.25 + (health - 0.1) / 0.7 * 0.8
        multiplier = max(0.1, min(1.1, multiplier))
        return multiplier

@dataclass
class PropertyManagement:
    """物业管理智能体"""
    response_time_mean: float        # 平均响应天数
    closure_rate: float              # 工单闭环率
    work_orders_total: int = 0       # 总工单
    work_orders_closed: int = 0      # 已闭环
    work_orders_open: int = 0        # 进行中
    
    def process_work_order(self) -> bool:
        """处理一个工单，返回是否闭环"""
        self.work_orders_total += 1
        if random.random() < self.closure_rate:
            self.work_orders_closed += 1
            self.work_orders_open -= 1
            return True
        return False

# ═══════════════════════════════════════════
# 模拟引擎
# ═══════════════════════════════════════════

class CommunitySimulation:
    """社区模拟器"""
    
    def __init__(self, name: str, has_platform: bool, seed: int = SEED):
        self.name = name
        self.has_platform = has_platform
        self.rng = random.Random(seed + (1 if has_platform else 0))
        
        # 创建业主
        self.owners: List[Owner] = []
        self._init_owners()
        
        # 创建物业
        if has_platform:
            self.pm = PropertyManagement(
                response_time_mean=PM_PLATFORM_RESPONSE_DAYS,
                closure_rate=PM_PLATFORM_CLOSURE_RATE
            )
        else:
            self.pm = PropertyManagement(
                response_time_mean=PM_BASE_RESPONSE_DAYS,
                closure_rate=PM_BASE_CLOSURE_RATE
            )
        
        # 平台特性（实验组专用）
        self.evidence_bank: List[Dict] = []      # 工单证据记录
        self.customer_service_interventions: int = 0
        self.monthly_reports_sent: int = 0
        self.platform_factors = dict(PLATFORM_FACTOR_TARGET)  # 平台侧五因子目标值
        
        # 统计记录
        self.daily_stats: List[Dict] = []
        self.day = 0
    
    def _init_owners(self):
        """初始化业主Agent"""
        # 按分类分布分配
        class_counts = {c: int(N_HOUSEHOLDS * p) for c, p in CLASS_DIST.items()}
        # 补齐到500
        diff = N_HOUSEHOLDS - sum(class_counts.values())
        class_counts['C'] += diff
        
        classifications = []
        for c, n in class_counts.items():
            classifications.extend([c] * n)
        self.rng.shuffle(classifications)
        
        for i in range(N_HOUSEHOLDS):
            building = i // HOUSEHOLDS_PER_BUILDING + 1
            floor = (i % HOUSEHOLDS_PER_BUILDING) // 5 + 1  # 每层约5户
            cls = classifications[i]
            
            owner = Owner(
                id=i,
                building=building,
                floor=floor,
                classification=cls,
                economic_hardship=(cls == 'B' or (cls == 'D' and self.rng.random() < 0.15)),
            )
            
            # 设置初始因子值
            owner.perceived_legitimacy = TRAD_FACTOR_INIT['legitimacy'] * self.rng.uniform(0.5, 1.5)
            owner.perceived_credibility = TRAD_FACTOR_INIT['credibility'] * self.rng.uniform(0.5, 1.5)
            owner.perceived_value_perception = TRAD_FACTOR_INIT['value_perception'] * self.rng.uniform(0.5, 1.5)
            owner.perceived_consensus = TRAD_FACTOR_INIT['consensus'] * self.rng.uniform(0.5, 1.5)
            owner.perceived_classification = TRAD_FACTOR_INIT['classification'] * self.rng.uniform(0.5, 1.5)
            
            # 初始满意度根据分类微调
            if cls in ('E', 'F'):
                owner.satisfaction = self.rng.uniform(5, 25)
                owner.trust = self.rng.uniform(3, 15)
            elif cls == 'A':
                owner.satisfaction = self.rng.uniform(15, 40)
                owner.trust = self.rng.uniform(10, 30)
            elif cls == 'B':
                owner.satisfaction = self.rng.uniform(25, 50)
                owner.trust = self.rng.uniform(15, 35)
            elif cls == 'D':
                owner.satisfaction = self.rng.uniform(30, 55)
                owner.trust = self.rng.uniform(20, 40)
            else:  # C
                owner.satisfaction = self.rng.uniform(45, 70)
                owner.trust = self.rng.uniform(30, 55)
            
            self.owners.append(owner)
    
    def run(self, days: int = N_DAYS) -> List[Dict]:
        """运行模拟"""
        for day in range(days):
            self.day = day + 1
            
            # 1. 生成随机事件（报修/投诉）
            self._generate_events()
            
            # 2. 物业处理工单
            self._process_work_orders()
            
            # 3. 平台介入（实验组）
            if self.has_platform:
                self._platform_intervention()
            
            # 4. 社交影响传播
            self._social_influence()
            
            # 5. 业主更新感知因子
            self._update_perceptions()
            
            # 6. 缴费决策（每月1号集中决策 + 每日微调）
            if self.day % 30 == 1 or self.day == 1:
                self._payment_decision_batch()
            
            # 7. 记录当日统计
            self._record_stats()
            
            # 8. 月度简报（实验组）
            if self.has_platform and self.day % 30 == 0:
                self._send_monthly_report()
        
        return self.daily_stats
    
    def _generate_events(self):
        """生成报修/投诉事件"""
        for owner in self.owners:
            # 基础报修概率根据分类调整
            prob = DAILY_COMPLAINT_PROB
            if owner.classification == 'E':
                prob *= 2.5  # 对抗型更倾向投诉
            elif owner.classification == 'A':
                prob *= 2.0  # 有争议的会报修
            elif owner.satisfaction < 20:
                prob *= 1.8
            elif owner.has_unresolved_issue:
                prob *= 1.5  # 有未解决问题更容易再投诉
            
            if self.rng.random() < prob:
                owner.has_unresolved_issue = True
                owner.issue_age_days = 0
                owner.complaints_filed += 1
                self.pm.work_orders_open += 1
    
    def _process_work_orders(self):
        """物业处理工单"""
        # 处理中的工单按概率闭环
        for owner in self.owners:
            if owner.has_unresolved_issue:
                owner.issue_age_days += 1
                # 物业响应：根据响应时间分布判断今天是否处理
                response_prob = 1.0 / self.pm.response_time_mean
                if self.rng.random() < response_prob:
                    if self.pm.process_work_order():
                        owner.has_unresolved_issue = False
                        owner.issue_age_days = 0
                        # 闭环提升满意度
                        if self.has_platform:
                            owner.satisfaction = min(100, owner.satisfaction + self.rng.uniform(8, 18))
                            owner.trust = min(100, owner.trust + self.rng.uniform(5, 12))
                            # 记录证据
                            self.evidence_bank.append({
                                'day': self.day,
                                'owner_id': owner.id,
                                'classification': owner.classification,
                                'issue_age': owner.issue_age_days,
                            })
                        else:
                            # 传统物业即使闭环，业主也未必知道
                            owner.satisfaction = min(100, owner.satisfaction + self.rng.uniform(2, 8))
                            owner.trust = min(100, owner.trust + self.rng.uniform(1, 5))
                    else:
                        # 处理了但未闭环
                        pass
    
    def _platform_intervention(self):
        """数治理方平台每日干预"""
        for owner in self.owners:
            # === 客服回访 ===
            intervention_prob = 0.0
            if owner.has_unresolved_issue:
                if owner.classification == 'A':
                    intervention_prob = 0.30
                elif owner.classification == 'D' and owner.issue_age_days > 2:
                    intervention_prob = 0.25
                elif owner.classification == 'E' and owner.issue_age_days > 1:
                    intervention_prob = 0.20
                elif owner.issue_age_days > 5:
                    intervention_prob = 0.15
            
            if self.rng.random() < intervention_prob:
                self.customer_service_interventions += 1
                
                if owner.classification == 'E':
                    if self.rng.random() < 0.40:
                        owner.classification = 'A'
                        owner.perceived_classification = min(0.90,
                            owner.perceived_classification + 0.06)
                elif owner.classification == 'A':
                    owner.satisfaction = min(100, owner.satisfaction + self.rng.uniform(5, 15))
                    owner.trust = min(100, owner.trust + self.rng.uniform(3, 10))
                elif owner.classification == 'D':
                    owner.payment_promises += 1
                    # D类回访时直接有一定概率打破惯性
                    if owner.payment_promises >= 1 and self.rng.random() < 0.25:
                        owner.classification = 'C'
                        owner.perceived_consensus = min(0.85,
                            owner.perceived_consensus + 0.05)
                owner.perceived_classification = min(0.92,
                    owner.perceived_classification + self.rng.uniform(0.01, 0.03))
            
            # === D类惯性打破 ===
            if owner.classification == 'D' and owner.payment_promises >= 1:
                if self.rng.random() < 0.05:
                    owner.classification = 'C'
                    owner.perceived_consensus = min(0.85,
                        owner.perceived_consensus + 0.03)
            
            # === 问题解决后A→C转化 ===
            if (owner.classification == 'A' and not owner.has_unresolved_issue 
                and owner.consecutive_paid >= 1 and self.rng.random() < 0.15):
                owner.classification = 'C'
                owner.perceived_legitimacy = min(0.88,
                    owner.perceived_legitimacy + 0.06)
    
    def _social_influence(self):
        """社交影响：邻居行为影响个体认知"""
        # 计算每栋楼的缴费率
        building_payment = defaultdict(lambda: {'paid': 0, 'total': 0})
        building_satisfaction = defaultdict(list)
        
        for owner in self.owners:
            b = owner.building
            building_payment[b]['total'] += 1
            if owner.paid_this_month:
                building_payment[b]['paid'] += 1
            building_satisfaction[b].append(owner.satisfaction)
        
        # 邻居影响传播
        for owner in self.owners:
            b = owner.building
            rate = building_payment[b]['paid'] / max(building_payment[b]['total'], 1)
            avg_sat = sum(building_satisfaction[b]) / max(len(building_satisfaction[b]), 1)
            
            # 邻居缴费率影响守约共识度
            consensus_influence = rate * NEIGHBOR_INFLUENCE_WEIGHT
            current = owner.perceived_consensus
            # 感知滞后：业主看到的邻居行为有噪声+延迟
            noisy_rate = rate + self.rng.uniform(-0.1, 0.1)
            noisy_rate = max(0, min(1, noisy_rate))
            
            # 在平台组，数据更透明→感知更准确
            if self.has_platform:
                owner.perceived_consensus = current * 0.5 + noisy_rate * 0.5
            else:
                biased_rate = noisy_rate * 0.7
                owner.perceived_consensus = current * 0.85 + biased_rate * 0.15
    
    def _update_perceptions(self):
        """业主更新五因子感知"""
        for owner in self.owners:
            if self.has_platform:
                # 平台组：因子向平台目标值靠拢
                for factor_name in TRAD_FACTOR_INIT:
                    current = getattr(owner, f'perceived_{factor_name}')
                    target = self.platform_factors[factor_name]
                    rate = FACTOR_RAMP_RATE[factor_name]
                    # 平滑向目标移动
                    new_val = current + (target - current) * rate
                    # 加上个体差异噪声
                    new_val += self.rng.uniform(-0.005, 0.005)
                    new_val = max(0.01, min(0.95, new_val))
                    setattr(owner, f'perceived_{factor_name}', new_val)
                
                # 平台特有影响：因分类精准度提升，修正某些因子的偏差
                if owner.classification == 'A' and not owner.has_unresolved_issue:
                    # A类问题解决后，正当性感知大幅回升
                    owner.perceived_legitimacy = min(0.85, 
                        owner.perceived_legitimacy + self.rng.uniform(0.01, 0.03))
            else:
                # 传统物业：因子缓慢衰减（负面体验累积）
                for factor_name in TRAD_FACTOR_INIT:
                    current = getattr(owner, f'perceived_{factor_name}')
                    decay = 0.001 if owner.has_unresolved_issue else 0.0003
                    new_val = max(0.02, current - decay)
                    setattr(owner, f'perceived_{factor_name}', new_val)
    
    def _payment_decision_batch(self):
        """批量缴费决策（每月一次）"""
        for owner in self.owners:
            multiplier = owner.payment_willingness()
            # 基础缴费概率取决于分类
            base_prob = CLASS_BASE_PAY_PROB.get(owner.classification, 0.5)
            prob = base_prob * multiplier
            
            # 经济困难修正
            if owner.economic_hardship:
                prob *= 0.4
            
            # 如有未解决问题，降低缴费意愿
            if owner.has_unresolved_issue and owner.issue_age_days > 7:
                prob *= 0.5
            
            # 决策
            if self.rng.random() < prob:
                owner.paid_this_month = True
                owner.consecutive_paid += 1
                owner.satisfaction = min(100, owner.satisfaction + self.rng.uniform(0.5, 2))
            else:
                owner.paid_this_month = False
                owner.consecutive_paid = 0
                if owner.payment_promises > 0:
                    owner.promises_broken += 1
    
    def _send_monthly_report(self):
        """发送月度简报（实验组专用）"""
        self.monthly_reports_sent += 1
        for owner in self.owners:
            boost = 0.08 if owner.satisfaction < 30 else 0.04
            owner.perceived_value_perception = min(0.85, owner.perceived_value_perception + boost)
            owner.perceived_legitimacy = min(0.85, owner.perceived_legitimacy + boost * 0.6)
            owner.perceived_consensus = min(0.80, owner.perceived_consensus + boost * 0.3)
    
    def _record_stats(self):
        """记录当日统计数据"""
        total = len(self.owners)
        paid = sum(1 for o in self.owners if o.paid_this_month)
        satisfied = sum(1 for o in self.owners if o.satisfaction >= 60)
        has_issue = sum(1 for o in self.owners if o.has_unresolved_issue)
        
        # 分类分布
        class_dist = defaultdict(int)
        for o in self.owners:
            class_dist[o.classification] += 1
        
        # 五因子均值
        factor_means = {}
        for f in ['legitimacy', 'credibility', 'value_perception', 'consensus', 'classification']:
            vals = [getattr(o, f'perceived_{f}') for o in self.owners]
            factor_means[f] = sum(vals) / len(vals)
        
        # 平均满意度
        avg_satisfaction = sum(o.satisfaction for o in self.owners) / total
        avg_trust = sum(o.trust for o in self.owners) / total
        
        # 物业指标
        if self.pm.work_orders_total > 0:
            pm_closure = self.pm.work_orders_closed / self.pm.work_orders_total
        else:
            pm_closure = 0
        
        stat = {
            'day': self.day,
            'payment_rate': paid / total,
            'satisfaction_rate': satisfied / total,
            'avg_satisfaction': round(avg_satisfaction, 2),
            'avg_trust': round(avg_trust, 2),
            'unresolved_rate': has_issue / total,
            'pm_closure_rate': round(pm_closure, 3),
            'work_orders_total': self.pm.work_orders_total,
            'work_orders_closed': self.pm.work_orders_closed,
            'work_orders_open': self.pm.work_orders_open,
            'class_dist': dict(class_dist),
            'factor_means': factor_means,
            'interventions': self.customer_service_interventions if self.has_platform else 0,
            'reports_sent': self.monthly_reports_sent,
            'evidence_count': len(self.evidence_bank),
        }
        self.daily_stats.append(stat)


# ═══════════════════════════════════════════
# 主程序
# ═══════════════════════════════════════════

def run_comparison():
    """运行A/B对照实验"""
    print("=" * 60)
    print("  数治理方 · AI社区模拟 POC")
    print("  A/B对照实验：传统物业 vs 引入数治理方")
    print(f"  {N_HOUSEHOLDS}户 × {N_DAYS}天 × {N_BUILDINGS}栋楼")
    print("=" * 60)
    print()
    
    # 运行对照组
    print("🔴 运行对照组（传统物业）...")
    control = CommunitySimulation("传统物业", has_platform=False, seed=SEED)
    control_stats = control.run(N_DAYS)
    print(f"   完成。最终缴费率: {control_stats[-1]['payment_rate']:.1%}")
    
    print()
    
    # 运行实验组
    print("🟢 运行实验组（引入数治理方）...")
    treatment = CommunitySimulation("数治理方", has_platform=True, seed=SEED)
    treatment_stats = treatment.run(N_DAYS)
    print(f"   完成。最终缴费率: {treatment_stats[-1]['payment_rate']:.1%}")
    
    print()
    print("=" * 60)
    print("  模拟完成，生成对比报告...")
    print("=" * 60)
    
    return control_stats, treatment_stats


def print_summary(control_stats, treatment_stats):
    """打印对比摘要"""
    cs = control_stats[-1]
    ts = treatment_stats[-1]
    
    def delta_str(c, t):
        d = t - c
        sign = '+' if d >= 0 else ''
        return f"{sign}{d:.1%}"
    
    print()
    print("┌─────────────────────────────────────────────────────────────┐")
    print("│                    90天 A/B对照实验结果                       │")
    print("├──────────────────────┬──────────┬──────────┬────────────────┤")
    print("│        指标           │ 传统物业  │ 数治理方  │     变化       │")
    print("├──────────────────────┼──────────┼──────────┼────────────────┤")
    print(f"│ 物业费缴纳率          │  {cs['payment_rate']:7.1%} │  {ts['payment_rate']:7.1%} │ {delta_str(cs['payment_rate'], ts['payment_rate']):>10}     │")
    print(f"│ 业主满意度(均值)       │  {cs['avg_satisfaction']:6.1f}  │  {ts['avg_satisfaction']:6.1f}  │ {'+' if ts['avg_satisfaction']>=cs['avg_satisfaction'] else ''}{ts['avg_satisfaction']-cs['avg_satisfaction']:+6.1f}     │")
    print(f"│ 业主信任度(均值)       │  {cs['avg_trust']:6.1f}  │  {ts['avg_trust']:6.1f}  │ {'+' if ts['avg_trust']>=cs['avg_trust'] else ''}{ts['avg_trust']-cs['avg_trust']:+6.1f}     │")
    print(f"│ 满意度≥60占比          │  {cs['satisfaction_rate']:7.1%} │  {ts['satisfaction_rate']:7.1%} │ {delta_str(cs['satisfaction_rate'], ts['satisfaction_rate']):>10}     │")
    print(f"│ 未解决诉求率           │  {cs['unresolved_rate']:7.1%} │  {ts['unresolved_rate']:7.1%} │ {(ts['unresolved_rate']-cs['unresolved_rate']):+8.1%}     │")
    print(f"│ 物业工单闭环率         │  {cs['pm_closure_rate']:7.1%} │  {ts['pm_closure_rate']:7.1%} │ {delta_str(cs['pm_closure_rate'], ts['pm_closure_rate']):>10}     │")
    print(f"│ 工单总数               │  {cs['work_orders_total']:6d}  │  {ts['work_orders_total']:6d}  │ {'+' if ts['work_orders_total']>=cs['work_orders_total'] else ''}{ts['work_orders_total']-cs['work_orders_total']:+6d}     │")
    print(f"│ 客服介入次数           │    N/A   │  {ts['interventions']:6d}  │        —       │")
    print(f"│ 月度简报发送            │    N/A   │  {ts['reports_sent']:6d}  │        —       │")
    print(f"│ 工单证据记录            │    N/A   │  {ts['evidence_count']:6d}  │        —       │")
    print("├──────────────────────┴──────────┴──────────┴────────────────┤")
    
    # 五因子对比
    print("│                      五因子均值对比                           │")
    print("├──────────────────────┬──────────┬──────────┬────────────────┤")
    for f_name, f_label in [('legitimacy','收费正当性'), ('credibility','履约可信度'), 
                              ('value_perception','价值感知度'), ('consensus','守约共识度'), 
                              ('classification','分类精准度')]:
        cv = cs['factor_means'][f_name]
        tv = ts['factor_means'][f_name]
        print(f"│ {f_label:20s} │  {cv:7.4f} │  {tv:7.4f} │ {'+' if tv>=cv else ''}{tv-cv:+8.4f}     │")
    
    # 五因子乘积
    c_prod = 1.0
    t_prod = 1.0
    for f in ['legitimacy','credibility','value_perception','consensus','classification']:
        c_prod *= cs['factor_means'][f]
        t_prod *= ts['factor_means'][f]
    print(f"│ {'五因子乘积':20s} │  {c_prod:7.6f} │  {t_prod:7.6f} │ ×{t_prod/c_prod:7.1f}倍     │")
    
    print("├──────────────────────┴──────────┴──────────┴────────────────┤")
    
    # 分类分布变化
    print("│                      分类分布变化                              │")
    print("├──────────┬──────────┬──────────┬──────────┬─────────────────┤")
    print("│   分类    │ 初始占比  │ 传统·最终 │ 平台·最终 │     迁移        │")
    print("├──────────┼──────────┼──────────┼──────────┼─────────────────┤")
    for cls in ['F','E','A','B','D','C']:
        init_pct = CLASS_DIST[cls] * 100
        c_pct = cs['class_dist'].get(cls, 0) / N_HOUSEHOLDS * 100
        t_pct = ts['class_dist'].get(cls, 0) / N_HOUSEHOLDS * 100
        diff = t_pct - c_pct
        arrow = '↑' if diff > 1 else ('↓' if diff < -1 else '→')
        print(f"│  {cls:6s}   │  {init_pct:5.1f}%  │  {c_pct:5.1f}%  │  {t_pct:5.1f}%  │ {arrow} {diff:+5.1f}%        │")
    
    print("└──────────┴──────────┴──────────┴──────────┴─────────────────┘")
    print()
    
    # 关键发现
    print("📊 关键发现：")
    print(f"  • 五因子乘积提升 {t_prod/c_prod:.1f} 倍（{c_prod:.6f} → {t_prod:.6f}）")
    print(f"  • 缴费率提升 {ts['payment_rate']-cs['payment_rate']:.1%}（{cs['payment_rate']:.1%} → {ts['payment_rate']:.1%}）")
    d_change = (ts['class_dist'].get('D',0) - cs['class_dist'].get('D',0)) / N_HOUSEHOLDS
    e_change = (ts['class_dist'].get('E',0) - cs['class_dist'].get('E',0)) / N_HOUSEHOLDS
    print(f"  • D类(惯性失约)变化: {d_change:+.1%}")
    print(f"  • E类(对抗态度)变化: {e_change:+.1%}")
    print(f"  • 客服累计介入 {ts['interventions']} 次，工单闭环 {ts['work_orders_closed']} 单")
    print(f"  • 工单证据累积 {ts['evidence_count']} 条")
    print()


if __name__ == '__main__':
    random.seed(SEED)
    cs, ts = run_comparison()
    print_summary(cs, ts)
    
    # 输出JSON供后续分析
    output = {
        'config': {'n_households': N_HOUSEHOLDS, 'n_days': N_DAYS, 'seed': SEED},
        'control': {'final': cs[-1], 'history': cs},
        'treatment': {'final': ts[-1], 'history': ts},
    }
    
    import os
    out_dir = os.path.join(os.path.dirname(__file__), '..', '模拟设计')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'simulation_results.json')
    
    # 简化输出（去掉history中的详细daily stats以减少文件大小）
    output['control']['history'] = [{k: v for k, v in d.items() if k != 'class_dist'} for d in cs]
    output['treatment']['history'] = [{k: v for k, v in d.items() if k != 'class_dist'} for d in ts]
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"📁 详细结果已保存至: {out_path}")
