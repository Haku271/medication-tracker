// 对乙酰氨基酚摄入统计工具

// 成人单次/24小时累计上限（mg）
export const PARACETAMOL_LIMITS = {
  single: 1000,
  daily: 4000
};

// 警戒线（mg）
const SINGLE_WARN = 650;
const DAILY_WARN = 3000;

// 从剂量字符串解析片数，如 "2片" -> 2，"1片" -> 1
export function parseTabletCount(doseStr) {
  if (!doseStr) return 1;
  const m = String(doseStr).match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 1;
}

// 取出含对乙酰氨基酚的服药条目，附带计算后的 mg 量
export function getParacetamolMeds(entries, allDrugs) {
  return (entries || [])
    .filter(e => e.type === 'medication')
    .map(e => {
      const drug = allDrugs.find(d => d.id === e.drug);
      if (!drug || !drug.paracetamolPerTablet) return null;
      return { entry: e, drug, mg: drug.paracetamolPerTablet * parseTabletCount(e.dose) };
    })
    .filter(Boolean);
}

// 汇总：含药品种数、累计 mg、最近一次 mg
export function summarize(entries, allDrugs) {
  const meds = getParacetamolMeds(entries, allDrugs);
  const distinctDrugs = new Set(meds.map(m => m.entry.drug));
  const totalMg = meds.reduce((a, m) => a + m.mg, 0);

  const sorted = [...meds].sort((a, b) => new Date(b.entry.timestamp) - new Date(a.entry.timestamp));
  const lastDoseMg = sorted.length ? sorted[0].mg : 0;

  return { distinctCount: distinctDrugs.size, totalMg, lastDoseMg };
}

// 按毫克值返回等级：'green' | 'amber' | 'red'
export function levelFor(mg, limitKind) {
  const warn = limitKind === 'single' ? SINGLE_WARN : DAILY_WARN;
  const limit = limitKind === 'single' ? PARACETAMOL_LIMITS.single : PARACETAMOL_LIMITS.daily;
  if (mg >= limit) return 'red';
  if (mg >= warn) return 'amber';
  return 'green';
}
