<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>

      

    
    <h1>Matrices</h1>

    <!-- Botón Abrir Grafo (siempre visible) -->
    <div class="import-section">
      <button @click="triggerFileInput" class="btn-import">Abrir Grafo</button>
      <input 
        ref="fileInput" 
        type="file" 
        accept=".json" 
        style="display: none" 
        @change="importarGrafo"
      />
    </div>

    <!-- Crear grafo -->
    <div v-if="!grafoCreado" class="create-structure">
      <h3>Crear Grafo</h3>
      
      <div class="config-row">
        <div>
          <label>Cantidad de Nodos:</label>
          <input 
            type="number" 
            v-model.number="config.cantidadNodos" 
            min="1"
            placeholder="Ej: 5"
          />
        </div>
        
        <div>
          <label>Tipo de Grafo:</label>
          <select v-model="config.esDirigido">
            <option :value="false">No Dirigido</option>
            <option :value="true">Dirigido</option>
          </select>
        </div>
        
        <div>
          <label>¿Es Ponderado?</label>
          <!-- Siempre ponderado: opción bloqueada -->
          <select v-model="config.esPonderado" disabled>
            <option :value="true">Sí</option>
          </select>
        </div>
      </div>

      <div class="info-preview" v-if="config.cantidadNodos > 0">
        <p><strong>Nodos:</strong> {{ config.cantidadNodos }} (numerados del 1 al {{ config.cantidadNodos }})</p>
        <p><strong>Tipo:</strong> {{ config.esDirigido ? 'Dirigido' : 'No Dirigido' }}</p>
        <p><strong>Ponderado:</strong> {{ config.esPonderado ? 'Sí' : 'No' }}</p>
      </div>

      <button @click="crearGrafo">Crear Grafo</button>
    </div>

    <!-- Grafo creado -->
    <div v-else>
      <!-- Info del grafo -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-item">
            <strong>Nodos:</strong> {{ grafo.nodos.length }}
          </div>
          <div class="info-item">
            <strong>Aristas:</strong> {{ contarAristas() }}
          </div>
          <div class="info-item">
            <strong>Tipo:</strong> {{ config.esDirigido ? 'Dirigido' : 'No Dirigido' }}
          </div>
          <div class="info-item">
            <strong>Ponderado:</strong> {{ config.esPonderado ? 'Sí' : 'No' }}
          </div>
        </div>
      </div>

      <!-- Gestión de Aristas -->
      <div class="edge-management">
        <h3>Gestión de Aristas</h3>
        <div class="edge-controls">
          <input 
            type="text" 
            v-model="aristaInput" 
            placeholder="Ej: 12 para conectar nodo 1 y 2"
            maxlength="10"
            @keyup.enter="agregarArista"
          />
          <input 
            v-if="config.esPonderado"
            type="number" 
            v-model.number="pesoArista" 
            placeholder="Peso"
            step="0.1"
          />
          <button @click="agregarArista">Agregar Arista</button>
        </div>
        <p class="help-text">
          {{ config.esDirigido ? 
            'Formato: "12" crea arista 1→2' : 
            'Formato: "12" crea arista bidireccional 1↔2' 
          }}
        </p>
      </div>

      <!-- Operaciones -->
      <div class="operations">
        <h3>Operaciones del Grafo</h3>
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

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Visualización del Grafo -->
      <div class="graph-visualization">
        <h3>Visualización del Grafo</h3>
        <div id="graph-container" ref="graphContainer"></div>
      </div>

      <!-- Panel de notación del grafo original -->
      <div class="set-notation">
        <h4>Representación en Teoría de Conjuntos:</h4>
        <div class="notation-content">
          <p><strong>V =</strong> {{ formatearConjuntoNodos() }}</p>
          <p><strong>A =</strong> <span v-html="formatearConjuntoAristas()"></span></p>
        </div>
      </div>

      <!-- Panel dinámico de Ramas y Cuerdas (árbol de expansión máximo) -->
      <div class="tree-sets" v-if="grafoCreado">
        <h4>Ramas (T) — Árbol de expansión máximo</h4>
        <div class="notation-content">
          <p v-html="formatearConjuntoRamas()"></p>
        </div>

        <h4>Cuerdas (C)</h4>
        <div class="notation-content">
          <p v-html="formatearConjuntoCuerdas()"></p>
        </div>
      </div>

      <!-- Panel de Todos los Circuitos -->
      <div class="circuits-panel" v-if="grafoCreado && todosLosCircuitos.length > 0">
        <h4>Todos los Circuitos</h4>
        <div class="notation-content">
          <div v-for="(circuito, idx) in todosLosCircuitos" :key="`c-${idx}`" class="circuit-item">
            <p v-html="formatearCircuito(circuito, idx)"></p>
          </div>
        </div>

        <!-- Matriz de Circuitos -->
        <div class="matrix-section" v-if="matrizCircuitos.length > 0">
          <h5>Matriz de Circuitos</h5>
          <table class="circuit-matrix">
            <thead>
              <tr>
                <th></th>
                <th v-for="(arista, idx) in grafo.aristas" :key="`h-${idx}`">
                  ({{ arista.from }},{{ arista.to }})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, idx) in matrizCircuitos" :key="`r-${idx}`">
                <td><strong>c{{ idx + 1 }}</strong></td>
                <td v-for="(valor, jdx) in fila" :key="`c-${idx}-${jdx}`"
                    :class="{'cell-positive': valor === 1, 'cell-negative': valor === -1, 'cell-zero': valor === 0}">
                  {{ valor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <!-- Panel de Circuitos Fundamentales -->
      <div class="fundamental-circuits-panel" v-if="grafoCreado && circuitosFundamentales.length > 0">
        <h4>Circuitos Fundamentales</h4>
        <div class="notation-content">
          <div v-for="(circuito, idx) in circuitosFundamentales" :key="`cf-${idx}`" class="circuit-item">
            <p v-html="formatearCircuitoFundamental(circuito, idx)"></p>
          </div>
        </div>

        <!-- Matriz de Circuitos Fundamentales -->
        <div class="matrix-section" v-if="matrizCircuitosFundamentales.length > 0">
          <h5>Matriz de Circuitos Fundamentales</h5>
          <table class="circuit-matrix">
            <thead>
              <tr>
                <th></th>
                <th v-for="(arista, idx) in grafo.aristas" :key="`hf-${idx}`">
                  ({{ arista.from }},{{ arista.to }})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, idx) in matrizCircuitosFundamentales" :key="`rf-${idx}`">
                <td><strong>cf{{ idx + 1 }}</strong></td>
                <td v-for="(valor, jdx) in fila" :key="`cf-${idx}-${jdx}`"
                    :class="{'cell-positive': valor === 1, 'cell-negative': valor === -1, 'cell-zero': valor === 0}">
                  {{ valor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel de Conjuntos de Corte (insertado justo debajo de circuitos) -->
      <div class="cuts-panel" v-if="grafoCreado && todosLosCortes.length > 0">
        <h4>Conjuntos de Corte</h4>
        <div class="notation-content">
          <div v-for="(corte, idx) in todosLosCortes" :key="`cc-${idx}`" class="circuit-item">
            <p v-html="formatearConjuntoCorte(corte, idx)"></p>
          </div>
        </div>

        <!-- Matriz de Conjuntos de Corte -->
        <div class="matrix-section" v-if="matrizCortes.length > 0">
          <h5>Matriz de Conjuntos de Corte</h5>
          <table class="circuit-matrix">
            <thead>
              <tr>
                <th></th>
                <th v-for="(arista, idx) in grafo.aristas" :key="`hc-${idx}`">
                  ({{ arista.from }},{{ arista.to }})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, idx) in matrizCortes" :key="`rc-${idx}`">
                <td><strong>cc{{ idx + 1 }}</strong></td>
                <td v-for="(valor, jdx) in fila" :key="`cc-${idx}-${jdx}`"
                    :class="{'cell-positive': valor === 1, 'cell-zero': valor === 0}">
                  {{ valor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel de Cortes Fundamentales -->
      <div class="fundamental-cuts-panel" v-if="grafoCreado && cortesFundamentales.length > 0">
        <h4>Cortes Fundamentales</h4>
        <div class="notation-content">
          <div v-for="(corte, idx) in cortesFundamentales" :key="`cfc-${idx}`" class="circuit-item">
            <p v-html="formatearConjuntoCorteFundamental(corte, idx)"></p>
          </div>
        </div>

        <!-- Matriz de Cortes Fundamentales -->
        <div class="matrix-section" v-if="matrizCortesFundamentales.length > 0">
          <h5>Matriz de Cortes Fundamentales</h5>
          <table class="circuit-matrix">
            <thead>
              <tr>
                <th></th>
                <th v-for="(arista, idx) in grafo.aristas" :key="`hcf-${idx}`">
                  ({{ arista.from }},{{ arista.to }})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, idx) in matrizCortesFundamentales" :key="`rcf-${idx}`">
                <td><strong>cfc{{ idx + 1 }}</strong></td>
                <td v-for="(valor, jdx) in fila" :key="`cfc-${idx}-${jdx}`"
                    :class="{'cell-positive': valor === 1, 'cell-zero': valor === 0}">
                  {{ valor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botón de reseteo y guardado -->
      <div class="reset-section">
        <button @click="resetearGrafo" class="btn-danger" :disabled="false">Resetear Grafo</button>
        <button @click="guardarGrafo" class="btn-save">💾 Guardar Grafo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface Config {
  cantidadNodos: number;
  esDirigido: boolean;
  esPonderado: boolean;
}

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

const config = ref<Config>({
  cantidadNodos: 5,
  esDirigido: false,
  esPonderado: true
});

const grafoCreado = ref(false);
const grafo = ref<Grafo>({
  nodos: [],
  aristas: []
});

const aristaInput = ref('');
const pesoArista = ref<number | null>(1);
const nodoEliminar = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);

// Variables para almacenamiento del árbol máximo (ramas y cuerdas)
const aristasOriginales = ref<Array<Arista & { id?: string }>>([]);
const ramasArbol = ref<Arista[]>([]);
const cuerdasArbol = ref<Arista[]>([]);
const arbolCalculado = ref(false);

// Variables para circuitos y matrices
const todosLosCircuitos = ref<Arista[][]>([]);
const circuitosFundamentales = ref<Arista[][]>([]);
const matrizCircuitos = ref<number[][]>([]);
const matrizCircuitosFundamentales = ref<number[][]>([]);

// Variables para cortes y matrices de cortes
const todosLosCortes = ref<Arista[][]>([]);
const cortesFundamentales = ref<Arista[][]>([]);
const matrizCortes = ref<number[][]>([]);
const matrizCortesFundamentales = ref<number[][]>([]);

// Estados para visualización
const graphContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

let network: Network | null = null;
let nodesDataSet: DataSet<{ id: number | string; label?: string; color?: any; font?: any }> | null = null;
let edgesDataSet: DataSet<{ id: number; from: number | string; to: number | string; label?: string; arrows?: string; color?: any; font?: any }> | null = null;

function crearGrafo() {
  if (config.value.cantidadNodos <= 0) {
    mostrarMensaje('Por favor ingrese una cantidad válida de nodos', true);
    return;
  }

  // Crear nodos numerados del 1 al n
  grafo.value.nodos = [];
  for (let i = 1; i <= config.value.cantidadNodos; i++) {
    grafo.value.nodos.push({ id: i, label: `${i}` });
  }

  grafo.value.aristas = [];
  grafoCreado.value = true;
  mostrarMensaje('Grafo creado correctamente', false);

  // Inicializar visualización
  nextTick(() => {
    inicializarVisualizacion();
    // Calcular árbol máximo (inicialmente sin aristas será vacío)
    calcularArbolExpansionMaximo();
  });
}

function inicializarVisualizacion() {
  if (!graphContainer.value) return;

  nodesDataSet = new DataSet(
    grafo.value.nodos.map((nodo: Nodo) => ({
      id: nodo.id,
      label: nodo.label,
      color: {
        background: '#1f2937',
        border: '#374151',
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

  edgesDataSet = new DataSet(
    grafo.value.aristas.map((arista: Arista, index: number) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: config.value.esPonderado && arista.peso !== undefined ? `${arista.peso}` : '',
      arrows: config.value.esDirigido ? 'to' : undefined,
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

  const data = {
    nodes: nodesDataSet,
    edges: edgesDataSet
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

  try {
    network = new Network(graphContainer.value, data, options);
  } catch (e) {
    console.error('Error al inicializar vis-network:', e);
  }
}

function actualizarVisualizacion() {
  if (!nodesDataSet || !edgesDataSet) return;

  // Actualizar nodos
  const nodosNuevos = grafo.value.nodos.map((n: Nodo) => n.id);
  
  // Eliminar nodos que ya no existen
  const nodosActualesTyped = nodesDataSet!.get() as Array<{ id: number | string }>;
  nodosActualesTyped.forEach((nodo: { id: number | string }) => {
    if (!nodosNuevos.includes(nodo.id)) {
      nodesDataSet!.remove(nodo.id);
    }
  });

  // Agregar nodos nuevos
  grafo.value.nodos.forEach((nodo: Nodo) => {
    const existe = nodesDataSet!.get(nodo.id);
    if (!existe) {
      nodesDataSet!.add({
        id: nodo.id,
        label: nodo.label,
        color: {
          background: '#1f2937',
          border: '#374151',
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

  // Actualizar aristas
  edgesDataSet.clear();
  grafo.value.aristas.forEach((arista: Arista, index: number) => {
    edgesDataSet!.add({
      id: index,
      from: arista.from,
      to: arista.to,
      label: config.value.esPonderado && arista.peso !== undefined ? `${arista.peso}` : '',
      arrows: config.value.esDirigido ? 'to' : undefined,
      color: {
        color: '#94a3b8',
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      }
    });
  });
  // Force a redraw so `network` is considered used and the view updates
  network?.redraw();
}

function agregarArista() {
  if (!aristaInput.value || aristaInput.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaInput.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  // Validar que los nodos existen
  if (!existeNodo(nodo1) || !existeNodo(nodo2)) {
    mostrarMensaje('Uno o ambos nodos no existen en el grafo', true);
    return;
  }

  // Validar que no se está conectando un nodo consigo mismo
  if (nodo1 === nodo2) {
    mostrarMensaje('No se puede crear una arista de un nodo a sí mismo', true);
    return;
  }

  // Verificar si la arista ya existe
  if (existeArista(nodo1, nodo2)) {
    mostrarMensaje('Esta arista ya existe', true);
    return;
  }

  // En este módulo el grafo siempre es ponderado: exigir peso
  if (pesoArista.value === null || pesoArista.value === undefined) {
    mostrarMensaje('Por favor ingrese el peso de la arista', true);
    return;
  }

  grafo.value.aristas.push({
    from: nodo1,
    to: nodo2,
    peso: pesoArista.value
  });

  actualizarVisualizacion();
  mostrarMensaje(
    `Arista agregada: ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2} (peso: ${pesoArista.value})`,
    false
  );
  
  aristaInput.value = '';
  if (config.value.esPonderado) pesoArista.value = 1;

  // Recalcular árbol máximo y actualizar conjuntos
  calcularArbolExpansionMaximo();
}

function insertarNodo() {
  // Calcular el nuevo id a partir de los ids numéricos actuales
  const numericIds = grafo.value.nodos.map((n: Nodo) => Number(n.id)).filter((x: number) => !isNaN(x));
  const nuevoId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
  grafo.value.nodos.push({ id: nuevoId, label: `${nuevoId}` });

  actualizarVisualizacion();
  mostrarMensaje(`Nodo ${nuevoId} insertado`, false);
  // Recalcular árbol máximo
  calcularArbolExpansionMaximo();
}

function eliminarNodo() {
  if (!nodoEliminar.value) {
    mostrarMensaje('Por favor ingrese un número de nodo', true);
    return;
  }

  const id = nodoEliminar.value;
  
  if (!existeNodo(id)) {
    mostrarMensaje(`El nodo ${id} no existe`, true);
    return;
  }

  // Eliminar el nodo
  grafo.value.nodos = grafo.value.nodos.filter((n: Nodo) => n.id !== id);

  // Eliminar todas las aristas conectadas a este nodo
  grafo.value.aristas = grafo.value.aristas.filter(
    (arista: Arista) => arista.from !== id && arista.to !== id
  );

  actualizarVisualizacion();
  mostrarMensaje(`Nodo ${id} eliminado junto con sus aristas`, false);
  nodoEliminar.value = null;
  // Recalcular árbol máximo
  calcularArbolExpansionMaximo();
}

function borrarArista() {
  if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaBorrar.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  const aristaIndex = grafo.value.aristas.findIndex((arista: Arista) =>
    (String(arista.from) === String(nodo1) && String(arista.to) === String(nodo2)) ||
    (!config.value.esDirigido && String(arista.from) === String(nodo2) && String(arista.to) === String(nodo1))
  );

  if (aristaIndex === -1) {
    mostrarMensaje('La arista no existe', true);
    return;
  }

  grafo.value.aristas.splice(aristaIndex, 1);
  actualizarVisualizacion();
  mostrarMensaje(`Arista ${nodo1}-${nodo2} eliminada`, false);
  aristaBorrar.value = '';
  // Recalcular árbol máximo
  calcularArbolExpansionMaximo();
}

function extraerNodos(input: string): [number, number] | null {
  // Compatibilidad con OperacionesUnGrafo: aceptar "12" → 1 y 2, y "1 2" → 1 y 2
  const trimmed = input.trim();
  const tokens = trimmed.match(/\d+/g) || [];

  // Caso 1: dos tokens separados (espacios, comas, etc.)
  if (tokens.length >= 2) {
    const t0 = tokens[0] as string;
    const t1 = tokens[1] as string;
    const n1 = parseInt(t0, 10);
    const n2 = parseInt(t1, 10);
    if (isNaN(n1) || isNaN(n2)) {
      mostrarMensaje('Formato inválido. Se esperaban dos números de nodo.', true);
      return null;
    }
    return [n1, n2];
  }

  // Caso 2: un solo token continuo de dígitos, separamos primer dígito y el resto
  const noSpace = trimmed.replace(/\s+/g, '');
  if (!/^\d+$/.test(noSpace) || noSpace.length < 2) {
    mostrarMensaje('Formato inválido. Use "12" o "1 2" (dos números).', true);
    return null;
  }
  const n1 = parseInt(noSpace[0], 10);
  const n2 = parseInt(noSpace.substring(1), 10);
  if (isNaN(n1) || isNaN(n2)) {
    mostrarMensaje('Formato inválido. Se esperaban números de nodo.', true);
    return null;
  }
  return [n1, n2];
}

function mostrarMensaje(msg: string, error: boolean) {
  mensaje.value = msg;
  esError.value = error;
  setTimeout(() => {
    mensaje.value = '';
    esError.value = false;
  }, 3000);
}

function resetearGrafo() {
  if (confirm('¿Estás seguro de que deseas resetear el grafo?')) {
    grafoCreado.value = false;
    grafo.value = { nodos: [], aristas: [] };
    network = null;
    nodesDataSet = null;
    edgesDataSet = null;
    // Limpiar información del árbol
    ramasArbol.value = [];
    cuerdasArbol.value = [];
    arbolCalculado.value = false;

    mostrarMensaje('Grafo reseteado', false);
  }
}

function contarAristas(): number {
  return grafo.value.aristas.length;
}

function formatearConjuntoNodos(): string {
  if (grafo.value.nodos.length === 0) return '∅';
  return `{${grafo.value.nodos.map((n: Nodo) => n.id).join(', ')}}`;
}

function formatearConjuntoAristas(): string {
  if (grafo.value.aristas.length === 0) return '∅';
  // Deduplicar aristas antes de formatear (considerar grafos no dirigidos)
  const aristasUnicasRecord: Record<string, Arista> = {};
  grafo.value.aristas.forEach((arista: Arista) => {
    const key = config.value.esDirigido
      ? `${String(arista.from)}-${String(arista.to)}`
      : [String(arista.from), String(arista.to)].sort().join('-'); // Para grafos no dirigidos, ordenar las aristas
    if (!aristasUnicasRecord[key]) aristasUnicasRecord[key] = arista;
  });

  const aristasFormateadas = Object.keys(aristasUnicasRecord).map((key: string) => {
    const arista = aristasUnicasRecord[key];
    const pesoHtml = config.value.esPonderado && arista.peso !== undefined
      ? `, <span class="peso-badge">p=${arista.peso}</span>`
      : '';
    return `(${arista.from}, ${arista.to}${pesoHtml})`;
  });
  
  return `{${aristasFormateadas.join(', ')}}`;
}

function formatearConjuntoRamas(): string {
  if (ramasArbol.value.length === 0) return '∅';
  const ramas = ramasArbol.value.map((a: Arista) => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    const pesoHtml = config.value.esPonderado && a.peso !== undefined
      ? `, <span class=\"peso-badge\">p=${a.peso}</span>`
      : '';
    return `(${a.from}${simbolo}${a.to}${pesoHtml})`;
  });
  return `{ ${ramas.join(', ')} }`;
}

function formatearConjuntoCuerdas(): string {
  if (cuerdasArbol.value.length === 0) return '∅';
  const cuerdas = cuerdasArbol.value.map((a: Arista) => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    const pesoHtml = config.value.esPonderado && a.peso !== undefined
      ? `, <span class=\"peso-badge\">p=${a.peso}</span>`
      : '';
    return `(${a.from}${simbolo}${a.to}${pesoHtml})`;
  });
  return `{ ${cuerdas.join(', ')} }`;
}

function formatearCircuito(circuito: Arista[], indice: number): string {
  if (!circuito || circuito.length === 0) return `c${indice + 1} = ∅`;
  const elementos = circuito.map((a: Arista) => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    const pesoHtml = config.value.esPonderado && a.peso !== undefined
      ? `, <span class=\"peso-badge\">p=${a.peso}</span>`
      : '';
    return `(${a.from}${simbolo}${a.to}${pesoHtml})`;
  });
  return `c${indice + 1} = { ${elementos.join(', ')} }`;
}

function formatearCircuitoFundamental(circuito: Arista[], indice: number): string {
  if (!circuito || circuito.length === 0) return `cf${indice + 1} = ∅`;
  const elementos = circuito.map((a: Arista) => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    const pesoHtml = config.value.esPonderado && a.peso !== undefined
      ? `, <span class=\"peso-badge\">p=${a.peso}</span>`
      : '';
    return `(${a.from}${simbolo}${a.to}${pesoHtml})`;
  });
  return `cf${indice + 1} = { ${elementos.join(', ')} }`;
}

function calcularArbolExpansionMaximo() {
  if (!grafo.value.aristas || grafo.value.aristas.length === 0) {
    ramasArbol.value = [];
    cuerdasArbol.value = [];
    arbolCalculado.value = false;
    return;
  }

  // Guardar aristas originales (como hace ArbolesExpansion.vue)
  aristasOriginales.value = grafo.value.aristas.map((a: Arista) => ({ ...a, id: `${a.from}-${a.to}` }));

  // Ordenar por peso descendente
  const aristasOrdenadas = [...grafo.value.aristas].sort((a, b) => (Number(b.peso) ?? 0) - (Number(a.peso) ?? 0));

  // Kruskal usando arrays como conjuntos (equivalente funcional a Map/Set)
  const arbolExpansion: Arista[] = [];
  const nodosConectados: Record<number, number[]> = {};
  grafo.value.nodos.forEach((n: Nodo) => {
    const idNum = Number(n.id);
    nodosConectados[idNum] = [idNum];
  });

  function unionArrays(a: number[], b: number[]): number[] {
    const seen: Record<number, boolean> = {};
    for (const v of a) seen[v] = true;
    for (const v of b) seen[v] = true;
    return Object.keys(seen).map(k => Number(k));
  }

  for (const arista of aristasOrdenadas) {
    const fromId = Number(arista.from);
    const toId = Number(arista.to);
    const conjuntoFrom = nodosConectados[fromId] || [fromId];
    const conjuntoTo = nodosConectados[toId] || [toId];

    const formaCiclo = conjuntoFrom.some((nodo: number) => conjuntoTo.indexOf(nodo) !== -1);
    if (!formaCiclo) {
      arbolExpansion.push(arista);
      const nuevoConjunto = unionArrays(conjuntoFrom, conjuntoTo);
      for (const n of nuevoConjunto) {
        nodosConectados[n] = nuevoConjunto;
      }
    }

    if (arbolExpansion.length === grafo.value.nodos.length - 1) break;
  }

  ramasArbol.value = arbolExpansion;
  // Cuerdas: usar aristasOriginales y comparar solo from/to
  cuerdasArbol.value = aristasOriginales.value
    .filter((original: Arista & { id?: string }) =>
      !arbolExpansion.some((rama: Arista) => rama.from === original.from && rama.to === original.to)
    )
    .map((o: Arista & { id?: string }) => ({ from: o.from, to: o.to, peso: o.peso } as Arista));

  arbolCalculado.value = arbolExpansion.length > 0;

  // Calcular circuitos tras actualizar árbol
  calcularCircuitos();
}

function calcularCircuitos() {
  if (!grafo.value.aristas || grafo.value.aristas.length === 0) {
    todosLosCircuitos.value = [];
    circuitosFundamentales.value = [];
    matrizCircuitos.value = [];
    matrizCircuitosFundamentales.value = [];
    // Cortes
    todosLosCortes.value = [];
    cortesFundamentales.value = [];
    matrizCortes.value = [];
    matrizCortesFundamentales.value = [];
    return;
  }

  // Encontrar todos los circuitos simples del grafo
  todosLosCircuitos.value = encontrarTodosLosCircuitos();

  // Identificar circuitos fundamentales (uno por cuerda)
  circuitosFundamentales.value = identificarCircuitosFundamentales();

  // Construir matrices
  matrizCircuitos.value = construirMatrizCircuitos(todosLosCircuitos.value);
  matrizCircuitosFundamentales.value = construirMatrizCircuitos(circuitosFundamentales.value);

  // Calcular cortes (todos los conjuntos de corte minimal) y sus matrices
  calcularCortes();
}

function encontrarTodosLosCircuitos(): Arista[][] {
  // Algoritmo de Johnson para encontrar todos los ciclos simples
  const circuitos: Arista[][] = [];
  const n = grafo.value.nodos.length;
  if (n === 0) return circuitos;

  // Construir lista de adyacencia
  const adj: Record<number, number[]> = {};
  grafo.value.nodos.forEach((nodo: Nodo) => {
    adj[Number(nodo.id)] = [];
  });
  grafo.value.aristas.forEach((arista: Arista) => {
    const from = Number(arista.from);
    const to = Number(arista.to);
    adj[from].push(to);
    if (!config.value.esDirigido) {
      adj[to].push(from);
    }
  });

  const blocked: Record<number, boolean> = {};
  const blockedSet: Record<number, number[]> = {};
  const stack: number[] = [];
  const path: number[] = [];

  function unblock(u: number): void {
    blocked[u] = false;
    if (blockedSet[u]) {
      blockedSet[u].forEach((w: number) => {
        if (blocked[w]) unblock(w);
      });
      blockedSet[u] = [];
    }
  }

  function circuit(v: number, s: number): boolean {
    let f = false;
    stack.push(v);
    path.push(v);
    blocked[v] = true;

    for (const w of adj[v] || []) {
      if (w === s) {
        // Encontramos un ciclo
        const ciclo = [...path];
        if (ciclo.length >= 3) {
          const aristasCircuito: Arista[] = [];
          for (let i = 0; i < ciclo.length; i++) {
            const from = ciclo[i];
            const to = ciclo[(i + 1) % ciclo.length];
            const arista = grafo.value.aristas.find((a: Arista) =>
              (Number(a.from) === from && Number(a.to) === to) ||
              (!config.value.esDirigido && Number(a.from) === to && Number(a.to) === from)
            );
            if (arista) aristasCircuito.push(arista);
          }
          if (aristasCircuito.length === ciclo.length) {
            circuitos.push(aristasCircuito);
          }
        }
        f = true;
      } else if (!blocked[w]) {
        if (circuit(w, s)) {
          f = true;
        }
      }
    }

    if (f) {
      unblock(v);
    } else {
      for (const w of adj[v] || []) {
        if (!blockedSet[w]) blockedSet[w] = [];
        if (blockedSet[w].indexOf(v) === -1) {
          blockedSet[w].push(v);
        }
      }
    }

    path.pop();
    stack.pop();
    return f;
  }

  // Inicializar blocked y blockedSet
  grafo.value.nodos.forEach((nodo: Nodo) => {
    const id = Number(nodo.id);
    blocked[id] = false;
    blockedSet[id] = [];
  });

  const nodos = grafo.value.nodos.map((n: Nodo) => Number(n.id)).sort((a: number, b: number) => a - b);
  for (let i = 0; i < nodos.length; i++) {
    const s = nodos[i];
    // Resetear blocked para cada inicio
    grafo.value.nodos.forEach((nodo: Nodo) => {
      blocked[Number(nodo.id)] = false;
      blockedSet[Number(nodo.id)] = [];
    });
    circuit(s, s);
  }

  // Deduplicar circuitos (especialmente importante en grafos no dirigidos)
  return deduplicarCircuitos(circuitos);
}

function deduplicarCircuitos(circuitos: Arista[][]): Arista[][] {
  const circuitosUnicos: Arista[][] = [];
  const firmasVistas: Record<string, boolean> = {};

  for (const circuito of circuitos) {
    // Extraer nodos del circuito
    const nodosCircuito = circuito.map((a: Arista) => Number(a.from));
    
    let firma: string;
    
    if (config.value.esDirigido) {
      // Para grafos dirigidos: considerar la secuencia de nodos (dirección importa)
      // Normalizar comenzando desde el nodo más pequeño para evitar rotaciones
      const minIdx = nodosCircuito.indexOf(Math.min(...nodosCircuito));
      const secuenciaNormalizada = [
        ...nodosCircuito.slice(minIdx),
        ...nodosCircuito.slice(0, minIdx)
      ];
      firma = secuenciaNormalizada.join('→');
    } else {
      // Para grafos no dirigidos: solo importa el conjunto de nodos
      const nodosOrdenados = [...nodosCircuito].sort((a: number, b: number) => a - b);
      firma = nodosOrdenados.join('-');
    }

    // Solo agregar si no hemos visto esta combinación
    if (!firmasVistas[firma]) {
      firmasVistas[firma] = true;
      circuitosUnicos.push(circuito);
    }
  }

  return circuitosUnicos;
}

function identificarCircuitosFundamentales(): Arista[][] {
  const fundamentales: Arista[][] = [];
  const cuerdasUsadas: Record<string, boolean> = {};

  // Para cada cuerda, encontrar un circuito que la contenga
  for (const cuerda of cuerdasArbol.value) {
    const keyC = `${cuerda.from}-${cuerda.to}`;
    if (cuerdasUsadas[keyC]) continue;

    // Buscar circuito que contenga esta cuerda
    for (const circuito of todosLosCircuitos.value) {
      const contieneCuerda = circuito.some((a: Arista) =>
        (a.from === cuerda.from && a.to === cuerda.to) ||
        (!config.value.esDirigido && a.from === cuerda.to && a.to === cuerda.from)
      );

      if (contieneCuerda) {
        // Verificar que no usa otra cuerda ya asignada
        let usaOtraCuerda = false;
        for (const a of circuito) {
          const k = `${a.from}-${a.to}`;
          const k2 = `${a.to}-${a.from}`;
          if ((cuerdasUsadas[k] || cuerdasUsadas[k2]) && k !== keyC && k2 !== keyC) {
            usaOtraCuerda = true;
            break;
          }
        }

        if (!usaOtraCuerda) {
          fundamentales.push(circuito);
          cuerdasUsadas[keyC] = true;
          if (!config.value.esDirigido) cuerdasUsadas[`${cuerda.to}-${cuerda.from}`] = true;
          break;
        }
      }
    }
  }

  return fundamentales;
}

function construirMatrizCircuitos(circuitos: Arista[][]): number[][] {
  if (circuitos.length === 0 || grafo.value.aristas.length === 0) return [];

  const matriz: number[][] = [];
  const todasAristas = grafo.value.aristas;

  for (const circuito of circuitos) {
    const fila: number[] = [];
    for (const arista of todasAristas) {
      // Buscar si la arista está en el circuito
      let idx = -1;
      for (let i = 0; i < circuito.length; i++) {
        const a = circuito[i];
        if ((a.from === arista.from && a.to === arista.to) ||
            (!config.value.esDirigido && a.from === arista.to && a.to === arista.from)) {
          idx = i;
          break;
        }
      }

      if (idx === -1) {
        fila.push(0);
      } else {
        // Determinar dirección (horario=1, antihorario=-1)
        const aristaCircuito = circuito[idx];

        // Calcular si va en sentido horario o antihorario (simplificado)
        const mismaDir = aristaCircuito.from === arista.from && aristaCircuito.to === arista.to;
        fila.push(mismaDir ? 1 : -1);
      }
    }
    matriz.push(fila);
  }

  return matriz;
}

// ===================== CORTES (CUT SETS) =====================
function calcularCortes() {
  // Calcular todos los cortes mínimos (minimal edge cuts)
  todosLosCortes.value = encontrarTodosLosCortes();

  // Cortes fundamentales por hojas del árbol máximo
  cortesFundamentales.value = cortesFundamentalesPorHojas();

  // Matrices
  matrizCortes.value = construirMatrizCortes(todosLosCortes.value);
  matrizCortesFundamentales.value = construirMatrizCortes(cortesFundamentales.value);
}

function encontrarTodosLosCortes(): Arista[][] {
  const cortes: Arista[][] = [];
  const aristas = grafo.value.aristas;
  const m = aristas.length;
  if (m === 0) return cortes;

  // Helper: comprobar si quitar el conjunto de índices "indices" desconecta el grafo (considerando conectividad no dirigida)
  function esDesconectado(indices: number[]): boolean {
    const removedMap: Record<number, boolean> = {};
    indices.forEach(i => { removedMap[i] = true; });
    // construir adyacencia no dirigida con aristas restantes
    const adj: Record<number, number[]> = {};
    grafo.value.nodos.forEach((n: Nodo) => { adj[Number(n.id)] = []; });
    for (let i = 0; i < aristas.length; i++) {
      if (removedMap[i]) continue;
      const a = aristas[i];
      const u = Number(a.from);
      const v = Number(a.to);
      adj[u].push(v);
      adj[v].push(u);
    }
    // BFS desde primer nodo existente
    const nodos: number[] = grafo.value.nodos.map((n: Nodo) => Number(n.id));
    if (nodos.length === 0) return false;
    const start = nodos[0];
    const visited: Record<number, boolean> = {};
    const q: number[] = [start];
    visited[start] = true;
    while (q.length) {
      const x = q.shift() as number;
      for (const y of adj[x] || []) {
        if (!visited[y]) { visited[y] = true; q.push(y); }
      }
    }
    // si existe algún nodo no visitado => desconectado
    return nodos.some((n: number) => !visited[n]);
  }

  // Generar combinaciones con poda por tamaño creciente
  const indices: number[] = [];
  function backtrack(start: number, k: number) {
    if (k === 0) {
      // indices contiene una combinación de tamaño original
      // comprobar si al quitar estas aristas se desconecta
      if (esDesconectado(indices)) {
        // comprobar minimalidad: ninguna subcoalición menor desconecta
        let minimal = true;
        for (let i = 0; i < indices.length; i++) {
          const subset = indices.slice(0, i).concat(indices.slice(i + 1));
          if (esDesconectado(subset)) { minimal = false; break; }
        }
        if (minimal) {
          cortes.push(indices.map(idx => aristas[idx]));
        }
      }
      return;
    }

    for (let i = start; i <= m - k; i++) {
      indices.push(i);
      backtrack(i + 1, k - 1);
      indices.pop();
    }
  }

  // recorrer tamaños 1..m-1 (no incluir quitar todas las aristas)
  for (let size = 1; size <= Math.max(1, m - 1); size++) {
    backtrack(0, size);
  }

  // Deduplicar por firma (lista de aristas ordenadas)
  const vistos: Record<string, boolean> = {};
  const resultado: Arista[][] = [];
  for (const corte of cortes) {
    const firma = corte
      .map(a => (config.value.esDirigido ? `${a.from}-${a.to}` : [String(a.from), String(a.to)].sort().join('-')))
      .sort()
      .join('|');
    if (!vistos[firma]) { vistos[firma] = true; resultado.push(corte); }
  }

  return resultado;
}

function construirMatrizCortes(cortes: Arista[][]): number[][] {
  if (cortes.length === 0 || grafo.value.aristas.length === 0) return [];
  const matriz: number[][] = [];
  for (const corte of cortes) {
    const fila: number[] = [];
    for (const a of grafo.value.aristas) {
      const pertenece = corte.some(c =>
        (c.from === a.from && c.to === a.to) || (!config.value.esDirigido && c.from === a.to && c.to === a.from)
      );
      fila.push(pertenece ? 1 : 0);
    }
    matriz.push(fila);
  }
  return matriz;
}

function cortesFundamentalesPorHojas(): Arista[][] {
  // Encontrar hojas en ramasArbol (grado 1 en el árbol)
  const degree: Record<number, number> = {};
  ramasArbol.value.forEach((a: Arista) => {
    const u = Number(a.from);
    const v = Number(a.to);
    degree[u] = (degree[u] || 0) + 1;
    degree[v] = (degree[v] || 0) + 1;
  });
  const hojas = Object.keys(degree).filter(k => degree[Number(k)] === 1).map(k => Number(k));

  const fundamentales: Arista[][] = [];
  for (const hoja of hojas) {
    // El corte fundamental asociado a una hoja es el conjunto de todas las aristas incidentes a la hoja
    const corte = grafo.value.aristas.filter((a: Arista) => Number(a.from) === hoja || Number(a.to) === hoja);
    if (corte.length > 0) fundamentales.push(corte);
  }
  return fundamentales;
}

function formatearConjuntoCorte(corte: Arista[], indice: number): string {
  if (!corte || corte.length === 0) return `cc${indice + 1} = ∅`;
  const elementos = corte.map((a: Arista) => {
    const peso = a.peso !== undefined ? ` <span class=\"peso-badge\">p=${a.peso}</span>` : '';
    const simbolo = config.value.esDirigido ? '→' : '↔';
    return `(${a.from}${simbolo}${a.to}${peso})`;
  });
  return `cc${indice + 1} = { ${elementos.join(', ')} }`;
}

function formatearConjuntoCorteFundamental(corte: Arista[], indice: number): string {
  if (!corte || corte.length === 0) return `cfc${indice + 1} = ∅`;
  const elementos = corte.map((a: Arista) => {
    const peso = a.peso !== undefined ? ` <span class=\"peso-badge\">p=${a.peso}</span>` : '';
    const simbolo = config.value.esDirigido ? '→' : '↔';
    return `(${a.from}${simbolo}${a.to}${peso})`;
  });
  return `cfc${indice + 1} = { ${elementos.join(', ')} }`;
}

function existeNodo(id: number): boolean {
  return grafo.value.nodos.some((n: Nodo) => String(n.id) === String(id));
}

function existeArista(from: number, to: number): boolean {
  return grafo.value.aristas.some(
    (arista: Arista) =>
      (String(arista.from) === String(from) && String(arista.to) === String(to)) ||
      (!config.value.esDirigido && String(arista.from) === String(to) && String(arista.to) === String(from))
  );
}

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

interface GrafoJSON {
  version: string;
  config: {
    cantidadNodos: number;
    esDirigido: boolean;
    esPonderado: boolean;
  };
  grafo: {
    nodos: Array<{ id: number | string; label: string }>;
    aristas: Array<{ from: number | string; to: number | string; peso?: number }>;
  };
}

function validarFormatoJSON(obj: any): obj is GrafoJSON {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.version === '1.0' &&
    obj.config &&
    typeof obj.config.cantidadNodos === 'number' &&
    typeof obj.config.esDirigido === 'boolean' &&
    typeof obj.config.esPonderado === 'boolean' &&
    obj.grafo &&
    Array.isArray(obj.grafo.nodos) &&
    Array.isArray(obj.grafo.aristas) &&
    obj.grafo.nodos.every((n: any) => n && (typeof n.id === 'number' || typeof n.id === 'string') && typeof n.label === 'string') &&
    obj.grafo.aristas.every((a: any) => a && (typeof a.from === 'number' || typeof a.from === 'string') && (typeof a.to === 'number' || typeof a.to === 'string') && (a.peso === undefined || typeof a.peso === 'number'))
  );
}

function importarGrafo(event: Event) {
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
        mostrarMensaje('Archivo JSON inválido. Por favor selecciona un archivo de grafo válido generado por este módulo.', true);
        if (fileInput.value) fileInput.value.value = '';
        return;
      }

      // Cargar configuración y grafo
      config.value = { ...datosJSON.config };
      grafo.value = {
        nodos: datosJSON.grafo.nodos.map((n: Nodo) => ({ ...n })),
        aristas: datosJSON.grafo.aristas.map((a: Arista) => ({ ...a }))
      };

      grafoCreado.value = true;

      // Limpiar input
      if (fileInput.value) fileInput.value.value = '';

      nextTick(() => {
        inicializarVisualizacion();
        // Recalcular árbol máximo tras importar
        calcularArbolExpansionMaximo();
      });

      mostrarMensaje('Grafo importado correctamente', false);
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

function guardarGrafo() {
  const datosGuardar: GrafoJSON = {
    version: '1.0',
    config: {
      cantidadNodos: config.value.cantidadNodos,
      esDirigido: config.value.esDirigido,
      esPonderado: config.value.esPonderado
    },
    grafo: {
      nodos: grafo.value.nodos.map((n: Nodo) => ({ ...n })),
      aristas: grafo.value.aristas.map((a: Arista) => ({ ...a }))
    }
  };

  const json = JSON.stringify(datosGuardar, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `grafo_${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  mostrarMensaje('Grafo guardado exitosamente', false);
}
</script>

<style scoped>
/* Styles copied from OperacionesUnGrafo.vue to ensure identical look */
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
  max-width: 1000px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.info-item {
  text-align: center;
  padding: 0.5rem;
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
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 2;
}

.peso-badge {
  color: #f59e0b; /* amber */
  font-weight: 700;
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

/* Cabecera para todas las matrices indicando las aristas */
.circuit-matrix thead th:first-child {
    position: relative;
    min-width: 100px;
}

.circuit-matrix thead th:first-child::before {
    content: 'Aristas';
    color: var(--primary);
    font-weight: 600;
    display: block;
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

.graph-visualization {
  max-width: 1200px;
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

#graph-container {
  width: 100%;
  height: 500px;
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

/* Estilos para paneles de circuitos */
.circuits-panel,
.fundamental-circuits-panel {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.circuits-panel h4,
.fundamental-circuits-panel h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--primary);
}

.circuit-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #374151;
}

.circuit-item:last-child {
  border-bottom: none;
}

.circuit-item p {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
}

/* Estilos para matrices de circuitos */
.matrix-section {
  margin-top: 1.5rem;
}

.matrix-section h5 {
  text-align: center;
  color: var(--primary);
  margin-bottom: 1rem;
}

.circuit-matrix {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.circuit-matrix th,
.circuit-matrix td {
  border: 1px solid #374151;
  padding: 0.5rem;
  text-align: center;
}

.circuit-matrix th {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: var(--primary);
  font-weight: 600;
}

.circuit-matrix tbody tr:nth-child(even) {
  background: #1f2937;
}

.circuit-matrix tbody tr:nth-child(odd) {
  background: #111827;
}

.cell-positive {
  color: #22c55e;
  font-weight: 700;
}

.cell-negative {
  color: #ef4444;
  font-weight: 700;
}

.cell-zero {
  color: #6b7280;
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

  #graph-container {
    height: 400px;
  }

  .circuit-matrix {
    font-size: 0.75rem;
  }

  .circuit-matrix th,
  .circuit-matrix td {
    padding: 0.25rem;
  }
}
</style>
