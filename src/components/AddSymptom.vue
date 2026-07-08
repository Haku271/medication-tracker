<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center gap-3">
      <button @click="goBack" class="text-gray-600 hover:text-gray-900 text-xl">←</button>
      <h1 class="text-lg font-bold">添加症状</h1>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-gray-700">症状</label>
          <span v-if="selectedSymptoms.length > 0" class="text-xs text-gray-400">已选 {{ selectedSymptoms.length }} 项</span>
        </div>
        <div class="space-y-3">
          <div v-for="group in symptomGroups" :key="group.name">
            <div class="text-xs text-gray-400 mb-1">{{ group.name }}</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="symptom in group.symptoms"
                :key="symptom.value"
                @click="toggleSymptom(symptom.value)"
                :class="['px-3 py-2 rounded-full text-sm border transition-all',
                  selectedSymptoms.includes(symptom.value)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200']"
              >
                {{ symptom.label }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="selectedSymptoms.length > 0" class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="symptom in selectedSymptoms"
              :key="symptom"
              @click="toggleSymptom(symptom)"
              class="px-2.5 py-1 rounded-full text-sm bg-blue-100 border border-blue-500 text-blue-700 cursor-pointer"
            >
              {{ symptomLabel(symptom) }} ×
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-3">体温（可选）</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in temperatureOptions"
            :key="opt.value"
            type="button"
            @click="temperature = temperature === opt.value ? '' : opt.value"
            :class="['px-3 py-2 rounded-full text-sm border transition-all',
              temperature === opt.value
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200']"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">时间</label>
        <div class="flex gap-2 mb-2">
          <button @click="timeMode = 'now'" :class="['flex-1 py-2 px-4 rounded-lg border-2', timeMode === 'now' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200']">当前时间</button>
          <button @click="timeMode = 'custom'" :class="['flex-1 py-2 px-4 rounded-lg border-2', timeMode === 'custom' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200']">自定义</button>
        </div>
        <input v-if="timeMode === 'custom'" v-model="customTime" type="datetime-local" class="w-full p-2 border border-gray-300 rounded-lg">
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
        <textarea v-model="notes" rows="3" class="w-full p-2 border border-gray-300 rounded-lg resize-none" placeholder="添加备注..."></textarea>
      </div>

      <button @click="submit" :disabled="selectedSymptoms.length === 0 && !temperature" class="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50">添加记录</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { SYMPTOM_GROUPS, symptomLabel } from '../data/symptoms.js';

const router = useRouter();
const symptomGroups = SYMPTOM_GROUPS;

const selectedSymptoms = ref([]);
const temperature = ref('');
const timeMode = ref('now');
const customTime = ref('');
const notes = ref('');

function toggleSymptom(symptom) {
  const idx = selectedSymptoms.value.indexOf(symptom);
  if (idx > -1) { selectedSymptoms.value.splice(idx, 1); }
  else { selectedSymptoms.value.push(symptom); }
}

function goBack() { router.back(); }

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

function submit() {
  const activeCold = coldStore.getActiveCold();
  if (!activeCold) { alert('没有进行中的感冒'); return; }

  const timestamp = timeMode.value === 'custom' && customTime.value ? new Date(customTime.value).toISOString() : (coldStartTime || new Date().toISOString());

  if (selectedSymptoms.value.length > 0) {
    coldStore.addEntry(activeCold.id, { timestamp, type: 'symptom', symptoms: [...selectedSymptoms.value], notes: notes.value });
  }

  if (temperature.value) {
    coldStore.addEntry(activeCold.id, { timestamp, type: 'temperature', value: parseFloat(temperature.value), unit: 'celsius', notes: notes.value });
  }

  router.push('/');
}
</script>
