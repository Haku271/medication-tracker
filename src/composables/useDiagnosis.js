import { computed } from 'vue';
import { diagnoseFromHistory } from '../utils/diagnosisRules.js';

export function useDiagnosis(entries) {
  // 推断当前阶段
  const currentDiagnosis = computed(() => {
    if (!entries || entries.value === undefined) return null;
    const entriesList = entries.value || entries;
    return diagnoseFromHistory(entriesList);
  });

  // 诊断历史（按时间顺序）
  const diagnosisHistory = computed(() => {
    const entriesList = entries.value || entries;
    if (!entriesList) return [];

    const history = [];
    const seen = new Set();

    for (const entry of entriesList) {
      if (entry.type !== 'symptom') continue;

      const diagnosis = diagnose(entry.symptoms || []);
      if (diagnosis && !seen.has(diagnosis.stage)) {
        seen.add(diagnosis.stage);
        history.push({
          ...diagnosis,
          timestamp: entry.timestamp
        });
      }
    }

    return history;
  });

  return {
    currentDiagnosis,
    diagnosisHistory
  };
}
