// 症状关键词映射（依据《伤寒杂病论》条文）
export const SYMPTOMS = {
  HAN: '恶寒',
  RE: '发热',
  HAN_RE: '往来寒热',
  HAN_ZHAN: '寒战',
  WU_HAN: '无汗',
  CHU_HAN: '汗出',
  DA_HAN: '大汗',
  TOU_TONG: '头痛',
  XIANG_QIANG: '头项强痛',
  XUAN: '头眩',
  MU_XUAN: '目眩',
  Nv: '鼻衄',
  YAN_TONG: '咽痛',
  YAN_GAN: '咽干',
  KOU_KU: '口苦',
  KOU_ZAO_KE: '口燥渴',
  SHEN_TONG: '身疼痛',
  GU_JIE_TONG: '骨节疼痛',
  XIANG_BEI_QIANG: '项背强',
  JI_ROU_TONG: '肌肉酸痛',
  SHEN_ZHONG: '身重',
  FA_LI: '乏力',
  KE_SU: '咳嗽',
  CHUAN: '喘',
  DUAN_QI: '短气',
  XIONG_XIE: '胸胁苦满',
  XIN_FAN: '心烦',
  ZAO: '烦躁',
  BU_DE_MEI: '不得眠',
  XIN_XIA_JI: '心下悸',
  FU_MAN: '腹满',
  FU_TONG: '腹痛',
  XIN_XIA_PI: '心下痞',
  E_XIN: '恶心',
  OU_TU: '呕吐',
  YUE: '哕',
  BIAN_MI: '便秘',
  XIA_LI: '下利',
  BU_YU_SHI: '不欲饮食',
  DA_RE: '大热',
  DA_KE: '大渴',
  CHAO_RE: '潮热',
  ZHAN_YU: '谵语',
  SHEN_HUANG: '身黄',
  NI_LENG: '手足逆冷',
  QUAN_WO: '蜷卧',
  BEI_HAN: '背恶寒',
  XI_TUO: '喜唾',
};

// 阶段规则（按优先级顺序，依《伤寒杂病论》六经辨证）
export const DIAGNOSIS_RULES = [
  {
    stage: '少阳半表半里',
    desc: '口苦咽干目眩，往来寒热，胸胁苦满',
    formula: '小柴胡汤',
    priority: 1,
    match: (s) =>
      s.includes('口苦') || s.includes('往来寒热') ||
      (s.includes('胸胁苦满') && s.includes('不欲饮食'))
  },
  {
    stage: '阳明腑证',
    desc: '腹满便结，潮热谵语',
    formula: '承气汤',
    priority: 2,
    match: (s) =>
      s.includes('便秘') &&
      (s.includes('腹满') || s.includes('潮热') || s.includes('谵语') || s.includes('发热'))
  },
  {
    stage: '阳明经证',
    desc: '大热，大汗，大渴',
    formula: '白虎汤',
    priority: 3,
    match: (s) =>
      s.includes('大热') ||
      (s.includes('大汗') && s.includes('大渴')) ||
      (s.includes('口燥渴') && s.includes('大汗'))
  },
  {
    stage: '太阳中风',
    desc: '发热，汗出，恶风',
    formula: '桂枝汤',
    priority: 4,
    match: (s) =>
      s.includes('发热') && s.includes('汗出')
  },
  {
    stage: '太阳伤寒表证',
    desc: '恶寒，发热，无汗，身疼痛',
    formula: '麻黄汤',
    priority: 5,
    match: (s) =>
      s.includes('恶寒') && s.includes('发热') &&
      (s.includes('无汗') || s.includes('身疼痛') || s.includes('头项强痛'))
  },
  {
    stage: '太阴病',
    desc: '腹满而吐，食不下，自利益甚',
    formula: '理中汤',
    priority: 6,
    match: (s) =>
      s.includes('腹满') && (s.includes('下利') || s.includes('不欲饮食') || s.includes('呕吐'))
  },
  {
    stage: '少阴病',
    desc: '脉微细，但欲寐，恶寒蜷卧',
    formula: '四逆汤',
    priority: 7,
    match: (s) =>
      (s.includes('蜷卧') || s.includes('背恶寒')) &&
      (s.includes('恶寒') || s.includes('乏力') || s.includes('手足逆冷'))
  },
  {
    stage: '厥阴病',
    desc: '消渴，气上撞心，饥不欲食，食则吐蛔',
    formula: '乌梅丸',
    priority: 8,
    match: (s) =>
      (s.includes('口燥渴') || s.includes('大渴')) &&
      s.includes('不欲饮食') &&
      (s.includes('呕吐') || s.includes('腹痛'))
  },
  {
    stage: '霍乱',
    desc: '呕吐而利，发热恶寒，身疼痛',
    formula: '五苓散/理中丸',
    priority: 9,
    match: (s) =>
      s.includes('呕吐') && s.includes('下利') &&
      (s.includes('发热') || s.includes('恶寒'))
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
