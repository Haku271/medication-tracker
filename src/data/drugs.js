// 药品数据结构
// paracetamolPerTablet: 每片(默认剂量)含对乙酰氨基酚毫克数；无则为 null
// visible: 是否在添加服药页显示（默认 true，由 localStorage 覆盖）
// formType: 剂型，用于卡片视觉区分。sr=缓释，normal=普通，compound=复方
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
    default: return { label: '普通', bar: 'bg-gray-400', tag: 'bg-gray-200 text-gray-700' };
  }
}
