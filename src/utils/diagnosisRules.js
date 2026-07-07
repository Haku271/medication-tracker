// 症状关键词映射
export const SYMPTOMS = {
  HAN: '恶寒',
  RE: '发热',
  HAN_RE: '往来寒热',
  HAN_ZHAN: '寒战',
  CHU_HAN: '汗出',
  YAN_TONG: '咽痛',
  TOU_TONG: '头痛',
  KE_SU: '咳嗽',
  LIU_TI: '流涕',
  BI_SAI: '鼻塞',
  FA_LI: '乏力',
  JI_ROU_TONG: '肌肉酸痛',
  KE_WANG: '大渴',
  DA_HAN: '大汗',
  DA_RE: '大热',
  FU_TONG: '腹痛',
  BIAN_MI: '便秘',
  E_XIN: '恶心',
  OU_TU: '呕吐',
};

// 阶段规则（按优先级顺序）
export const DIAGNOSIS_RULES = [
  {
    stage: '少阳半表半里',
    desc: '往来寒热，胸胁苦满',
    formula: '小柴胡汤',
    priority: 1,
    match: (symptoms) => symptoms.includes('往来寒热')
  },
  {
    stage: '阳明腑证',
    desc: '腹满便结，热结旁流',
    formula: '承气汤',
    priority: 2,
    match: (symptoms) =>
      symptoms.includes('便秘') &&
      (symptoms.includes('腹痛') || symptoms.includes('发热'))
  },
  {
    stage: '阳明经证',
    desc: '大热，大汗，大渴',
    formula: '白虎汤',
    priority: 3,
    match: (symptoms) =>
      symptoms.includes('大热') ||
      (symptoms.includes('大汗') && symptoms.includes('大渴'))
  },
  {
    stage: '太阳中风',
    desc: '发热，汗出，恶风',
    formula: '桂枝汤',
    priority: 4,
    match: (symptoms) =>
      symptoms.includes('发热') && symptoms.includes('汗出')
  },
  {
    stage: '太阳表证',
    desc: '恶寒，发热，无汗',
    formula: '麻黄汤',
    priority: 5,
    match: (symptoms) =>
      symptoms.includes('恶寒') && symptoms.includes('发热')
  }
];

// 推断函数
export function diagnose(symptoms) {
  if (!symptoms || symptoms.length === 0) {
    return null;
  }

  // 按优先级排序，先匹配高优先级
  for (const rule of DIAGNOSIS_RULES) {
    if (rule.match(symptoms)) {
      return {
        stage: rule.stage,
        desc: rule.desc,
        formula: rule.formula,
        priority: rule.priority
      };
    }
  }

  return null;
}

// 根据症状历史推断当前阶段（考虑时间变化）
export function diagnoseFromHistory(entries) {
  if (!entries || entries.length === 0) return null;

  // 按时间排序
  const sortedEntries = [...entries]
    .filter(e => e.type === 'symptom')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (sortedEntries.length === 0) return null;

  // 取最新一条症状记录进行推断
  const latest = sortedEntries[sortedEntries.length - 1];
  return diagnose(latest.symptoms || []);
}
