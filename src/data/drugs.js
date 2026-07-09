// 药品数据结构
// paracetamolPerTablet: 每片(默认剂量)含对乙酰氨基酚毫克数；无则为 null
// visible: 是否在添加服药页显示（默认 true，由 localStorage 覆盖）
// formType: 剂型，用于卡片视觉区分。sr=缓释，compound=复方，granule=颗粒，pill=丸剂，liquid=口服液，normal=普通
// category: 功效分类。antipyretic=退烧镇痛，expectorant=止咳化痰，antiasthmatic=平喘
const drugs = [
  {
    id: 'paracetamol-chlorpheniramine',
    name: '氨酚黄那敏',
    onsetMinutes: 30,           // 起效时间（分钟）
    durationHours: 5,           // 效果持续时间（小时）
    minIntervalHours: 4,        // 最短间隔（小时）
    defaultDose: '1片',
    paracetamolPerTablet: 250,
    formType: 'compound',
    category: 'antipyretic',
    visible: true
  },
  {
    id: 'ibuprofen-sr',
    name: '布洛芬缓释片',
    onsetMinutes: 60,
    durationHours: 12,
    minIntervalHours: 12,
    defaultDose: '1片',
    paracetamolPerTablet: null,
    formType: 'sr',
    category: 'antipyretic',
    visible: true
  },
  {
    id: 'paracetamol-sr',
    name: '对乙酰氨基酚缓释片',
    onsetMinutes: 60,
    durationHours: 8,
    minIntervalHours: 8,
    defaultDose: '1片',
    paracetamolPerTablet: 650,
    formType: 'sr',
    category: 'antipyretic',
    visible: true
  },
  {
    id: 'ibuprofen',
    name: '布洛芬片',
    onsetMinutes: 45,
    durationHours: 5,
    minIntervalHours: 4,
    defaultDose: '1片',
    paracetamolPerTablet: null,
    formType: 'normal',
    category: 'antipyretic',
    visible: true
  },
  {
    id: 'paracetamol',
    name: '对乙酰氨基酚',
    onsetMinutes: 45,
    durationHours: 5,
    minIntervalHours: 4,
    defaultDose: '1片',
    paracetamolPerTablet: 500,
    formType: 'normal',
    category: 'antipyretic',
    visible: true
  },
  {
    id: 'tongxuan-lifei-granule',
    name: '通宣理肺颗粒',
    onsetMinutes: 30,
    durationHours: 6,
    minIntervalHours: 4,
    defaultDose: '1袋',
    paracetamolPerTablet: null,
    formType: 'granule',
    category: 'expectorant',
    visible: true
  },
  {
    id: 'tongxuan-lifei-pill',
    name: '通宣理肺丸',
    onsetMinutes: 60,
    durationHours: 8,
    minIntervalHours: 8,
    defaultDose: '1丸',
    paracetamolPerTablet: null,
    formType: 'pill',
    category: 'expectorant',
    visible: true
  },
  {
    id: 'tongxuan-lifei-tablet',
    name: '通宣理肺片',
    onsetMinutes: 0,
    durationHours: 0,
    minIntervalHours: 0,
    defaultDose: '1片',
    paracetamolPerTablet: null,
    formType: 'normal',
    category: 'expectorant',
    visible: true
  },
  {
    id: 'tongxuan-lifei-oral',
    name: '通宣理肺口服液',
    onsetMinutes: 30,
    durationHours: 6,
    minIntervalHours: 4,
    defaultDose: '1支',
    paracetamolPerTablet: null,
    formType: 'liquid',
    category: 'expectorant',
    visible: true
  },
  {
    id: 'hanchuan-zupa',
    name: '寒喘祖帕颗粒',
    onsetMinutes: 30,
    durationHours: 6,
    minIntervalHours: 4,
    defaultDose: '1袋',
    paracetamolPerTablet: null,
    formType: 'normal',
    category: 'antiasthmatic',
    visible: true
  }
];

const STORAGE_KEY_VISIBLE = 'medication-tracker-drug-visibility';

// 从 localStorage 加载药品可见性并合并进 drugs
function loadVisibility() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISIBLE);
    if (!raw) return;
    const map = JSON.parse(raw);
    if (map && typeof map === 'object') {
      drugs.forEach(d => {
        if (typeof map[d.id] === 'boolean') d.visible = map[d.id];
      });
    }
  } catch {
    // 解析失败时忽略，使用默认可见性
  }
}

function saveVisibility() {
  const map = {};
  drugs.forEach(d => { map[d.id] = d.visible; });
  localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(map));
}

// 初始化时合并持久化的可见性
loadVisibility();

export default drugs;
export const getDrugById = (id) => drugs.find(d => d.id === id);
export const getAllDrugs = () => [...drugs];
export const getVisibleDrugs = () => drugs.filter(d => d.visible).map(d => ({ ...d }));
export function setVisible(drugId, visible) {
  const drug = drugs.find(d => d.id === drugId);
  if (!drug) return;
  drug.visible = !!visible;
  saveVisibility();
}

// 剂型标签：用于卡片视觉区分（色块 + 文字）
export function formTag(formType) {
  switch (formType) {
    case 'sr': return { label: '缓释', bar: 'bg-blue-500', tag: 'bg-blue-100 text-blue-700' };
    case 'compound': return { label: '复方', bar: 'bg-purple-500', tag: 'bg-purple-100 text-purple-700' };
    case 'granule': return { label: '颗粒', bar: 'bg-emerald-500', tag: 'bg-emerald-100 text-emerald-700' };
    case 'pill': return { label: '丸剂', bar: 'bg-amber-500', tag: 'bg-amber-100 text-amber-700' };
    case 'liquid': return { label: '口服液', bar: 'bg-sky-500', tag: 'bg-sky-100 text-sky-700' };
    default: return { label: '普通', bar: 'bg-gray-400', tag: 'bg-gray-200 text-gray-700' };
  }
}

// 功效分类
export const DRUG_CATEGORIES = [
  { id: 'antipyretic', label: '退烧镇痛', tag: 'bg-red-100 text-red-700' },
  { id: 'expectorant', label: '止咳化痰', tag: 'bg-emerald-100 text-emerald-700' },
  { id: 'antiasthmatic', label: '平喘', tag: 'bg-amber-100 text-amber-700' }
];

export function categoryMeta(category) {
  return DRUG_CATEGORIES.find(c => c.id === category);
}

// 按分类分组的可见药品
export function getVisibleDrugsByCategory() {
  return groupDrugsByCategory(getVisibleDrugs());
}

// 按分类分组的全部药品（含不可见）
export function getAllDrugsByCategory() {
  return groupDrugsByCategory([...drugs]);
}

function groupDrugsByCategory(list) {
  const groups = DRUG_CATEGORIES.map(c => ({ ...c, drugs: [] }));
  const byId = Object.fromEntries(groups.map(g => [g.id, g]));
  list.forEach(d => {
    const g = byId[d.category];
    if (g) g.drugs.push({ ...d });
  });
  return groups.filter(g => g.drugs.length > 0);
}
