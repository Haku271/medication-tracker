<template>
  <div>
    <h2 class="text-lg font-bold text-gray-800 mb-4">历史感冒记录</h2>

    <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
      <p class="text-sm">暂无历史记录</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="cold in history"
        :key="cold.id"
        class="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        @click="viewCold(cold.id)"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium text-gray-800">
              {{ formatDate(cold.start_time) }} ~ {{ cold.end_time ? formatDate(cold.end_time) : '进行中' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              病程 {{ calculateDays(cold) }} 天
            </p>
          </div>
          <span :class="['px-2 py-1 rounded-full text-xs font-medium',
            cold.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
            {{ cold.status === 'active' ? '进行中' : '已结束' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';

const router = useRouter();

const history = computed(() => coldStore.getHistory());

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function calculateDays(cold) {
  const start = new Date(cold.start_time);
  const end = cold.end_time ? new Date(cold.end_time) : new Date();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function viewCold(id) {
  router.push({ path: '/', query: { view: id } });
}
</script>
