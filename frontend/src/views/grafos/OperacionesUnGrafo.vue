<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Operaciones en un Grafo</h1>

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
          <select v-model="config.esPonderado">
            <option :value="false">No</option>
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

      <!-- Notación de Teoría de Conjuntos -->
      <div class="set-notation">
        <h4>Representación en Teoría de Conjuntos:</h4>
        <div class="notation-content">
          <p><strong>V =</strong> {{ formatearConjuntoNodos() }}</p>
          <p><strong>A =</strong> {{ formatearConjuntoAristas() }}</p>
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

          <!-- Fusionar Vértices -->
          <div class="operation-card">
            <h4>Fusionar Vértices</h4>
            <input 
              type="text" 
              v-model="verticesFusionar" 
              placeholder="Ej: 12"
              maxlength="10"
            />
            <button @click="fusionarVertices">Fusionar</button>
          </div>

          <!-- Contraer Arista -->
          <div class="operation-card">
            <h4>Contraer Arista</h4>
            <input 
              type="text" 
              v-model="aristaContraer" 
              placeholder="Ej: 12"
              maxlength="10"
            />
            <button @click="contraerArista">Contraer</button>
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

      <!-- Botón de reseteo -->
      <div class="reset-section">
        <button @click="resetearGrafo" class="btn-danger">Resetear Grafo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface Config {
  cantidadNodos: number;
  esDirigido: boolean;
  esPonderado: boolean;
}

interface Nodo {
  id: number;
  label: string;
}

interface Arista {
  from: number;
  to: number;
  peso?: number;
}

interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

const config = ref<Config>({
  cantidadNodos: 5,
  esDirigido: false,
  esPonderado: false
});

const grafoCreado = ref(false);
const grafo = ref<Grafo>({
  nodos: [],
  aristas: []
});

const aristaInput = ref('');
const pesoArista = ref<number>(1);
const nodoEliminar = ref<number | null>(null);
const aristaBorrar = ref('');
const verticesFusionar = ref('');
const aristaContraer = ref('');
const mensaje = ref('');
const esError = ref(false);

const graphContainer = ref<HTMLElement | null>(null);
let network: Network | null = null;
let nodesDataSet: DataSet<any> | null = null;
let edgesDataSet: DataSet<any> | null = null;

function crearGrafo() {
  if (config.value.cantidadNodos <= 0) {
    mostrarMensaje('Por favor ingrese una cantidad válida de nodos', true);
    return;
  }

  // Crear nodos numerados del 1 al n
  grafo.value.nodos = [];
  for (let i = 1; i <= config.value.cantidadNodos; i++) {
    grafo.value.nodos.push({
      id: i,
      label: `${i}`
    });
  }

  grafo.value.aristas = [];
  grafoCreado.value = true;
  mostrarMensaje('Grafo creado correctamente', false);

  // Inicializar visualización
  nextTick(() => {
    inicializarVisualizacion();
  });
}

function inicializarVisualizacion() {
  if (!graphContainer.value) return;

  // Preparar datos para vis-network
  nodesDataSet = new DataSet(
    grafo.value.nodos.map(nodo => ({
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
    grafo.value.aristas.map((arista, index) => ({
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
        type: 'continuous'
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

  network = new Network(graphContainer.value, data, options);
}

function actualizarVisualizacion() {
  if (!nodesDataSet || !edgesDataSet) return;

  // Actualizar nodos
  const nodosActuales = nodesDataSet.get();
  const nodosNuevos = grafo.value.nodos.map(nodo => nodo.id);
  
  // Eliminar nodos que ya no existen
  nodosActuales.forEach(nodo => {
    if (!nodosNuevos.includes(nodo.id)) {
      nodesDataSet!.remove(nodo.id);
    }
  });

  // Agregar nodos nuevos
  grafo.value.nodos.forEach(nodo => {
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
  grafo.value.aristas.forEach((arista, index) => {
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

  const peso = config.value.esPonderado ? pesoArista.value : undefined;

  grafo.value.aristas.push({
    from: nodo1,
    to: nodo2,
    peso: peso
  });

  actualizarVisualizacion();
  mostrarMensaje(
    `Arista agregada: ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2}${peso !== undefined ? ` (peso: ${peso})` : ''}`,
    false
  );
  
  aristaInput.value = '';
  if (config.value.esPonderado) pesoArista.value = 1;
}

function insertarNodo() {
  const nuevoId = Math.max(...grafo.value.nodos.map(n => n.id)) + 1;
  grafo.value.nodos.push({
    id: nuevoId,
    label: `${nuevoId}`
  });

  actualizarVisualizacion();
  mostrarMensaje(`Nodo ${nuevoId} insertado`, false);
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
  grafo.value.nodos = grafo.value.nodos.filter(n => n.id !== id);

  // Eliminar todas las aristas conectadas a este nodo
  grafo.value.aristas = grafo.value.aristas.filter(
    arista => arista.from !== id && arista.to !== id
  );

  actualizarVisualizacion();
  mostrarMensaje(`Nodo ${id} eliminado junto con sus aristas`, false);
  nodoEliminar.value = null;
}

function borrarArista() {
  if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaBorrar.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  const aristaIndex = grafo.value.aristas.findIndex(
    arista => 
      (arista.from === nodo1 && arista.to === nodo2) ||
      (!config.value.esDirigido && arista.from === nodo2 && arista.to === nodo1)
  );

  if (aristaIndex === -1) {
    mostrarMensaje('La arista no existe', true);
    return;
  }

  grafo.value.aristas.splice(aristaIndex, 1);
  actualizarVisualizacion();
  mostrarMensaje(`Arista ${nodo1}-${nodo2} eliminada`, false);
  aristaBorrar.value = '';
}

function fusionarVertices() {
  if (!verticesFusionar.value || verticesFusionar.value.length < 2) {
    mostrarMensaje('Por favor ingrese dos nodos válidos (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(verticesFusionar.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  if (!existeNodo(nodo1) || !existeNodo(nodo2)) {
    mostrarMensaje('Uno o ambos nodos no existen', true);
    return;
  }

  if (nodo1 === nodo2) {
    mostrarMensaje('No se puede fusionar un nodo consigo mismo', true);
    return;
  }

  // Mantener nodo1, eliminar nodo2
  // Redirigir todas las aristas de nodo2 a nodo1
  grafo.value.aristas = grafo.value.aristas.map(arista => {
    if (arista.from === nodo2) arista.from = nodo1;
    if (arista.to === nodo2) arista.to = nodo1;
    return arista;
  }).filter(arista => arista.from !== arista.to); // Eliminar auto-loops

  // Eliminar duplicados de aristas
  const aristasUnicas = new Map<string, Arista>();
  grafo.value.aristas.forEach(arista => {
    const key = config.value.esDirigido 
      ? `${arista.from}-${arista.to}`
      : [arista.from, arista.to].sort().join('-');
    
    if (!aristasUnicas.has(key)) {
      aristasUnicas.set(key, arista);
    }
  });
  grafo.value.aristas = Array.from(aristasUnicas.values());

  // Eliminar nodo2
  grafo.value.nodos = grafo.value.nodos.filter(n => n.id !== nodo2);

  actualizarVisualizacion();
  mostrarMensaje(`Vértices ${nodo1} y ${nodo2} fusionados en ${nodo1}`, false);
  verticesFusionar.value = '';
}

function contraerArista() {
  if (!aristaContraer.value || aristaContraer.value.length < 2) {
    mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
    return;
  }

  const nodos = extraerNodos(aristaContraer.value);
  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  if (!existeArista(nodo1, nodo2)) {
    mostrarMensaje('La arista no existe', true);
    return;
  }

  // Eliminar la arista
  grafo.value.aristas = grafo.value.aristas.filter(
    arista => 
      !((arista.from === nodo1 && arista.to === nodo2) ||
        (!config.value.esDirigido && arista.from === nodo2 && arista.to === nodo1))
  );

  // Fusionar los nodos
  grafo.value.aristas = grafo.value.aristas.map(arista => {
    if (arista.from === nodo2) arista.from = nodo1;
    if (arista.to === nodo2) arista.to = nodo1;
    return arista;
  }).filter(arista => arista.from !== arista.to);

  // Eliminar duplicados
  const aristasUnicas = new Map<string, Arista>();
  grafo.value.aristas.forEach(arista => {
    const key = config.value.esDirigido 
      ? `${arista.from}-${arista.to}`
      : [arista.from, arista.to].sort().join('-');
    
    if (!aristasUnicas.has(key)) {
      aristasUnicas.set(key, arista);
    }
  });
  grafo.value.aristas = Array.from(aristasUnicas.values());

  grafo.value.nodos = grafo.value.nodos.filter(n => n.id !== nodo2);

  actualizarVisualizacion();
  mostrarMensaje(`Arista ${nodo1}-${nodo2} contraída, nodos fusionados en ${nodo1}`, false);
  aristaContraer.value = '';
}

function resetearGrafo() {
  if (confirm('¿Estás seguro de que deseas resetear el grafo?')) {
    grafoCreado.value = false;
    grafo.value = { nodos: [], aristas: [] };
    network = null;
    nodesDataSet = null;
    edgesDataSet = null;
    mostrarMensaje('Grafo reseteado', false);
  }
}

function contarAristas(): number {
  return grafo.value.aristas.length;
}

function formatearConjuntoNodos(): string {
  if (grafo.value.nodos.length === 0) return '∅';
  return `{${grafo.value.nodos.map(n => n.id).join(', ')}}`;
}

function formatearConjuntoAristas(): string {
  if (grafo.value.aristas.length === 0) return '∅';
  
  const aristasFormateadas = grafo.value.aristas.map(arista => {
    const peso = config.value.esPonderado && arista.peso !== undefined 
      ? `, ${arista.peso}` 
      : '';
    return `(${arista.from}, ${arista.to}${peso})`;
  });
  
  return `{${aristasFormateadas.join(', ')}}`;
}

function existeNodo(id: number): boolean {
  return grafo.value.nodos.some(n => n.id === id);
}

function existeArista(from: number, to: number): boolean {
  return grafo.value.aristas.some(
    arista => 
      (arista.from === from && arista.to === to) ||
      (!config.value.esDirigido && arista.from === to && arista.to === from)
  );
}

function extraerNodos(input: string): [number, number] | null {
  // Extraer números del string
  const numeros = input.match(/\d+/g);
  
  if (!numeros || numeros.length < 2) {
    mostrarMensaje('Formato inválido. Use formato: 12 (para nodos 1 y 2)', true);
    return null;
  }

  const nodo1 = parseInt(numeros[0]);
  const nodo2 = parseInt(numeros[1]);

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

.notation-content p {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
}

.notation-content strong {
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

  #graph-container {
    height: 400px;
  }
}
</style>
