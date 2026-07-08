<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center gap-3">
      <button @click="goBack" class="text-gray-600 hover:text-gray-900 text-xl">←</button>
      <h1 class="text-lg font-bold">添加服药</h1>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">选择药品</label>
        <div v-if="drugs.length === 0" class="text-gray-400 text-sm text-center py-4">
          暂无可选药品，请到药品管理开启
        </div>
        <div v-else class="space-y-2">
          <button v-for="drug in drugs" :key="drug.id" @click="selectedDrug = drug"
            :class="['w-full p-3 pl-4 rounded-lg border-2 text-left flex items-stretch gap-3', selectedDrug?.id === drug.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">
            <div :class="['w-1.5 rounded-full shrink-0', formTag(drug.formType).bar]"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ drug.name }}</span>
                <span :class="['shrink-0 px-2 py-0.5 rounded text-xs font-bold', formTag(drug.formType).tag]">
                  {{ formTag(drug.formType).label }}
                </span>
              </div>
              <div class="text-sm text-gray-500 mt-1">间隔: {{ drug.minIntervalHours }}小时</div>
            </div>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">剂量</label>
        <div v-if="selectedDrug" class="flex gap-2">
          <button v-for="n in [1, 2]" :key="n" @click="dose = `${n}片`"
            :class="['flex-1 py-2 rounded-lg border-2 font-medium', dose === `${n}片` ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700']">
            {{ n }}片
          </button>
        </div>
        <p v-else class="text-sm text-gray-400">请先选择药品</p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">时间</label>
        <div class="flex gap-2 mb-2">
          <button @click="timeMode = 'now'" :class="['flex-1 py-2 rounded-lg border-2', timeMode === 'now' ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">当前时间</button>
          <button @click="timeMode = 'custom'" :class="['flex-1 py-2 rounded-lg border-2', timeMode === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">自定义</button>
        </div>
        <input v-if="timeMode === 'custom'" v-model="customTime" type="datetime-local" class="w-full p-2 border border-gray-300 rounded-lg">
      </div>

      <div v-if="warning" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <p class="text-red-700 text-sm">{{ warning }}</p>
      </div>

      <div v-if="paracetamolWarning" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-amber-600">⚠️</span>
          <h3 class="font-bold text-amber-900 text-sm">对乙酰氨基酚摄入统计</h3>
        </div>
        <p class="text-amber-800 text-sm">{{ paracetamolWarning }}</p>
      </div>

      <button @click="submit" :disabled="!selectedDrug" class="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50">确认添加</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { getAllDrugs, getVisibleDrugs, formTag } from '../data/drugs.js';
import { PARACETAMOL_LIMITS, parseTabletCount } from '../utils/paracetamol.js';

const router = useRouter();
const drugs = getVisibleDrugs();
const allDrugs = getAllDrugs();

const selectedDrug = ref(null);
const dose = ref('');
const timeMode = ref('now');
const customTime = ref('');

watch(selectedDrug, (drug) => {
  dose.value = drug ? '1片' : '';
});

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const coldStartTime = (() => {
  const activeCold = coldStore.getActiveCold();
  return activeCold ? activeCold.start_time : null;
})();

if (coldStartTime) {
  customTime.value = toLocalInputValue(coldStartTime);
}

const warning = computed(() => {
  if (!selectedDrug.value) return '';
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) return '';

  const medEntries = activeCold.entries.filter(e => e.type === 'medication' && e.drug === selectedDrug.value.id);
  if (medEntries.length === 0) return '';

  const lastDose = medEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  const refTime = timeMode.value === 'custom' && customTime.value ? new Date(customTime.value) : new Date();
  const hoursSince = (refTime - new Date(lastDose.timestamp)) / (1000 * 60 * 60);
  const minInterval = selectedDrug.value.minIntervalHours;

  if (hoursSince < minInterval) {
    const remaining = Math.ceil((minInterval - hoursSince) * 10) / 10;
    return `距上次服用不足 ${minInterval} 小时，建议再等 ${remaining} 小时`;
  }
  return '';
});

// 对乙酰氨基酚摄入量统计：当本次所选药品 + 当前感冒历史中已出现 ≥2 种含该成分的药品时显示
const paracetamolWarning = computed(() => {
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) return '';

  const histMeds = activeCold.entries.filter(e => e.type === 'medication');
  const histMcg = histMeds
    .map(e => {
      const d = allDrugs.find(x => x.id === e.drug);
      return d && d.paracetamolPerTablet ? d.paracetamolPerTablet * parseTabletCount(e.dose) : 0;
    })
    .reduce((a, b) => a + b, 0);

  const sel = selectedDrug.value;
  const selMcg = sel && sel.paracetamolPerTablet ? sel.paracetamolPerTablet * parseTabletCount(dose.value || sel.defaultDose) : 0;

  const distinctParacetamolDrugs = new Set();
  histMeds.forEach(e => {
    const d = allDrugs.find(x => x.id === e.drug);
    if (d && d.paracetamolPerTablet) distinctParacetamolDrugs.add(e.drug);
  });
  if (sel && sel.paracetamolPerTablet) distinctParacetamolDrugs.add(sel.id);

  if (distinctParacetamolDrugs.size < 2) return '';

  const total = histMcg + selMcg;
  const selText = selMcg > 0 ? `（本次将再加 ${selMcg}mg）` : '';
  return `检测到 ${distinctParacetamolDrugs.size} 种含对乙酰氨基酚药物同时使用，历史累计约 ${histMcg}mg${selText}，单日上限 ${PARACETAMOL_LIMITS.daily}mg。请注意避免超量，以免肝损伤。`;
});

function goBack() { router.back(); }

function submit() {
  if (!selectedDrug.value) return;
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) { alert('没有进行中的感冒'); return; }

  const timestamp = timeMode.value === 'custom' && customTime.value ? new Date(customTime.value).toISOString() : (coldStartTime || new Date().toISOString());

  coldStore.addEntry(activeCold.id, {
    timestamp,
    type: 'medication',
    drug: selectedDrug.value.id,
    drugName: selectedDrug.value.name,
    dose: dose.value || selectedDrug.value.defaultDose
  });

  router.push('/');
}
</script>
