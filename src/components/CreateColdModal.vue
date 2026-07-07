<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="cancel">
    <div class="bg-white rounded-xl p-6 w-11/12 max-w-md mx-4 shadow-xl">
      <h2 class="text-xl font-bold mb-4 text-gray-800">创建新感冒</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
        <div class="flex gap-2">
          <button
            @click="useNow"
            :class="['flex-1 py-2 px-4 rounded-lg border-2 transition-colors',
              timeMode === 'now' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300']"
          >
            当前时间
          </button>
          <button
            @click="timeMode = 'custom'"
            :class="['flex-1 py-2 px-4 rounded-lg border-2 transition-colors',
              timeMode === 'custom' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300']"
          >
            自定义
          </button>
        </div>
        <input
          v-if="timeMode === 'custom'"
          v-model="customTime"
          type="datetime-local"
          class="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          初始症状（可选)
          <span class="text-gray-400 text-xs">{{ selectedSymptoms.length > 0 ? `已选 ${selectedSymptoms.length} 项` : '' }}</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="symptom in availableSymptoms"
            :key="symptom"
            @click="toggleSymptom(symptom)"
            :class="['px-3 py-1.5 rounded-full text-sm border transition-all',
              selectedSymptoms.includes(symptom)
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200']"
          >
            {{ symptom }}
          </button>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="cancel"
          class="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="confirm"
          :disabled="isSubmitting"
          class="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {{ isSubmitting ? '创建中...' : '确认创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';

const router = useRouter();

const emit = defineEmits(['close']);

const availableSymptoms = [
  '恶寒', '发热', '头痛', '鼻塞', '流涕',
  '咽痛', '咳嗽', '乏力', '肌肉酸痛', '往来寒热'
];

const timeMode = ref('now');
const customTime = ref('');
const selectedSymptoms = ref([]);
const isSubmitting = ref(false);

function useNow() {
  timeMode.value = 'now';
  customTime.value = '';
}

function toggleSymptom(symptom) {
  const idx = selectedSymptoms.value.indexOf(symptom);
  if (idx > -1) {
    selectedSymptoms.value.splice(idx, 1);
  } else {
    selectedSymptoms.value.push(symptom);
  }
}

function cancel() {
  selectedSymptoms.value = [];
  timeMode.value = 'now';
  customTime.value = '';
  emit('close');
}

function confirm() {
  isSubmitting.value = true;

  let startTime;
  if (timeMode.value === 'custom' && customTime.value) {
    startTime = new Date(customTime.value).toISOString();
  } else {
    startTime = new Date().toISOString();
  }

  try {
    coldStore.createCold({
      startTime,
      initialSymptoms: [...selectedSymptoms.value]
    });

    selectedSymptoms.value = [];
    timeMode.value = 'now';
    customTime.value = '';

    emit('close');
    router.push('/');
  } catch (err) {
    alert(err.message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
