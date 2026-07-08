<script setup>
import { ref, computed } from 'vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'radix-vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})

const open = ref(false)
const maxVisible = 3

const hasMore = computed(() => props.entries.length > maxVisible)

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-3 border-b border-gray-100 flex justify-between items-center">
      <h3 class="font-bold text-gray-800">📋 最新记录</h3>
      <CollapsibleRoot v-if="hasMore" v-model:open="open" class="inline-flex">
        <CollapsibleTrigger
          class="text-sm text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
        >
          <span>{{ open ? '收起' : '查看全部' }}</span>
        </CollapsibleTrigger>
      </CollapsibleRoot>
    </div>

    <!-- Fixed Items -->
    <div class="divide-y divide-gray-50">
      <div
        v-for="entry in entries.slice(0, maxVisible)"
        :key="entry.id"
        class="p-3"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono text-gray-400">{{ formatTime(entry.timestamp) }}</span>
              <span
                v-if="entry.type === 'symptom'"
                class="inline-flex items-center gap-1 text-sm text-gray-700"
              >
                🩺 症状：{{ entry.symptoms?.join('、') }}
              </span>
              <span
                v-else-if="entry.type === 'medication'"
                class="inline-flex items-center gap-1 text-sm text-gray-700"
              >
                💊 服药：{{ entry.drugName }} {{ entry.dose }}
              </span>
              <span
                v-else-if="entry.type === 'temperature'"
                class="inline-flex items-center gap-1 text-sm text-gray-700"
              >
                🌡️ 体温：{{ entry.value }}℃
              </span>
              <span
                v-else-if="entry.type === 'note'"
                class="inline-flex items-center gap-1 text-sm text-gray-700"
              >
                📝 备注：{{ entry.content }}
              </span>
            </div>
            <p v-if="entry.notes" class="text-xs text-gray-400 mt-1">{{ entry.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Collapsible Items with animation -->
      <CollapsibleRoot v-if="hasMore" v-model:open="open">
        <CollapsibleContent
          class="CollapsibleContent"
          as="div"
        >
          <div
            v-for="entry in entries.slice(maxVisible)"
            :key="entry.id"
            class="p-3 border-t border-gray-50"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-mono text-gray-400">{{ formatTime(entry.timestamp) }}</span>
                  <span
                    v-if="entry.type === 'symptom'"
                    class="inline-flex items-center gap-1 text-sm text-gray-700"
                  >
                    🩺 症状：{{ entry.symptoms?.join('、') }}
                  </span>
                  <span
                    v-else-if="entry.type === 'medication'"
                    class="inline-flex items-center gap-1 text-sm text-gray-700"
                  >
                    💊 服药：{{ entry.drugName }} {{ entry.dose }}
                  </span>
                  <span
                    v-else-if="entry.type === 'temperature'"
                    class="inline-flex items-center gap-1 text-sm text-gray-700"
                  >
                    🌡️ 体温：{{ entry.value }}℃
                  </span>
                  <span
                    v-else-if="entry.type === 'note'"
                    class="inline-flex items-center gap-1 text-sm text-gray-700"
                  >
                    📝 备注：{{ entry.content }}
                  </span>
                </div>
                <p v-if="entry.notes" class="text-xs text-gray-400 mt-1">{{ entry.notes }}</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>
    </div>

    <div v-if="entries.length === 0" class="p-4 text-gray-400 text-sm text-center">
      暂无记录，点击下方 + 添加
    </div>
  </div>
</template>

<style scoped>
.CollapsibleContent {
  overflow: hidden;
}

.CollapsibleContent[data-state='open'] {
  animation: slideDown 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.CollapsibleContent[data-state='closed'] {
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: var(--radix-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    max-height: var(--radix-collapsible-content-height);
  }
  to {
    opacity: 0;
    max-height: 0;
  }
}
</style>
