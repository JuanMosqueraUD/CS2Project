<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  <h1>Árbol de Residuos Múltiples</h1>

  <!-- Panel de configuración inicial -->
  <div class="create-structure" v-if="showConfigPanel">
    <h3>Crear estructura</h3>
    <div>
      <details class="dropdown">
        <summary>Valor de m: <strong>{{ m }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="m = 1">1</a></li>
          <li><a href="#" @click.prevent="m = 2">2</a></li>
          <li><a href="#" @click.prevent="m = 3">3</a></li>
        </ul>
      </details>
      <button @click="createTreeStructure">Crear estructura</button>
    </div>
  </div>

  <!-- Controles principales -->
  <section v-else class="controls">
    <div class="tree-info">
      <span class="badge primary">m = {{ m }}</span>
      <button @click="resetTree" class="reset-btn outline">Reiniciar</button>
    </div>
    
    <div class="operation-controls">
      <input v-model="input" maxlength="1" placeholder="Clave (A-Z)" @input="onInput" />
      <button @click="insert" class="outline contrast" :disabled="!treeCreated">Insertar</button>
      <button @click="search" class="outline" :disabled="!treeCreated">Buscar</button>
      <button @click="remove" class="contrast" :disabled="!treeCreated">Borrar</button>
      <label class="toggle">
        <input type="checkbox" v-model="useGraph" />
        <span>Vista gráfica</span>
      </label>
    </div>
    
    <!-- Información binaria -->
    <div v-if="currentBinaryCode" class="binary-info">
      <div class="binary-display">
        <span class="binary-label">Binario:</span>
        <span class="binary-code">{{ currentBinaryCode }}</span>
      </div>
      <div class="groups-display">
        <span class="groups-label">Grupos:</span>
        <span class="groups-container">
          <span 
            v-for="(group, index) in binaryGroups" 
            :key="index" 
            class="bit-group"
            :class="`group-${index}`"
          >
            {{ group }}
          </span>
        </span>
      </div>
    </div>
    
    <!-- Herramientas adicionales -->
    <div v-if="treeCreated" class="tools-section">
      <div class="tools-buttons">
        <button @click="exportTreeConfig" class="tool-btn outline">Guardar</button>
        <label class="tool-btn outline import-btn">
          Abrir
          <input type="file" accept=".json" @change="importTreeConfig" hidden />
        </label>
      </div>
    </div>
    
    <span v-if="message" class="message">{{ message }}</span>
  </section>

  <section v-if="root && !showConfigPanel" class="tree-container">
    <div v-if="useGraph" class="graph-wrapper">
      <div ref="graphEl" class="graph"></div>
    </div>
    <div v-else class="muted">Activa "Vista gráfica" para ver el árbol.</div>
  </section>

  <p v-else-if="!showConfigPanel" class="muted">Primero crea la estructura del árbol.</p>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { letterToCode } from '../utils/digitalTree';
import { type RMNode, insertRM, searchRM, buildRMTemplate, groupBits } from '../utils/residueMultiTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const input = ref('');
const message = ref('');
const m = ref(2); // default 2 bits per group
const root = ref<RMNode | null>(null);
const pathIdx = ref<number[]>([]);
const useGraph = ref(true);

// Nuevas variables para mejorar la funcionalidad
const treeCreated = ref(false); // Para controlar si ya se creó la estructura
const currentBinaryCode = ref(''); // Código binario actual
const binaryGroups = ref<string[]>([]); // Agrupación de bits
const showConfigPanel = ref(true); // Panel de configuración inicial

// Build template on first mount and when m changes (solo si no se ha creado aún)
watch(m, (mv) => {
  if (!treeCreated.value) {
    const mm = Math.min(3, Math.max(1, mv));
    root.value = buildRMTemplate(mm);
    pathIdx.value = [];
  }
});

const graphEl = ref<HTMLDivElement | null>(null);
let network: Network | null = null;
let networkContainer: HTMLDivElement | null = null;

function onInput(e: Event) {
  const t = e.target as HTMLInputElement;
  t.value = t.value.replace(/[^a-zA-Z]/g, '').slice(0, 1);
  input.value = t.value.toUpperCase();
  message.value = '';
  
  // Actualizar código binario y agrupación si hay una letra
  if (input.value) {
    updateBinaryInfo(input.value);
  } else {
    currentBinaryCode.value = '';
    binaryGroups.value = [];
  }
}

function createTreeStructure() {
  const mv = Math.min(3, Math.max(1, m.value));
  root.value = buildRMTemplate(mv);
  treeCreated.value = true;
  showConfigPanel.value = false;
  pathIdx.value = [];
  message.value = `Estructura del árbol creada con m=${mv}.`;
}

function resetTree() {
  root.value = null;
  treeCreated.value = false;
  showConfigPanel.value = true;
  pathIdx.value = [];
  currentBinaryCode.value = '';
  binaryGroups.value = [];
  message.value = '';
  
  // Limpiar el network si existe
  if (network) {
    network.destroy();
    network = null;
  }
}

function updateBinaryInfo(letter: string) {
  const code = letterToCode(letter);
  if (code) {
    currentBinaryCode.value = code;
    // Importar la función groupBits
    import('../utils/residueMultiTree').then(({ groupBits }) => {
      const mv = Math.min(3, Math.max(1, m.value));
      binaryGroups.value = groupBits(code, mv);
    });
  } else {
    currentBinaryCode.value = '';
    binaryGroups.value = [];
  }
}

// Funciones para persistencia futura (preparación)
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateResidueMultipleImport 
} from "../utils/importExportUtils.ts";

function exportTreeConfig() {
  if (!treeCreated.value || !root.value) {
    message.value = 'No hay árbol para exportar';
    return;
  }
  
  const config = {
    base: m.value, // Usar 'base' en lugar de 'm' para consistencia
    digitosClave: 1 // Los árboles de residuos trabajan con letras (1 carácter)
  };
  
  const exportData = createExportData('residuo-multiple', config, root.value);
  const filename = generateExportFileName('residuo-multiple');
  
  downloadJsonFile(exportData, filename);
  message.value = 'Estructura exportada exitosamente.';
}

async function importTreeConfig(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Usar la utilidad común para validación
    const validation = validateResidueMultipleImport(importData);
    if (!validation.isValid) {
      message.value = validation.error!;
      return;
    }
    
    // Importar exitosamente
    m.value = importData.config.base; // 'base' en lugar de 'm'
    root.value = importData.data;
    treeCreated.value = true;
    showConfigPanel.value = false;
    pathIdx.value = [];
    
    message.value = `Árbol importado exitosamente con base m=${m.value}`;
  } catch (error) {
    message.value = `Error al importar: ${error}`;
  }
  
  // Limpiar input
  input.value = '';
}

function insert() {
  message.value = '';
  const mv = Math.min(3, Math.max(1, m.value));
  if (!treeCreated.value) { message.value = 'Primero debes crear la estructura del árbol'; return; }
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten claves A-Z'; return; }
  
  // Actualizar información binaria
  updateBinaryInfo(input.value);
  
  const res = insertRM(root.value, input.value, mv);
  root.value = res.root;
  pathIdx.value = res.path;
  
  const groupsText = binaryGroups.value.join(' | ');
  message.value = res.status === 'duplicate' 
    ? `Duplicado: ${input.value.toUpperCase()} (${code}) → Grupos: [${groupsText}]`
    : `Insertado: ${input.value.toUpperCase()} (${code}) → Grupos: [${groupsText}] → Ruta: ${res.path.join('→')}`;
  input.value = '';
}

function search() {
  message.value = '';
  const mv = Math.min(3, Math.max(1, m.value));
  if (!treeCreated.value) { message.value = 'Primero debes crear la estructura del árbol'; return; }
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten claves A-Z'; return; }
  
  // Actualizar información binaria
  updateBinaryInfo(input.value);
  
  const res = searchRM(root.value, input.value, mv);
  pathIdx.value = res.path;
  
  const groupsText = binaryGroups.value.join(' | ');
  message.value = res.found 
    ? `✓ Encontrada: ${input.value.toUpperCase()} (${code}) → Grupos: [${groupsText}] → Ruta: ${res.path.join('→')}`
    : `✗ No encontrada: ${input.value.toUpperCase()} (${code}) → Grupos: [${groupsText}]`;
}

function remove() {
  message.value = '';
  const mv = Math.min(3, Math.max(1, m.value));
  if (!treeCreated.value) { message.value = 'Primero debes crear la estructura del árbol'; return; }
  if (!input.value) { message.value = 'Ingresa una clave A-Z'; return; }
  const code = letterToCode(input.value);
  if (!code) { message.value = 'Solo se permiten claves A-Z'; return; }
  
  // Actualizar información binaria
  updateBinaryInfo(input.value);
  
  // Función auxiliar para encontrar el nodo específico
  function findNodeForRemoval(node: RMNode | null, letter: string, m: number): { found: boolean; path: number[]; targetNode: RMNode | null } {
    if (!node || !code) return { found: false, path: [], targetNode: null };
    const groups = groupBits(code, m);
    const path: number[] = [];
    let current: RMNode | null = node;
    
    for (let i = 0; i < groups.length && current; i++) {
      if (current.key !== null) {
        return { 
          found: current.key === letter.toUpperCase(), 
          path, 
          targetNode: current.key === letter.toUpperCase() ? current : null
        };
      }
      const idx = parseInt(groups[i], 2); // Convert binary to index
      path.push(idx);
      current = current.children[idx] ?? null;
    }
    
    if (current && current.key !== null) {
      return { 
        found: current.key === letter.toUpperCase(), 
        path, 
        targetNode: current.key === letter.toUpperCase() ? current : null
      };
    }
    return { found: false, path, targetNode: null };
  }
  
  const result = findNodeForRemoval(root.value, input.value, mv);
  if (result.found && result.targetNode) {
    // Simplemente borrar el contenido del nodo, dejando el espacio vacío
    result.targetNode.key = null;
    result.targetNode.code = null;
    
    const groupsText = binaryGroups.value.join(' | ');
    message.value = `🗑️ Borrado: ${input.value.toUpperCase()} (${code}) → Grupos: [${groupsText}] → Ruta: ${result.path.join('→')}`;
    pathIdx.value = result.path;
  } else {
    const groupsText = binaryGroups.value.join(' | ');
    message.value = `✗ No se encontró ${input.value.toUpperCase()} (${code}) para borrar → Grupos: [${groupsText}]`;
  }
}

function buildGraphData(node: RMNode, baseId = 'r'): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];
  function traverse(n: RMNode, id: string, level: number = 0) {
    const isConnector = n.key === null;
    
    // Configurar etiquetas según los requerimientos de residuos múltiples
    let label = '';
    if (isConnector) {
      // Para conectores, mostrar los labelBits que representan el grupo de bits
      if (n.labelBits) {
        label = n.labelBits; // Ejemplo: "00", "01", "10", "11" para m=2
      } else {
        label = 'r'; // Raíz (no tiene labelBits)
      }
    } else {
      // Para hojas, mantener comportamiento original: mostrar la letra insertada
      label = `${n.key ?? '∅'}`;
    }
    
    nodes.push({
      id,
      label,
      shape: isConnector ? 'box' : 'circle',
      color: { 
        background: isConnector ? '#1e293b' : '#059669', 
        border: isConnector ? '#334155' : '#047857', 
        highlight: { background: '#f59e0b', border: '#d97706' }
      },
      font: { 
        color: '#ffffff',
        face: 'Courier New, monospace', 
        size: isConnector ? 12 : 16,
        bold: !isConnector,
        multi: false,  // Una sola línea para las nuevas etiquetas
        align: 'center'
      },
      borderWidth: 2,
      size: isConnector ? 28 : 32
    });
    
    if (n.children && n.children.length) {
      for (let i = 0; i < n.children.length; i++) {
        const child = n.children[i];
        const cid = id + '_' + i;
        if (child) {
          // Determinar si el child es una hoja (tiene key !== null)
          const isChildLeaf = child.key !== null;
          
          edges.push({ 
            from: id, 
            to: cid, 
            arrows: '', 
            color: { color: '#64748b', highlight: '#f59e0b' },
            hoverWidth: 0,
            selectionWidth: 0,
            // Solo mostrar el número si conecta a una hoja en el último nivel
            label: isChildLeaf ? i.toString() : '',
            font: { 
              color: '#94a3b8', 
              size: 10,
              strokeWidth: 0,
              strokeColor: '#1f2937'
            }
          });
          traverse(child, cid, level + 1);
        } else {
          // invisible placeholder to keep order/spacing consistent
          nodes.push({ 
            id: cid, 
            label: '', 
            shape: 'circle', 
            size: 16, 
            color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }, 
            font: { color: 'rgba(0,0,0,0)' }, 
            borderWidth: 0 
          });
          edges.push({ 
            from: id, 
            to: cid, 
            arrows: '', 
            color: { color: 'rgba(0,0,0,0)' } 
          });
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
        treeSpacing: 100 
      } 
    }, 
    physics: {
      enabled: false  // Asegurar que no hay física
    }, 
    edges: { 
      smooth: { 
        enabled: true, 
        type: 'cubicBezier', 
        roundness: 0.4 
      },
      hoverWidth: 0,  // Sin hover en edges
      selectionWidth: 1
    }, 
    interaction: { 
      hover: false,  // Deshabilitar hover para evitar movimientos automáticos
      zoomView: true,  // Permitir zoom con rueda del mouse
      dragView: true,  // Permitir arrastrar la vista con mouse
      keyboard: { enabled: false },
      zoomSpeed: 1,
      multiselect: false,
      navigationButtons: false,
      tooltipDelay: 300,
      selectConnectedEdges: false,
      hoverConnectedEdges: false,
      dragNodes: false,  // Prevenir arrastrar nodos individuales
      hideEdgesOnDrag: false,
      hideNodesOnDrag: false
    }, 
    nodes: { 
      size: 24,
      fixed: true,  // Nodos fijos para evitar movimiento
      physics: false  // Sin física en nodos
    },
    // Configuración de zoom para un comportamiento más controlado
    configure: {
      enabled: false
    }
  };
  
  // If the container element changed (due to v-if toggling), recreate the network
  if (network && networkContainer !== graphEl.value) {
    try { network.destroy(); } catch {}
    network = null;
    networkContainer = null;
  }
  
  if (network) {
    network.setData({ nodes: new DataSet(data.nodes), edges: new DataSet(data.edges) });
  } else {
    network = new Network(graphEl.value, { nodes: data.nodes, edges: data.edges }, options);
    networkContainer = graphEl.value;
    
    // Asegurar que las configuraciones se apliquen después de la inicialización
    setTimeout(() => {
      if (network) {
        network.setOptions(options);
      }
    }, 100);
  }

  const targetId = computeTargetId();
  if (targetId) { 
    try { 
      network.selectNodes([targetId]); 
      // Centrar sin cambiar la escala para evitar zoom indeseado
      network.focus(targetId, { 
        animation: { duration: 400, easingFunction: 'easeInOutQuad' }
      }); 
    } catch {} 
  }
}

// Solo renderizar el gráfico si ya existe y está activado
onMounted(() => { 
  nextTick(() => { 
    if (useGraph.value && root.value && treeCreated.value) {
      renderGraph(); 
    }
  }); 
});
onBeforeUnmount(() => {
  if (network) { 
    network.destroy(); 
    network = null; 
    networkContainer = null; 
  }
});

// Destroy network when graph hidden (root null or useGraph toggled off)
watch([root, useGraph], () => {
  if (!useGraph.value || !root.value) {
    if (network) { 
      try { network.destroy(); } catch {} 
      network = null; 
      networkContainer = null; 
    }
  }
});
watch([root, pathIdx, useGraph, m], () => {
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
</script>

<style scoped>
/* Interfaz de creación de estructura (similar a HashMod) */
.create-structure {
  margin: 2rem 0;
}

.create-structure h3 {
  margin-bottom: 1rem;
}

.create-structure > div {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.create-structure .dropdown {
  min-width: 150px;
}

.info-text {
  color: #cbd5e1;
  font-weight: 500;
  padding: 0.5rem;
  background: #1f2937;
  border-radius: 4px;
  border-left: 4px solid #3b82f6;
}

/* Controles principales */
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.tree-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.operation-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.reset-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.toggle {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

/* Información binaria */
.binary-info {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.binary-display, .groups-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.binary-label, .groups-label {
  font-weight: 600;
  color: #e0e7ff;
  min-width: 60px;
}

.binary-code {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #10b981;
  letter-spacing: 2px;
}

.groups-container {
  display: flex;
  gap: 0.5rem;
}

.bit-group {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1rem;
  letter-spacing: 1px;
}

.group-0 { background: #fef3c7; color: #92400e; } /* Amarillo */
.group-1 { background: #dbeafe; color: #1e40af; } /* Azul */
.group-2 { background: #fce7f3; color: #be185d; } /* Rosa */
.group-3 { background: #d1fae5; color: #065f46; } /* Verde */
.group-4 { background: #fee2e2; color: #991b1b; } /* Rojo */

/* Herramientas adicionales */
.tools-section {
  border-top: 1px solid #374151;
  padding-top: 1rem;
  margin-top: 1rem;
}

.tools-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.tool-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.import-btn {
  position: relative;
  display: inline-block;
}

.import-btn input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Badges */
.badge {
  font-size: 0.75rem;
  border: 1px solid #334155;
  padding: 4px 8px;
  border-radius: 9999px;
  background: #0f172a;
  color: #cbd5e1;
}

.badge.primary {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

/* Mensajes */
.message {
  color: #e5e7eb;
  font-size: 0.9rem;
}

/* Contenedor del árbol */
.tree-container {
  margin-top: 1rem;
  background: #0b1220;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #1f2a44;
}

.graph-wrapper {
  display: flex;
  justify-content: center;
}

.graph {
  width: min(100%, 980px);
  height: 520px;
  border: 1px solid #1f2a44;
  border-radius: 8px;
  background: #0b1220;
}

.muted {
  color: #6b7280;
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .operation-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .binary-display, .groups-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .groups-container {
    flex-wrap: wrap;
  }
}
</style>
