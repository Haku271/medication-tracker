<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 顶部：当前感冒状态 -->
    <div v-if="activeCold" class="bg-white shadow-sm border-b border-gray-100">
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-gray-900">感冒详情</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDate(activeCold.start_time) }} 开始 · 第 {{ daysElapsed }} 天
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="router.push('/history')"
              class="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              历史记录
            </button>
            <button
              @click="router.push('/drug-management')"
              class="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              药品管理
            </button>
            <button
              @click="endCurrentCold"
              class="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              结束感冒
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无感冒：显示历史 -->
    <div v-else class="p-4">
      <HistoryView />
    </div>

    <!-- 感冒详情内容 -->
    <div v-if="activeCold" class="p-4 space-y-4">
      <!-- 当前推断 -->
      <div v-if="currentDiagnosis" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-amber-600 text-lg">📋</span>
          <h3 class="font-bold text-amber-900">当前推断</h3>
        </div>
        <p class="text-amber-800 font-medium">{{ currentDiagnosis.stage }}</p>
        <p class="text-amber-700/70 text-sm mt-1">{{ currentDiagnosis.desc }}</p>
        <p class="text-amber-700/50 text-xs mt-1" v-if="currentDiagnosis.formula">代表方：{{ currentDiagnosis.formula }}</p>
      </div>

      <!-- 药品状态 -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-3 border-b border-gray-100">
          <h3 class="font-bold text-gray-800">💊 服药状态</h3>
        </div>
        <div v-if="Object.keys(drugStatus).length === 0" class="p-4 text-gray-400 text-sm text-center">
          暂无服药记录
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div v-for="status in drugStatus" :key="status.drugId" class="p-3 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">{{ status.drugName }}</p>
              <p class="text-sm text-gray-500">{{ status.message }}</p>
            </div>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium',
              status.status === 'active' ? 'bg-green-100 text-green-700' :
              status.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              status.status === 'interval' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700']">
              {{
                status.status === 'active' ? '生效中' :
                status.status === 'pending' ? '待生效' :
                status.status === 'interval' ? '间隔期' : '可再次服用'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- 对乙酰氨基酚摄入统计 -->
      <div v-if="paracetamolSummary" class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-amber-600 text-lg">⚠️</span>
          <h3 class="font-bold text-gray-800">对乙酰氨基酚摄入统计</h3>
        </div>
        <p class="text-xs text-gray-500 mb-3">检测到 {{ paracetamolSummary.distinctCount }} 种含对乙酰氨基酚药物同时使用</p>

        <!-- 累计摄入条 -->
        <div class="mb-3">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">24小时累计</span>
            <span :class="['font-medium', levelTextColor(dailyLevel)]">{{ paracetamolSummary.totalMg }} / 4000 mg</span>
          </div>
          <div class="h-3 rounded-full bg-gray-100 relative overflow-hidden">
            <div :class="['h-full rounded-full transition-all', levelBg(dailyLevel)]" :style="{ width: dailyPercent + '%' }"></div>
          </div>
          <p v-if="dailyLevel === 'red'" class="text-red-600 text-xs mt-1">累计已超单日上限，请停止服用含对乙酰氨基酚药物</p>
        </div>

        <!-- 最近一次条 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">最近一次剂量</span>
            <span :class="['font-medium', levelTextColor(singleLevel)]">{{ paracetamolSummary.lastDoseMg }} / 1000 mg</span>
          </div>
          <div class="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div :class="['h-full rounded-full transition-all', levelBg(singleLevel)]" :style="{ width: singlePercent + '%' }"></div>
          </div>
          <p v-if="singleLevel === 'red'" class="text-red-600 text-xs mt-1">单次剂量已超上限，存在肝损伤风险</p>
          <p v-else-if="singleLevel === 'amber'" class="text-amber-600 text-xs mt-1">单次剂量偏高，建议留意</p>
        </div>
      </div>


      <!-- 最新记录 -->
      <EntryList :entries="entries" />
    </div>

    <!-- 悬浮按钮 -->
    <div class="fixed bottom-6 right-6 z-40">
      <button
        v-if="activeCold"
        @click="showActionMenu = true"
        class="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center text-2xl hover:bg-blue-700 active:scale-95 transition-all"
      >
        +
      </button>
      <button
        v-else
        @click="showCreateModal = true"
        class="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center text-2xl hover:bg-blue-700 active:scale-95 transition-all"
      >
        +
      </button>
    </div>

    <!-- 快速操作菜单 -->
    <div v-if="showActionMenu" class="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" @click.self="showActionMenu = false">
      <div class="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-3">
        <button @click="navigateTo('/add-symptom')" class="w-full p-4 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors">
          <span class="text-xl mr-3">🩺</span> 添加症状
        </button>
        <button @click="navigateTo('/add-medication')" class="w-full p-4 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors">
          <span class="text-xl mr-3">💊</span> 添加服药
        </button>
        <button @click="navigateTo('/add-note')" class="w-full p-4 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors">
          <span class="text-xl mr-3">📝</span> 添加备注
        </button>
        <button @click="showActionMenu = false" class="w-full p-3 text-center text-gray-500 mt-2">
          取消
        </button>
      </div>
    </div>

    <!-- 创建感冒模态框 -->
    <CreateColdModal v-if="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { useDiagnosis } from '../composables/useDiagnosis.js';
import { useDrugStatus } from '../composables/useDrugStatus.js';
import { getAllDrugs } from '../data/drugs.js';
import { summarize, levelFor, PARACETAMOL_LIMITS } from '../utils/paracetamol.js';
import CreateColdModal from './CreateColdModal.vue';
import HistoryView from './HistoryView.vue';
import EntryList from './EntryList.vue';

const router = useRouter();
const allDrugs = getAllDrugs();

const showCreateModal = ref(false);
const showActionMenu = ref(false);
const showAllEntries = ref(false);
coldStore.checkAutoEnd();

const activeCold = computed(() => coldStore.getActiveCold());

// 计算天数
const daysElapsed = computed(() => {
  if (!activeCold.value) return 0;
  const start = new Date(activeCold.value.start_time);
  const now = new Date();
  return Math.ceil((now - start) / (1000 * 60 * 60 * 24));
});

// 诊断
const { currentDiagnosis } = useDiagnosis(activeCold.value?.entries || []);

// 药品状态
const { drugStatuses } = useDrugStatus(activeCold);
const drugStatus = computed(() => drugStatuses.value || {});

// 对乙酰氨基酚摄入统计：当历史出现 ≥2 种含该成分的药品时显示
const paracetamolSummary = computed(() => {
  const cold = activeCold.value;
  if (!cold) return null;
  const s = summarize(cold.entries, allDrugs);
  return s.distinctCount < 2 ? null : s;
});

const dailyLevel = computed(() => paracetamolSummary.value ? levelFor(paracetamolSummary.value.totalMg, 'daily') : 'green');
const singleLevel = computed(() => paracetamolSummary.value ? levelFor(paracetamolSummary.value.lastDoseMg, 'single') : 'green');
const dailyPercent = computed(() => paracetamolSummary.value ? Math.min(100, paracetamolSummary.value.totalMg / PARACETAMOL_LIMITS.daily * 100) : 0);
const singlePercent = computed(() => paracetamolSummary.value ? Math.min(100, paracetamolSummary.value.lastDoseMg / PARACETAMOL_LIMITS.single * 100) : 0);

function levelBg(level) {
  return level === 'red' ? 'bg-red-500' : level === 'amber' ? 'bg-amber-500' : 'bg-green-500';
}
function levelTextColor(level) {
  return level === 'red' ? 'text-red-600' : level === 'amber' ? 'text-amber-600' : 'text-green-600';
}

// 记录
const entries = computed(() => {
  const cold = activeCold.value;
  if (!cold) return [];
  return [...cold.entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const visibleEntries = computed(() => {
  if (showAllEntries.value) return entries.value;
  return entries.value.slice(0, 3);
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function endCurrentCold() {
  if (!activeCold.value) return;
  if (confirm('确定要结束这次感冒记录吗？')) {
    coldStore.endCold(activeCold.value.id);
  }
}

function navigateTo(path) {
  showActionMenu.value = false;
  router.push(path);
}
</script>
