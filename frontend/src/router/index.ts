import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

// Importar vistas
import HomeView from "../views/HomeView.vue";
import LinealView from "../views/LinealView.vue";
import BinariaView from "../views/BinariaView.vue";
import HashMod from '../views/HashMod.vue';
import ResiduoDigital from '../views/ResiduoDigital.vue';
import ResiduoSimple from '../views/ResiduoSimple.vue';
import ResiduoMultiple from '../views/ResiduoMultiple.vue';
import ResiduoHuffman from '../views/ResiduoHuffman.vue';

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
  // Rutas de Residuos
  { path: "/residuos/digital", name: "residuo-digital", component: ResiduoDigital },
  { path: "/residuos/simple", name: "residuo-simple", component: ResiduoSimple },
  { path: "/residuos/multiple", name: "residuo-multiple", component: ResiduoMultiple },
  { path: "/residuos/huffman", name: "residuo-huffman", component: ResiduoHuffman },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
