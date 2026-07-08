import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../components/HomeView.vue';
import AddSymptom from '../components/AddSymptom.vue';
import AddMedication from '../components/AddMedication.vue';
import ExportView from '../components/ExportView.vue';
import HistoryView from '../components/HistoryView.vue';
import DrugManagement from '../components/DrugManagement.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/add-symptom', name: 'add-symptom', component: AddSymptom },
  { path: '/add-medication', name: 'add-medication', component: AddMedication },
  { path: '/export', name: 'export', component: ExportView },
  { path: '/history', name: 'history', component: HistoryView },
  { path: '/drug-management', name: 'drug-management', component: DrugManagement }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
