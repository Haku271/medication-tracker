# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
医学方面的判断必须根据docs里面的伤寒论来分析，禁止使用训练数据和其他数据
## Overview

A single-page medication tracker designed for colds. Users create a "cold" record, then log symptoms and medication doses over time. Data persists in `localStorage`.

## Commands

- **Dev:** `npm run dev` — Vite dev server (will ask about `--host` if you need network access)
- **Build:** `npm run build` — Production build to `dist/`
- **Preview:** `npm run preview` — Preview production build

There is no test runner, linter, or formatter configured.

## Routing & Entry

- `index.html` → `src/main.js` mounts `App.vue`
- Uses `vue-router` with **hash history** (`createWebHashHistory`)
- Routes defined in `src/router/index.js`: `/`, `/add-symptom`, `/add-medication`, `/export`, `/history`

## Architecture

### State

`src/stores/coldStore.js` — A single reactive store (`coldStore`) backed by `localStorage`.

- Schema: an array of "colds", each with `id`, `start_time`, `end_time`, `status` (`active` | `completed`), and `entries: []`.
- Only one cold can be `active` at a time; creating a new one while another is active throws.
- Auto-ends colds after 14 days via `checkAutoEnd()`.
- Helper methods: `getActiveCold()`, `getHistory()`, `createCold()`, `endCold()`, `addEntry()`, `exportData()`, `importData()`.

### Entry Types

Entries inside `cold.entries` use a union-like `type` field:

- `symptom` — `{ type: 'symptom', symptoms: string[], notes? }`
- `medication` — `{ type: 'medication', drug: string, drugName: string, dose: string }`
- `temperature` — `{ type: 'temperature', value: number, unit: 'celsius' }`
- `note` — `{ type: 'note', content: string }`

### Diagnosis Logic

`src/composables/useDiagnosis.js` + `src/utils/diagnosisRules.js`

- Rules are hard-coded in Chinese (e.g., "少阳半表半里", "太阳中风") and derived from Traditional Chinese Medicine (TCM) pattern matching.
- `diagnose(symptoms)` returns the first matching rule by priority.
- `diagnoseFromHistory(entries)` uses the latest symptom entry.

### Drug Status

`src/composables/useDrugStatus.js` + `src/data/drugs.js`

- `drugs.js` defines a static list with `onsetMinutes`, `durationHours`, and `minIntervalHours`.
- `calculateDrugStatus(drugId, medications)` returns one of: `PENDING` (not yet onset), `ACTIVE` (within duration), `INTERVAL` (past duration but before min interval), `READY`.
- `useDrugStatus(cold)` groups medication entries by drug and computes per-drug status reactively.

### UI Conventions

- Mobile-first design using Tailwind CSS v4 with `@tailwindcss/postcss`
- Top bar with back arrow (`←`) and page title is the standard sub-page layout
- Floating action button (`+`) on `HomeView` opens an action sheet for adding symptoms/medication

## Important Files

| File | Purpose |
|------|---------|
| `src/stores/coldStore.js` | All persistent state |
| `src/data/drugs.js` | Drug definitions (onset, duration, interval) |
| `src/utils/diagnosisRules.js` | TCM symptom-matching rules |
| `src/composables/useDiagnosis.js` | Reactive diagnosis from entries |
| `src/composables/useDrugStatus.js` | Reactive per-drug status from entries |
| `src/components/HomeView.vue` | Dashboard with active cold, drug status, latest entries |
| `src/components/CreateColdModal.vue` | Modal to start a new cold |
| `src/components/AddSymptom.vue` | Symptom + optional temperature entry |
| `src/components/AddMedication.vue` | Medication entry with interval warning |
| `src/components/ExportView.vue` | JSON/text export and JSON import |
