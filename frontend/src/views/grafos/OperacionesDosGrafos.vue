<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>

    <h1>Operaciones entre Grafos (N grafos)</h1>

    <!-- Botón Abrir Grafos (siempre visible) -->
    <div class="import-section">
      <button @click="triggerFileInput" class="btn-import">Abrir Grafos</button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="importarGrafos"
      />
    </div>

    <!-- Crear grafos -->
    <div v-if="!grafosCreados" class="create-structure">
      <h3>Crear Grafos</h3>

      <div class="config-row">
        <div>
          <label>Cantidad de Grafos:</label>
          <input
            type="number"
            v-model.number="config.cantidadGrafos"
            min="1"
            placeholder="Ej: 3"
          />
        </div>
      </div>

      <div class="config-row" v-if="config.cantidadGrafos > 0">
        <div v-for="i in config.cantidadGrafos" :key="i">
          <label>{{ `Cantidad de Nodos (G${i}):` }}</label>
          <input
            type="number"
            v-model.number="config.byGraph[i - 1]"
            min="1"
            :placeholder="`Ej: 5`"
          />
        </div>
      </div>

      <div class="info-preview" v-if="config.cantidadGrafos > 0">
        <p v-for="i in config.cantidadGrafos" :key="i"><strong>{{ `G${i} - Nodos:` }}</strong> {{ config.byGraph[i - 1] }}</p>
      </div>

      <button @click="crearGrafos">Crear Grafos</button>
    </div>

    <!-- Grafos creados -->
    <div v-else>
      <!-- Info de los grafos -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-group" v-for="(g, idx) in grafos" :key="idx">
            <h4>{{ `Grafo G${idx + 1}` }}</h4>
            <div class="info-item">
              <strong>Nodos:</strong> {{ g.nodos.length }}
            </div>
            <div class="info-item">
              <strong>Aristas:</strong> {{ contarAristas(idx) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Selector de Grafo a Modificar (dinámico) -->
      <div class="graph-selector-section">
        <label>Selecciona el grafo a modificar:</label>
        <div class="selector-buttons">
          <button
            v-for="(_, idx) in grafos"
            :key="idx"
            @click="grafoSeleccionado = idx"
            :class="{ active: grafoSeleccionado === idx }"
            class="selector-btn"
          >
            {{ `G${idx + 1}` }}
          </button>
        </div>
      </div>

      <!-- Gestión de Aristas -->
      <div class="edge-management">
        <h3>Gestión de Aristas - Grafo {{ `G${grafoSeleccionado + 1}` }}</h3>
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
        <h3>Operaciones del Grafo - {{ `G${grafoSeleccionado + 1}` }}</h3>
        <div class="operations-horizontal">
          <button @click="insertarNodo" class="btn-compact">Insertar Nodo</button>
          <div class="compact-group">
            <input type="number" v-model.number="nodoEliminar" placeholder="Eliminar nodo" class="input-compact" min="1" />
            <button @click="eliminarNodo" class="btn-compact">Eliminar</button>
          </div>
          <div class="compact-group">
            <input type="text" v-model="aristaBorrar" placeholder="Borrar arista (ej: 12)" class="input-compact" maxlength="10" />
            <button @click="borrarArista" class="btn-compact">Borrar</button>
          </div>
        </div>
      </div>

      <!-- Operaciones entre Grafos -->
      <div class="graph-operations">
        <h3>Operaciones entre Grafos</h3>
        <div class="operations-compact">
          <button @click="mostrarOperacion('union')" class="btn-operation">Unión (G₁ ∪ G₂)</button>
          <button @click="mostrarOperacion('interseccion')" class="btn-operation">Intersección (G₁ ∩ G₂)</button>
          <button @click="mostrarOperacion('suma')" class="btn-operation">Suma (G₁ + G₂)</button>
          <button @click="mostrarOperacion('sumaAnillo')" class="btn-operation">Suma Anillo (G₁ ⊕ G₂)</button>
          <button @click="mostrarOperacion('producto')" class="btn-operation">Producto Cartesiano (G₁ × G₂)</button>
          <button @click="mostrarOperacion('tensorial')" class="btn-operation">Producto Tensorial (G₁ ⊗ G₂)</button>
          <button @click="mostrarOperacion('composicion')" class="btn-operation">Composición (G₁ ∘ G₂)</button>
        </div>
      </div>

      <!-- Panel de Resultado de Operación -->
      <div v-if="operacionActiva" class="operation-result">
        
        <!-- Visualización del Grafo Resultado -->
        <div class="graph-visualization">
          <h4>Grafo Resultado</h4>
          <div class="graphs-container">
            <div class="graph-wrapper">
              <div id="graph-container-resultado" class="graph-container" :ref="el => setGraphContainerResultado(el)"></div>
            </div>
          </div>
        </div>

        <!-- Notación del Grafo Resultado -->
        <div class="set-notation">
          <h4>Representación en Teoría de Conjuntos - Grafo Resultado:</h4>
          <div class="notation-content">
            <div class="grafo-notation">
              <h5>Grafo Resultado:</h5>
              <p><strong>V =</strong> {{ formatearConjuntoNodosResultado() }}</p>
              <p><strong>A =</strong> {{ formatearConjuntoAristasResultado() }}</p>
            </div>
          </div>
        </div>

        <!-- Botón para cerrar el panel -->
        <div class="result-actions">
          <button @click="cerrarOperacion" class="btn-close">Cerrar Resultado</button>
        </div>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Visualización de los Grafos -->
      <div class="graph-visualization">
        <h3>Visualización de los Grafos</h3>
        <div class="graphs-container">
          <div class="graph-wrapper" v-for="(_, idx) in grafos" :key="idx">
            <h4>{{ `Grafo G${idx + 1}` }}</h4>
            <div :id="`graph-container-${idx}`" class="graph-container" :ref="el => setGraphContainer(el, idx)"></div>
          </div>
        </div>
      </div>

      <!-- Panel de notación de los grafos -->
      <div class="set-notation">
        <h4>Representación en Teoría de Conjuntos:</h4>
        <div class="notation-content">
          <div class="grafo-notation" v-for="(_, idx) in grafos" :key="idx">
            <h5>{{ `Grafo G${idx + 1}:` }}</h5>
            <p><strong>{{ `V_${idx + 1} =` }}</strong> {{ formatearConjuntoNodos(idx) }}</p>
            <p><strong>{{ `A_${idx + 1} =` }}</strong> {{ formatearConjuntoAristas(idx) }}</p>
          </div>
        </div>
      </div>

      <!-- Botón de reseteo y guardado -->
      <div class="reset-section">
        <button @click="resetearGrafos" class="btn-danger">Resetear Grafos</button>
        <button @click="guardarGrafos" class="btn-save">Guardar Grafos</button>
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
  cantidadGrafos: number;
  byGraph: number[];
}

const config = ref<Config>({ cantidadGrafos: 2, byGraph: [5, 5] });
const grafosCreados = ref(false);
const grafoSeleccionado = ref<number>(0);
const grafos = ref<Grafo[]>([]);

const aristaInput = ref('');
const nodoEliminar = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);

const graphContainers = ref<Array<HTMLElement | null>>([]);
const fileInput = ref<HTMLInputElement | null>(null);

let networks: Array<Network | null> = [];
let nodesDataSets: Array<DataSet<any> | null> = [];
let edgesDataSets: Array<DataSet<any> | null> = [];

let nodesDataSetResultado: DataSet<any> | null = null;
let edgesDataSetResultado: DataSet<any> | null = null;
let _networkResultado: Network | null = null;

const operacionActiva = ref<string>('');
const grafoResultado = ref<Grafo>({ nodos: [], aristas: [] });
const graphContainerResultado = ref<HTMLElement | null>(null);

function setGraphContainer(el: any, idx: number) {
  // aceptar cualquier tipo y castear a HTMLElement cuando sea posible
  graphContainers.value[idx] = (el as HTMLElement) || null;
}

function setGraphContainerResultado(el: any) {
  graphContainerResultado.value = (el as HTMLElement) || null;
}

function crearGrafos() {
  if (!config.value.cantidadGrafos || config.value.cantidadGrafos <= 0) {
    mostrarMensaje('Por favor ingrese una cantidad válida de grafos', true);
    return;
  }

  // rellenar byGraph si hace falta
  while (config.value.byGraph.length < config.value.cantidadGrafos) {
    config.value.byGraph.push(5);
  }

  grafos.value = [];
  for (let g = 0; g < config.value.cantidadGrafos; g++) {
    const cantidad = config.value.byGraph[g] > 0 ? config.value.byGraph[g] : 0;
    const nodos: Nodo[] = [];
    const letter = getGraphLetter(g);
    for (let i = 1; i <= cantidad; i++) {
      nodos.push({ id: i, label: `${i}${letter}` });
    }
    grafos.value.push({ nodos, aristas: [] });
  }

  // inicializar arrays auxiliares
  networks = [];
  nodesDataSets = [];
  edgesDataSets = [];
  graphContainers.value = new Array(config.value.cantidadGrafos).map(() => null);

  grafosCreados.value = true;
  grafoSeleccionado.value = 0;
  mostrarMensaje('Grafos creados correctamente', false);

  nextTick(() => {
    inicializarVisualizacion();
  });
}

function inicializarVisualizacion() {
  for (let i = 0; i < grafos.value.length; i++) {
    inicializarGrafo(i);
  }
}

function inicializarGrafo(idx: number) {
  const grafo = grafos.value[idx];
  const container = graphContainers.value[idx];
  if (!container) return;

  const palette = [
    { base: '#3b82f6', dark: '#1e40af' },
    { base: '#10b981', dark: '#047857' },
    { base: '#f97316', dark: '#b45309' },
    { base: '#ef4444', dark: '#7f1d1d' }
  ];
  const color = palette[idx % palette.length];

  const nodesData = new DataSet(
    grafo.nodos.map((nodo: Nodo) => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: color.base,
        border: color.dark,
        highlight: { background: '#f59e0b', border: '#d97706' }
      },
      font: { color: '#e5e7eb', size: 16 }
    }))
  );

  const edgesData = new DataSet(
    grafo.aristas.map((arista: Arista, index: number) => ({
      id: `${idx}_${index}`,
      from: arista.from,
      to: arista.to,
      label: '',
      arrows: undefined,
      color: { color: color.base, highlight: '#f59e0b' },
      font: { color: '#e5e7eb', size: 14, background: '#111827' }
    }))
  );

  nodesDataSets[idx] = nodesData;
  edgesDataSets[idx] = edgesData;

  const data = { nodes: nodesDataSets[idx] as any, edges: edgesDataSets[idx] as any };

  const options = {
    nodes: { shape: 'circle', size: 25, borderWidth: 2 },
    edges: { width: 2, smooth: { enabled: true, type: 'continuous', roundness: 0.5 } },
    physics: { enabled: true, barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 150, springConstant: 0.04 }, stabilization: { iterations: 100 } },
    interaction: { hover: true, dragNodes: true, dragView: true, zoomView: true }
  };

  networks[idx] = new Network(container, data, options);
}

function actualizarVisualizacion(idx: number) {
  const grafo = grafos.value[idx];
  const nodesDataSet = nodesDataSets[idx];
  const edgesDataSet = edgesDataSets[idx];
  const paletteBase = ['#3b82f6', '#10b981', '#f97316', '#ef4444'];
  const colorBase = paletteBase[idx % paletteBase.length];

  if (!nodesDataSet || !edgesDataSet) return;

  // Actualizar nodos
  const nodosActuales = nodesDataSet.get();
  const nodosNuevos = grafo.nodos.map((n: Nodo) => n.id);

  for (const nodo of nodosActuales) {
    if (!nodosNuevos.includes(nodo.id)) nodesDataSet.remove(nodo.id);
  }

  for (const nodo of grafo.nodos) {
    const existe = nodesDataSet.get(nodo.id);
    if (!existe) {
      nodesDataSet.add({ id: nodo.id, label: nodo.label, color: { background: colorBase, border: '#111827', highlight: { background: '#f59e0b', border: '#d97706' } }, font: { color: '#e5e7eb', size: 16 } });
    }
  }

  // Limpiar y reconstruir aristas
  edgesDataSet.clear();
  for (let index = 0; index < grafo.aristas.length; index++) {
    const arista = grafo.aristas[index];
    const edgeId = `G${idx + 1}_${String(arista.from)}_${String(arista.to)}_${index}`;
    edgesDataSet.add({ id: edgeId, from: arista.from, to: arista.to, label: '', arrows: undefined, color: { color: colorBase, highlight: '#f59e0b' }, font: { color: '#e5e7eb', size: 14, background: '#111827' } });
  }
}

function agregarArista() {
  const idx = grafoSeleccionado.value;
  const grafo = grafos.value[idx];

  if (!aristaInput.value || aristaInput.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaInput.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  if (!existeNodo(grafo, nodo1) || !existeNodo(grafo, nodo2)) {
    mostrarMensaje('Uno o ambos nodos no existen en el grafo ' + `G${idx + 1}`, true);
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

  grafo.aristas.push({ from: nodo1, to: nodo2 });
  actualizarVisualizacion(idx);
  mostrarMensaje(`Arista agregada a G${idx + 1}: ${nodo1}↔${nodo2}`, false);
  aristaInput.value = '';
}

function insertarNodo() {
  const idx = grafoSeleccionado.value;
  const grafo = grafos.value[idx];
  const numericIds = grafo.nodos.map((n: Nodo) => Number(n.id)).filter((x: number) => !isNaN(x));
  const nuevoId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
  const letter = getGraphLetter(idx);
  grafo.nodos.push({ id: nuevoId, label: `${nuevoId}${letter}` });
  actualizarVisualizacion(idx);
  mostrarMensaje(`Nodo ${nuevoId} insertado en G${idx + 1}`, false);
}

function eliminarNodo() {
  const idx = grafoSeleccionado.value;
  const grafo = grafos.value[idx];

  if (!nodoEliminar.value) {
    mostrarMensaje('Por favor ingrese un número de nodo', true);
    return;
  }

  const id = nodoEliminar.value;

  if (!existeNodo(grafo, id)) {
    mostrarMensaje(`El nodo ${id} no existe en G${idx + 1}`, true);
    return;
  }

  grafos.value[idx].nodos = grafos.value[idx].nodos.filter((n: Nodo) => n.id !== id);
  grafos.value[idx].aristas = grafos.value[idx].aristas.filter((arista: Arista) => arista.from !== id && arista.to !== id);

  actualizarVisualizacion(idx);
  mostrarMensaje(`Nodo ${id} eliminado de G${idx + 1} junto con sus aristas`, false);
  nodoEliminar.value = null;
}

function borrarArista() {
  const idx = grafoSeleccionado.value;
  const grafo = grafos.value[idx];

  if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaBorrar.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  const aristaIndex = grafo.aristas.findIndex((arista: Arista) =>
    (String(arista.from) === String(nodo1) && String(arista.to) === String(nodo2)) ||
    (String(arista.from) === String(nodo2) && String(arista.to) === String(nodo1))
  );

  if (aristaIndex === -1) {
    mostrarMensaje('La arista no existe', true);
    return;
  }

  grafo.aristas.splice(aristaIndex, 1);
  actualizarVisualizacion(idx);
  mostrarMensaje(`Arista ${nodo1}-${nodo2} eliminada de G${idx + 1}`, false);
  aristaBorrar.value = '';
}

function resetearGrafos() {
  if (confirm('¿Estás seguro de que deseas resetear los grafos?')) {
    grafosCreados.value = false;
    grafos.value = [];
    networks = [];
    nodesDataSets = [];
    edgesDataSets = [];
    graphContainers.value = [];
    mostrarMensaje('Grafos reseteados', false);
  }
}

function contarAristas(idx: number): number {
  return grafos.value[idx]?.aristas.length ?? 0;
}

function formatearConjuntoNodos(idx: number): string {
  const grafo = grafos.value[idx];
  if (!grafo || grafo.nodos.length === 0) return '∅';
  const letter = getGraphLetter(idx);
  return `{${grafo.nodos.map((n: Nodo) => `${n.id}${letter}`).join(', ')}}`;
}

function formatearConjuntoAristas(idx: number): string {
  const grafo = grafos.value[idx];
  if (!grafo || grafo.aristas.length === 0) return '∅';
  const seen: Record<string, boolean> = {};
  const aristasFormateadas: string[] = [];
  const letter = getGraphLetter(idx);
  for (const arista of grafo.aristas) {
    const fromLabel = `${String(arista.from)}${letter}`;
    const toLabel = `${String(arista.to)}${letter}`;
    const key = [fromLabel, toLabel].sort().join('-');
    if (!seen[key]) {
      seen[key] = true;
      aristasFormateadas.push(`(${fromLabel}, ${toLabel})`);
    }
  }

  return `{${aristasFormateadas.join(', ')}}`;
}

function existeNodo(grafo: Grafo, id: number): boolean {
  return grafo.nodos.some((n: Nodo) => String(n.id) === String(id));
}

function existeArista(grafo: Grafo, from: number, to: number): boolean {
  return grafo.aristas.some((arista: Arista) =>
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
  if (fileInput.value) fileInput.value.click();
}

// Operaciones entre Grafos
function calcularUnion(): Grafo {
  // Mostrar los grafos originales juntos en el resultado.
  // Cada nodo/arista recibe un id único en la visualización para evitar colisiones,
  // pero la notación del resultado usará el id original con una letra que identifica el grafo (A, B, C...)
  const resultado: Grafo = { nodos: [], aristas: [] };

  for (let gi = 0; gi < grafos.value.length; gi++) {
    const g = grafos.value[gi];

    // añadir nodos con id único (prefijo con índice) y conservar label original
    for (const nodo of g.nodos) {
      const uniqueId = `${gi}_${String(nodo.id)}`;
      resultado.nodos.push({ id: uniqueId, label: String(nodo.label) });
    }

    // añadir aristas referenciando ids únicos creados arriba
    for (const arista of g.aristas) {
      const fromId = `${gi}_${String(arista.from)}`;
      const toId = `${gi}_${String(arista.to)}`;
      resultado.aristas.push({ from: fromId, to: toId });
    }
  }

  return resultado;
}

function calcularInterseccion(): Grafo {
  if (grafos.value.length < 2) {
    return { nodos: [], aristas: [] };
  }

  // Comenzar con el primer grafo
  let resultado: Grafo = JSON.parse(JSON.stringify(grafos.value[0]));

  // Intersectar con cada uno de los demás grafos
  for (let i = 1; i < grafos.value.length; i++) {
    const grafo = grafos.value[i];

    // Mantener solo nodos que existen en ambos
    resultado.nodos = resultado.nodos.filter((nodo: Nodo) =>
      grafo.nodos.some((n: Nodo) => String(n.id) === String(nodo.id))
    );

    // Mantener solo aristas que existen en ambos
    resultado.aristas = resultado.aristas.filter((arista: Arista) =>
      grafo.aristas.some((a: Arista) =>
        (String(a.from) === String(arista.from) && String(a.to) === String(arista.to)) ||
        (String(a.from) === String(arista.to) && String(a.to) === String(arista.from))
      )
    );
  }

  return resultado;
}

function calcularSuma(): Grafo {
  const resultado: Grafo = { nodos: [], aristas: [] };

  // Mantener arrays de ids actuales en resultado para crear bipartitas completas
  for (let gi = 0; gi < grafos.value.length; gi++) {
    const g = grafos.value[gi];

    // ids existentes antes de añadir este grafo
    const existingIds = resultado.nodos.map(n => String(n.id));

    // añadir nodos del grafo actual
    for (const nodo of g.nodos) {
      const uniqueId = `${gi}_${String(nodo.id)}`;
      resultado.nodos.push({ id: uniqueId, label: String(nodo.label) });
    }

    // añadir aristas internas (mantener estructura original dentro del grafo)
    for (const arista of g.aristas) {
      const fromId = `${gi}_${String(arista.from)}`;
      const toId = `${gi}_${String(arista.to)}`;
      resultado.aristas.push({ from: fromId, to: toId });
    }

    // crear aristas completas entre existingIds y los nuevos nodos de este grafo
    const newIds = g.nodos.map((n: Nodo) => `${gi}_${String(n.id)}`);
    for (const aId of existingIds) {
      for (const bId of newIds) {
        // evitar duplicados (comprobar por orden indiferente)
        const exists = resultado.aristas.some(e =>
          (String(e.from) === aId && String(e.to) === bId) ||
          (String(e.from) === bId && String(e.to) === aId)
        );
        if (!exists) resultado.aristas.push({ from: aId, to: bId });
      }
    }
  }

  return resultado;
}

function mostrarOperacion(tipo: string) {
  operacionActiva.value = tipo;

  if (tipo === 'union') {
    grafoResultado.value = calcularUnion();
  } else if (tipo === 'interseccion') {
    grafoResultado.value = calcularInterseccion();
  } else if (tipo === 'suma') {
    grafoResultado.value = calcularSuma();
  } else if (tipo === 'sumaAnillo') {
    grafoResultado.value = calcularSumaAnillo();
  } else if (tipo === 'producto') {
    grafoResultado.value = calcularProductoCartesiano();
  } else if (tipo === 'tensorial') {
    grafoResultado.value = calcularProductoTensorial();
  } else if (tipo === 'composicion') {
    grafoResultado.value = calcularComposicion();
  }

  nextTick(() => {
    inicializarGrafoResultado();
  });
}

// Suma Anillo: nodos = unión sin repeticiones, aristas = unión menos intersección
function calcularSumaAnillo(): Grafo {
  if (grafos.value.length < 2) {
    mostrarMensaje('Se requieren al menos dos grafos para Suma Anillo', true);
    return { nodos: [], aristas: [] };
  }
  // Solo los dos primeros grafos
  const g1 = grafos.value[0];
  const g2 = grafos.value[1];

  // Nodos: unión sin repeticiones (evitar Set/Array.from por compatibilidad)
  const nodosMap: Record<string, boolean> = {};
  for (let ii = 0; ii < g1.nodos.length; ii++) { nodosMap[String(g1.nodos[ii].id)] = true; }
  for (let ii = 0; ii < g2.nodos.length; ii++) { nodosMap[String(g2.nodos[ii].id)] = true; }
  const nodosRes: { id: string; label: string }[] = [];
  for (const k in nodosMap) { if (Object.prototype.hasOwnProperty.call(nodosMap, k)) nodosRes.push({ id: k, label: k }); }

  // Aristas: unión menos intersección (evitar includes)
  const aristaKey = (a: { from: string | number, to: string | number }) => `${a.from},${a.to}`;
  const aristas1Keys: string[] = [];
  for (let ii = 0; ii < g1.aristas.length; ii++) { aristas1Keys.push(aristaKey(g1.aristas[ii] as any)); }
  const aristas2Keys: Record<string, boolean> = {};
  for (let ii = 0; ii < g2.aristas.length; ii++) { aristas2Keys[aristaKey(g2.aristas[ii] as any)] = true; }

  const unionAristas = g1.aristas.concat(g2.aristas);
  const resultadoAristas: { from: string | number, to: string | number }[] = [];
  for (let ii = 0; ii < unionAristas.length; ii++) {
    const a = unionAristas[ii] as any;
    const key = aristaKey(a);
    // si está en la intersección (es decir, está en aristas1Keys y en aristas2Keys) la excluimos
    let in1 = false;
    for (let jj = 0; jj < aristas1Keys.length; jj++) { if (aristas1Keys[jj] === key) { in1 = true; break; } }
    const in2 = !!aristas2Keys[key];
    if (!(in1 && in2)) resultadoAristas.push(a);
  }

  // Formato compatible con visualización
  const aristasRes: { from: string | number, to: string | number }[] = [];
  for (let ii = 0; ii < resultadoAristas.length; ii++) {
    const a = resultadoAristas[ii] as any;
    aristasRes.push({ from: a.from, to: a.to });
  }

  return {
    nodos: nodosRes,
    aristas: aristasRes
  };
}

// Producto cartesiano (solo entre los dos primeros grafos):
// - Nodos: producto cartesiano con notación que conserva letras (ej: 1A1B)
// - Aristas: conectar (a1b1)-(a2b2) si a1==a2 y b1-b2 están conectados en G2, o b1==b2 y a1-a2 están conectados en G1
function calcularProductoCartesiano(): Grafo {
  if (grafos.value.length < 2) {
    mostrarMensaje('Se requieren al menos dos grafos para Producto Cartesiano', true);
    return { nodos: [], aristas: [] };
  }

  // Añade sufijos de letra a los nodos de un grafo original (sin mutar el original)
  const addLabelsToGraph = (g: Grafo, gi: number): Grafo => ({
    nodos: g.nodos.map((n: any) => ({ id: String(n.id), label: `${String(n.id)}${getGraphLetter(gi)}` })),
    aristas: g.aristas.map((a: any) => ({ ...a }))
  });

  // Resolver clave de nodo dentro de un grafo: intenta encontrar el id usado en aristas
  const resolveNodeKey = (g: Grafo, compLabel: string) => {
    let byLabel: any = null;
    for (let ii = 0; ii < g.nodos.length; ii++) {
      const n = g.nodos[ii];
      if (String(n.label) === compLabel || String(n.id) === compLabel) {
        byLabel = n; break;
      }
    }
    if (byLabel) return String(byLabel.id);
    const stripped = stripLetter(compLabel);
    let byStripped: any = null;
    for (let ii = 0; ii < g.nodos.length; ii++) {
      const n = g.nodos[ii];
      if (String(n.id) === stripped || String(n.label) === stripped) { byStripped = n; break; }
    }
    if (byStripped) return String(byStripped.id);
    return compLabel;
  };

  const existeArista = (g: Grafo, l1: string, l2: string) => {
    const k1 = resolveNodeKey(g, l1);
    const k2 = resolveNodeKey(g, l2);
    return g.aristas.some((ar: any) => (String(ar.from) === k1 && String(ar.to) === k2) || (String(ar.from) === k2 && String(ar.to) === k1));
  };

  // Operación entre dos grafos (gA puede ser un producto previo)
  const opTwoCartesian = (gA: Grafo, gB: Grafo): Grafo => {
    const productoNodos: { id: string; label: string; a: string; b: string }[] = [];
    for (const na of gA.nodos) {
      for (const nb of gB.nodos) {
        const id = `${String(na.label)}${String(nb.label)}`;
        productoNodos.push({ id, label: id, a: String(na.label), b: String(nb.label) });
      }
    }

    const aristasRes: { from: string; to: string }[] = [];
    const seen: Record<string, boolean> = {};
    for (let i = 0; i < productoNodos.length; i++) {
      for (let j = i + 1; j < productoNodos.length; j++) {
        const p = productoNodos[i];
        const q = productoNodos[j];
        const cond1 = (p.a === q.a) && existeArista(gB, p.b, q.b);
        const cond2 = (p.b === q.b) && existeArista(gA, p.a, q.a);
        if (cond1 || cond2) {
          const key = [p.id, q.id].sort().join('-');
          if (!seen[key]) {
            seen[key] = true;
            aristasRes.push({ from: p.id, to: q.id });
          }
        }
      }
    }

    return {
      nodos: productoNodos.map(n => ({ id: n.id, label: n.label })),
      aristas: aristasRes
    };
  };

  // Secuencial entre todos los grafos
  let resultado = addLabelsToGraph(grafos.value[0], 0);
  for (let i = 1; i < grafos.value.length; i++) {
    const giGraph = addLabelsToGraph(grafos.value[i], i);
    resultado = opTwoCartesian(resultado, giGraph);
  }
  return resultado;
}

// Quitar la letra del label y devolver el id original numérico/string, por ejemplo '1A' -> '1'
function stripLetter(l: string): string {
  // eliminar cualquier letra final (A,B,C...) dejando el número u texto original antes de la letra
  return l.replace(/[A-Z]$/i, '');
}

// Producto Tensorial: nodos = producto cartesiano (con letras), aristas si ambas componentes conectadas
function calcularProductoTensorial(): Grafo {
  if (grafos.value.length < 2) {
    mostrarMensaje('Se requieren al menos dos grafos para Producto Tensorial', true);
    return { nodos: [], aristas: [] };
  }

  const addLabelsToGraph = (g: Grafo, gi: number): Grafo => ({
    nodos: g.nodos.map((n: any) => ({ id: String(n.id), label: `${String(n.id)}${getGraphLetter(gi)}` })),
    aristas: g.aristas.map((a: any) => ({ ...a }))
  });

  const resolveNodeKey = (g: Grafo, compLabel: string) => {
    let byLabel: any = null;
    for (let ii = 0; ii < g.nodos.length; ii++) {
      const n = g.nodos[ii];
      if (String(n.label) === compLabel || String(n.id) === compLabel) { byLabel = n; break; }
    }
    if (byLabel) return String(byLabel.id);
    const stripped = stripLetter(compLabel);
    let byStripped: any = null;
    for (let ii = 0; ii < g.nodos.length; ii++) {
      const n = g.nodos[ii];
      if (String(n.id) === stripped || String(n.label) === stripped) { byStripped = n; break; }
    }
    if (byStripped) return String(byStripped.id);
    return compLabel;
  };

  const existeArista = (g: Grafo, l1: string, l2: string) => {
    const k1 = resolveNodeKey(g, l1);
    const k2 = resolveNodeKey(g, l2);
    return g.aristas.some((ar: any) => (String(ar.from) === k1 && String(ar.to) === k2) || (String(ar.from) === k2 && String(ar.to) === k1));
  };

  const opTwoTensorial = (gA: Grafo, gB: Grafo): Grafo => {
    const productoNodos: { id: string; label: string; a: string; b: string }[] = [];
    for (const na of gA.nodos) {
      for (const nb of gB.nodos) {
        const id = `${String(na.label)}${String(nb.label)}`;
        productoNodos.push({ id, label: id, a: String(na.label), b: String(nb.label) });
      }
    }

    const aristasRes: { from: string; to: string }[] = [];
    const seen: Record<string, boolean> = {};
    for (let i = 0; i < productoNodos.length; i++) {
      for (let j = i + 1; j < productoNodos.length; j++) {
        const p = productoNodos[i];
        const q = productoNodos[j];
        if (existeArista(gA, p.a, q.a) && existeArista(gB, p.b, q.b)) {
          const key = [p.id, q.id].sort().join('-');
          if (!seen[key]) {
            seen[key] = true;
            aristasRes.push({ from: p.id, to: q.id });
          }
        }
      }
    }

    return {
      nodos: productoNodos.map(n => ({ id: n.id, label: n.label })),
      aristas: aristasRes
    };
  };

  // Secuencial
  let resultado = addLabelsToGraph(grafos.value[0], 0);
  for (let i = 1; i < grafos.value.length; i++) {
    const giGraph = addLabelsToGraph(grafos.value[i], i);
    resultado = opTwoTensorial(resultado, giGraph);
  }
  return resultado;
}

// Composición de Grafos: nodos = producto cartesiano (con letras), aristas según dos casos:
// Caso 1: ambas componentes conectadas en sus grafos originales
// Caso 2: una componente igual, las otras conectadas en sus grafos originales
function calcularComposicion(): Grafo {
  if (grafos.value.length < 2) {
    mostrarMensaje('Se requieren al menos dos grafos para Composición', true);
    return { nodos: [], aristas: [] };
  }

  // Grafo con etiquetas
  const addLabelsToGraph = (g: Grafo, gi: number): Grafo => ({
    nodos: g.nodos.map((n: any) => ({ id: String(n.id), label: `${String(n.id)}${getGraphLetter(gi)}` })),
    aristas: g.aristas.map((a: any) => ({ ...a }))
  });

  // Helper: obtener el grafo original no etiquetado por índice
  const getOriginalGraph = (gi: number): Grafo => grafos.value[gi];

  // Comprobar si existe arista en un grafo original
  const existeAristaEnOriginal = (gi: number, u: string, v: string) => {
    const g = getOriginalGraph(gi);
    const uId = String(u);
    const vId = String(v);
    return g.aristas.some((ar: any) =>
      (String(ar.from) === uId && String(ar.to) === vId) || (String(ar.from) === vId && String(ar.to) === uId)
    );
  };

  // Parser: extrae componentes de un nodo producto
  // ej: "1A2B" -> ["1A", "2B"], "1A1B1C" -> ["1A", "1B", "1C"]
  const parseNodoProducto = (lbl: string) => {
    const comps: string[] = [];
    let curr = '';
    for (let k = 0; k < lbl.length; k++) {
      const ch = lbl[k];
      if (/[A-Z]/.test(ch)) {
        curr += ch;
        comps.push(curr);
        curr = '';
      } else {
        curr += ch;
      }
    }
    return comps;
  };

  // Operación binaria entre dos grafos (gA compuesto, gB original etiquetado)
  const opTwoComposicion = (gA: Grafo, gB: Grafo, giA: number, giB: number): Grafo => {
    const productoNodos: { id: string; label: string }[] = [];
    for (const na of gA.nodos) {
      for (const nb of gB.nodos) {
        const id = `${String(na.label)}${String(nb.label)}`;
        productoNodos.push({ id, label: id });
      }
    }

    const aristasRes: { from: string; to: string }[] = [];
    const seen: Record<string, boolean> = {};

    for (let i = 0; i < productoNodos.length; i++) {
      for (let j = i + 1; j < productoNodos.length; j++) {
        const p = productoNodos[i];
        const q = productoNodos[j];

        // Extraer componentes: p.label = "1A2B", q.label = "2A1B"
        // donde la primera parte (1A, 2A) viene de gA y la segunda (2B, 1B) de gB
        const pComps = parseNodoProducto(String(p.label));
        const qComps = parseNodoProducto(String(q.label));

        // Para dos grafos: pComps[0] es u1, pComps[1] es v1
        //                  qComps[0] es u2, qComps[1] es v2
        const pCompA = pComps.slice(0, pComps.length - 1).join(''); // todas menos la última
        const pCompB = pComps[pComps.length - 1] || ''; // última componente
        const qCompA = qComps.slice(0, qComps.length - 1).join('');
        const qCompB = qComps[qComps.length - 1] || '';

        // Extraer valores sin letras para comparar en grafos originales
        const pA_val = stripLetter(pCompA) || pCompA;
        const pB_val = stripLetter(pCompB) || pCompB;
        const qA_val = stripLetter(qCompA) || qCompA;
        const qB_val = stripLetter(qCompB) || qCompB;

        // Reglas de composición:
        // Conectar (u1,v1) con (u2,v2) si:
        // 1. u1 está conectado con u2 en el grafo A (primeras componentes conectadas)
        // 2. u1 = u2 Y v1 está conectado con v2 en el grafo B
        
        const cond1 = existeAristaEnOriginal(giA, pA_val, qA_val);
        const cond2 = (pA_val === qA_val) && existeAristaEnOriginal(giB, pB_val, qB_val);

        if (cond1 || cond2) {
          const key = [p.id, q.id].sort().join('-');
          if (!seen[key]) {
            seen[key] = true;
            aristasRes.push({ from: p.id, to: q.id });
          }
        }
      }
    }

    return {
      nodos: productoNodos,
      aristas: aristasRes
    };
  };

  // Secuencial con índices de grafos
  let resultado = addLabelsToGraph(grafos.value[0], 0);
  for (let i = 1; i < grafos.value.length; i++) {
    const giGraph = addLabelsToGraph(grafos.value[i], i);
    resultado = opTwoComposicion(resultado, giGraph, i - 1, i);
  }
  return resultado;
}

function cerrarOperacion() {
  operacionActiva.value = '';
  grafoResultado.value = { nodos: [], aristas: [] };
  // destruir la instancia de vis-network del resultado (si existe) antes de nulificar
  _networkResultado?.destroy();
  _networkResultado = null;
  nodesDataSetResultado = null;
  edgesDataSetResultado = null;
}

function inicializarGrafoResultado() {
  const container = graphContainerResultado.value;
  if (!container) return;

  const palette = [
    { base: '#8b5cf6', dark: '#6d28d9' },
  ];
  const color = palette[0];

  const nodesData = new DataSet(
    grafoResultado.value.nodos.map((nodo: Nodo) => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: color.base,
        border: color.dark,
        highlight: { background: '#f59e0b', border: '#d97706' }
      },
      font: { color: '#e5e7eb', size: 16 }
    }))
  );

  const edgesData = new DataSet(
    grafoResultado.value.aristas.map((arista: Arista, index: number) => ({
      id: `resultado_${index}`,
      from: arista.from,
      to: arista.to,
      label: '',
      arrows: undefined,
      color: { color: color.base, highlight: '#f59e0b' },
      font: { color: '#e5e7eb', size: 14, background: '#111827' }
    }))
  );

  nodesDataSetResultado = nodesData;
  edgesDataSetResultado = edgesData;

  const data = { nodes: nodesDataSetResultado as any, edges: edgesDataSetResultado as any };

  const options = {
    nodes: { shape: 'circle', size: 25, borderWidth: 2 },
    edges: { width: 2, smooth: { enabled: true, type: 'continuous', roundness: 0.5 } },
    physics: { enabled: true, barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 150, springConstant: 0.04 }, stabilization: { iterations: 100 } },
    interaction: { hover: true, dragNodes: true, dragView: true, zoomView: true }
  };

  _networkResultado = new Network(container, data, options);
}

function getGraphLetter(idx: number): string {
  // 0 -> A, 1 -> B, etc.
  const base = 65; // 'A'
  return String.fromCharCode(base + (idx % 26));
}

function formatearConjuntoNodosResultado(): string {
  if (!grafoResultado.value || grafoResultado.value.nodos.length === 0) return '∅';

  // grafoResultado almacena nodos con id único: `${gi}_${origId}`
  const entries: string[] = [];
  for (const nodo of grafoResultado.value.nodos) {
    const parts = String(nodo.id).split('_');
    if (parts.length >= 2) {
      const orig = parts.slice(1).join('_');
      entries.push(`${orig}`);
    } else {
      entries.push(String(nodo.id));
    }
  }

  return `{${entries.join(', ')}}`;
}

function formatearConjuntoAristasResultado(): string {
  if (!grafoResultado.value || grafoResultado.value.aristas.length === 0) return '∅';

  const seen: Record<string, boolean> = {};
  const aristasFormateadas: string[] = [];
  for (const arista of grafoResultado.value.aristas) {
    // from and to are in format `${gi}_${orig}`
    const parseEndpoint = (ep: any) => {
      const s = String(ep).split('_');
      if (s.length >= 2) {
        const orig = s.slice(1).join('_');
        return `${orig}`;
      }
      return String(ep);
    };

    const fromLabel = parseEndpoint(arista.from);
    const toLabel = parseEndpoint(arista.to);
    const key = [fromLabel, toLabel].sort().join('-');
    if (!seen[key]) {
      seen[key] = true;
      aristasFormateadas.push(`(${fromLabel}, ${toLabel})`);
    }
  }

  return `{${aristasFormateadas.join(', ')}}`;
}

interface GrafosJSON {
  version: string;
  config: { cantidadGrafos: number; byGraph: number[] };
  grafos: Grafo[];
}

function validarFormatoJSON(obj: any): obj is GrafosJSON {
  return (
    obj && typeof obj === 'object' && obj.version === '1.0' && obj.config && typeof obj.config.cantidadGrafos === 'number' && Array.isArray(obj.config.byGraph) && Array.isArray(obj.grafos)
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

      config.value.cantidadGrafos = datosJSON.config.cantidadGrafos;
      config.value.byGraph = [...datosJSON.config.byGraph];
      grafos.value = datosJSON.grafos.map((g: any) => ({
        nodos: g.nodos.map((n: any) => ({ id: n.id, label: `${n.id}` })),
        aristas: g.aristas.map((a: any) => ({ ...a }))
      }));

      networks = [];
      nodesDataSets = [];
      edgesDataSets = [];
      graphContainers.value = new Array(config.value.cantidadGrafos).map(() => null);

      grafosCreados.value = true;
      grafoSeleccionado.value = 0;

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
    config: { cantidadGrafos: config.value.cantidadGrafos, byGraph: [...config.value.byGraph] },
    grafos: grafos.value.map((g: Grafo) => ({ nodos: g.nodos.map((n: Nodo) => ({ ...n })), aristas: g.aristas.map((a: Arista) => ({ ...a })) }))
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

.graph-operations {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 1rem;
  border: 2px solid #8b5cf6;
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.graph-operations h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  text-align: center;
  color: #8b5cf6;
  font-size: 1.1rem;
}

.operations-compact {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-operation {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

.operation-description {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.5rem 0;
}

.operation-result {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #8b5cf6;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(111, 45, 217, 0.05) 100%);
}

.operation-result h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #8b5cf6;
}

.operation-result .graph-visualization {
  max-width: 100%;
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 1px solid #374151;
  background: var(--card-background-color);
}

.operation-result .set-notation {
  margin: 1.5rem 0;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-close {
  background: #64748b;
  border: 1px solid #64748b;
  color: #fff;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.btn-close:hover {
  background: #475569;
  border-color: #475569;
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
