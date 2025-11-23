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

// Importar vistas de búsquedas externas
import LinealExterna from '../views/external-searches/LinealExterna.vue';
import BinariaExterna from '../views/external-searches/BinariaExterna.vue';
import HashModuloExterno from '../views/external-searches/hash/HashModuloExterno.vue';
import HashCuadradoExterno from '../views/external-searches/hash/HashCuadradoExterno.vue';
import HashPlegamientoExterno from '../views/external-searches/hash/HashPlegamientoExterno.vue';
import HashTruncamientoExterno from '../views/external-searches/hash/HashTruncamientoExterno.vue';
import HashCambioBaseExterno from '../views/external-searches/hash/HashCambioBaseExterno.vue';
import DinamicaView from '../views/DinamicaView.vue';
import IndicesView from '../views/external-searches/IndicesView.vue';

// Importar vistas de grafos
import OperacionesUnGrafo from '../views/grafos/OperacionesUnGrafo.vue';
import ArbolesExpansion from '../views/grafos/ArbolesExpansion.vue';

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
  
  // Rutas de Búsquedas Externas
  { path: "/external/lineal", name: "external-lineal", component: LinealExterna },
  { path: "/external/binaria", name: "external-binaria", component: BinariaExterna },
  { path: "/external/hash/modulo", name: "external-hash-modulo", component: HashModuloExterno },
  { path: "/external/hash/cuadrado", name: "external-hash-cuadrado", component: HashCuadradoExterno },
  { path: "/external/hash/plegamiento", name: "external-hash-plegamiento", component: HashPlegamientoExterno },
  { path: "/external/hash/truncamiento", name: "external-hash-truncamiento", component: HashTruncamientoExterno },
  { path: "/external/hash/cambio-base", name: "external-hash-cambio-base", component: HashCambioBaseExterno },
  { path: "/external/estructuras-dinamicas", name: "external-estructuras-dinamicas", component: DinamicaView },
  { path: "/external/indices", name: "external-indices", component: IndicesView },
  
  // Rutas de Grafos
  { path: "/grafos/operaciones/un-grafo", name: "grafos-operaciones-un-grafo", component: OperacionesUnGrafo },
  { path: "/grafos/arboles/expansion", name: "grafos-arboles-expansion", component: ArbolesExpansion },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
