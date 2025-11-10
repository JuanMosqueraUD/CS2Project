<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  <h1>Árbol de Huffman</h1>

  <section class="controls">
    <input v-model="inputText" placeholder="Ingresa un mensaje a enviar" @input="onTextInput" />
    <button @click="buildTree" class="outline contrast">Construir Árbol</button>
    <button @click="recoverString" class="outline" :disabled="!huffmanResult">Recuperar Cadena</button>
    <button @click="resetTree" class="secondary outline" title="Reiniciar árbol">Reiniciar</button>
    
    <div class="import-export-controls">
      <button @click="exportarEstructura" class="secondary" :disabled="!huffmanResult">Guardar</button>
      <label for="import-file" class="secondary file-upload-btn">Abrir</label>
      <input id="import-file" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
    
    <label class="toggle">
      <input type="checkbox" v-model="useGraph" />
      <span>Vista gráfica</span>
    </label>
    <span v-if="message" class="message">{{ message }}</span>
  </section>

  <!-- Frequency table -->
  <section v-if="huffmanResult && huffmanResult.frequencies.length > 0" class="frequency-section">
    <h3>Tabla de Frecuencias</h3>
    <div class="frequency-grid">
      <div class="frequency-header">
        <span>Carácter</span>
        <span>Frecuencia</span>
        <span>Código</span>
      </div>
      <div v-for="freq in sortedFrequencies" :key="freq.char" class="frequency-row">
        <span class="char">{{ freq.char === ' ' ? '[ESP]' : freq.char }}</span>
        <span class="freq">{{ freq.frequency }}</span>
        <span class="code">{{ freq.code || '-' }}</span>
      </div>
    </div>
    
    <!-- Métrica de Longitud L -->
    <div class="metric-section">
      <span class="metric-label">Longitud L:</span>
      <span class="metric-value-compact">{{ longitudL }}</span>
      <span class="metric-hint">(Σ frecuencia × long. código)</span>
    </div>
  </section>

  <!-- String recovery section -->
  <section v-if="recoveryResult" class="recovery-section">
    <div class="recovery-grid">
      <div class="original-section">
        <h4>Texto Original:</h4>
        <div class="result-text">{{ recoveryResult.original }}</div>
      </div>
      
      <div class="encoded-section">
        <h4>Código Binario:</h4>
        <div class="result-code">{{ recoveryResult.encoded }}</div>
      </div>
    </div>
  </section>

  <!-- Tree visualization -->
  <section v-if="huffmanResult && huffmanResult.tree" class="tree-container">
    <h3>Árbol de Huffman</h3>
    <div class="legend">
      <span class="badge leaf">Hoja (carácter)</span>
      <span class="badge internal">Nodo interno</span>
    </div>
    <div v-if="useGraph" class="graph-wrapper">
      <div ref="graphEl" class="graph"></div>
    </div>
    <div v-else class="muted">Activa "Vista gráfica" para ver el árbol.</div>
  </section>

  <p v-else class="muted">Ingresa una cadena de texto y construye el árbol para comenzar.</p>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { 
  type HuffmanResult, 
  type HuffmanNode, 
  type CharFrequency,
  createHuffmanFromText,
  encodeText
} from '../utils/huffmanTree';
import { DataSet, Network, type Options } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const inputText = ref('');
const message = ref('');
const huffmanResult = ref<HuffmanResult | null>(null);
const recoveryResult = ref<{ original: string; encoded: string } | null>(null);
const useGraph = ref(true);

const graphEl = ref<HTMLDivElement | null>(null);
let network: Network | null = null;

const sortedFrequencies = computed(() => {
  if (!huffmanResult.value) return [];
  return [...huffmanResult.value.frequencies].sort((a, b) => b.frequency - a.frequency);
});

// Calcular la longitud promedio L (longitud ponderada)
const longitudL = computed(() => {
  if (!huffmanResult.value || !huffmanResult.value.frequencies) return 0;
  
  // L = Σ(frecuencia × longitud_código)
  const sumaPonderada = huffmanResult.value.frequencies.reduce((sum, freq) => {
    const longitudCodigo = freq.code ? freq.code.length : 0;
    return sum + (freq.frequency * longitudCodigo);
  }, 0);
  
  return sumaPonderada;
});

function onTextInput() {
  message.value = '';
  huffmanResult.value = null;
  recoveryResult.value = null;
}

function buildTree() {
  message.value = '';
  if (!inputText.value.trim()) {
    message.value = 'Ingresa una cadena de texto válida';
    return;
  }
  
  huffmanResult.value = createHuffmanFromText(inputText.value);
  message.value = `Árbol construido con ${huffmanResult.value.frequencies.length} caracteres únicos`;
}

function recoverString() {
  if (!huffmanResult.value) return;
  
  const originalText = huffmanResult.value.originalText;
  const encodedText = encodeText(originalText, huffmanResult.value.codes);
  
  recoveryResult.value = {
    original: originalText,
    encoded: encodedText
  };
  
  message.value = `Cadena recuperada: "${originalText}" → ${encodedText}`;
}

function resetTree() {
  inputText.value = '';
  huffmanResult.value = null;
  recoveryResult.value = null;
  message.value = 'Árbol reiniciado correctamente';
  
  // Limpiar el network si existe
  if (network) {
    network.destroy();
    network = null;
  }
}

function buildGraphData(node: HuffmanNode, baseId = 'r'): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  function traverse(n: HuffmanNode, id: string, level: number = 0) {
    const isLeaf = n.isLeaf && n.char !== null && n.char !== '';
    const label = isLeaf ? (n.char === ' ' ? '[ESP]' : n.char) : `${n.frequency}`;
    
    nodes.push({
      id,
      label,
      shape: 'circle',
      color: {
        background: isLeaf ? '#111827' : '#0f172a',
        border: isLeaf ? '#374151' : '#1e293b',
        highlight: { background: '#f59e0b', border: '#d97706' },
        hover: { background: '#1f2937', border: '#4b5563' }
      },
      font: { 
        color: isLeaf ? '#ffffff' : '#93c5fd', 
        face: 'Inter, system-ui, sans-serif', 
        bold: { color: '#ffffff' } 
      },
      borderWidth: 2,
      level
    });
    
    // Always create left connection - real or invisible
    const lid = id + 'L';
    if (n.left) {
      edges.push({ 
        from: id, 
        to: lid, 
        arrows: '', 
        color: { color: '#94a3b8', highlight: '#f59e0b' },
        label: '0',
        font: { size: 12, color: '#6b7280' }
      });
      traverse(n.left, lid, level + 1);
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
    if (n.right) {
      edges.push({ 
        from: id, 
        to: rid, 
        arrows: '', 
        color: { color: '#94a3b8', highlight: '#f59e0b' },
        label: '1',
        font: { size: 12, color: '#6b7280' }
      });
      traverse(n.right, rid, level + 1);
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
  
  traverse(node, baseId, 0);
  return { nodes, edges };
}

function renderGraph() {
  if (!graphEl.value || !huffmanResult.value || !huffmanResult.value.tree) return;
  
  const data = buildGraphData(huffmanResult.value.tree);
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
    physics: false,
    edges: { smooth: { enabled: true, type: 'cubicBezier', roundness: 0.4 } },
    interaction: { hover: true, zoomView: true, dragView: true },
    nodes: { size: 24 }
  };
  
  if (network) {
    network.setData({ nodes: new DataSet(data.nodes), edges: new DataSet(data.edges) });
  } else {
    network = new Network(graphEl.value, { nodes: data.nodes, edges: data.edges }, options);
  }
}

// Import/Export functions
function exportarEstructura() {
  if (!huffmanResult.value) {
    message.value = 'Primero debes construir un árbol para exportar.';
    return;
  }

  const exportData = {
    type: 'huffman',
    version: '1.0',
    timestamp: new Date().toISOString(),
    config: {
      originalText: huffmanResult.value.originalText
    },
    data: {
      frequencies: huffmanResult.value.frequencies,
      tree: huffmanResult.value.tree
    }
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `huffman_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  link.click();
  
  message.value = 'Árbol de Huffman exportado exitosamente.';
}

function importarEstructura(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target?.result as string);
      
      if (importData.type !== 'huffman') {
        message.value = 'Este archivo no contiene un árbol de Huffman válido.';
        return;
      }
      
      if (!importData.data || !importData.data.frequencies || !importData.config) {
        message.value = 'El archivo no tiene el formato esperado.';
        return;
      }
      
      // Reconstruct huffman result
      huffmanResult.value = {
        tree: importData.data.tree,
        frequencies: importData.data.frequencies,
        codes: new Map(importData.data.frequencies.map((f: CharFrequency) => [f.char, f.code || ''])),
        originalText: importData.config.originalText || ''
      };
      
      inputText.value = huffmanResult.value.originalText;
      inputText.value = huffmanResult.value.originalText;
      
      message.value = `Árbol de Huffman importado exitosamente. Texto original: "${huffmanResult.value.originalText}"`;
      
    } catch (error) {
      message.value = 'Error al leer el archivo. Asegúrate de que sea un JSON válido.';
    }
  };
  
  reader.readAsText(file);
  target.value = '';
}

onMounted(() => {
  nextTick(() => {
    if (useGraph.value && huffmanResult.value) renderGraph();
  });
});

onBeforeUnmount(() => {
  if (network) {
    network.destroy();
    network = null;
  }
});

watch([huffmanResult, useGraph], () => {
  nextTick(() => {
    if (useGraph.value && huffmanResult.value && huffmanResult.value.tree) {
      renderGraph();
    } else if (useGraph.value && (!huffmanResult.value || !huffmanResult.value.tree) && network) {
      // Si no hay resultado pero hay network, destruirlo
      network.destroy();
      network = null;
    }
  });
}, { deep: true });
</script>

<style scoped>
.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.import-export-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.file-upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.file-upload-btn:hover {
  opacity: 0.8;
}

.toggle {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.message {
  color: #e5e7eb; 
  font-size: 0.9rem;
}

.frequency-section {
  margin: 1.5rem 0;
}

.frequency-grid {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 0.5rem;
  max-width: 400px;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1rem;
  background: #0f172a;
}

.frequency-header {
  display: contents;
  font-weight: 700;
  color: #f8fafc;
}

.frequency-header > span {
  padding: 0.25rem 0.5rem;
  border-bottom: 2px solid #475569;
}

.frequency-row {
  display: contents;
}

.frequency-row > span {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #374151;
  color: #e2e8f0;
}

.char {
  font-family: monospace;
  font-weight: 600;
  background: #1e293b;
  border-radius: 4px;
  color: #fbbf24;
}

.code {
  font-family: monospace;
  color: #34d399;
  font-weight: 500;
}

.metric-section {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #475569;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.metric-label {
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 600;
}

.metric-value-compact {
  font-size: 1.25rem;
  color: #3b82f6;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.metric-hint {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.recovery-section {
  margin: 1.5rem 0;
}

.recovery-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.original-section, .encoded-section {
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1rem;
  background: #0f172a;
}

.original-section h4, .encoded-section h4 {
  margin: 0 0 0.75rem 0;
  color: #f8fafc;
}

.result-text, .result-code {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 4px;
  padding: 0.75rem;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  color: #e2e8f0;
  min-height: 2.5rem;
}

.result-code {
  color: #34d399;
}

.tree-container {
  margin-top: 1.5rem;
  background: #0b1220;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #1f2a44;
}

.legend {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  border: 1px solid #334155;
  padding: 2px 6px;
  border-radius: 9999px;
  background: #0f172a;
  color: #cbd5e1;
}

.badge.leaf {
  background: #052f3a;
  border-color: #155e75;
  color: #a5f3fc;
}

.badge.internal {
  background: #0f144a;
  border-color: #4f46e5;
  color: #c7d2fe;
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
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .recovery-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
