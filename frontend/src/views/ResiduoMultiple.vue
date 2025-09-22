<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  <h1>Árbol de Residuos Múltiples</h1>

  <section class="controls">
    <label>m (grupos de bits):
      <input type="number" v-model.number="m" min="1" max="3" />
    </label>
    <input v-model="input" maxlength="1" placeholder="Letra (A-Z)" @input="onInput" />
    <button @click="insert" class="outline contrast">Insertar</button>
    <button @click="search" class="outline">Buscar</button>
    <label class="toggle">
      <input type="checkbox" v-model="useGraph" />
      <span>Vista gráfica</span>
    </label>
    <span v-if="message" class="message">{{ message }}</span>
  </section>

  <section v-if="root" class="tree-container">
    <div class="legend">
      <span class="badge">Aridad: {{ arity }}</span>
    </div>
    <div v-if="useGraph" class="graph-wrapper">
      <div ref="graphEl" class="graph"></div>
    </div>
    <div v-else class="muted">Activa "Vista gráfica" para ver el árbol.</div>
  </section>

  <p v-else class="muted">Aún no hay nodos. Inserta una letra.</p>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { letterToCode } from '../utils/digitalTree';
import { type RMNode, insertRM, searchRM, buildRMTemplate } from '../utils/residueMultiTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const input = ref('');
const message = ref('');
const m = ref(2); // default 2 bits per group
const root = ref<RMNode | null>(null);
// Build template on first mount and when m changes
watch(m, (mv) => {
  const mm = Math.min(3, Math.max(1, mv));
  root.value = buildRMTemplate(mm);
  pathIdx.value = [];
});
onMounted(() => { root.value = buildRMTemplate(Math.min(3, Math.max(1, m.value))); });
const pathIdx = ref<number[]>([]);
const useGraph = ref(true);

const arity = computed(() => 2 ** Math.min(3, Math.max(1, m.value)));
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
  const mv = Math.min(3, Math.max(1, m.value));
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = insertRM(root.value, input.value, mv);
  root.value = res.root;
  pathIdx.value = res.path;
  message.value = res.status === 'duplicate' ? `Duplicado: ${input.value.toUpperCase()}` : `Insertado ${input.value.toUpperCase()} (m=${mv})`;
  input.value = '';
}

function search() {
  message.value = '';
  const mv = Math.min(3, Math.max(1, m.value));
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = searchRM(root.value, input.value, mv);
  pathIdx.value = res.path;
  message.value = res.found ? `Encontrada ${input.value.toUpperCase()}` : `No encontrada ${input.value.toUpperCase()}`;
}

function buildGraphData(node: RMNode, baseId = 'r'): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];
  function traverse(n: RMNode, id: string) {
    const isConnector = n.key === null;
    nodes.push({
      id,
      label: isConnector ? (n.labelBits ?? '○') : (n.key ?? '∅'),
      shape: 'circle',
      color: { background: isConnector ? '#0f172a' : '#111827', border: isConnector ? '#1e293b' : '#374151', highlight: { background: '#f59e0b', border: '#d97706' }, hover: { background: '#1f2937', border: '#4b5563' } },
      font: { color: isConnector ? '#93c5fd' : '#ffffff', face: 'Inter, system-ui, sans-serif', bold: { color: '#ffffff' } },
      borderWidth: 2,
    });
    if (n.children && n.children.length) {
      for (let i = 0; i < n.children.length; i++) {
        const child = n.children[i];
        const cid = id + '_' + i;
        if (child) {
          edges.push({ from: id, to: cid, arrows: '', color: { color: '#94a3b8', highlight: '#f59e0b' } });
          traverse(child, cid);
        } else {
          // invisible placeholder to keep order/spacing consistent
          nodes.push({ id: cid, label: '', shape: 'circle', size: 16, color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }, font: { color: 'rgba(0,0,0,0)' }, borderWidth: 0 });
          edges.push({ from: id, to: cid, arrows: '', color: { color: 'rgba(0,0,0,0)' } });
        }
      }
    }
  }
  traverse(node, baseId);
  return { nodes, edges };
}

function computeTargetId(): string | null {
  if (!root.value) return null;
  let id = 'r';
  for (const idx of pathIdx.value ?? []) id += '_' + idx;
  return id;
}

function renderGraph() {
  if (!graphEl.value || !root.value) return;
  const data = buildGraphData(root.value);
  const options: Options = { autoResize: true, layout: { improvedLayout: true, hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed', levelSeparation: 80, nodeSpacing: 120, treeSpacing: 100 } }, physics: false, edges: { smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 } }, interaction: { hover: true, zoomView: true, dragView: true }, nodes: { size: 24 } };
  if (network) { network.setData({ nodes: new DataSet(data.nodes), edges: new DataSet(data.edges) }); }
  else { network = new Network(graphEl.value, { nodes: data.nodes, edges: data.edges }, options); }
  const targetId = computeTargetId();
  if (targetId) { try { network.selectNodes([targetId]); network.focus(targetId, { animation: { duration: 400, easingFunction: 'easeInOutQuad' }, scale: 1.0 }); } catch {} }
}

onMounted(() => { nextTick(() => { if (useGraph.value && root.value) renderGraph(); }); });
onBeforeUnmount(() => { if (network) { network.destroy(); network = null; } });
watch([root, pathIdx, useGraph, m], () => { nextTick(() => { if (useGraph.value) renderGraph(); }); }, { deep: true });
</script>

<style scoped>
.controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.toggle { display: inline-flex; gap: 6px; align-items: center; }
.message { color: #cbd5e1; }
.tree-container { margin-top: 1rem; background: #0b1220; padding: 12px; border-radius: 10px; border: 1px solid #1f2a44; }
.legend { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.badge { font-size: 0.75rem; border: 1px solid #334155; padding: 2px 6px; border-radius: 9999px; background: #0f172a; color: #cbd5e1; }
.graph-wrapper { display: flex; justify-content: center; }
.graph { width: min(100%, 980px); height: 520px; border: 1px solid #1f2a44; border-radius: 8px; background: #0b1220; }
.muted { color: #6b7280; }
</style>
