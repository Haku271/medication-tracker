// 药品数据结构
const drugs = [
  {
    id: 'paracetamol-chlorpheniramine',
    name: '氨酚黄那敏',
    onsetMinutes: 30,           // 起效时间（分钟）
    durationHours: 5,           // 效果持续时间（小时）
    minIntervalHours: 4,        // 最短间隔（小时）
    defaultDose: '1片'
  },
  {
    id: 'ibuprofen-sr',
    name: '布洛芬缓释片',
    onsetMinutes: 60,
    durationHours: 12,
    minIntervalHours: 12,
    defaultDose: '1片'
  },
  {
    id: 'paracetamol-sr',
    name: '对乙酰氨基酚缓释片',
    onsetMinutes: 60,
    durationHours: 8,
    minIntervalHours: 8,
    defaultDose: '1片'
  },
  {
    id: 'ibuprofen',
    name: '布洛芬片',
    onsetMinutes: 45,
    durationHours: 5,
    minIntervalHours: 4,
    defaultDose: '1片'
  },
  {
    id: 'paracetamol',
    name: '对乙酰氨基酚',
    onsetMinutes: 45,
    durationHours: 5,
    minIntervalHours: 4,
    defaultDose: '1片'
  }
];

export default drugs;
export const getDrugById = (id) => drugs.find(d => d.id === id);
export const getAllDrugs = () => [...drugs];
