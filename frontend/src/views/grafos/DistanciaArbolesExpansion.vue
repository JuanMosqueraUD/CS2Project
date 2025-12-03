<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>

    <h1>Distancia de Árboles de Expansión</h1>

    <!-- Crear grafos -->
    <div v-if="!grafosCreados" class="create-structure">
      <h3>Crear Dos Grafos Ponderados</h3>

      <div class="config-row">
        <div>
          <label>Cantidad de Nodos (Grafo 1):</label>
          <input
            type="number"
            v-model.number="config.nodos1"
            min="1"
            placeholder="Ej: 5"
          />
        </div>
        
        <div>
          <label>Cantidad de Nodos (Grafo 2):</label>
          <input
            type="number"
            v-model.number="config.nodos2"
            min="1"
            placeholder="Ej: 5"
          />
        </div>
      </div>

      <div class="info-preview" v-if="config.nodos1 > 0 && config.nodos2 > 0">
        <p><strong>Grafo 1 - Nodos:</strong> {{ config.nodos1 }} (numerados del 1 al {{ config.nodos1 }})</p>
        <p><strong>Grafo 2 - Nodos:</strong> {{ config.nodos2 }} (numerados del 1 al {{ config.nodos2 }})</p>
        <p><strong>Tipo:</strong> No Dirigido</p>
        <p><strong>Ponderado:</strong> Sí (siempre)</p>
      </div>

      <button @click="crearGrafos">Crear Grafos</button>
      
      <div class="import-section">
        <p style="margin: 1rem 0;">O importar grafos existentes:</p>
        <label for="import-file-initial" class="btn-primary" style="cursor: pointer; display: inline-block; padding: 0.65rem 1.5rem;">Abrir Grafos</label>
        <input id="import-file-initial" type="file" accept=".json" @change="importarGrafos" style="display: none;">
      </div>
    </div>

    <!-- Grafos creados -->
    <div v-else>
      <!-- Info de los grafos -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-group">
            <h4>Grafo 1</h4>
            <div class="info-item">
              <strong>Nodos:</strong> {{ grafo1.nodos.length }}
            </div>
            <div class="info-item">
              <strong>Aristas:</strong> {{ contarAristas(0) }}
            </div>
          </div>
          <div class="info-group">
            <h4>Grafo 2</h4>
            <div class="info-item">
              <strong>Nodos:</strong> {{ grafo2.nodos.length }}
            </div>
            <div class="info-item">
              <strong>Aristas:</strong> {{ contarAristas(1) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de operaciones -->
      <div class="operations" style="display: flex; gap: 1rem; justify-content: center; align-items: center; margin-top: 1rem;">
        <button @click="exportarGrafos" class="btn-secondary">Guardar Grafos</button>
        <label for="import-file" class="btn-secondary" style="cursor: pointer; display: inline-block; padding: 0.65rem 1.5rem; margin: 0;">Abrir Grafos</label>
        <input id="import-file" type="file" accept=".json" @change="importarGrafos" style="display: none;">
      </div>

      <!-- Selector de Grafo a Modificar -->
      <div class="graph-selector-section">
        <label>Selecciona el grafo a modificar:</label>
        <div class="selector-buttons">
          <button
            @click="grafoSeleccionado = 0"
            :class="['outline', 'contrast', { active: grafoSeleccionado === 0 }]"
          >
            Grafo 1
          </button>
          <button
            @click="grafoSeleccionado = 1"
            :class="['outline', 'contrast', { active: grafoSeleccionado === 1 }]"
          >
            Grafo 2
          </button>
        </div>
      </div>

      <!-- Gestión de Aristas -->
      <div class="edge-management">
        <h3>Gestión de Aristas - {{ grafoSeleccionado === 0 ? 'Grafo 1' : 'Grafo 2' }}</h3>
        <div class="edge-controls">
          <input
            type="text"
            v-model="aristaInput"
            placeholder="Ej: 12 para conectar"
            maxlength="10"
            @keyup.enter="agregarArista"
          />
          <input
            type="number"
            v-model.number="pesoArista"
            placeholder="Peso"
            step="1"
            min="1"
          />
          <button @click="agregarArista">Agregar</button>
          <input
            type="text"
            v-model="aristaBorrar"
            placeholder="Ej: 12 para borrar"
            maxlength="10"
          />
          <button @click="borrarArista">Borrar</button>
        </div>
        <p class="help-text">
          Formato: "12" o "1 2" para arista bidireccional 1↔2 con peso
        </p>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Visualización de los Grafos -->
      <div class="graphs-visualization">
        <h3>{{ (arbol1Calculado && arbol2Calculado) ? 'Árboles de Expansión Mínimos' : 'Visualización de los Grafos' }}</h3>
        <div class="graphs-container">
          <div class="graph-wrapper">
            <h4>{{ arbol1Calculado ? 'Árbol de Expansión - Grafo 1' : 'Grafo 1' }}</h4>
            <div id="graph-container-1" ref="graphContainer1"></div>
            <!-- Notación de Teoría de Conjuntos Grafo 1 -->
            <div class="set-notation">
              <div class="notation-content">
                <p v-if="!arbol1Calculado"><strong>V₁ =</strong> {{ formatearConjuntoNodos(0) }}</p>
                <p v-if="!arbol1Calculado"><strong>A₁ =</strong> {{ formatearConjuntoAristas(0) }}</p>
                <p v-if="arbol1Calculado"><strong>T₁ =</strong> {{ formatearArbolExpansion(0) }}</p>
              </div>
            </div>
          </div>

          <div class="graph-wrapper">
            <h4>{{ arbol2Calculado ? 'Árbol de Expansión - Grafo 2' : 'Grafo 2' }}</h4>
            <div id="graph-container-2" ref="graphContainer2"></div>
            <!-- Notación de Teoría de Conjuntos Grafo 2 -->
            <div class="set-notation">
              <div class="notation-content">
                <p v-if="!arbol2Calculado"><strong>V₂ =</strong> {{ formatearConjuntoNodos(1) }}</p>
                <p v-if="!arbol2Calculado"><strong>A₂ =</strong> {{ formatearConjuntoAristas(1) }}</p>
                <p v-if="arbol2Calculado"><strong>T₂ =</strong> {{ formatearArbolExpansion(1) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones para calcular árboles de expansión -->
      <div class="expansion-algorithms">
        <button @click="generarArbolesExpansion" class="outline contrast">
          Generar Árbol de Expansión
        </button>
      </div>

      <!-- Botón para calcular distancia -->
      <div class="distance-calculation">
        <button @click="calcularDistanciaArboles" class="outline contrast">
          Calcular Distancia de Árboles
        </button>
      </div>

      <!-- Resultado de distancia -->
      <div v-if="distanciaCalculada" class="distance-result">
        <h3>Distancia entre Árboles</h3>
        <p class="distance-value">{{ distancia.toFixed(2) }}</p>
      </div>



      <!-- Botón de reseteo -->
      <div class="reset-section">
        <button @click="resetearGrafos" class="btn-danger">Resetear Grafos</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface Config {
  nodos1: number;
  nodos2: number;
}

interface Nodo {
  id: number;
  label: string;
}

interface Arista {
  from: number;
  to: number;
  peso: number;
}

interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

const config = ref<Config>({
  nodos1: 5,
  nodos2: 5
});

const grafosCreados = ref(false);
const grafo1 = ref<Grafo>({
  nodos: [],
  aristas: []
});
const grafo2 = ref<Grafo>({
  nodos: [],
  aristas: []
});

const grafoSeleccionado = ref(0); // 0 para grafo1, 1 para grafo2
const aristaInput = ref('');
const pesoArista = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);

// Árboles de expansión
const arbol1Calculado = ref(false);
const arbol2Calculado = ref(false);
const ramas1 = ref<Arista[]>([]);
const ramas2 = ref<Arista[]>([]);

const graphContainer1 = ref<HTMLElement | null>(null);
const graphContainer2 = ref<HTMLElement | null>(null);

let network1: Network | null = null;
let network2: Network | null = null;

let nodesDataSet1: DataSet<any> | null = null;
let edgesDataSet1: DataSet<any> | null = null;
let nodesDataSet2: DataSet<any> | null = null;
let edgesDataSet2: DataSet<any> | null = null;

function crearGrafos() {
  if (config.value.nodos1 <= 0 || config.value.nodos2 <= 0) {
    mostrarMensaje('Por favor ingrese cantidades válidas de nodos para ambos grafos', true);
    return;
  }

  // Crear nodos para grafo 1
  grafo1.value.nodos = [];
  for (let i = 1; i <= config.value.nodos1; i++) {
    grafo1.value.nodos.push({
      id: i,
      label: `${i}`
    });
  }
  grafo1.value.aristas = [];

  // Crear nodos para grafo 2
  grafo2.value.nodos = [];
  for (let i = 1; i <= config.value.nodos2; i++) {
    grafo2.value.nodos.push({
      id: i,
      label: `${i}`
    });
  }
  grafo2.value.aristas = [];

  grafosCreados.value = true;
  mostrarMensaje('Grafos creados correctamente', false);

  // Inicializar visualizaciones
  nextTick(() => {
    inicializarVisualizaciones();
  });
}

function inicializarVisualizaciones() {
  if (!graphContainer1.value || !graphContainer2.value) return;

  // Inicializar grafo 1
  nodesDataSet1 = new DataSet(
    grafo1.value.nodos.map(nodo => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: '#f59e0b',
        border: '#d97706',
        highlight: {
          background: '#fbbf24',
          border: '#f59e0b'
        }
      },
      font: {
        color: '#ffffff',
        size: 16
      }
    }))
  );

  edgesDataSet1 = new DataSet<any>([]);

  network1 = new Network(
    graphContainer1.value,
    { nodes: nodesDataSet1, edges: edgesDataSet1 },
    getNetworkOptions()
  );

  // Inicializar grafo 2
  nodesDataSet2 = new DataSet(
    grafo2.value.nodos.map(nodo => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: '#f59e0b',
        border: '#d97706',
        highlight: {
          background: '#fbbf24',
          border: '#f59e0b'
        }
      },
      font: {
        color: '#ffffff',
        size: 16
      }
    }))
  );

  edgesDataSet2 = new DataSet<any>([]);

  network2 = new Network(
    graphContainer2.value,
    { nodes: nodesDataSet2, edges: edgesDataSet2 },
    getNetworkOptions()
  );
}

function getNetworkOptions() {
  return {
    nodes: {
      shape: 'circle',
      size: 25,
      borderWidth: 2,
      borderWidthSelected: 3
    },
    edges: {
      width: 2,
      selectionWidth: 3,
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0.5
      }
    },
    physics: {
      enabled: true,
      stabilization: {
        iterations: 100
      },
      barnesHut: {
        gravitationalConstant: -2000,
        springLength: 150,
        springConstant: 0.04
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 100
    }
  };
}

function agregarArista() {
  if (!aristaInput.value) {
    mostrarMensaje('Por favor ingrese los nodos para conectar', true);
    return;
  }

  if (pesoArista.value === null || pesoArista.value === undefined) {
    mostrarMensaje('Por favor ingrese un peso para la arista', true);
    return;
  }

  if (!Number.isInteger(pesoArista.value) || pesoArista.value < 1) {
    mostrarMensaje('El peso debe ser un número entero positivo (mayor o igual a 1)', true);
    return;
  }

  // Parsear input
  const input = aristaInput.value.replace(/\s+/g, '');
  let nodo1: number, nodo2: number;

  if (input.length === 2 && !isNaN(Number(input[0])) && !isNaN(Number(input[1]))) {
    nodo1 = Number(input[0]);
    nodo2 = Number(input[1]);
  } else {
    const match = input.match(/^(\d+)\s*(\d+)$/);
    if (match) {
      nodo1 = Number(match[1]);
      nodo2 = Number(match[2]);
    } else {
      mostrarMensaje('Formato inválido. Use "12" o "1 2"', true);
      return;
    }
  }

  const grafo = grafoSeleccionado.value === 0 ? grafo1.value : grafo2.value;
  const maxNodos = grafoSeleccionado.value === 0 ? config.value.nodos1 : config.value.nodos2;

  // Validar nodos
  if (nodo1 < 1 || nodo1 > maxNodos || nodo2 < 1 || nodo2 > maxNodos) {
    mostrarMensaje(`Los nodos deben estar entre 1 y ${maxNodos}`, true);
    return;
  }

  if (nodo1 === nodo2) {
    mostrarMensaje('No se permiten aristas de un nodo consigo mismo', true);
    return;
  }

  // Verificar si la arista ya existe
  const aristaExiste = grafo.aristas.some(
    a => (a.from === nodo1 && a.to === nodo2) || (a.from === nodo2 && a.to === nodo1)
  );

  if (aristaExiste) {
    mostrarMensaje('Esta arista ya existe', true);
    return;
  }

  // Agregar arista
  grafo.aristas.push({
    from: nodo1,
    to: nodo2,
    peso: pesoArista.value
  });

  // Actualizar visualización
  actualizarVisualizacion(grafoSeleccionado.value);

  mostrarMensaje(`Arista ${nodo1}↔${nodo2} agregada con peso ${pesoArista.value}`, false);
  aristaInput.value = '';
  pesoArista.value = null;
}

function borrarArista() {
  if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista para borrar (ej: 12)', true);
    return;
  }

  const tokens = aristaBorrar.value.trim().match(/\d+/g) || [];
  let nodo1: number, nodo2: number;

  if (tokens.length >= 2) {
    nodo1 = parseInt(tokens[0]!);
    nodo2 = parseInt(tokens[1]!);
  } else {
    const noSpace = aristaBorrar.value.replace(/\s+/g, '');
    if (!/^\d+$/.test(noSpace) || noSpace.length < 2) {
      mostrarMensaje('Formato inválido. Use "12" o "1 2"', true);
      return;
    }
    nodo1 = parseInt(noSpace[0]);
    nodo2 = parseInt(noSpace.substring(1));
  }

  const grafo = grafoSeleccionado.value === 0 ? grafo1.value : grafo2.value;

  // Buscar la arista (bidireccional)
  const aristaIndex = grafo.aristas.findIndex(
    (arista: Arista) =>
      (arista.from === nodo1 && arista.to === nodo2) ||
      (arista.from === nodo2 && arista.to === nodo1)
  );

  if (aristaIndex === -1) {
    mostrarMensaje(`Arista ${nodo1}↔${nodo2} no encontrada`, true);
    return;
  }

  // Eliminar arista
  grafo.aristas.splice(aristaIndex, 1);

  // Resetear árboles calculados
  arbol1Calculado.value = false;
  arbol2Calculado.value = false;
  ramas1.value = [];
  ramas2.value = [];
  distanciaCalculada.value = false;

  // Actualizar visualización
  actualizarVisualizacion(grafoSeleccionado.value);

  mostrarMensaje(`Arista ${nodo1}↔${nodo2} eliminada`, false);
  aristaBorrar.value = '';
}

function actualizarVisualizacion(grafoIdx: number) {
  const edgesDataSet = grafoIdx === 0 ? edgesDataSet1 : edgesDataSet2;
  const grafo = grafoIdx === 0 ? grafo1.value : grafo2.value;

  if (!edgesDataSet) return;

  edgesDataSet.clear();
  edgesDataSet.add(
    grafo.aristas.map((arista, index) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: `${arista.peso}`,
      color: {
        color: '#94a3b8',
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      }
    }))
  );
}

function visualizarArbol(grafoIdx: number) {
  const container = grafoIdx === 0 ? graphContainer1.value : graphContainer2.value;
  const grafo = grafoIdx === 0 ? grafo1.value : grafo2.value;
  const ramas = grafoIdx === 0 ? ramas1.value : ramas2.value;

  if (!container) return;

  // Destruir la red existente antes de crear la nueva
  if (grafoIdx === 0 && network1) {
    network1.destroy();
  } else if (grafoIdx === 1 && network2) {
    network2.destroy();
  }

  const nodesTree = new DataSet(
    grafo.nodos.map(nodo => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: '#f59e0b',
        border: '#d97706',
        highlight: {
          background: '#fbbf24',
          border: '#f59e0b'
        }
      },
      font: {
        color: '#ffffff',
        size: 16
      }
    }))
  );

  const edgesTree = new DataSet<any>(
    ramas.map((arista, index) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: `${arista.peso}`,
      color: {
        color: '#94a3b8',
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      }
    }))
  );

  const network = new Network(
    container,
    { nodes: nodesTree, edges: edgesTree },
    getNetworkOptions()
  );

  // Asignar al network principal
  if (grafoIdx === 0) {
    network1 = network;
  } else {
    network2 = network;
  }
}

function contarAristas(grafoIdx: number): number {
  return grafoIdx === 0 ? grafo1.value.aristas.length : grafo2.value.aristas.length;
}

function formatearConjuntoNodos(grafoIdx: number): string {
  const grafo = grafoIdx === 0 ? grafo1.value : grafo2.value;
  if (grafo.nodos.length === 0) return '∅';
  return `{ ${grafo.nodos.map(n => n.label).join(', ')} }`;
}

function formatearConjuntoAristas(grafoIdx: number): string {
  const grafo = grafoIdx === 0 ? grafo1.value : grafo2.value;
  if (grafo.aristas.length === 0) return '∅';
  return `{ ${grafo.aristas.map(a => `(${a.from},${a.to})`).join(', ')} }`;
}

function formatearArbolExpansion(grafoIdx: number): string {
  const ramas = grafoIdx === 0 ? ramas1.value : ramas2.value;
  if (ramas.length === 0) return '∅';
  return `{ ${ramas.map(a => `(${a.from},${a.to})`).join(', ')} }`;
}

// Variables para distancia
const distanciaCalculada = ref(false);
const distancia = ref(0);

function generarArbolesExpansion() {
  // Calcular ambos árboles
  calcularArbolExpansion(0);
  calcularArbolExpansion(1);
}

function calcularArbolExpansion(grafoIdx: number) {
  const grafo = grafoIdx === 0 ? grafo1.value : grafo2.value;

  if (grafo.aristas.length === 0) {
    mostrarMensaje(`El grafo ${grafoIdx + 1} no tiene aristas`, true);
    return;
  }

  // Algoritmo de Kruskal para árbol de expansión mínimo
  const aristasOrdenadas = [...grafo.aristas].sort((a, b) => a.peso - b.peso);
  const arbolExpansion: Arista[] = [];
  const nodosConectados = new Map<number, Set<number>>();

  // Inicializar cada nodo en su propio conjunto
  grafo.nodos.forEach(nodo => {
    nodosConectados.set(nodo.id, new Set([nodo.id]));
  });

  // Agregar aristas sin formar ciclos
  for (const arista of aristasOrdenadas) {
    const conjuntoFrom = nodosConectados.get(arista.from)!;
    const conjuntoTo = nodosConectados.get(arista.to)!;

    const formaCiclo = Array.from(conjuntoFrom).some(nodo => conjuntoTo.has(nodo));

    if (!formaCiclo) {
      arbolExpansion.push(arista);

      const nuevoConjunto = new Set([...conjuntoFrom, ...conjuntoTo]);
      nuevoConjunto.forEach(nodo => {
        nodosConectados.set(nodo, nuevoConjunto);
      });
    }

    if (arbolExpansion.length === grafo.nodos.length - 1) {
      break;
    }
  }

  // Guardar ramas
  if (grafoIdx === 0) {
    ramas1.value = arbolExpansion;
    arbol1Calculado.value = true;
  } else {
    ramas2.value = arbolExpansion;
    arbol2Calculado.value = true;
  }

  const pesoTotal = arbolExpansion.reduce((sum, a) => sum + a.peso, 0);
  mostrarMensaje(`Árbol de expansión mínimo del grafo ${grafoIdx + 1} calculado. Peso total: ${pesoTotal}`, false);

  // Visualizar árbol
  nextTick(() => {
    visualizarArbol(grafoIdx);
  });
}

function calcularDistanciaArboles() {
  // Verificar que ambos árboles hayan sido calculados
  if (!arbol1Calculado.value) {
    mostrarMensaje('Primero debes generar los árboles de expansión', true);
    return;
  }

  if (!arbol2Calculado.value) {
    mostrarMensaje('Primero debes generar los árboles de expansión', true);
    return;
  }

  // Validar que los árboles de expansión sean válidos
  // Un árbol de expansión debe tener exactamente n-1 aristas y ser conexo
  if (ramas1.value.length !== grafo1.value.nodos.length - 1) {
    mostrarMensaje('El árbol de expansión del Grafo 1 no es válido', true);
    return;
  }

  if (ramas2.value.length !== grafo2.value.nodos.length - 1) {
    mostrarMensaje('El árbol de expansión del Grafo 2 no es válido', true);
    return;
  }

  // Calcular distancia: (|union| - |intersection|) / 2 con pesos
  // Usar las aristas de los árboles de expansión (ramas1 y ramas2)
  const aristas1Map = new Map<string, number>();
  ramas1.value.forEach(a => {
    const key1 = `${Math.min(a.from, a.to)}-${Math.max(a.from, a.to)}`;
    aristas1Map.set(key1, a.peso);
  });

  const aristas2Map = new Map<string, number>();
  ramas2.value.forEach(a => {
    const key2 = `${Math.min(a.from, a.to)}-${Math.max(a.from, a.to)}`;
    aristas2Map.set(key2, a.peso);
  });

  // Calcular intersección (aristas comunes con sus pesos)
  let sumaInterseccion = 0;
  let countInterseccion = 0;
  aristas1Map.forEach((peso, key) => {
    if (aristas2Map.has(key)) {
      sumaInterseccion += Math.min(peso, aristas2Map.get(key)!);
      countInterseccion++;
    }
  });

  // Calcular unión (todas las aristas con sus pesos)
  const unionKeys = new Set([...aristas1Map.keys(), ...aristas2Map.keys()]);
  let sumaUnion = 0;
  unionKeys.forEach(key => {
    const peso1 = aristas1Map.get(key) || 0;
    const peso2 = aristas2Map.get(key) || 0;
    sumaUnion += Math.max(peso1, peso2);
  });

  // Distancia = (suma_union - suma_interseccion) / 2
  distancia.value = (sumaUnion - sumaInterseccion) / 2;
  distanciaCalculada.value = true;

  mostrarMensaje(`Distancia calculada: ${distancia.value.toFixed(2)}`, false);
}

function exportarGrafos() {
  const data = {
    type: 'distancia-arboles-expansion',
    timestamp: new Date().toISOString(),
    config: config.value,
    grafo1: grafo1.value,
    grafo2: grafo2.value
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `distancia-arboles-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarMensaje('Grafos exportados correctamente', false);
}

function importarGrafos(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);

      if (data.type !== 'distancia-arboles-expansion') {
        mostrarMensaje('Archivo inválido: tipo incorrecto', true);
        return;
      }

      // Importar configuración
      config.value = data.config;

      // Importar grafos
      grafo1.value = data.grafo1;
      grafo2.value = data.grafo2;

      grafosCreados.value = true;

      // Reinicializar visualizaciones
      nextTick(() => {
        inicializarVisualizaciones();
        actualizarVisualizacion(0);
        actualizarVisualizacion(1);
      });

      mostrarMensaje('Grafos importados correctamente', false);
    } catch (error) {
      mostrarMensaje('Error al leer el archivo', true);
    }
  };

  reader.readAsText(file);
  input.value = ''; // Reset input
}

function resetearGrafos() {
  grafosCreados.value = false;
  grafo1.value = { nodos: [], aristas: [] };
  grafo2.value = { nodos: [], aristas: [] };
  arbol1Calculado.value = false;
  arbol2Calculado.value = false;
  ramas1.value = [];
  ramas2.value = [];
  aristaInput.value = '';
  pesoArista.value = null;
  mensaje.value = '';

  if (network1) {
    network1.destroy();
    network1 = null;
  }
  if (network2) {
    network2.destroy();
    network2 = null;
  }
}

function mostrarMensaje(msg: string, error: boolean) {
  mensaje.value = msg;
  esError.value = error;
  setTimeout(() => {
    mensaje.value = '';
    esError.value = false;
  }, 3000);
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

.create-structure {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.create-structure h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.config-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.config-row > div {
  flex: 1;
  min-width: 200px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.info-group {
  text-align: center;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.375rem;
  background: var(--code-background-color);
}

.info-group h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary);
}

.info-item {
  margin: 0.5rem 0;
}

.graph-selector-section {
  max-width: 800px;
  margin: 2rem auto;
  text-align: center;
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

.selector-buttons button.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
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

.operations {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.operations h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  text-align: center;
  font-size: 1.1rem;
}

.operations-horizontal {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.compact-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-compact {
  padding: 0.5rem 1rem;
  white-space: nowrap;
  font-size: 0.9rem;
}

.input-compact {
  width: 150px;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.edge-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.edge-controls input {
  flex: 1;
  min-width: 150px;
}

.edge-controls button {
  flex: 0 0 auto;
}

.help-text {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--muted-color);
}

.message {
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
  border-radius: 0.25rem;
  text-align: center;
  background: #10b981;
  color: white;
  font-weight: 600;
}

.message.error {
  background: #ef4444;
}

.graphs-visualization,
.trees-visualization {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.graphs-visualization h3,
.trees-visualization h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.graphs-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.graph-wrapper {
  display: flex;
  flex-direction: column;
}

.graph-wrapper h4 {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--primary);
}

#graph-container-1,
#graph-container-2,
#tree-container-1,
#tree-container-2 {
  width: 100%;
  height: 500px;
  border: 2px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: #1e3a5f;
}

.set-notation {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
  background: var(--code-background-color);
}

.notation-content {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.notation-content p {
  margin: 0.25rem 0;
  padding: 0.25rem;
}

.notation-content strong {
  color: var(--primary);
  margin-right: 0.5rem;
}

.expansion-algorithms {
  max-width: 900px;
  margin: 2rem auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.expansion-algorithms button {
  min-width: 250px;
}

.distance-calculation {
  max-width: 900px;
  margin: 2rem auto;
  text-align: center;
}

.distance-result {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  background: var(--card-background-color);
  text-align: center;
}

.distance-result h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary);
}

.distance-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.import-section {
  text-align: center;
  margin-top: 1.5rem;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.reset-section {
  max-width: 800px;
  margin: 2rem auto;
  text-align: center;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}
</style>
