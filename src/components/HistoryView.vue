<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-bold text-gray-800">历史感冒记录</h2>
      <button
        v-if="!manageMode && history.length > 0"
        @click="enterManage"
        class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        管理
      </button>
    </div>

    <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
      <p class="text-sm">暂无历史记录</p>
    </div>

    <div v-else>
      <!-- 管理工具栏 -->
      <div v-if="manageMode" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div class="flex items-center justify-between mb-2.5">
          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate.prop="someSelected && !allSelected"
              @change="toggleAll"
              class="w-4 h-4"
            >
            全选
          </label>
          <span class="text-sm text-gray-500">已选 {{ selectedIds.length }} 项</span>
        </div>
        <div class="flex gap-2">
          <button
            @click="exportSelectedJSON"
            :disabled="selectedIds.length === 0"
            class="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            导出 JSON
          </button>
          <button
            @click="exportSelectedText"
            :disabled="selectedIds.length === 0"
            class="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            导出文字
          </button>
          <button
            @click="deleteSelected"
            :disabled="selectedIds.length === 0"
            class="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            删除
          </button>
        </div>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="cold in history"
          :key="cold.id"
          :class="['p-3.5 rounded-lg border transition-colors',
            manageMode
              ? (isSelected(cold.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-100')
              : 'border-gray-100 hover:bg-gray-50 cursor-pointer']"
          @click="manageMode ? toggleSelect(cold.id) : viewCold(cold.id)"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-start gap-2">
              <input
                v-if="manageMode"
                type="checkbox"
                :checked="isSelected(cold.id)"
                @click.stop="toggleSelect(cold.id)"
                class="w-4 h-4 mt-1"
              >
              <div>
                <p class="font-medium text-gray-800">
                  {{ formatDate(cold.start_time) }} ~ {{ cold.end_time ? formatDate(cold.end_time) : '进行中' }}
                </p>
                <p class="text-sm text-gray-500 mt-0.5">
                  病程 {{ calculateDays(cold) }} 天
                </p>
              </div>
            </div>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium',
              cold.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
              {{ cold.status === 'active' ? '进行中' : '已结束' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="manageMode" class="flex gap-2 mt-3">
        <button
          @click="exitManage"
          class="flex-1 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { symptomLabels } from '../data/symptoms.js';

const router = useRouter();

const history = computed(() => coldStore.getHistory());
const manageMode = ref(false);
const selectedIds = ref([]);

const allSelected = computed(() =>
  history.value.length > 0 && selectedIds.value.length === history.value.length
);
const someSelected = computed(() => selectedIds.value.length > 0);

function isSelected(id) {
  return selectedIds.value.includes(id);
}

function toggleSelect(id) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
}

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = history.value.map(c => c.id);
  }
}

function enterManage() {
  manageMode.value = true;
  selectedIds.value = [];
}

function exitManage() {
  manageMode.value = false;
  selectedIds.value = [];
}

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

function getSelectedColds() {
  const idSet = new Set(selectedIds.value);
  return coldStore.colds.filter(c => idSet.has(c.id));
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSelectedJSON() {
  if (selectedIds.value.length === 0) return;
  const data = {
    schema_version: '1.0',
    export_type: 'medication-tracker-backup',
    export_time: new Date().toISOString(),
    records: getSelectedColds()
  };
  downloadBlob(
    JSON.stringify(data, null, 2),
    'application/json',
    `medication-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
  );
}

function exportSelectedText() {
  if (selectedIds.value.length === 0) return;
  const colds = getSelectedColds();
  let text = '=== 感冒记录 ===\n患者自填，供参考\n\n';

  for (const cold of colds) {
    text += '【基本信息】\n';
    text += `开始时间：${formatDateTime(cold.start_time)}\n`;
    if (cold.end_time) {
      text += `记录结束：${formatDateTime(cold.end_time)}（${cold.status === 'completed' ? '手动结束' : '自动结束'}）\n`;
    }
    text += '\n【症状记录】\n';

    const entries = [...cold.entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    for (const entry of entries) {
      const time = formatDateTime(entry.timestamp);
      if (entry.type === 'symptom') {
        text += `${time} - ${symptomLabels(entry.symptoms).join('、') || ''}\n`;
        if (entry.notes) text += `  备注：${entry.notes}\n`;
      } else if (entry.type === 'temperature') {
        text += `${time} - 体温：${entry.value}℃\n`;
      } else if (entry.type === 'medication') {
        text += `${time} - 服药：${entry.drugName || entry.drug} ${entry.dose}\n`;
      } else if (entry.type === 'note') {
        text += `${time} - 备注：${entry.content}\n`;
      }
    }
    text += '\n---\n\n';
  }

  downloadBlob(text, 'text/plain;charset=utf-8', `感冒记录-${new Date().toISOString().split('T')[0]}.txt`);
}

function deleteSelected() {
  if (selectedIds.value.length === 0) return;
  if (!confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？此操作不可撤销。`)) return;
  coldStore.deleteColds(selectedIds.value);
  exitManage();
}
</script>
