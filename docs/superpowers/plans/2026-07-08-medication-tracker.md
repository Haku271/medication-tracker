# Medication Tracker Implementation Plan

## Overview
Build a Vue 3 + Vite + Tailwind CSS web app for tracking cold symptoms and fever medication.

## File Structure

```
medication-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   └── coldStore.js
│   ├── data/
│   │   └── drugs.js
│   ├── composables/
│   │   ├── useDiagnosis.js
│   │   └── useDrugStatus.js
│   ├── components/
│   │   ├── HomeView.vue
│   │   ├── ColdDetail.vue
│   │   ├── HistoryView.vue
│   │   ├── AddSymptom.vue
│   │   ├── AddMedication.vue
│   │   ├── DrugStatus.vue
│   │   ├── ExportView.vue
│   │   └── CreateColdModal.vue
│   └── utils/
│       ├── storage.js
│       └── diagnosisRules.js
```

## Tasks

### Task 1: Project Scaffolding
- Run: `npm create vue@latest .` (select no extra options)
- Install deps: `npm install vue-router dayjs lucide-vue-next`
- Install dev deps: `npm install -D tailwindcss postcss autoprefixer` + init tailwind
- Configure tailwind.config.js with content paths
- Configure vite.config.js
- Test: `npm run dev` opens at localhost:5173

### Task 2: Data Layer (stores/coldStore.js + data/drugs.js)
- Define drug config in data/drugs.js with 5 built-in drugs and their params
- Implement coldStore with: createCold, endCold, addEntry, getActiveCold, getHistory, exportData, importData
- Use localStorage for persistence with JSON serialization
- Test: create a cold, verify localStorage has data

### Task 3: Diagnosis Engine (utils/diagnosisRules.js + composables/useDiagnosis.js)
- Define diagnosis rules as config array (5 stages)
- Implement match logic: take symptoms array, return latest stage
- Support progression tracking over time
- Test: feed symptom history, verify correct stage output

### Task 4: Drug Status Engine (composables/useDrugStatus.js)
- Take drug config + medication history, return current status
- States: pending, active, interval, ready
- Calculate: time until effective, time until next dose
- Test: verify all 4 states with mock data

### Task 5: Router + Home View
- Setup Vue Router with routes: /, /add-symptom, /add-medication, /export
- HomeView: show ColdDetail if active cold exists, else HistoryView
- Test: navigate to each route

### Task 6: Create Cold Modal
- Modal with: time picker (now/custom), symptom selector (optional skip), confirm
- On create: go to HomeView (now showing active cold)
- Test: create cold, verify appears in HomeView

### Task 7: Cold Detail View
- Display: start time, elapsed days, current diagnosis
- Drug status cards with real-time status
- Recent entries timeline (latest 3)
- Floating action button for quick add
- Test: add entries, verify UI updates

### Task 8: Add Symptom Page
- Multi-select symptom list
- Optional temperature input
- Time picker (now/custom)
- Notes field
- Test: add symptom, verify in timeline

### Task 9: Add Medication Page
- Drug selector (5 built-in)
- Dose input
- Time picker
- Optional: warning if interval not met
- Test: add medication, verify drug status updates

### Task 10: Export/Import Page
- Export JSON button (downloads file)
- Export text button (doctor version, no diagnosis)
- Import JSON: file picker + validation + merge
- Test: export, import, verify data integrity

### Task 11: History View
- List of past colds with summary
- Tap to view cold detail (read-only or editable)
- Test: multiple colds, verify list displays correctly

### Task 12: Polish + Final Test
- Mobile-first responsive design via Tailwind
- All touch targets >= 44px
- Auto-end after 14 days
- Full end-to-end walkthrough

## Verification
- All tasks have at least one manual test step
- Full app flow: create cold -> add symptoms -> add medication -> view status -> export -> end
