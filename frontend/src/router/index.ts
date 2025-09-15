import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

// Importar vistas
import HomeView from "../views/HomeView.vue";
import LinealView from "../views/LinealView.vue";
import BinariaView from "../views/BinariaView.vue";
import HashMod from '../views/HashMod.vue';

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/lineal", name: "lineal", component: LinealView },
  { path: "/binaria", name: "binaria", component: BinariaView },
  {
    path: "/hashmod",
    name: "hashmod",
    component: HashMod,
    props: (route: RouteLocationNormalizedLoaded) => ({ funcion: route.query.funcion })
  },
  {
    path: "/hash/:estrategia?",
    name: "hash-generic",
    component: HashMod,
    props: (route: RouteLocationNormalizedLoaded) => ({ estrategia: route.params.estrategia ?? route.query.estrategia })
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
