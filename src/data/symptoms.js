// 症状选项依据《伤寒杂病论》原文所述整理
// label: 白话显示；value: 古文（用于存储与诊断匹配）；group: 分类
export const SYMPTOM_GROUPS = [
  {
    name: '寒热汗',
    symptoms: [
      { label: '怕冷（恶寒）', value: '恶寒' },
      { label: '发烧（发热）', value: '发热' },
      { label: '忽冷忽热（往来寒热）', value: '往来寒热' },
      { label: '寒战（战惕）', value: '寒战' },
      { label: '不出汗（无汗）', value: '无汗' },
      { label: '出汗（汗出）', value: '汗出' },
      { label: '大出汗（大汗）', value: '大汗' }
    ]
  },
  {
    name: '头面颈项',
    symptoms: [
      { label: '头痛', value: '头痛' },
      { label: '头项强痛', value: '头项强痛' },
      { label: '头晕（头眩）', value: '头眩' },
      { label: '眼花（目眩）', value: '目眩' },
      { label: '鼻出血（鼻衄）', value: '鼻衄' },
      { label: '嗓子痛（咽痛）', value: '咽痛' },
      { label: '嗓子干（咽干）', value: '咽干' },
      { label: '口苦', value: '口苦' },
      { label: '口干口渴（口燥渴）', value: '口燥渴' }
    ]
  },
  {
    name: '身躯肢节',
    symptoms: [
      { label: '全身痛（身疼痛）', value: '身疼痛' },
      { label: '关节痛（骨节疼痛）', value: '骨节疼痛' },
      { label: '项背僵硬（项背强）', value: '项背强' },
      { label: '肌肉酸痛', value: '肌肉酸痛' },
      { label: '身体沉重（身重）', value: '身重' },
      { label: '乏力', value: '乏力' }
    ]
  },
  {
    name: '胸肺心神',
    symptoms: [
      { label: '咳嗽（咳）', value: '咳嗽' },
      { label: '气喘（喘）', value: '喘' },
      { label: '气短（短气）', value: '短气' },
      { label: '胸胁胀满（胸胁苦满）', value: '胸胁苦满' },
      { label: '心烦', value: '心烦' },
      { label: '烦躁', value: '烦躁' },
      { label: '睡不着（不得眠）', value: '不得眠' },
      { label: '心下跳动（心下悸）', value: '心下悸' }
    ]
  },
  {
    name: '脾胃肠',
    symptoms: [
      { label: '腹胀（腹满）', value: '腹满' },
      { label: '腹痛', value: '腹痛' },
      { label: '心下痞闷（心下痞）', value: '心下痞' },
      { label: '恶心', value: '恶心' },
      { label: '呕吐', value: '呕吐' },
      { label: '打嗝（哕）', value: '哕' },
      { label: '便秘', value: '便秘' },
      { label: '拉肚子（下利）', value: '下利' },
      { label: '不想吃（不欲饮食）', value: '不欲饮食' }
    ]
  },
  {
    name: '热证危证',
    symptoms: [
      { label: '高烧（大热）', value: '大热' },
      { label: '极度口渴（大渴）', value: '大渴' },
      { label: '潮热', value: '潮热' },
      { label: '说胡话（谵语）', value: '谵语' },
      { label: '身体发黄（身黄）', value: '身黄' },
      { label: '手脚冰凉（手足逆冷）', value: '手足逆冷' },
      { label: '蜷缩卧床（蜷卧）', value: '蜷卧' },
      { label: '背部怕冷（背恶寒）', value: '背恶寒' },
      { label: '常吐口水（喜唾）', value: '喜唾' }
    ]
  }
];

// 扁平列表（向后兼容）
export const SYMPTOM_OPTIONS = SYMPTOM_GROUPS.flatMap(g => g.symptoms);

// 子集：用于新建感冒时的快速选项
export const COLD_SYMPTOM_OPTIONS = SYMPTOM_OPTIONS.filter(o =>
  ['恶寒', '发热', '无汗', '汗出', '往来寒热',
   '头痛', '头项强痛', '身疼痛', '骨节疼痛', '项背强',
   '咽痛', '咽干', '口苦', '咳嗽', '喘',
   '胸胁苦满', '心烦', '乏力', '身重', '肌肉酸痛'].includes(o.value)
);

// 古文 -> 白话显示。未登记的古文值原样返回（向后兼容旧数据）。
const SYMPTOM_LABEL_MAP = Object.fromEntries(
  SYMPTOM_OPTIONS.map(o => [o.value, o.label])
);

export function symptomLabel(value) {
  return SYMPTOM_LABEL_MAP[value] ?? value;
}

export function symptomLabels(values) {
  return (values || []).map(symptomLabel);
}
