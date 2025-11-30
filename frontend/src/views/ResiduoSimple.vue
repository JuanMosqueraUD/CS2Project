<template>
  <div class="btn-back">
    <button @click="volverAlMenu" class="outline contrast">
      ← Volver
    </button>
  </div>
  <h1>Árbol de Residuos</h1>

  <section class="controls">
    <input v-model="input" maxlength="1" placeholder="Ingresa una clave (A-Z)" @input="onInput" />
    <button @click="insert" class="outline contrast">Insertar</button>
    <button @click="search" class="outline">Buscar</button>
    <button @click="remove" class="contrast">Borrar</button>
    <button @click="resetTree" class="secondary outline" title="Reiniciar árbol">Reiniciar</button>
    <label class="toggle">
      <input type="checkbox" v-model="useGraph" />
      <span>Vista gráfica</span>
    </label>
    
    <!-- Controles de exportación e importación -->
    <div class="import-export-controls">
      <button @click="exportarEstructura" class="secondary">Guardar</button>
      <label for="import-file" class="secondary file-upload-btn">Abrir</label>
      <input id="import-file" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
    
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

  <p v-else class="muted">Aún no hay nodos. Inserta una clave para crear el árbol.</p>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useNavigation } from '../composables/useNavigation';
import { letterToCode } from '../utils/digitalTree';
import { type RSNode, insertRS, searchRS } from '../utils/residueTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const router = useRouter();
const { navigateTo } = useNavigation();

function volverAlMenu() {
  navigateTo('residuos');
  router.push('/');
}
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateResidueSimpleImport 
} from "../utils/importExportUtils.ts";

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
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten claves A-Z'; return; }
  const res = insertRS(root.value, input.value);
  root.value = res.root;
  highlightPath.value = res.path;
  if (res.status === 'duplicate') {
    message.value = `La clave ${input.value.toUpperCase()} ya existe. Ruta: ${res.path.join('›') || 'raíz'}`;
  } else {
    message.value = `Insertado ${input.value.toUpperCase()} con código ${code} por ruta ${res.path.join('›') || 'raíz'}`;
  }
  input.value = '';
}

function search() {
  message.value = '';
  highlightPath.value = [];
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten claves A-Z'; return; }
  const res = searchRS(root.value, input.value);
  highlightPath.value = res.path;
  if (res.found) {
    message.value = `Encontrada ${input.value.toUpperCase()} por ruta ${res.path.join('›') || 'raíz'}`;
  } else {
    message.value = `No encontrada ${input.value.toUpperCase()}`;
  }
}

function buildGraphData(node: RSNode, baseId = 'r', highlightPath: Array<'L' | 'R'> = []): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverse(n: RSNode, id: string, level: number = 0, pathSoFar: Array<'L' | 'R'> = []) {
    const isHighlighted = pathSoFar.length <= highlightPath.length && 
                         pathSoFar.every((dir, i) => dir === highlightPath[i]);
    const isConnector = n.key === null;
    nodes.push({
      id,
      label: isConnector ? '○' : (n.key ?? '∅'),
      shape: 'circle',
      color: {
        background: isHighlighted ? '#f59e0b' : (isConnector ? '#0f172a' : '#111827'),
        border: isHighlighted ? '#d97706' : (isConnector ? '#1e293b' : '#374151'),
        highlight: { background: '#f59e0b', border: '#d97706' },
        hover: { background: '#1f2937', border: '#4b5563' }
      },
      font: { color: isConnector ? '#93c5fd' : '#ffffff', face: 'Inter, system-ui, sans-serif', bold: { color: '#ffffff' } },
      borderWidth: 2,
      level
    });

    const hasLeft = !!n.left;
    const hasRight = !!n.right;
    
    // Always create left connection - real or invisible
    const lid = id + 'L';
    if (hasLeft) {
      const nextPath = [...pathSoFar, 'L' as const];
      const isEdgeHighlighted = nextPath.length <= highlightPath.length && 
                               nextPath.every((dir, i) => dir === highlightPath[i]);
      
      edges.push({ 
        from: id, 
        to: lid, 
        arrows: '', 
        color: { color: isEdgeHighlighted ? '#f59e0b' : '#94a3b8', highlight: '#f59e0b' },
        width: isEdgeHighlighted ? 3 : 1,
        label: '0',
        font: { size: 12, color: '#6b7280' }
      });
      traverse(n.left as RSNode, lid, level + 1, nextPath);
    } else {
      // Create invisible left node
      nodes.push({
        id: lid,
        label: '',
        shape: 'circle',
        size: 1,
        color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
        font: { color: 'rgba(0,0,0,0)', size: 1 },
        borderWidth: 0,
        level: level + 1,
        physics: false,
        fixed: { x: true, y: true }
      });
      edges.push({ 
        from: id, 
        to: lid, 
        arrows: '', 
        color: { color: 'rgba(0,0,0,0)' },
        width: 0
      });
    }
    
    // Always create right connection - real or invisible  
    const rid = id + 'R';
    if (hasRight) {
      const nextPath = [...pathSoFar, 'R' as const];
      const isEdgeHighlighted = nextPath.length <= highlightPath.length && 
                               nextPath.every((dir, i) => dir === highlightPath[i]);
      
      edges.push({ 
        from: id, 
        to: rid, 
        arrows: '', 
        color: { color: isEdgeHighlighted ? '#f59e0b' : '#94a3b8', highlight: '#f59e0b' },
        width: isEdgeHighlighted ? 3 : 1,
        label: '1',
        font: { size: 12, color: '#6b7280' }
      });
      traverse(n.right as RSNode, rid, level + 1, nextPath);
    } else {
      // Create invisible right node
      nodes.push({
        id: rid,
        label: '',
        shape: 'circle',
        size: 1,
        color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
        font: { color: 'rgba(0,0,0,0)', size: 1 },
        borderWidth: 0,
        level: level + 1,
        physics: false,
        fixed: { x: true, y: true }
      });
      edges.push({ 
        from: id, 
        to: rid, 
        arrows: '', 
        color: { color: 'rgba(0,0,0,0)' },
        width: 0
      });
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
  const data = buildGraphData(root.value, 'r', highlightPath.value || []);
  const options: Options = {
    autoResize: true,
    layout: {
      improvedLayout: true,
      hierarchical: {
        enabled: true,
        direction: 'UD',
        sortMethod: 'directed',
        levelSeparation: 80,
        nodeSpacing: 120,
        treeSpacing: 100,
        blockShifting: true,
        edgeMinimization: true,
        parentCentralization: false,
        shakeTowards: 'leaves'
      }
    },
    physics: {
      enabled: false
    },
    edges: { 
      smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 }
    },
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
watch([root, highlightPath, useGraph], () => {
  nextTick(() => {
    if (useGraph.value && root.value) {
      renderGraph();
    } else if (useGraph.value && !root.value && network) {
      // Si no hay root pero hay network, destruirlo
      network.destroy();
      network = null;
    }
  });
}, { deep: true });

function remove() {
  message.value = '';
  highlightPath.value = [];
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  if (!letterToCode(input.value)) { message.value = 'Solo se permiten claves A-Z'; return; }
  
  // Verificar que el elemento existe antes de intentar borrarlo
  const searchRes = searchRS(root.value, input.value);
  if (!searchRes.found) {
    message.value = `No se encontró ${input.value.toUpperCase()} para borrar`;
    input.value = '';
    return;
  }
  
  // Recopilar todas las letras del árbol excepto la que se va a borrar
  function collectAllLetters(node: RSNode | null): string[] {
    if (!node) return [];
    const letters: string[] = [];
    if (node.key && node.key !== input.value.toUpperCase()) {
      letters.push(node.key);
    }
    return letters.concat(collectAllLetters(node.left), collectAllLetters(node.right));
  }
  
  const allLetters = collectAllLetters(root.value);
  
  // Reconstruir el árbol desde cero
  root.value = null;
  for (const letter of allLetters) {
    const res = insertRS(root.value, letter);
    root.value = res.root;
  }
  
  message.value = `Borrado ${input.value.toUpperCase()} y árbol reconstruido`;
  input.value = '';
}

function resetTree() {
  root.value = null;
  highlightPath.value = [];
  message.value = 'Árbol reiniciado correctamente';
  input.value = '';
  
  // Limpiar el network si existe
  if (network) {
    network.destroy();
    network = null;
  }
}

// Funciones de exportación e importación
function exportarEstructura() {
  if (!root.value) {
    message.value = "Primero debes insertar elementos para exportar la estructura.";
    return;
  }

  const config = {
    digitosClave: 1 // Los árboles de residuos simples trabajan con letras (1 carácter)
  };

  const exportData = createExportData('residuo-simple', config, root.value);
  const filename = generateExportFileName('residuo-simple');
  
  downloadJsonFile(exportData, filename);
  message.value = "Estructura exportada exitosamente.";
}

function importarEstructura(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target?.result as string);
      
      // Usar la utilidad común para validación
      const validation = validateResidueSimpleImport(importData);
      if (!validation.isValid) {
        message.value = validation.error!;
        return;
      }
      
      // Importar exitosamente
      root.value = importData.data;
      highlightPath.value = [];
      
      message.value = "Estructura importada exitosamente.";
      
    } catch (error) {
      message.value = "Error al leer el archivo. Asegúrate de que sea un JSON válido.";
    }
  };
  
  reader.readAsText(file);
  // Limpiar el input para permitir seleccionar el mismo archivo otra vez
  target.value = '';
}
</script>

<style scoped>
.controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.toggle { display: inline-flex; gap: 6px; align-items: center; }
.message { color: #e5e7eb; font-size: 0.9rem; }

.import-export-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.file-upload-btn {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  text-decoration: none;
  border: 1px solid;
  font-size: 0.875rem;
}

.file-upload-btn:hover {
  opacity: 0.8;
}

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
