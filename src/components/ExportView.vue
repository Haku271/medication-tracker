<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white p-4 shadow-sm border-b border-gray-100 flex items-center gap-3">
      <button @click="goBack" class="text-gray-600 hover:text-gray-900 text-xl">←</button>
      <h1 class="text-lg font-bold">数据管理</h1>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 mb-2">导出备份（JSON）</h3>
        <p class="text-sm text-gray-500 mb-4">导出完整数据，可用于备份或导入恢复</p>
        <button @click="exportJSON" class="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">导出 JSON</button>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 mb-2">导出文字版</h3>
        <p class="text-sm text-gray-500 mb-4">纯记录格式，适合给医生看</p>
        <button @click="exportText" class="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">导出文字</button>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-800 mb-2">导入数据</h3>
        <p class="text-sm text-gray-500 mb-4">从 JSON 备份恢复数据</p>
        <input type="file" accept=".json" @change="handleFileImport" class="w-full p-2 border border-gray-300 rounded-lg">
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';

const router = useRouter();

function goBack() { router.back(); }

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function exportJSON() {
  const data = coldStore.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medication-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportText() {
  const history = coldStore.getHistory();
  let text = '=== 感冒记录 ===\n患者自填，供参考\n\n';

  for (const cold of history) {
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
        text += `${time} - ${entry.symptoms?.join('、') || ''}\n`;
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

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `感冒记录-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      coldStore.importData(data);
      alert('导入成功！');
      router.push('/');
    } catch (err) {
      alert('导入失败：' + err.message);
    }
  };
  reader.readAsText(file);
}
</script>
