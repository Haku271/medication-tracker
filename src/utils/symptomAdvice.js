import { DRUG_STATUS, calculateDrugStatus } from '../composables/useDrugStatus.js';
import mapData from '../data/symptomMedication.json';
import { symptomLabel } from '../data/symptoms.js';

export const ADVICE_LEVEL = {
  SEE_DOCTOR: 'seeDoctor',        // 危险：就医
  NEEDS_DRUG: 'needsDrug',        // 常备药：需 XX 药
  NEEDS_CONSULT: 'needsConsult',  // 非常备药：需辨证就医
  SELF_RESOLVING: 'selfResolving' // 自愈随主解：护理建议
};

export const GROUP_META = {
  seeDoctor:     { title: '需尽快就医',   icon: '🚑', bubble: 'bg-red-500',   card: 'bg-red-50 border-red-200',     text: 'text-red-700' },
  needsDrug:     { title: '建议用药',     icon: '⚠️', bubble: 'bg-orange-500', card: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  needsConsult:  { title: '需辨证就医',   icon: '🩺', bubble: 'bg-gray-500',   card: 'bg-gray-50 border-gray-200',   text: 'text-gray-700' },
  selfResolving: { title: '护理建议',     icon: '🌿', bubble: 'bg-green-600',  card: 'bg-green-50 border-green-200', text: 'text-green-700' }
};

function buildReverseCovers() {
  const reverse = {};
  for (const drugId in mapData.drugCovers) {
    for (const symptom of mapData.drugCovers[drugId]) {
      if (!reverse[symptom]) reverse[symptom] = [];
      reverse[symptom].push(drugId);
    }
  }
  return reverse;
}

const REVERSE_COVERS = buildReverseCovers();

function activeDrugIds(drugStatuses) {
  const ids = [];
  for (const drugId in drugStatuses) {
    const s = drugStatuses[drugId].status;
    if (s === DRUG_STATUS.ACTIVE || s === DRUG_STATUS.PENDING) {
      ids.push(drugId);
    }
  }
  return ids;
}

function isCovered(symptom, activeIds) {
  const drugIds = REVERSE_COVERS[symptom];
  if (!drugIds) return false;
  return drugIds.some(id => activeIds.includes(id));
}

function reasonFor(symptom, level, activeIds) {
  const drugIds = REVERSE_COVERS[symptom];
  const hasCover = drugIds && drugIds.length > 0;

  if (!hasCover) {
    if (level === ADVICE_LEVEL.NEEDS_DRUG) {
      return '现有库存药品未含对应成分，建议另备对症常备药';
    }
    return '该症状需辨证施治，常见成药难以套用';
  }

  if (activeIds.length === 0) {
    return '暂无相关服药记录';
  }
  return '已服药品暂未生效或已过效期，未能覆盖该症状';
}

export function buildSymptomAdvice(entries, drugStatuses) {
  if (!entries || entries.length === 0) return { groups: [], topSymptoms: [] };

  const sorted = [...entries]
    .filter(e => e.type === 'symptom' && e.symptoms)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const seen = new Set();
  const latest = [];
  for (const entry of sorted) {
    for (const s of entry.symptoms) {
      if (seen.has(s)) continue;
      seen.add(s);
      latest.push(s);
    }
  }

  if (latest.length === 0) return { groups: [], topSymptoms: [] };

  const activeIds = activeDrugIds(drugStatuses || {});
  const collected = { seeDoctor: [], needsDrug: [], needsConsult: [], selfResolving: [] };

  for (const symptom of latest) {
    if (isCovered(symptom, activeIds)) continue;

    let level, message;
    if (mapData.seeDoctor.includes(symptom)) {
      level = ADVICE_LEVEL.SEE_DOCTOR;
      message = '此为危重症状，请尽快就诊';
    } else if (mapData.needsDrug[symptom]) {
      level = ADVICE_LEVEL.NEEDS_DRUG;
      message = mapData.needsDrug[symptom];
    } else if (mapData.needsConsult.includes(symptom)) {
      level = ADVICE_LEVEL.NEEDS_CONSULT;
      message = '常见成药难以应对，需医生辨证后用药';
    } else if (mapData.selfResolving[symptom]) {
      level = ADVICE_LEVEL.SELF_RESOLVING;
      message = mapData.selfResolving[symptom];
    } else {
      continue;
    }

    collected[level].push({
      symptom,
      label: symptomLabel(symptom),
      message,
      reason: reasonFor(symptom, level, activeIds)
    });
  }

  const groupOrder = [
    ADVICE_LEVEL.SEE_DOCTOR,
    ADVICE_LEVEL.NEEDS_DRUG,
    ADVICE_LEVEL.NEEDS_CONSULT,
    ADVICE_LEVEL.SELF_RESOLVING
  ];
  const groups = groupOrder
    .map(level => ({ level, items: collected[level] }))
    .filter(g => g.items.length > 0);

  return { groups, topSymptoms: latest };
}
