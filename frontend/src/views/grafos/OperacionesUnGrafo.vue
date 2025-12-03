<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Operaciones en un Grafo</h1>

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
        <div class="operations-grid">

          <!-- Fusionar Vértices -->
          <div class="operation-card">
            <h4>Fusionar nodos</h4>
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

          <!-- Generar Grafo Línea -->
          <div class="operation-card">
            <h4>Generar Grafo Línea</h4>
            <button @click="iniciarGrafoLinea" :disabled="grafoLineaAplicado || complementoAplicado">Generar Línea</button>
          </div>

          <!-- Generar Complemento -->
          <div class="operation-card">
            <h4>Generar Complemento del Grafo</h4>
            <button @click="iniciarComplemento" :disabled="grafoLineaAplicado || complementoAplicado" style="font-size: 90%;">Generar Complemento</button>
          </div>
        </div>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Botones de reversión -->
      <div v-if="grafoLineaAplicado || complementoAplicado" class="revert-section">
        <button v-if="grafoLineaAplicado" @click="revertirGrafoLinea" class="btn-revert">Revertir Grafo Línea</button>
        <button v-if="complementoAplicado" @click="revertirComplemento" class="btn-revert">Revertir Complemento</button>
      </div>

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
          <p><strong>A =</strong> {{ formatearConjuntoAristas() }}</p>
        </div>
      </div>

      <!-- Panel de notación del complemento (si aplica) -->
      <div v-if="complementoAplicado && complementoInfo && complementoInfo.aristas.length > 0" class="set-notation complemento-notation">
        <h4>Complemento del Grafo:</h4>
        <div class="notation-content">
          <p><strong>V =</strong> {{ formatearConjuntoNodosComplemento() }}</p>
          <p><strong>A =</strong> {{ formatearConjuntoAristasComplemento() }}</p>
        </div>
      </div>

      <!-- Botón de reseteo y guardado -->
      <div class="reset-section">
        <button @click="resetearGrafo" class="btn-danger" :disabled="grafoLineaAplicado || complementoAplicado">Resetear Grafo</button>
        <button @click="guardarGrafo" class="btn-save">Guardar Grafo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, toRaw } from 'vue';
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

// Estados para transformaciones de grafo
const grafoLineaAplicado = ref(false);
const complementoAplicado = ref(false);
const grafoOriginal = ref<Grafo | null>(null);
const complementoInfo = ref<{ nodos: (number | string)[]; aristas: Arista[] } | null>(null);

const graphContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

  // Debug logs para asegurar que el contenedor y los datos existen
  console.log('Inicializando visualización:', { container: graphContainer.value, nodes: grafo.value.nodos.length, edges: grafo.value.aristas.length });
  if (!graphContainer.value) {
    console.error('Graph container no disponible - abortando inicialización de vis-network');
    return;
  }

  try {
    network = new Network(graphContainer.value, data, options);
  } catch (e) {
    console.error('Error al inicializar vis-network:', e);
  }
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
  // Calcular el nuevo id a partir de los ids numéricos actuales
  const numericIds = grafo.value.nodos.map(n => Number(n.id)).filter(x => !isNaN(x));
  const nuevoId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
  grafo.value.nodos.push({ id: nuevoId, label: `${nuevoId}` });

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
}

function fusionarVertices() {
  console.log("Iniciando fusión de nodos...");
  
  if (!verticesFusionar.value || verticesFusionar.value.length < 2) {
    mostrarMensaje('Por favor ingrese dos nodos válidos (ej: 12)', true);
    console.log("No se ingresaron dos nodos válidos.");
    return;
  }

  const nodos = extraerNodos(verticesFusionar.value);
  console.log("Nodos a fusionar:", nodos);

  if (!nodos) return;

  const [nodo1, nodo2] = nodos;

  // Verificar si los nodos existen
  console.log(`Verificando si los nodos ${nodo1} y ${nodo2} existen...`);
  if (!existeNodo(nodo1) || !existeNodo(nodo2)) {
    mostrarMensaje('Uno o ambos nodos no existen', true);
    console.log("Al menos uno de los nodos no existe.");
    return;
  }

  if (nodo1 === nodo2) {
    mostrarMensaje('No se puede fusionar un nodo consigo mismo', true);
    console.log("Intento de fusionar un nodo consigo mismo.");
    return;
  }

  // Crear el nuevo nodo fusionado (usar string para evitar colisión con ids numéricos)
  const nuevoNodo = `${nodo1}${nodo2}`;
  console.log("Nuevo nodo fusionado:", nuevoNodo);
  // Guardar copia de aristas antes de modificar para comprobar si existía arista entre nodo1 y nodo2
  const aristasAntes = grafo.value.aristas.map(a => ({ ...a }));
  console.log("Aristas antes de la fusión:", aristasAntes);

  // Mapear sobre la copia para producir las nuevas aristas con el nodo fusionado
  let nuevasAristas = aristasAntes.map(arista => {
    const aristaRaw = { ...arista };
    if (aristaRaw.from === nodo1 || aristaRaw.from === nodo2) aristaRaw.from = nuevoNodo;
    if (aristaRaw.to === nodo1 || aristaRaw.to === nodo2) aristaRaw.to = nuevoNodo;
    return aristaRaw;
  });

  console.log("Aristas después de mapear la fusión:", nuevasAristas);

  // Eliminar los nodos fusionados (nodo1 y nodo2)
  grafo.value.nodos = grafo.value.nodos.filter(nodo => nodo.id !== nodo1 && nodo.id !== nodo2);
  console.log("Nodos después de la fusión:", grafo.value.nodos);

  // Agregar el nuevo nodo fusionado
  grafo.value.nodos.push({ id: nuevoNodo, label: nuevoNodo });

  // Comprobar si existía arista entre nodo1 y nodo2 antes de la fusión
  const huboAristaEntre = aristasAntes.some(ar =>
    (ar.from === nodo1 && ar.to === nodo2) || (!config.value.esDirigido && ar.from === nodo2 && ar.to === nodo1)
  );

  // Si hubo una arista entre los dos nodos, al mapearla habremos creado un bucle; si no hubo, no crear uno nuevo.
  if (huboAristaEntre) {
    // Asegurar que exista al menos un bucle para el nuevo nodo (si hubo arista entre ambos)
    const existeBucle = nuevasAristas.some(a => a.from === nuevoNodo && a.to === nuevoNodo);
    if (!existeBucle) {
      nuevasAristas.push({ from: nuevoNodo, to: nuevoNodo, peso: config.value.esPonderado ? 1 : undefined });
    }
  }

  // Eliminar duplicados de aristas resultantes (mantener una copia representativa)
  const aristasUnicas = new Map();
  nuevasAristas.forEach(arista => {
    const key = config.value.esDirigido ? `${arista.from}-${arista.to}` : [arista.from, arista.to].sort().join('-');
    if (!aristasUnicas.has(key)) aristasUnicas.set(key, arista);
  });

  grafo.value.aristas = Array.from(aristasUnicas.values());

  console.log("Aristas después de la fusión y deduplicación:", grafo.value.aristas);

  // Actualizar la visualización y la notación
  actualizarVisualizacion();
  mostrarMensaje(`Vértices ${nodo1} y ${nodo2} fusionados en ${nuevoNodo}`, false);

  // Limpiar input
  verticesFusionar.value = '';
  // Actualizar la notación en teoría de conjuntos
  actualizarNotacionTeoriaConjuntos();
}


function actualizarNotacionTeoriaConjuntos() {
  console.log("Actualizando la notación de teoría de conjuntos...");
  
  // Actualizar el conjunto de nodos
  const conjuntoNodos = grafo.value.nodos.map(nodo => nodo.id);
  console.log("Conjunto de nodos:", conjuntoNodos);

  // Crear un conjunto de aristas únicas para evitar duplicados
  const aristasUnicas = new Set<string>();

  grafo.value.aristas.forEach(arista => {
    // Convertimos la arista en un objeto plano para asegurar la comparación
    const aristaRaw = { ...arista };

    // Generamos una clave única para cada arista
    const aristaKey = config.value.esDirigido
      ? `${aristaRaw.from}-${aristaRaw.to}`
      : [aristaRaw.from, aristaRaw.to].sort().join('-'); // Para grafos no dirigidos, ordenar las aristas

    console.log("Comprobando arista:", aristaKey);

    // Solo agregar la arista si no está duplicada
    if (!aristasUnicas.has(aristaKey)) {
      aristasUnicas.add(aristaKey);
      console.log("Arista única añadida:", aristaRaw);
    } else {
      console.log("Arista duplicada encontrada, no se añade:", aristaRaw);
    }
  });

  // Obtener las aristas únicas
  const conjuntoAristas = Array.from(aristasUnicas).map(aristaKey => {
    const [from, to] = aristaKey.split('-');
    const arista = grafo.value.aristas.find(a => `${a.from}-${a.to}` === aristaKey);
    const peso = config.value.esPonderado && arista?.peso !== undefined ? `, ${arista.peso}` : '';
    return `(${from}, ${to}${peso})`;
  });
  
  console.log("Conjunto de aristas (sin duplicados):", conjuntoAristas);

  // Formatear la representación en conjunto
  const conjuntoNodosStr = `{${conjuntoNodos.join(', ')}}`;
  const conjuntoAristasStr = `{${conjuntoAristas.join(', ')}}`;

  // Mostrar la notación actualizada en el UI
  console.log(`V = ${conjuntoNodosStr}`);
  console.log(`A = ${conjuntoAristasStr}`);
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
  // Crear nuevo nodo fusionado con notación "12"
  const nuevoNodo = `${nodo1}${nodo2}`;

  // Copia de aristas antes de modificar
  const aristasAntes = grafo.value.aristas.map(a => ({ ...a }));

  // Eliminar todas las aristas que conecten directamente nodo1 y nodo2 (la arista contraída)
  const restantes = aristasAntes.filter(ar => !(
    (String(ar.from) === String(nodo1) && String(ar.to) === String(nodo2)) ||
    (!config.value.esDirigido && String(ar.from) === String(nodo2) && String(ar.to) === String(nodo1))
  ));

  // Reemplazar referencias a nodo1 o nodo2 por el nuevo nodo fusionado
  let nuevasAristas = restantes.map(arista => {
    const a = { ...arista };
    if (String(a.from) === String(nodo1) || String(a.from) === String(nodo2)) a.from = nuevoNodo;
    if (String(a.to) === String(nodo1) || String(a.to) === String(nodo2)) a.to = nuevoNodo;
    return a;
  });

  // Eliminar auto-bucles resultantes que no deberían permanecer
  nuevasAristas = nuevasAristas.filter(a => String(a.from) !== String(a.to));

  // Deduplicar aristas resultantes
  const aristasUnicas = new Map<string, Arista>();
  nuevasAristas.forEach(arista => {
    const key = config.value.esDirigido
      ? `${String(arista.from)}-${String(arista.to)}`
      : [String(arista.from), String(arista.to)].sort().join('-');
    if (!aristasUnicas.has(key)) aristasUnicas.set(key, arista);
  });

  grafo.value.aristas = Array.from(aristasUnicas.values());

  // Reemplazar nodos: eliminar ambos y añadir el nuevo nodo fusionado
  grafo.value.nodos = grafo.value.nodos.filter(n => String(n.id) !== String(nodo1) && String(n.id) !== String(nodo2));
  grafo.value.nodos.push({ id: nuevoNodo, label: nuevoNodo });

  actualizarVisualizacion();
  // Actualizar la notación de teoría de conjuntos
  actualizarNotacionTeoriaConjuntos();

  mostrarMensaje(`Arista ${nodo1}-${nodo2} contraída, nodos fusionados en ${nuevoNodo}`, false);
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
  // Deduplicar aristas antes de formatear (considerar grafos no dirigidos)
  const aristasUnicas = new Map<string, Arista>();
  grafo.value.aristas.forEach(arista => {
    const key = config.value.esDirigido
      ? `${String(arista.from)}-${String(arista.to)}`
      : [String(arista.from), String(arista.to)].sort().join('-');
    if (!aristasUnicas.has(key)) aristasUnicas.set(key, arista);
  });

  const aristasFormateadas = Array.from(aristasUnicas.values()).map(arista => {
    const peso = config.value.esPonderado && arista.peso !== undefined ? `, ${arista.peso}` : '';
    return `(${arista.from}, ${arista.to}${peso})`;
  });

  return `{${aristasFormateadas.join(', ')}}`;
}

function existeNodo(id: number): boolean {
  return grafo.value.nodos.some(n => String(n.id) === String(id));
}

function existeArista(from: number, to: number): boolean {
  return grafo.value.aristas.some(
    arista =>
      (String(arista.from) === String(from) && String(arista.to) === String(to)) ||
      (!config.value.esDirigido && String(arista.from) === String(to) && String(arista.to) === String(from))
  );
}

function extraerNodos(input: string): [number, number] | null {
  // Limpiar la entrada (eliminar espacios y caracteres no numéricos)
  const cleanedInput = input.replace(/\D/g, ''); // Solo conservar números
  
  // Asegurarse de que haya al menos dos números
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

// ============ GRAFO LÍNEA ============
function iniciarGrafoLinea() {
  if (grafo.value.aristas.length === 0) {
    mostrarMensaje('El grafo debe tener al menos una arista para generar el grafo línea', true);
    return;
  }

  // Mostrar confirmación
  if (!confirm('¿Deseas generar el grafo línea? Esta acción transformará el grafo actual.')) {
    return;
  }

  // Guardar grafo original
  grafoOriginal.value = {
    nodos: grafo.value.nodos.map(n => ({ ...n })),
    aristas: grafo.value.aristas.map(a => ({ ...a }))
  };

  // Generar grafo línea
  generarGrafoLinea();
  grafoLineaAplicado.value = true;

  actualizarVisualizacion();
  actualizarNotacionTeoriaConjuntos();
  mostrarMensaje('Grafo Línea generado exitosamente', false);
}

function generarGrafoLinea() {
  // En el grafo línea, cada arista se convierte en un nodo
  // Las aristas del grafo línea conectan nodos que corresponden a aristas adyacentes en el grafo original

  const nuevosNodos: Nodo[] = [];
  const nuevasAristas: Arista[] = [];

  // Crear nodos a partir de las aristas originales
  grafo.value.aristas.forEach((arista, index) => {
    const nuevoId = `${arista.from}${arista.to}`;
    nuevosNodos.push({
      id: nuevoId,
      label: nuevoId
    });
  });

  // Crear aristas entre nodos que corresponden a aristas adyacentes
  for (let i = 0; i < grafo.value.aristas.length; i++) {
    for (let j = i + 1; j < grafo.value.aristas.length; j++) {
      const arista1 = grafo.value.aristas[i];
      const arista2 = grafo.value.aristas[j];

      // Verificar si las aristas comparten un nodo
      const comparar = (a: number | string, b: number | string) => String(a) === String(b);
      const adyacentes =
        comparar(arista1.from, arista2.from) ||
        comparar(arista1.from, arista2.to) ||
        comparar(arista1.to, arista2.from) ||
        comparar(arista1.to, arista2.to);

      if (adyacentes) {
        const nodo1 = `${arista1.from}${arista1.to}`;
        const nodo2 = `${arista2.from}${arista2.to}`;

        // Agregar arista (evitar duplicados)
        const existe = nuevasAristas.some(a =>
          (String(a.from) === String(nodo1) && String(a.to) === String(nodo2)) ||
          (String(a.from) === String(nodo2) && String(a.to) === String(nodo1))
        );

        if (!existe) {
          nuevasAristas.push({
            from: nodo1,
            to: nodo2
          });
        }
      }
    }
  }

  // Reemplazar grafo
  grafo.value.nodos = nuevosNodos;
  grafo.value.aristas = nuevasAristas;
}

function revertirGrafoLinea() {
  if (!grafoOriginal.value) return;

  grafo.value = {
    nodos: grafoOriginal.value.nodos.map(n => ({ ...n })),
    aristas: grafoOriginal.value.aristas.map(a => ({ ...a }))
  };

  grafoLineaAplicado.value = false;
  grafoOriginal.value = null;

  actualizarVisualizacion();
  actualizarNotacionTeoriaConjuntos();
  mostrarMensaje('Grafo Línea revertido', false);
}

// ============ GRAFO COMPLEMENTO ============
function iniciarComplemento() {
  // Verificar si el grafo es completo
  const nodos = grafo.value.nodos.length;
  const aristasMaximas = (nodos * (nodos - 1)) / 2;
  const aristasCactuales = config.value.esDirigido ? grafo.value.aristas.length : grafo.value.aristas.length;

  if (aristasCactuales === aristasMaximas) {
    mostrarMensaje('El grafo ya es completo. Se resaltará en su color original.', false);
    complementoAplicado.value = true;
    complementoInfo.value = { nodos: [], aristas: [] };
    return;
  }

  // Guardar grafo original
  grafoOriginal.value = {
    nodos: grafo.value.nodos.map(n => ({ ...n })),
    aristas: grafo.value.aristas.map(a => ({ ...a }))
  };

  // Calcular aristas del complemento
  const aristasFaltantes = calcularComplemento();

  if (aristasFaltantes.length === 0) {
    mostrarMensaje('El grafo ya es completo.', false);
    complementoAplicado.value = true;
    complementoInfo.value = { nodos: [], aristas: [] };
    return;
  }

  // Guardar información del complemento y agregar aristas
  const nodosComplemento: (number | string)[] = [];
  aristasFaltantes.forEach(a => {
    if (!nodosComplemento.includes(a.from)) nodosComplemento.push(a.from);
    if (!nodosComplemento.includes(a.to)) nodosComplemento.push(a.to);
  });

  complementoInfo.value = {
    nodos: nodosComplemento,
    aristas: aristasFaltantes
  };

  // Agregar aristas del complemento al grafo
  aristasFaltantes.forEach(arista => {
    grafo.value.aristas.push(arista);
  });

  complementoAplicado.value = true;

  actualizarVisualizacionComplemento();
  actualizarNotacionTeoriaConjuntos();
  mostrarMensaje('Grafo Complemento generado. Las nuevas aristas están resaltadas en naranja.', false);
}

function calcularComplemento(): Arista[] {
  const aristasFaltantes: Arista[] = [];
  const nodosIds = grafo.value.nodos.map(n => n.id);

  for (let i = 0; i < nodosIds.length; i++) {
    for (let j = i + 1; j < nodosIds.length; j++) {
      const nodo1 = nodosIds[i];
      const nodo2 = nodosIds[j];

      // Verificar si ya existe arista entre estos nodos
      const existe = grafo.value.aristas.some(a =>
        (String(a.from) === String(nodo1) && String(a.to) === String(nodo2)) ||
        (String(a.from) === String(nodo2) && String(a.to) === String(nodo1))
      );

      if (!existe) {
        aristasFaltantes.push({
          from: nodo1,
          to: nodo2
        });
      }
    }
  }

  return aristasFaltantes;
}

function actualizarVisualizacionComplemento() {
  if (!nodesDataSet || !edgesDataSet || !complementoInfo.value) return;

  // Actualizar aristas con colores diferenciados para el complemento
  edgesDataSet.clear();
  grafo.value.aristas.forEach((arista, index) => {
    const esComplemento = complementoInfo.value!.aristas.some(a =>
      (String(a.from) === String(arista.from) && String(a.to) === String(arista.to)) ||
      (String(a.from) === String(arista.to) && String(a.to) === String(arista.from))
    );

    const color = esComplemento ? '#f97316' : '#94a3b8'; // Naranja para complemento, gris por defecto

    edgesDataSet!.add({
      id: index,
      from: arista.from,
      to: arista.to,
      label: config.value.esPonderado && arista.peso !== undefined ? `${arista.peso}` : '',
      arrows: config.value.esDirigido ? 'to' : undefined,
      color: {
        color: color,
        highlight: '#f59e0b'
      },
      font: {
        color: '#e5e7eb',
        size: 14,
        background: '#111827'
      },
      width: esComplemento ? 3 : 2
    });
  });
}

function revertirComplemento() {
  if (!grafoOriginal.value) return;

  grafo.value = {
    nodos: grafoOriginal.value.nodos.map(n => ({ ...n })),
    aristas: grafoOriginal.value.aristas.map(a => ({ ...a }))
  };

  complementoAplicado.value = false;
  complementoInfo.value = null;
  grafoOriginal.value = null;

  actualizarVisualizacion();
  actualizarNotacionTeoriaConjuntos();
  mostrarMensaje('Complemento revertido', false);
}

function formatearConjuntoAristasComplemento(): string {
  if (!complementoInfo.value || complementoInfo.value.aristas.length === 0) return '∅';

  const aristasFormateadas = complementoInfo.value.aristas.map(arista => {
    const peso = config.value.esPonderado && arista.peso !== undefined ? `, ${arista.peso}` : '';
    return `(${arista.from}, ${arista.to}${peso})`;
  });

  return `{${aristasFormateadas.join(', ')}}`;
}

function formatearConjuntoNodosComplemento(): string {
  if (!complementoInfo.value || complementoInfo.value.nodos.length === 0) return '∅';
  return `{${complementoInfo.value.nodos.join(', ')}}`;
}

// ============ GUARDAR E IMPORTAR GRAFOS ============
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
        nodos: datosJSON.grafo.nodos.map(n => ({ ...n })),
        aristas: datosJSON.grafo.aristas.map(a => ({ ...a }))
      };

      grafoCreado.value = true;
      grafoLineaAplicado.value = false;
      complementoAplicado.value = false;
      grafoOriginal.value = null;
      complementoInfo.value = null;

      // Limpiar input
      if (fileInput.value) fileInput.value.value = '';

      nextTick(() => {
        inicializarVisualizacion();
        actualizarNotacionTeoriaConjuntos();
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
      nodos: grafo.value.nodos.map(n => ({ ...n })),
      aristas: grafo.value.aristas.map(a => ({ ...a }))
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
  margin-bottom: 1rem;
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

.revert-section {
  max-width: 600px;
  margin: 1rem auto;
  text-align: center;
  padding: 1rem;
}

.btn-revert {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  margin: 0.5rem;
}

.btn-revert:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-danger {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.complemento-notation {
  border-color: #f97316;
  background: linear-gradient(135deg, #7c2d12 0%, #5a1f0f 100%);
}

.complemento-notation h4 {
  color: #f97316;
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
