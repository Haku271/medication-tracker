<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center gap-3">
      <button @click="goBack" class="text-gray-600 hover:text-gray-900 text-xl">←</button>
      <h1 class="text-lg font-bold">药品管理</h1>
    </div>

    <div class="p-4 space-y-5">
      <p class="text-sm text-gray-500">开启的药品会显示在添加服药页面</p>

      <div v-for="group in drugGroups" :key="group.id">
        <div class="flex items-center gap-2 mb-2">
          <span :class="['px-2 py-0.5 rounded text-xs font-bold', group.tag]">{{ group.label }}</span>
          <span class="text-xs text-gray-400">{{ group.drugs.length }} 种</span>
        </div>
        <div class="space-y-3">
          <div v-for="drug in group.drugs" :key="drug.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-stretch gap-3">
            <div :class="['w-1.5 rounded-full shrink-0', formTag(drug.formType).bar]"></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-800">{{ drug.name }}</span>
                <span :class="['shrink-0 px-2 py-0.5 rounded text-xs font-bold', formTag(drug.formType).tag]">
                  {{ formTag(drug.formType).label }}
                </span>
              </div>
              <div v-if="drug.category === 'antipyretic'" class="text-sm text-gray-500 mt-1">间隔: {{ drug.minIntervalHours }}小时</div>
            </div>
            <button
              @click="toggle(drug)"
              :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0', drug.visible ? 'bg-blue-600' : 'bg-gray-300']">
              <span :class="['inline-block h-4 w-4 transform rounded-full bg-white transition-transform', drug.visible ? 'translate-x-6' : 'translate-x-1']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAllDrugsByCategory, setVisible, formTag } from '../data/drugs.js';

const router = useRouter();
const drugGroups = ref(getAllDrugsByCategory());

function goBack() { router.back(); }

function toggle(drug) {
  const next = !drug.visible;
  drug.visible = next;
  setVisible(drug.id, next);
}
</script>
