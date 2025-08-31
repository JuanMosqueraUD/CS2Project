import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
import HomeView from '../views/HomeView.vue'
import InternaView from '../views/InternaView.vue'
import ExternaView from '../views/ExternaView.vue'
import ColisionesView from '../views/ColisionesView.vue'
import GrafosView from '../views/GrafosView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/interna', name: 'interna', component: InternaView },
  { path: '/externa', name: 'externa', component: ExternaView },
  { path: '/colisiones', name: 'colisiones', component: ColisionesView },
  { path: '/grafos', name: 'grafos', component: GrafosView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
