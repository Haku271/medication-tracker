<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center gap-3">
      <button @click="goBack" class="text-gray-600 hover:text-gray-900 text-xl">←</button>
      <h1 class="text-lg font-bold">添加服药</h1>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">选择药品</label>
        <div class="space-y-2">
          <button v-for="drug in drugs" :key="drug.id" @click="selectedDrug = drug"
            :class="['w-full p-3 rounded-lg border-2 text-left', selectedDrug?.id === drug.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">
            <div class="font-medium">{{ drug.name }}</div>
            <div class="text-sm text-gray-500 mt-1">间隔: {{ drug.minIntervalHours }}小时</div>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">剂量</label>
        <input v-model="dose" type="text" :placeholder="selectedDrug ? selectedDrug.defaultDose : '1片'" class="w-full p-2 border border-gray-300 rounded-lg">
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

      <button @click="submit" :disabled="!selectedDrug" class="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50">确认添加</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { getAllDrugs } from '../data/drugs.js';

const router = useRouter();
const drugs = getAllDrugs();

const selectedDrug = ref(null);
const dose = ref('');
const timeMode = ref('now');
const customTime = ref('');

const warning = computed(() => {
  if (!selectedDrug.value) return '';
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) return '';

  const medEntries = activeCold.entries.filter(e => e.type === 'medication' && e.drug === selectedDrug.value.id);
  if (medEntries.length === 0) return '';

  const lastDose = medEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  const hoursSince = (new Date() - new Date(lastDose.timestamp)) / (1000 * 60 * 60);
  const minInterval = selectedDrug.value.minIntervalHours;

  if (hoursSince < minInterval) {
    const remaining = Math.ceil((minInterval - hoursSince) * 10) / 10;
    return `距上次服用不足 ${minInterval} 小时，建议再等 ${remaining} 小时`;
  }
  return '';
});

function goBack() { router.back(); }

function submit() {
  if (!selectedDrug.value) return;
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) { alert('没有进行中的感冒'); return; }

  const timestamp = timeMode.value === 'custom' && customTime.value ? new Date(customTime.value).toISOString() : new Date().toISOString();

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
