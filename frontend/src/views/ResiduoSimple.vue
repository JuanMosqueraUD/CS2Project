<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  <h1>Árbol por Residuos (Simple)</h1>

  <section class="controls">
    <input v-model="input" maxlength="1" placeholder="Ingresa una letra (A-Z)" @input="onInput" />
    <button @click="insert" class="outline contrast">Insertar</button>
    <button @click="search" class="outline">Buscar</button>
    <button @click="remove" class="contrast">Borrar</button>
    <label class="toggle">
      <input type="checkbox" v-model="useGraph" />
      <span>Vista gráfica</span>
    </label>
    <span v-if="message" class="message">{{ message }}</span>
  </section>

  <section v-if="root" class="tree-container">
    <div class="legend">
      <span class="badge left">0 → Izquierda</span>
      <span class="badge right">1 → Derecha</span>
      <span class="badge connector">Conector</span>
    </div>
    <div v-if="useGraph" class="graph-wrapper">
      <div ref="graphEl" class="graph"></div>
    </div>
    <div v-else class="muted">Activa "Vista gráfica" para ver el árbol.</div>
  </section>

  <p v-else class="muted">Aún no hay nodos. Inserta una letra para crear el árbol.</p>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { letterToCode } from '../utils/digitalTree';
import { type RSNode, insertRS, searchRS, deleteRS } from '../utils/residueTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const input = ref('');
const message = ref('');
const root = ref<RSNode | null>(null);
const highlightPath = ref<Array<'L' | 'R'>>([]);
const useGraph = ref(true);

const graphEl = ref<HTMLDivElement | null>(null);
let network: Network | null = null;

function onInput(e: Event) {
  const t = e.target as HTMLInputElement;
  t.value = t.value.replace(/[^a-zA-Z]/g, '').slice(0, 1);
  input.value = t.value.toUpperCase();
  message.value = '';
}

function insert() {
  message.value = '';
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = insertRS(root.value, input.value);
  root.value = res.root;
  highlightPath.value = res.path;
  if (res.status === 'duplicate') {
    message.value = `La letra ${input.value.toUpperCase()} ya existe. Ruta: ${res.path.join('›') || 'raíz'}`;
  } else {
    message.value = `Insertado ${input.value.toUpperCase()} con código ${code} por ruta ${res.path.join('›') || 'raíz'}`;
  }
  input.value = '';
}

function search() {
  message.value = '';
  highlightPath.value = [];
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = searchRS(root.value, input.value);
  highlightPath.value = res.path;
  if (res.found) {
    message.value = `Encontrada ${input.value.toUpperCase()} por ruta ${res.path.join('›') || 'raíz'}`;
  } else {
    message.value = `No encontrada ${input.value.toUpperCase()}`;
  }
}

function buildGraphData(node: RSNode, baseId = 'r'): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverse(n: RSNode, id: string) {
    const isConnector = n.key === null;
    nodes.push({
      id,
      label: isConnector ? '○' : (n.key ?? '∅'),
      shape: 'circle',
      color: {
        background: isConnector ? '#0f172a' : '#111827',
        border: isConnector ? '#1e293b' : '#374151',
        highlight: { background: '#f59e0b', border: '#d97706' },
        hover: { background: '#1f2937', border: '#4b5563' }
      },
      font: { color: isConnector ? '#93c5fd' : '#ffffff', face: 'Inter, system-ui, sans-serif', bold: { color: '#ffffff' } },
      borderWidth: 2,
    });

    const hasLeft = !!n.left;
    const hasRight = !!n.right;
    if (hasLeft) {
      const lid = id + 'L';
      edges.push({ from: id, to: lid, arrows: '', color: { color: '#94a3b8', highlight: '#f59e0b' } });
      traverse(n.left as RSNode, lid);
    }
    if (hasRight) {
      const rid = id + 'R';
      edges.push({ from: id, to: rid, arrows: '', color: { color: '#94a3b8', highlight: '#f59e0b' } });
      traverse(n.right as RSNode, rid);
    }
    if (hasLeft && !hasRight) {
      const pid = id + 'R_';
      nodes.push({ id: pid, label: '', shape: 'circle', size: 18, color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }, font: { color: 'rgba(0,0,0,0)' }, borderWidth: 0 });
        edges.push({ from: id, to: pid, arrows: '', color: { color: 'rgba(0,0,0,0)' } });
    } else if (!hasLeft && hasRight) {
      const pid = id + 'L_';
      nodes.push({ id: pid, label: '', shape: 'circle', size: 18, color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }, font: { color: 'rgba(0,0,0,0)' }, borderWidth: 0 });
      edges.push({ from: id, to: pid, arrows: '', color: { color: 'rgba(0,0,0,0)' } });
    }
  }

  traverse(node, baseId);
  return { nodes, edges };
}

function computeTargetId(): string | null {
  if (!root.value) return null;
  let id = 'r';
  for (const step of highlightPath.value ?? []) id += step;
  return id;
}

function renderGraph() {
  if (!graphEl.value || !root.value) return;
  const data = buildGraphData(root.value);
  const options: Options = {
    autoResize: true,
    layout: {
      improvedLayout: true,
      hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed', levelSeparation: 80, nodeSpacing: 150, treeSpacing: 120 }
    },
    physics: false,
    edges: { smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 } },
    interaction: { hover: true, zoomView: true, dragView: true },
    nodes: { size: 24 },
  };

  if (network) {
    network.setData({ nodes: new DataSet(data.nodes), edges: new DataSet(data.edges) });
  } else {
    network = new Network(graphEl.value, { nodes: data.nodes, edges: data.edges }, options);
  }
  const targetId = computeTargetId();
  if (targetId) {
    try { network.selectNodes([targetId]); network.focus(targetId, { animation: { duration: 400, easingFunction: 'easeInOutQuad' }, scale: 1.0 }); } catch {}
  }
}

onMounted(() => { nextTick(() => { if (useGraph.value && root.value) renderGraph(); }); });
onBeforeUnmount(() => { if (network) { network.destroy(); network = null; } });
watch([root, highlightPath, useGraph], () => { nextTick(() => { if (useGraph.value) renderGraph(); }); }, { deep: true });

function remove() {
  message.value = '';
  highlightPath.value = [];
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = deleteRS(root.value, input.value);
  root.value = res.root;
  highlightPath.value = res.path;
  message.value = res.deleted ? `Borrado ${input.value.toUpperCase()}` : `No se encontró ${input.value.toUpperCase()} para borrar`;
  input.value = '';
}
</script>

<style scoped>
.controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.toggle { display: inline-flex; gap: 6px; align-items: center; }
.message { color: #cbd5e1; }
.tree-container { margin-top: 1rem; background: #0b1220; padding: 12px; border-radius: 10px; border: 1px solid #1f2a44; }
.legend { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.badge { font-size: 0.75rem; border: 1px solid #334155; padding: 2px 6px; border-radius: 9999px; background: #0f172a; color: #cbd5e1; }
.badge.left { background: #052f3a; border-color: #155e75; color: #a5f3fc; }
.badge.right { background: #0f144a; border-color: #4f46e5; color: #c7d2fe; }
.badge.connector { background: #0f172a; border-color: #1e293b; color: #93c5fd; }
.graph-wrapper { display: flex; justify-content: center; }
.graph { width: min(100%, 980px); height: 520px; border: 1px solid #1f2a44; border-radius: 8px; background: #0b1220; }
.muted { color: #6b7280; }
</style>
