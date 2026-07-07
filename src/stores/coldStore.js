import { reactive } from 'vue';

const STORAGE_KEY = 'medication-tracker-colds';
const STORAGE_VERSION = '1.0';

// 辅助函数：生成 UUID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// 从 localStorage 加载
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, colds: [] };
    const parsed = JSON.parse(raw);
    // 版本校验可以在这里做
    return parsed;
  } catch {
    return { version: STORAGE_VERSION, colds: [] };
  }
}

// 保存到 localStorage
function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// reactive store
const initialData = loadFromStorage();

export const coldStore = reactive({
  colds: initialData.colds || [],

  // 获取活跃的感冒（未结束）
  getActiveCold() {
    return this.colds.find(c => c.status === 'active') || null;
  },

  // 获取所有历史感冒（包括已完成）
  getHistory() {
    return [...this.colds].sort((a, b) =>
      new Date(b.start_time) - new Date(a.start_time)
    );
  },

  // 创建新感冒
  createCold({ startTime, initialSymptoms = [] }) {
    const existingActive = this.getActiveCold();
    if (existingActive) {
      throw new Error('已有进行中的感冒，请先结束当前感冒');
    }

    const cold = {
      id: generateId(),
      start_time: startTime,
      end_time: null,
      status: 'active',
      entries: []
    };

    // 如果有初始症状，添加到 entries
    if (initialSymptoms.length > 0) {
      cold.entries.push({
        id: generateId(),
        timestamp: startTime,
        type: 'symptom',
        symptoms: initialSymptoms,
        notes: ''
      });
    }

    this.colds.push(cold);
    saveToStorage({ version: STORAGE_VERSION, colds: this.colds });
    return cold;
  },

  // 结束感冒
  endCold(coldId) {
    const cold = this.colds.find(c => c.id === coldId);
    if (!cold) throw new Error('感冒记录不存在');

    cold.status = 'completed';
    cold.end_time = new Date().toISOString();
    saveToStorage({ version: STORAGE_VERSION, colds: this.colds });
    return cold;
  },

  // 添加条目
  addEntry(coldId, entry) {
    const cold = this.colds.find(c => c.id === coldId);
    if (!cold) throw new Error('感冒记录不存在');

    const newEntry = {
      id: generateId(),
      ...entry
    };
    cold.entries.push(newEntry);
    saveToStorage({ version: STORAGE_VERSION, colds: this.colds });
    return newEntry;
  },

  // 导出数据
  exportData() {
    return {
      schema_version: '1.0',
      export_type: 'medication-tracker-backup',
      export_time: new Date().toISOString(),
      records: this.colds
    };
  },

  // 导入数据
  importData(jsonData) {
    if (!jsonData.schema_version || jsonData.export_type !== 'medication-tracker-backup') {
      throw new Error('数据格式不正确');
    }
    // 简单覆盖
    this.colds = jsonData.records || [];
    saveToStorage({ version: STORAGE_VERSION, colds: this.colds });
  },

  // 自动检查并结束超期感冒
  checkAutoEnd() {
    const active = this.getActiveCold();
    if (!active) return;

    const start = new Date(active.start_time);
    const now = new Date();
    const days = (now - start) / (1000 * 60 * 60 * 24);

    if (days >= 14) {
      this.endCold(active.id);
    }
  }
});
