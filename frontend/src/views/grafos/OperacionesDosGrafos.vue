<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Operaciones entre 2 Grafos</h1>

    <!-- Botón Importar Grafos (siempre visible) -->
    <div class="import-section">
      <button @click="triggerFileInput" class="btn-import">📥 Importar Grafos</button>
      <input 
        ref="fileInput" 
        type="file" 
        accept=".json" 
        style="display: none" 
        @change="importarGrafos"
      />
    </div>

    <!-- Selector de Grafo a Modificar -->
    <div class="graph-selector-section">
      <label>Selecciona el grafo a modificar:</label>
      <div class="selector-buttons">
        <button 
          @click="grafoSeleccionado = 'G1'" 
          :class="{ active: grafoSeleccionado === 'G1' }"
          class="selector-btn"
        >
          G1
        </button>
        <button 
          @click="grafoSeleccionado = 'G2'" 
          :class="{ active: grafoSeleccionado === 'G2' }"
          class="selector-btn"
        >
          G2
        </button>
      </div>
    </div>

    <!-- Crear grafos -->
    <div v-if="!grafosCreados" class="create-structure">
      <h3>Crear Grafos</h3>
      
      <div class="config-row">
        <div>
          <label>Cantidad de Nodos (G1):</label>
          <input 
            type="number" 
            v-model.number="config.G1.cantidadNodos" 
            min="1"
            placeholder="Ej: 5"
          />
        </div>
        
        <div>
          <label>Cantidad de Nodos (G2):</label>
          <input 
            type="number" 
            v-model.number="config.G2.cantidadNodos" 
            min="1"
            placeholder="Ej: 5"
          />
        </div>
      </div>

      <div class="info-preview" v-if="config.G1.cantidadNodos > 0 && config.G2.cantidadNodos > 0">
        <p><strong>G1 - Nodos:</strong> {{ config.G1.cantidadNodos }}</p>
        <p><strong>G2 - Nodos:</strong> {{ config.G2.cantidadNodos }}</p>
        <p><strong>Tipo:</strong> No Dirigido (fijo)</p>
        <p><strong>Ponderado:</strong> No (fijo)</p>
      </div>

      <button @click="crearGrafos">Crear Grafos</button>
    </div>

    <!-- Grafos creados -->
    <div v-else>
      <!-- Info de los grafos -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-group">
            <h4>Grafo G1</h4>
            <div class="info-item">
              <strong>Nodos:</strong> {{ grafos.G1.nodos.length }}
            </div>
            <div class="info-item">
              <strong>Aristas:</strong> {{ contarAristas('G1') }}
            </div>
          </div>
          <div class="info-group">
            <h4>Grafo G2</h4>
            <div class="info-item">
              <strong>Nodos:</strong> {{ grafos.G2.nodos.length }}
            </div>
            <div class="info-item">
              <strong>Aristas:</strong> {{ contarAristas('G2') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Aristas -->
      <div class="edge-management">
        <h3>Gestión de Aristas - Grafo {{ grafoSeleccionado }}</h3>
        <div class="edge-controls">
          <input 
            type="text" 
            v-model="aristaInput" 
            placeholder="Ej: 12 para conectar nodo 1 y 2"
            maxlength="10"
            @keyup.enter="agregarArista"
          />
          <button @click="agregarArista">Agregar Arista</button>
        </div>
        <p class="help-text">
          Formato: "12" crea arista bidireccional 1↔2
        </p>
      </div>

      <!-- Operaciones -->
      <div class="operations">
        <h3>Operaciones del Grafo - {{ grafoSeleccionado }}</h3>
        <div class="operations-grid">
          <!-- Insertar Nodo -->
          <div class="operation-card">
            <h4>Insertar Nodo</h4>
            <button @click="insertarNodo">Agregar Nodo</button>
          </div>

          <!-- Eliminar Nodo -->
          <div class="operation-card">
            <h4>Eliminar Nodo</h4>
            <input 
              type="number" 
              v-model.number="nodoEliminar" 
              placeholder="Número de nodo"
              min="1"
            />
            <button @click="eliminarNodo">Eliminar</button>
          </div>

          <!-- Borrar Arista -->
          <div class="operation-card">
            <h4>Borrar Arista</h4>
            <input 
              type="text" 
              v-model="aristaBorrar" 
              placeholder="Ej: 12"
              maxlength="10"
            />
            <button @click="borrarArista">Borrar</button>
          </div>
        </div>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Visualización de los Grafos -->
      <div class="graph-visualization">
        <h3>Visualización de los Grafos</h3>
        <div class="graphs-container">
          <div class="graph-wrapper">
            <h4>Grafo G1</h4>
            <div id="graph-container-g1" ref="graphContainerG1" class="graph-container"></div>
          </div>
          <div class="graph-wrapper">
            <h4>Grafo G2</h4>
            <div id="graph-container-g2" ref="graphContainerG2" class="graph-container"></div>
          </div>
        </div>
      </div>

      <!-- Panel de notación de los grafos -->
      <div class="set-notation">
        <h4>Representación en Teoría de Conjuntos:</h4>
        <div class="notation-content">
          <div class="grafo-notation">
            <h5>Grafo G1:</h5>
            <p><strong>V₁ =</strong> {{ formatearConjuntoNodos('G1') }}</p>
            <p><strong>A₁ =</strong> {{ formatearConjuntoAristas('G1') }}</p>
          </div>
          <div class="grafo-notation">
            <h5>Grafo G2:</h5>
            <p><strong>V₂ =</strong> {{ formatearConjuntoNodos('G2') }}</p>
            <p><strong>A₂ =</strong> {{ formatearConjuntoAristas('G2') }}</p>
          </div>
        </div>
      </div>

      <!-- Botón de reseteo y guardado -->
      <div class="reset-section">
        <button @click="resetearGrafos" class="btn-danger">Resetear Grafos</button>
        <button @click="guardarGrafos" class="btn-save">💾 Guardar Grafos</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface Nodo {
  id: number | string;
  label: string;
}

interface Arista {
  from: number | string;
  to: number | string;
  peso?: number;
}

interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

interface Config {
  G1: { cantidadNodos: number };
  G2: { cantidadNodos: number };
}

const config = ref<Config>({
  G1: { cantidadNodos: 5 },
  G2: { cantidadNodos: 5 }
});

const grafosCreados = ref(false);
const grafoSeleccionado = ref<'G1' | 'G2'>('G1');

const grafos = ref<{ G1: Grafo; G2: Grafo }>({
  G1: { nodos: [], aristas: [] },
  G2: { nodos: [], aristas: [] }
});

const aristaInput = ref('');
const nodoEliminar = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);

const graphContainerG1 = ref<HTMLElement | null>(null);
const graphContainerG2 = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

let networkG1: Network | null = null;
let networkG2: Network | null = null;
let nodesDataSetG1: DataSet<any> | null = null;
let edgesDataSetG1: DataSet<any> | null = null;
let nodesDataSetG2: DataSet<any> | null = null;
let edgesDataSetG2: DataSet<any> | null = null;

function crearGrafos() {
  if (config.value.G1.cantidadNodos <= 0 || config.value.G2.cantidadNodos <= 0) {
    mostrarMensaje('Por favor ingrese cantidades válidas de nodos para ambos grafos', true);
    return;
  }

  // Crear grafo G1
  grafos.value.G1.nodos = [];
  for (let i = 1; i <= config.value.G1.cantidadNodos; i++) {
    grafos.value.G1.nodos.push({
      id: i,
      label: `${i}`
    });
  }
  grafos.value.G1.aristas = [];

  // Crear grafo G2
  grafos.value.G2.nodos = [];
  for (let i = 1; i <= config.value.G2.cantidadNodos; i++) {
    grafos.value.G2.nodos.push({
      id: i,
      label: `${i}`
    });
  }
  grafos.value.G2.aristas = [];

  grafosCreados.value = true;
  mostrarMensaje('Grafos creados correctamente', false);

  nextTick(() => {
    inicializarVisualizacion();
  });
}

function inicializarVisualizacion() {
  inicializarGrafo('G1');
  inicializarGrafo('G2');
}

function inicializarGrafo(grafoKey: 'G1' | 'G2') {
  const grafo = grafos.value[grafoKey];
  const container = grafoKey === 'G1' ? graphContainerG1.value : graphContainerG2.value;

  if (!container) return;

  const colorBase = grafoKey === 'G1' ? '#3b82f6' : '#10b981';
  const colorDark = grafoKey === 'G1' ? '#1e40af' : '#047857';

  const nodesData = new DataSet(
    grafo.nodos.map((nodo: Nodo) => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: colorBase,
        border: colorDark,
        highlight: {
          background: '#f59e0b',
          border: '#d97706'
        }
      },
      font: {
        color: '#e5e7eb',
        size: 16
      }
    }))
  );

  const edgesData = new DataSet(
    grafo.aristas.map((arista: Arista, index: number) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: '',
      arrows: undefined,
      color: {
        color: colorBase,
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      }
    }))
  );

  if (grafoKey === 'G1') {
    nodesDataSetG1 = nodesData;
    edgesDataSetG1 = edgesData;
  } else {
    nodesDataSetG2 = nodesData;
    edgesDataSetG2 = edgesData;
  }

  const data = {
    nodes: grafoKey === 'G1' ? (nodesDataSetG1 as any) : (nodesDataSetG2 as any),
    edges: grafoKey === 'G1' ? (edgesDataSetG1 as any) : (edgesDataSetG2 as any)
  };

  const options = {
    nodes: {
      shape: 'circle',
      size: 25,
      borderWidth: 2
    },
    edges: {
      width: 2,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.5
      }
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 150,
        springConstant: 0.04
      },
      stabilization: {
        iterations: 100
      }
    },
    interaction: {
      hover: true,
      dragNodes: true,
      dragView: true,
      zoomView: true
    }
  };

  if (grafoKey === 'G1') {
    if (!graphContainerG1.value) return;
    networkG1 = new Network(graphContainerG1.value, data, options);
  } else {
    if (!graphContainerG2.value) return;
    networkG2 = new Network(graphContainerG2.value, data, options);
  }
}

function actualizarVisualizacion(grafoKey: 'G1' | 'G2') {
  const grafo = grafos.value[grafoKey];
  const nodesDataSet = grafoKey === 'G1' ? nodesDataSetG1 : nodesDataSetG2;
  const edgesDataSet = grafoKey === 'G1' ? edgesDataSetG1 : edgesDataSetG2;
  const colorBase = grafoKey === 'G1' ? '#3b82f6' : '#10b981';

  if (!nodesDataSet || !edgesDataSet) return;

  // Actualizar nodos
  const nodosActuales = nodesDataSet.get();
  const nodosNuevos = grafo.nodos.map((nodo: Nodo) => nodo.id);

  nodosActuales.forEach((nodo: any) => {
    if (!nodosNuevos.includes(nodo.id)) {
      nodesDataSet.remove(nodo.id);
    }
  });

  grafo.nodos.forEach((nodo: Nodo) => {
    const existe = nodesDataSet.get(nodo.id);
    if (!existe) {
      nodesDataSet.add({
        id: nodo.id,
        label: nodo.label,
        color: {
          background: colorBase,
          border: colorBase === '#3b82f6' ? '#1e40af' : '#047857',
          highlight: {
            background: '#f59e0b',
            border: '#d97706'
          }
        },
        font: {
          color: '#e5e7eb',
          size: 16
        }
      });
    }
  });

  // Limpiar y reconstruir todas las aristas
  edgesDataSet.clear();
  grafo.aristas.forEach((arista: Arista, index: number) => {
    const edgeId = `${grafoKey}_${String(arista.from)}_${String(arista.to)}_${index}`;
    edgesDataSet.add({
      id: edgeId,
      from: arista.from,
      to: arista.to,
      label: '',
      arrows: undefined,
      color: {
        color: colorBase,
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      }
    });
  });
}

function agregarArista() {
  const grafo = grafos.value[grafoSeleccionado.value];

  if (!aristaInput.value || aristaInput.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaInput.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  if (!existeNodo(grafo, nodo1) || !existeNodo(grafo, nodo2)) {
    mostrarMensaje('Uno o ambos nodos no existen en el grafo ' + grafoSeleccionado.value, true);
    return;
  }

  if (nodo1 === nodo2) {
    mostrarMensaje('No se puede crear una arista de un nodo a sí mismo', true);
    return;
  }

  if (existeArista(grafo, nodo1, nodo2)) {
    mostrarMensaje('Esta arista ya existe', true);
    return;
  }

  grafo.aristas.push({
    from: nodo1,
    to: nodo2
  });

  actualizarVisualizacion(grafoSeleccionado.value);
  mostrarMensaje(
    `Arista agregada a ${grafoSeleccionado.value}: ${nodo1}↔${nodo2}`,
    false
  );

  aristaInput.value = '';
}

function insertarNodo() {
  const grafo = grafos.value[grafoSeleccionado.value];
  const numericIds = grafo.nodos.map(n => Number(n.id)).filter(x => !isNaN(x));
  const nuevoId = numericIds.length ? Math.max(...numericIds) + 1 : 1;

  grafo.nodos.push({ id: nuevoId, label: `${nuevoId}` });

  actualizarVisualizacion(grafoSeleccionado.value);
  mostrarMensaje(`Nodo ${nuevoId} insertado en ${grafoSeleccionado.value}`, false);
}

function eliminarNodo() {
  const grafo = grafos.value[grafoSeleccionado.value];

  if (!nodoEliminar.value) {
    mostrarMensaje('Por favor ingrese un número de nodo', true);
    return;
  }

  const id = nodoEliminar.value;

  if (!existeNodo(grafo, id)) {
    mostrarMensaje(`El nodo ${id} no existe en ${grafoSeleccionado.value}`, true);
    return;
  }

  grafo.nodos = grafo.nodos.filter(n => n.id !== id);
  grafo.aristas = grafo.aristas.filter(
    arista => arista.from !== id && arista.to !== id
  );

  actualizarVisualizacion(grafoSeleccionado.value);
  mostrarMensaje(`Nodo ${id} eliminado de ${grafoSeleccionado.value} junto con sus aristas`, false);
  nodoEliminar.value = null;
}

function borrarArista() {
  const grafo = grafos.value[grafoSeleccionado.value];

  if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaBorrar.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  const aristaIndex = grafo.aristas.findIndex(
    arista =>
      (String(arista.from) === String(nodo1) && String(arista.to) === String(nodo2)) ||
      (String(arista.from) === String(nodo2) && String(arista.to) === String(nodo1))
  );

  if (aristaIndex === -1) {
    mostrarMensaje('La arista no existe', true);
    return;
  }

  grafo.aristas.splice(aristaIndex, 1);
  actualizarVisualizacion(grafoSeleccionado.value);
  mostrarMensaje(`Arista ${nodo1}-${nodo2} eliminada de ${grafoSeleccionado.value}`, false);
  aristaBorrar.value = '';
}

function resetearGrafos() {
  if (confirm('¿Estás seguro de que deseas resetear los grafos?')) {
    grafosCreados.value = false;
    grafos.value = {
      G1: { nodos: [], aristas: [] },
      G2: { nodos: [], aristas: [] }
    };
    networkG1 = null;
    networkG2 = null;
    nodesDataSetG1 = null;
    edgesDataSetG1 = null;
    nodesDataSetG2 = null;
    edgesDataSetG2 = null;
    mostrarMensaje('Grafos reseteados', false);
  }
}

function contarAristas(grafoKey: 'G1' | 'G2'): number {
  return grafos.value[grafoKey].aristas.length;
}

function formatearConjuntoNodos(grafoKey: 'G1' | 'G2'): string {
  const grafo = grafos.value[grafoKey];
  if (grafo.nodos.length === 0) return '∅';
  return `{${grafo.nodos.map(n => n.id).join(', ')}}`;
}

function formatearConjuntoAristas(grafoKey: 'G1' | 'G2'): string {
  const grafo = grafos.value[grafoKey];
  if (grafo.aristas.length === 0) return '∅';

  const aristasUnicas = new Map<string, Arista>();
  grafo.aristas.forEach((arista: Arista) => {
    const key = [String(arista.from), String(arista.to)].sort().join('-');
    if (!aristasUnicas.has(key)) aristasUnicas.set(key, arista);
  });

  const aristasFormateadas = Array.from(aristasUnicas.values()).map((arista: Arista) => {
    return `(${arista.from}, ${arista.to})`;
  });

  return `{${aristasFormateadas.join(', ')}}`;
}

function existeNodo(grafo: Grafo, id: number): boolean {
  return grafo.nodos.some(n => String(n.id) === String(id));
}

function existeArista(grafo: Grafo, from: number, to: number): boolean {
  return grafo.aristas.some(
    arista =>
      (String(arista.from) === String(from) && String(arista.to) === String(to)) ||
      (String(arista.from) === String(to) && String(arista.to) === String(from))
  );
}

function extraerNodos(input: string): [number, number] | null {
  const cleanedInput = input.replace(/\D/g, '');

  if (cleanedInput.length < 2) {
    mostrarMensaje('Formato inválido. Use formato: 12 (para nodos 1 y 2)', true);
    return null;
  }

  const nodo1 = parseInt(cleanedInput[0]);
  const nodo2 = parseInt(cleanedInput[1]);

  return [nodo1, nodo2];
}

function mostrarMensaje(msg: string, error: boolean) {
  mensaje.value = msg;
  esError.value = error;
  setTimeout(() => {
    mensaje.value = '';
    esError.value = false;
  }, 3000);
}

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

interface GrafosJSON {
  version: string;
  config: Config;
  grafos: {
    G1: Grafo;
    G2: Grafo;
  };
}

function validarFormatoJSON(obj: any): obj is GrafosJSON {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.version === '1.0' &&
    obj.config &&
    obj.grafos &&
    obj.grafos.G1 &&
    obj.grafos.G2 &&
    Array.isArray(obj.grafos.G1.nodos) &&
    Array.isArray(obj.grafos.G1.aristas) &&
    Array.isArray(obj.grafos.G2.nodos) &&
    Array.isArray(obj.grafos.G2.aristas)
  );
}

function importarGrafos(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    mostrarMensaje('Por favor selecciona un archivo JSON', true);
    return;
  }

  const file = files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const contenido = e.target?.result as string;
      const datosJSON = JSON.parse(contenido);

      if (!validarFormatoJSON(datosJSON)) {
        mostrarMensaje('Archivo JSON inválido. Por favor selecciona un archivo de grafos válido generado por este módulo.', true);
        if (fileInput.value) fileInput.value.value = '';
        return;
      }

      config.value = { ...datosJSON.config };
      grafos.value = {
        G1: {
          nodos: datosJSON.grafos.G1.nodos.map(n => ({ ...n })),
          aristas: datosJSON.grafos.G1.aristas.map(a => ({ ...a }))
        },
        G2: {
          nodos: datosJSON.grafos.G2.nodos.map(n => ({ ...n })),
          aristas: datosJSON.grafos.G2.aristas.map(a => ({ ...a }))
        }
      };

      grafosCreados.value = true;
      grafoSeleccionado.value = 'G1';

      if (fileInput.value) fileInput.value.value = '';

      nextTick(() => {
        inicializarVisualizacion();
      });

      mostrarMensaje('Grafos importados correctamente', false);
    } catch (error) {
      mostrarMensaje('Error al procesar el archivo. Asegúrate de que es un JSON válido.', true);
      if (fileInput.value) fileInput.value.value = '';
    }
  };

  reader.onerror = () => {
    mostrarMensaje('Error al leer el archivo', true);
    if (fileInput.value) fileInput.value.value = '';
  };

  reader.readAsText(file);
}

function guardarGrafos() {
  const datosGuardar: GrafosJSON = {
    version: '1.0',
    config: {
      G1: { cantidadNodos: config.value.G1.cantidadNodos },
      G2: { cantidadNodos: config.value.G2.cantidadNodos }
    },
    grafos: {
      G1: {
        nodos: grafos.value.G1.nodos.map(n => ({ ...n })),
        aristas: grafos.value.G1.aristas.map(a => ({ ...a }))
      },
      G2: {
        nodos: grafos.value.G2.nodos.map(n => ({ ...n })),
        aristas: grafos.value.G2.aristas.map(a => ({ ...a }))
      }
    }
  };

  const json = JSON.stringify(datosGuardar, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `grafos_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  mostrarMensaje('Grafos guardados exitosamente', false);
}
</script>

<style scoped>
.btn-back {
  margin-bottom: 1rem;
}

h1 {
  text-align: center;
  margin: 2rem 0;
}

.import-section {
  max-width: 600px;
  margin: 1rem auto;
  text-align: center;
  padding: 1rem;
}

.btn-import {
  background: #10b981;
  border: 1px solid #10b981;
  color: #fff;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.btn-import:hover {
  background: #059669;
  border-color: #059669;
}

.graph-selector-section {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.graph-selector-section label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.selector-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.selector-btn {
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #64748b;
  border-radius: 0.5rem;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selector-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.selector-btn:hover {
  border-color: var(--primary);
}

.create-structure {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.config-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.config-row > div {
  flex: 1;
  min-width: 150px;
}

.config-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.config-row input,
.config-row select {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.info-preview {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--code-background-color);
  border-radius: 0.25rem;
}

.info-preview p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.structure-info {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-group {
  padding: 1rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.info-group h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--primary);
}

.info-item {
  margin: 0.5rem 0;
  padding: 0.25rem;
}

.set-notation {
  max-width: 1000px;
  margin: 1.5rem auto;
  padding: 1.5rem;
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.set-notation h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--primary);
}

.notation-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.grafo-notation {
  padding: 1rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: rgba(30, 64, 175, 0.1);
}

.grafo-notation h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary);
  font-size: 0.95rem;
}

.grafo-notation p {
  margin: 0.5rem 0;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.6;
}

.grafo-notation strong {
  color: #f59e0b;
  margin-right: 0.5rem;
}

.edge-management {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.edge-management h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
}

.edge-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.edge-controls input {
  max-width: 200px;
}

.help-text {
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.5rem 0;
}

.operations {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.operations h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.operation-card {
  padding: 1rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  text-align: center;
}

.operation-card h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary);
  font-size: 0.95rem;
}

.operation-card input {
  width: 100%;
  margin-bottom: 0.5rem;
}

.operation-card button {
  width: 100%;
}

.message {
  margin: 1rem auto;
  padding: 1rem;
  max-width: 800px;
  text-align: center;
  border-radius: 0.5rem;
  background: var(--code-background-color);
}

.message.error {
  color: #ef4444;
  border: 1px solid #ef4444;
}

.graph-visualization {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.graph-visualization h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
}

.graphs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.graph-wrapper {
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: #0f172a;
  padding: 0.5rem;
}

.graph-wrapper h4 {
  margin: 0.5rem 0;
  text-align: center;
  color: #e5e7eb;
}

.graph-container {
  width: 100%;
  height: 400px;
  border: 2px solid #374151;
  border-radius: 0.5rem;
  background: #0f172a;
}

.reset-section {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-save {
  background: #8b5cf6;
  border: 1px solid #8b5cf6;
  color: #fff;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.btn-save:hover {
  background: #7c3aed;
  border-color: #7c3aed;
}

.btn-danger {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
  }

  .operations-grid {
    grid-template-columns: 1fr;
  }

  .edge-controls {
    flex-direction: column;
  }

  .edge-controls input {
    max-width: 100%;
  }

  .graphs-container {
    grid-template-columns: 1fr;
  }

  .graph-container {
    height: 350px;
  }

  .selector-buttons {
    flex-direction: column;
  }

  .selector-btn {
    width: 100%;
  }
}
</style>
