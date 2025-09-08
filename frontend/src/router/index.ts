import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
import HomeView from "../views/HomeView.vue";
import LinealView from "../views/LinealView.vue";
import BinariaView from "../views/BinariaView.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/lineal", name: "lineal", component: LinealView },
  { path: "/binaria", name: "binaria", component: BinariaView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
