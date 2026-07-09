<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 顶部：感冒状态 -->
    <div v-if="displayCold" class="bg-white shadow-sm border-b border-gray-100">
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-gray-900">
              {{ isViewingHistory ? '历史感冒详情' : '感冒详情' }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDate(displayCold.start_time) }} 开始
              <span v-if="isViewingHistory"> ~ {{ formatDate(displayCold.end_time) }} 结束</span>
              <span v-else> · 第 {{ daysElapsed }} 天</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="isViewingHistory"
              @click="router.push('/')"
              class="text-sm text-blue-500 hover:text-blue-700 font-medium"
            >
              返回
            </button>
            <template v-else>
              <button
                @click="router.push('/history')"
                class="material-symbols-rounded text-gray-600 hover:text-gray-900"
                title="历史记录"
              >
                history
              </button>
              <button
                @click="router.push('/drug-management')"
                class="material-symbols-rounded text-gray-600 hover:text-gray-900"
                title="药品管理"
              >
                settings
              </button>
              <button
                @click="endCurrentCold"
                class="material-symbols-rounded text-gray-600 hover:text-red-600"
                title="结束感冒"
              >
                power_settings_new
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 无感冒且未在查看历史：显示历史列表 -->
    <div v-if="!displayCold" class="p-4">
      <HistoryView />
    </div>

    <!-- 感冒详情内容 -->
    <div v-if="displayCold" class="p-4 space-y-4">
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
              <p class="text-sm text-gray-500">
                <span v-if="status.trackStatus === false && status.lastDoseTime">{{ formatTime(status.lastDoseTime) }} 服药</span>
                <span v-else-if="status.trackStatus === false">已服用</span>
                <span v-else>{{ status.message }}</span>
                <span v-if="status.trackStatus !== false && status.lastDoseTime" class="text-gray-400 ml-1">· {{ formatTime(status.lastDoseTime) }} 服药</span>
              </p>
            </div>
            <span v-if="status.trackStatus === false" class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              已服用
            </span>
            <span v-else :class="['px-2 py-1 rounded-full text-xs font-medium',
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


      <!-- 缺药/建议提示 -->
      <div v-if="symptomAdvice.groups.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-3 border-b border-gray-100 flex items-center gap-2">
          <span class="text-gray-600 text-lg">🔍</span>
          <h3 class="font-bold text-gray-800">症状提示</h3>
          <span class="text-xs text-gray-400">基于已记录症状与服药状态</span>
        </div>
        <template v-for="group in symptomAdvice.groups" :key="group.level">
          <div
            v-if="collapsed[group.level]"
            :class="['px-3 py-2.5 flex items-center gap-2 cursor-pointer', groupColor(group.level).card]"
            @click="collapsed[group.level] = false"
          >
            <span class="text-base">{{ groupMeta(group.level).icon }}</span>
            <span class="text-sm font-medium text-gray-800">{{ groupMeta(group.level).title }}</span>
            <span :class="['ml-auto px-2 py-0.5 rounded-full text-xs font-bold text-white', groupMeta(group.level).bubble]">{{ group.items.length }}</span>
            <span class="text-gray-400 text-sm">展开</span>
          </div>
          <div v-else :class="['border-t border-gray-100', groupColor(group.level).card]">
            <button class="w-full px-3 py-2.5 flex items-center gap-2" @click="collapsed[group.level] = true">
              <span class="text-base">{{ groupMeta(group.level).icon }}</span>
              <span class="text-sm font-bold text-gray-800">{{ groupMeta(group.level).title }}</span>
              <span :class="['px-1.5 py-0.5 rounded text-xs font-bold text-white', groupMeta(group.level).bubble]">{{ group.items.length }}</span>
              <span class="ml-auto text-gray-400 text-sm">收起</span>
            </button>
            <div class="px-3 pb-3 space-y-1.5">
              <div v-for="item in group.items" :key="item.symptom" class="flex flex-col gap-0.5">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-medium text-gray-800">{{ item.label }}</span>
                  <span :class="['text-sm font-medium', groupColor(group.level).text]">→ {{ item.message }}</span>
                </div>
                <span class="text-xs text-gray-400 pl-2">原因：{{ item.reason }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 最新记录 -->
      <EntryList :entries="entries" />
    </div>

    <!-- 悬浮按钮 -->
    <div v-if="!isViewingHistory" class="fixed bottom-6 right-6 z-40">
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

    <!-- 结束感冒确认模态框 -->
    <div v-if="showEndColdModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="cancelEndCold">
      <div class="bg-white rounded-xl p-6 w-11/12 max-w-md mx-4 shadow-xl">
        <h2 class="text-xl font-bold mb-2 text-gray-800">结束感冒</h2>
        <p class="text-gray-600 mb-6">确定要结束这次感冒记录吗？结束后将无法再添加记录。</p>
        <div class="flex gap-3">
          <button
            @click="cancelEndCold"
            class="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmEndCold"
            class="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            确认结束
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { coldStore } from '../stores/coldStore.js';
import { useDiagnosis } from '../composables/useDiagnosis.js';
import { useDrugStatus } from '../composables/useDrugStatus.js';
import { getAllDrugs } from '../data/drugs.js';
import { summarize, levelFor, PARACETAMOL_LIMITS } from '../utils/paracetamol.js';
import { buildSymptomAdvice, GROUP_META } from '../utils/symptomAdvice.js';
import CreateColdModal from './CreateColdModal.vue';
import HistoryView from './HistoryView.vue';
import EntryList from './EntryList.vue';

const router = useRouter();
const route = useRoute();
const allDrugs = getAllDrugs();

const showCreateModal = ref(false);
const showEndColdModal = ref(false);
const showActionMenu = ref(false);
const showAllEntries = ref(false);
coldStore.checkAutoEnd();

const activeCold = computed(() => coldStore.getActiveCold());

// 查看历史感冒：当 route.query.view 指定 id 时显示该记录
const viewCold = computed(() => {
  const id = route.query.view;
  return id ? coldStore.getColdById(String(id)) : null;
});

const isViewingHistory = computed(() => !!viewCold.value);
const displayCold = computed(() => viewCold.value || activeCold.value);

// 计算天数
const daysElapsed = computed(() => {
  if (!activeCold.value) return 0;
  const start = new Date(activeCold.value.start_time);
  const now = new Date();
  return Math.ceil((now - start) / (1000 * 60 * 60 * 24));
});

// 诊断
const { currentDiagnosis } = useDiagnosis(displayCold.value?.entries || []);

// 药品状态
const { drugStatuses } = useDrugStatus(displayCold);
const drugStatus = computed(() => drugStatuses.value || {});

// 缺药/建议提示
const collapsed = ref({ seeDoctor: false, needsDrug: false, needsConsult: true, selfResolving: false });
function groupMeta(level) { return GROUP_META[level]; }
function groupColor(level) { return GROUP_META[level]; }
const symptomAdvice = computed(() => {
  const cold = displayCold.value;
  if (!cold) return { groups: [] };
  return buildSymptomAdvice(cold.entries, drugStatus.value);
});

// 对乙酰氨基酚摄入统计：当历史出现 ≥2 种含该成分的药品时显示
const paracetamolSummary = computed(() => {
  const cold = displayCold.value;
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
  const cold = displayCold.value;
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
  showEndColdModal.value = true;
}

function cancelEndCold() {
  showEndColdModal.value = false;
}

function confirmEndCold() {
  if (!activeCold.value) return;
  coldStore.endCold(activeCold.value.id);
  showEndColdModal.value = false;
}

function navigateTo(path) {
  showActionMenu.value = false;
  router.push(path);
}
</script>
