import { computed } from 'vue';
import { getDrugById } from '../data/drugs.js';

// 状态常量
export const DRUG_STATUS = {
  PENDING: 'pending',     // 待生效
  ACTIVE: 'active',       // 生效中
  INTERVAL: 'interval',   // 间隔期
  READY: 'ready'          // 可服用
};

/**
 * 计算单个药品当前状态
 * @param {string} drugId - 药品ID
 * @param {Array} medications - 该药品的服药记录 [{timestamp, dose}]
 * @param {Date} now - 当前时间（用于测试）
 * @returns {Object} 状态信息
 */
export function calculateDrugStatus(drugId, medications, now = new Date()) {
  const drug = getDrugById(drugId);
  if (!drug) {
    throw new Error(`未知药品: ${drugId}`);
  }

  // 无服药记录
  if (!medications || medications.length === 0) {
    return {
      status: DRUG_STATUS.READY,
      drugId,
      drugName: drug.name,
      message: '可服用',
      nextDoseTime: null,
      timeRemaining: null
    };
  }

  // 按时间排序，取最近一次
  const sorted = [...medications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const lastDose = sorted[0];
  const lastTime = new Date(lastDose.timestamp);

  // 计算关键时间点
  const onsetTime = new Date(lastTime.getTime() + drug.onsetMinutes * 60 * 1000);
  const expireTime = new Date(lastTime.getTime() + drug.durationHours * 60 * 60 * 1000);
  const nextDoseTime = new Date(lastTime.getTime() + drug.minIntervalHours * 60 * 60 * 1000);

  // 判断状态
  if (now < onsetTime) {
    // 待生效
    const minutesUntil = Math.ceil((onsetTime - now) / (60 * 1000));
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;

    return {
      status: DRUG_STATUS.PENDING,
      drugId,
      drugName: drug.name,
      message: `还有 ${hours > 0 ? hours + '小时' : ''}${mins}分钟生效`,
      timeRemaining: minutesUntil,
      nextDoseTime: nextDoseTime.toISOString(),
      lastDoseTime: lastDose.timestamp,
      onsetTime: onsetTime.toISOString(),
      expireTime: expireTime.toISOString()
    };
  }

  if (now < expireTime) {
    // 生效中
    const minutesLeft = Math.ceil((expireTime - now) / (60 * 1000));
    const hours = Math.floor(minutesLeft / 60);
    const mins = minutesLeft % 60;

    return {
      status: DRUG_STATUS.ACTIVE,
      drugId,
      drugName: drug.name,
      message: `生效中，还剩 ${hours > 0 ? hours + '小时' : ''}${mins}分钟`,
      timeRemaining: minutesLeft,
      nextDoseTime: nextDoseTime.toISOString(),
      lastDoseTime: lastDose.timestamp,
      onsetTime: onsetTime.toISOString(),
      expireTime: expireTime.toISOString()
    };
  }

  if (now < nextDoseTime) {
    // 间隔期
    const minutesUntil = Math.ceil((nextDoseTime - now) / (60 * 1000));
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;

    const formatTime = (d) => {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return {
      status: DRUG_STATUS.INTERVAL,
      drugId,
      drugName: drug.name,
      message: `距离下次可服还有 ${hours > 0 ? hours + '小时' : ''}${mins}分钟`,
      timeRemaining: minutesUntil,
      nextDoseTime: nextDoseTime.toISOString(),
      nextDoseTimeFormatted: formatTime(nextDoseTime),
      lastDoseTime: lastDose.timestamp,
      onsetTime: onsetTime.toISOString(),
      expireTime: expireTime.toISOString()
    };
  }

  // 可服用
  return {
    status: DRUG_STATUS.READY,
    drugId,
    drugName: drug.name,
    message: '可服用',
    timeRemaining: 0,
    nextDoseTime: null,
    lastDoseTime: lastDose.timestamp,
    onsetTime: onsetTime.toISOString(),
    expireTime: expireTime.toISOString()
  };
}

/**
 * Vue composable - 监控多个药品状态
 * @param {Object} cold - 当前感冒记录（包含 entries）
 * @returns {Object} 响应式状态
 */
export function useDrugStatus(cold) {

  const drugStatuses = computed(() => {
    const entries = cold?.value?.entries || cold?.entries || [];

    // 收集各药品的服药记录
    const drugMedications = {};

    for (const entry of entries) {
      if (entry.type === 'medication' && entry.drug) {
        if (!drugMedications[entry.drug]) {
          drugMedications[entry.drug] = [];
        }
        drugMedications[entry.drug].push({
          timestamp: entry.timestamp,
          dose: entry.dose
        });
      }
    }

    // 计算每个药品的状态
    const statuses = {};
    for (const drugId in drugMedications) {
      statuses[drugId] = calculateDrugStatus(drugId, drugMedications[drugId]);
    }

    return statuses;
  });

  return {
    drugStatuses
  };
}
