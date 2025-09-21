<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  <h1>Árbol Digital</h1>

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
    </div>
    <div v-if="!useGraph" class="tree">
      <TreeNode :node="root" :highlightPath="highlightPath" />
    </div>
    <div v-else class="graph-wrapper">
      <div ref="graphEl" class="graph"></div>
    </div>
  </section>

  <p v-else class="muted">Aún no hay nodos. Inserta una letra para crear la raíz.</p>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, type VNode, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';
import { type DTNode, insertNode, letterToCode, searchLetter, deleteLetter } from '../utils/digitalTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const input = ref('');
const message = ref('');
const root = ref<DTNode | null>(null);
const highlightPath = ref<Array<'L' | 'R'>>([]);
const useGraph = ref(true);

// vis-network refs
const graphEl = ref<HTMLDivElement | null>(null);
let network: Network | null = null;

function buildGraphData(node: DTNode, baseId = 'r'): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverse(n: DTNode, id: string) {
    nodes.push({
      id,
      label: n.key ?? '∅',
      shape: 'circle',
      color: {
        background: '#111827',
        border: '#374151',
        highlight: { background: '#f59e0b', border: '#d97706' },
        hover: { background: '#1f2937', border: '#4b5563' }
      },
      font: { color: n.key ? '#ffffff' : '#93c5fd', face: 'Inter, system-ui, sans-serif', bold: { color: '#ffffff' } },
      borderWidth: 2,
    });
    const hasLeft = !!n.left;
    const hasRight = !!n.right;
    if (hasLeft) {
      const lid = id + 'L';
      edges.push({ from: id, to: lid, arrows: '', color: { color: '#94a3b8', highlight: '#f59e0b' } });
      const leftNode = n.left as DTNode;
      traverse(leftNode, lid);
    }
    if (hasRight) {
      const rid = id + 'R';
      edges.push({ from: id, to: rid, arrows: '', color: { color: '#94a3b8', highlight: '#f59e0b' } });
      const rightNode = n.right as DTNode;
      traverse(rightNode, rid);
    }
    // If only one child exists, add a transparent placeholder on the missing side
    if (hasLeft && !hasRight) {
      const pid = id + 'R_';
      nodes.push({
        id: pid,
        label: '',
        shape: 'circle',
        size: 18,
        color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
        font: { color: 'rgba(0,0,0,0)' },
        borderWidth: 0,
      });
      edges.push({ from: id, to: pid, arrows: '', color: { color: 'rgba(0,0,0,0)' } });
    } else if (!hasLeft && hasRight) {
      const pid = id + 'L_';
      nodes.push({
        id: pid,
        label: '',
        shape: 'circle',
        size: 18,
        color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
        font: { color: 'rgba(0,0,0,0)' },
        borderWidth: 0,
      });
      edges.push({ from: id, to: pid, arrows: '', color: { color: 'rgba(0,0,0,0)' } });
    }
  }

  traverse(node, baseId);
  return { nodes, edges };
}

function computeTargetId(): string | null {
  if (!root.value) return null;
  let id = 'r';
  for (const step of highlightPath.value ?? []) {
    id += step;
  }
  return id;
}

function renderGraph() {
  if (!graphEl.value || !root.value) return;
  const data = buildGraphData(root.value);
  const options: Options = {
    autoResize: true,
    layout: {
      improvedLayout: true,
      hierarchical: {
        enabled: true,
        direction: 'UD',
        sortMethod: 'directed',
        levelSeparation: 80,
        nodeSpacing: 150,
        treeSpacing: 120,
      }
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

  // Highlight target
  const targetId = computeTargetId();
  if (targetId) {
    try {
      network.selectNodes([targetId]);
      network.focus(targetId, { animation: { duration: 400, easingFunction: 'easeInOutQuad' }, scale: 1.0 });
    } catch { /* ignore if id not present */ }
  }
}

onMounted(() => {
  nextTick(() => {
    if (useGraph.value && root.value) renderGraph();
  });
});

onBeforeUnmount(() => {
  if (network) { network.destroy(); network = null; }
});

watch([root, highlightPath, useGraph], () => {
  nextTick(() => {
    if (useGraph.value) renderGraph();
  });
}, { deep: true });

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
  const res = insertNode(root.value, input.value);
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
  const res = searchLetter(root.value, input.value);
  highlightPath.value = res.path;
  if (res.found) {
    message.value = `Encontrada ${input.value.toUpperCase()} por ruta ${res.path.join('›') || 'raíz'}`;
  } else {
    message.value = `No encontrada ${input.value.toUpperCase()}`;
  }
}

function remove() {
  message.value = '';
  highlightPath.value = [];
  if (!input.value) { message.value = 'Ingresa una letra A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten letras A-Z'; return; }
  const res = deleteLetter(root.value, input.value);
  root.value = res.root;
  highlightPath.value = res.path;
  if (res.deleted) {
    if (res.mode === 'leaf') message.value = `Borrado ${input.value.toUpperCase()} (hoja)`;
    else if (res.mode === 'one-child') message.value = `Borrado ${input.value.toUpperCase()} (nodo con un hijo)`;
    else if (res.mode === 'two-children') message.value = `Borrado lógico de ${input.value.toUpperCase()} (conservando estructura)`;
    else message.value = `Borrado ${input.value.toUpperCase()}`;
  } else {
    message.value = `No se encontró ${input.value.toUpperCase()} para borrar`;
  }
  input.value = '';
}

interface TreeNodeProps { node: DTNode; highlightPath?: Array<'L' | 'R'> }

const TreeNode = defineComponent<TreeNodeProps>({
  name: 'TreeNode',
  props: {
    node: { type: Object as PropType<DTNode>, required: true },
    highlightPath: { type: Array as PropType<Array<'L' | 'R'>>, required: false }
  },
  setup(props): (() => VNode) {
    const render = (): VNode => {
      // Determine whether this node is the target of highlightPath (end of path)
      const isTarget = props.highlightPath && props.highlightPath.length === 0;
      const leftPath = props.highlightPath && props.highlightPath[0] === 'L' ? props.highlightPath.slice(1) : undefined;
      const rightPath = props.highlightPath && props.highlightPath[0] === 'R' ? props.highlightPath.slice(1) : undefined;

      return h('div', { class: 'node' }, [
        h('div', { class: ['bubble', isTarget ? 'hl' : ''].filter(Boolean).join(' ') }, props.node.key ?? '∅'),
        h('div', { class: 'children' }, [
          props.node.left
            ? h(TreeNode as any, { node: props.node.left, highlightPath: leftPath })
            : h('div', { class: 'placeholder l' }, '•'),
          props.node.right
            ? h(TreeNode as any, { node: props.node.right, highlightPath: rightPath })
            : h('div', { class: 'placeholder r' }, '•')
        ])
      ]);
    };
    return render;
  }
});
</script>

<style scoped>
.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.toggle { display: inline-flex; gap: 6px; align-items: center; }
.message { color: #334155; }
.tree-container { margin-top: 1rem; background: #0b1220; padding: 12px; border-radius: 10px; border: 1px solid #1f2a44; }
.legend { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.badge { font-size: 0.75rem; border: 1px solid #334155; padding: 2px 6px; border-radius: 9999px; background: #0f172a; color: #cbd5e1; }
.badge.left { background: #052f3a; border-color: #155e75; color: #a5f3fc; }
.badge.right { background: #0f144a; border-color: #4f46e5; color: #c7d2fe; }
.tree { display: flex; justify-content: center; }
.graph-wrapper { display: flex; justify-content: center; }
.graph { width: min(100%, 980px); height: 520px; border: 1px solid #1f2a44; border-radius: 8px; background: #0b1220; }
.node { text-align: center; }
.bubble { display: inline-block; min-width: 36px; padding: 6px 10px; border-radius: 9999px; background: #111827; color: white; font-weight: 700; }
.bubble.hl { outline: 3px solid #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.25); }
.children { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; align-items: start; }
.placeholder { color: #cbd5e1; font-size: 20px; }
.placeholder.l { justify-self: end; }
.placeholder.r { justify-self: start; }
</style>
