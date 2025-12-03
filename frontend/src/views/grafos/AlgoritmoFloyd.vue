<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Algoritmo de Floyd-Warshall</h1>

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
          <label>Ponderado:</label>
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
      
      <div class="import-section">
        <p style="margin: 1rem 0;">O importar grafo existente:</p>
        <label for="import-file-initial" class="btn-primary" style="cursor: pointer; display: inline-block; padding: 0.65rem 1.5rem;">Abrir Grafo</label>
        <input id="import-file-initial" type="file" accept=".json" @change="importarGrafo" style="display: none;">
      </div>
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

      <!-- Botones de operaciones -->
      <div class="operations" style="display: flex; gap: 1rem; justify-content: center; align-items: center; margin-top: 1rem;">
        <button @click="exportarGrafo" class="btn-secondary">Guardar Grafo</button>
        <label for="import-file" class="btn-secondary" style="cursor: pointer; display: inline-block; padding: 0.65rem 1.5rem; margin: 0;">Abrir Grafo</label>
        <input id="import-file" type="file" accept=".json" @change="importarGrafo" style="display: none;">
      </div>

      <!-- Gestión de Aristas -->
      <div class="edge-management">
        <h3>Gestión de Aristas</h3>
        <div class="edge-controls">
          <input 
            type="text" 
            v-model="aristaInput" 
            placeholder="Ej: 12 para conectar"
            maxlength="10"
            @keyup.enter="agregarArista"
          />
          <input 
            v-if="config.esPonderado"
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
          {{ config.esDirigido ? 
            `Formato: "12" o "1 2" para arista 1→2${config.esPonderado ? ' con peso' : ''}` : 
            `Formato: "12" o "1 2" para arista bidireccional 1↔2${config.esPonderado ? ' con peso' : ''}` 
          }}
        </p>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

      <!-- Visualización del Grafo -->
      <div class="graph-visualization">
        <h3>Visualización del Grafo</h3>
        <div id="graph-container" ref="graphContainer"></div>
      </div>

      <!-- Notación de Teoría de Conjuntos -->
      <div class="set-notation">
        <div class="notation-content">
          <p><strong>V =</strong> {{ formatearConjuntoNodos() }}</p>
          <p><strong>A =</strong> {{ formatearConjuntoAristas() }}</p>
        </div>
      </div>

      <!-- Algoritmo de Floyd -->
      <div class="floyd-algorithm">
        <button @click="calcularDistancias" class="outline contrast">
          Calcular Distancias
        </button>
      </div>

      <!-- Resultados del Algoritmo de Floyd -->
      <div v-if="resultadosFloyd" class="floyd-results">
        <h3>Resultados del Algoritmo de Floyd-Warshall</h3>
        
        <!-- Matriz Final del Algoritmo -->
        <div class="result-section">
          <h4>Matriz Final del Algoritmo</h4>
          <div class="matrix-container">
            <table class="distance-matrix">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="nodo in grafo.nodos" :key="'header-' + nodo.id">{{ nodo.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in grafo.nodos" :key="'row-' + i.id">
                  <th>{{ i.label }}</th>
                  <td v-for="j in grafo.nodos" :key="'cell-' + i.id + '-' + j.id">
                    {{ formatearDistancia(resultadosFloyd.matrizDistancias[i.id - 1][j.id - 1]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Excentricidades -->
        <div class="result-section">
          <h4>Excentricidades por Vértice</h4>
          <div class="excentricidades-grid">
            <div v-for="(exc, idx) in resultadosFloyd.excentricidades" :key="'exc-' + idx" class="excentricidad-item">
              <strong>Vértice {{ idx + 1 }}:</strong> {{ formatearDistancia(exc) }}
            </div>
          </div>
        </div>

        <!-- Distancias de Vértices -->
        <div class="result-section">
          <h4>Distancia de Vértice</h4>
          <div class="excentricidades-grid">
            <div v-for="(dist, idx) in resultadosFloyd.distanciasVertices" :key="'dist-' + idx" class="excentricidad-item">
              <strong>Vértice {{ idx + 1 }}:</strong> {{ formatearDistancia(dist) }}
            </div>
          </div>
        </div>

        <!-- Mediana -->
        <div class="result-section">
          <h4>Mediana (Excentricidad Mínima)</h4>
          <p class="result-value">
            <strong>{{ formatearDistancia(resultadosFloyd.mediana) }}</strong>
            <span class="result-label">
              {{ resultadosFloyd.centros.length === 1 ? 'Centro' : 'Bicentro' }}: 
              Vértice{{ resultadosFloyd.centros.length > 1 ? 's' : '' }} {{ resultadosFloyd.centros.join(', ') }}
            </span>
          </p>
          <div class="mediana-visualization">
            <div id="mediana-container" ref="medianaContainer"></div>
          </div>
        </div>

        <!-- Diámetro -->
        <div class="result-section">
          <h4>Diámetro (Excentricidad Máxima)</h4>
          <p class="result-value">
            <strong>{{ formatearDistancia(resultadosFloyd.diametro) }}</strong>
          </p>
        </div>
      </div>

      <!-- Botón de reseteo -->
      <div class="reset-section">
        <button @click="resetearGrafo" class="btn-danger">Resetear Grafo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import { downloadJsonFile } from '../../utils/importExportUtils';

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
  peso: number;
}

interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

interface ResultadosFloyd {
  matrizDistancias: number[][];
  excentricidades: number[];
  distanciasVertices: number[];
  mediana: number;
  diametro: number;
  centros: number[];
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
const pesoArista = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);
const graphContainer = ref<HTMLElement | null>(null);
const medianaContainer = ref<HTMLElement | null>(null);
const resultadosFloyd = ref<ResultadosFloyd | null>(null);

let network: Network | null = null;
let networkMediana: Network | null = null;

function mostrarMensaje(msg: string, error: boolean = false) {
  mensaje.value = msg;
  esError.value = error;
  setTimeout(() => {
    mensaje.value = '';
    esError.value = false;
  }, 3000);
}

function crearGrafo() {
  if (config.value.cantidadNodos < 1) {
    mostrarMensaje('Debe haber al menos 1 nodo', true);
    return;
  }

  // Crear nodos
  grafo.value.nodos = [];
  for (let i = 1; i <= config.value.cantidadNodos; i++) {
    grafo.value.nodos.push({
      id: i,
      label: i.toString()
    });
  }

  grafo.value.aristas = [];
  grafoCreado.value = true;

  nextTick(() => {
    inicializarVisualizacion();
  });
}

function inicializarVisualizacion() {
  if (!graphContainer.value) return;

  const nodes = new DataSet(
    grafo.value.nodos.map(n => ({
      id: n.id,
      label: n.label,
      color: {
        background: '#c2410c',
        border: '#ea580c',
        highlight: {
          background: '#ea580c',
          border: '#f97316'
        }
      },
      font: {
        color: '#ffffff',
        size: 16
      }
    }))
  );

  const edges = new DataSet(
    grafo.value.aristas.map((a, index) => ({
      id: index,
      from: a.from,
      to: a.to,
      label: config.value.esPonderado ? a.peso.toString() : '',
      arrows: config.value.esDirigido ? 'to' : undefined,
      color: {
        color: '#6b7280',
        highlight: '#3b82f6'
      }
    }))
  );

  const data = {
    nodes: nodes,
    edges: edges
  };

  const options = {
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

  network = new Network(graphContainer.value, data, options);
}

function agregarArista() {
  if (!aristaInput.value) {
    mostrarMensaje('Por favor ingrese los nodos para conectar', true);
    return;
  }

  if (config.value.esPonderado && (pesoArista.value === null || pesoArista.value === undefined)) {
    mostrarMensaje('Por favor ingrese el peso de la arista', true);
    return;
  }

  if (config.value.esPonderado && pesoArista.value !== null && (!Number.isInteger(pesoArista.value) || pesoArista.value < 1)) {
    mostrarMensaje('El peso debe ser un número entero positivo (mayor o igual a 1)', true);
    return;
  }

  const input = aristaInput.value.trim();
  
  // Remover espacios para permitir formatos como "1 2" o "12"
  const inputLimpio = input.replace(/\s+/g, '');
  
  // Validar formato (debe ser dos dígitos)
  if (!/^\d{1,}\d{1,}$/.test(inputLimpio) || inputLimpio.length < 2) {
    mostrarMensaje('Formato inválido. Use dos números (ej: 12 o 1 2)', true);
    return;
  }

  // Extraer nodos
  const nodo1 = parseInt(inputLimpio[0]);
  const nodo2 = parseInt(inputLimpio.substring(1));

  // Validar que los nodos existan
  if (!grafo.value.nodos.find(n => n.id === nodo1) || 
      !grafo.value.nodos.find(n => n.id === nodo2)) {
    mostrarMensaje(`Los nodos deben estar entre 1 y ${grafo.value.nodos.length}`, true);
    return;
  }

  if (nodo1 === nodo2) {
    mostrarMensaje('No se pueden crear bucles (aristas de un nodo a sí mismo)', true);
    return;
  }

  // Verificar si la arista ya existe
  const aristaExiste = grafo.value.aristas.some(a => 
    (a.from === nodo1 && a.to === nodo2) || 
    (!config.value.esDirigido && a.from === nodo2 && a.to === nodo1)
  );

  if (aristaExiste) {
    mostrarMensaje('Esta arista ya existe', true);
    return;
  }

  // Agregar arista
  const peso = config.value.esPonderado ? (pesoArista.value ?? 1) : 1;
  grafo.value.aristas.push({
    from: nodo1,
    to: nodo2,
    peso: peso
  });

  actualizarVisualizacion();
  
  // Limpiar inputs
  aristaInput.value = '';
  pesoArista.value = null;
  
  mostrarMensaje('Arista agregada correctamente', false);
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

  // Buscar la arista (dirigida o bidireccional)
  const aristaIndex = grafo.value.aristas.findIndex(
    (arista: Arista) =>
      (arista.from === nodo1 && arista.to === nodo2) ||
      (!config.value.esDirigido && arista.from === nodo2 && arista.to === nodo1)
  );

  if (aristaIndex === -1) {
    mostrarMensaje(`Arista ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2} no encontrada`, true);
    return;
  }

  // Eliminar arista
  grafo.value.aristas.splice(aristaIndex, 1);

  // Resetear resultados
  resultadosFloyd.value = null;

  // Actualizar visualización
  actualizarVisualizacion();

  mostrarMensaje(`Arista ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2} eliminada`, false);
  aristaBorrar.value = '';
}

function actualizarVisualizacion() {
  if (!network) return;

  const nodes = new DataSet(
    grafo.value.nodos.map(n => ({
      id: n.id,
      label: n.label,
      color: {
        background: '#c2410c',
        border: '#ea580c',
        highlight: {
          background: '#ea580c',
          border: '#f97316'
        }
      },
      font: {
        color: '#ffffff',
        size: 16
      }
    }))
  );

  const edges = new DataSet(
    grafo.value.aristas.map((a, index) => ({
      id: index,
      from: a.from,
      to: a.to,
      label: config.value.esPonderado ? a.peso.toString() : '',
      arrows: config.value.esDirigido ? 'to' : undefined,
      color: {
        color: '#6b7280',
        highlight: '#3b82f6'
      }
    }))
  );

  network.setData({
    nodes: nodes,
    edges: edges
  });
}

function contarAristas(): number {
  return grafo.value.aristas.length;
}

function formatearConjuntoNodos(): string {
  const nodos = grafo.value.nodos.map(n => n.label).join(', ');
  return `{ ${nodos} }`;
}

function formatearConjuntoAristas(): string {
  if (grafo.value.aristas.length === 0) return '{ }';
  
  const aristas = grafo.value.aristas.map(a => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    if (config.value.esPonderado) {
      return `(${a.from}${simbolo}${a.to}, ${a.peso})`;
    } else {
      return `(${a.from}${simbolo}${a.to})`;
    }
  });
  
  return `{ ${aristas.join(', ')} }`;
}

function calcularDistancias() {
  if (grafo.value.aristas.length === 0) {
    mostrarMensaje('El grafo no tiene aristas', true);
    return;
  }

  const n = grafo.value.nodos.length;
  const INF = Infinity;
  
  // 1. Inicializar matriz de distancias
  const matriz: number[][] = Array(n).fill(0).map(() => Array(n).fill(INF));
  
  // Diagonal en ceros
  for (let i = 0; i < n; i++) {
    matriz[i][i] = 0;
  }
  
  // Llenar con aristas existentes
  for (const arista of grafo.value.aristas) {
    const i = arista.from - 1;
    const j = arista.to - 1;
    matriz[i][j] = arista.peso;
    
    // Si es no dirigido, agregar arista inversa
    if (!config.value.esDirigido) {
      matriz[j][i] = arista.peso;
    }
  }
  
  // 2. Algoritmo de Floyd-Warshall
  // Para cada vértice k como intermediario
  for (let k = 0; k < n; k++) {
    // Para cada par de vértices (i, j)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // Si el camino i -> k -> j es más corto que i -> j
        if (matriz[i][k] + matriz[k][j] < matriz[i][j]) {
          matriz[i][j] = matriz[i][k] + matriz[k][j];
        }
      }
    }
  }
  
  // 3. Calcular excentricidades
  const excentricidades: number[] = [];
  for (let i = 0; i < n; i++) {
    let maxDistancia = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j && matriz[i][j] !== INF && matriz[i][j] > maxDistancia) {
        maxDistancia = matriz[i][j];
      }
    }
    excentricidades.push(maxDistancia === 0 ? INF : maxDistancia);
  }
  
  // 3.5. Calcular distancias de vértices (suma de caminos mínimos)
  const distanciasVertices: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumaDistancias = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j && matriz[i][j] !== INF) {
        sumaDistancias += matriz[i][j];
      }
    }
    distanciasVertices.push(sumaDistancias);
  }
  
  // 4. Calcular mediana (excentricidad mínima)
  const mediana = Math.min(...excentricidades.filter(e => e !== INF));
  
  // 5. Encontrar centros (vértices con excentricidad mínima)
  const centros: number[] = [];
  for (let i = 0; i < n; i++) {
    if (excentricidades[i] === mediana) {
      centros.push(i + 1); // +1 porque los nodos empiezan en 1
    }
  }
  
  // 6. Calcular diámetro (excentricidad máxima)
  const diametro = Math.max(...excentricidades.filter(e => e !== INF));
  
  // Guardar resultados
  resultadosFloyd.value = {
    matrizDistancias: matriz,
    excentricidades: excentricidades,
    distanciasVertices: distanciasVertices,
    mediana: mediana,
    diametro: diametro,
    centros: centros
  };
  
  mostrarMensaje('Distancias calculadas correctamente', false);
  
  // Generar visualización de la mediana
  nextTick(() => {
    generarVisualizacionMediana();
  });
}

function formatearDistancia(distancia: number): string {
  return distancia === Infinity ? '∞' : distancia.toString();
}

function generarVisualizacionMediana() {
  if (!medianaContainer.value || !resultadosFloyd.value) return;

  const centros = resultadosFloyd.value.centros;
  
  // Crear nodos para los centros
  const nodesMediana = new DataSet(
    centros.map(centroId => ({
      id: centroId,
      label: `${centroId}`,
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
        size: 14
      }
    }))
  );

  // Si es bicentro, crear arista entre los dos nodos
  const edgesMediana = new DataSet<any>();
  if (centros.length === 2) {
    edgesMediana.add({
      id: 1,
      from: centros[0],
      to: centros[1],
      color: {
        color: '#94a3b8',
        highlight: '#f59e0b'
      },
      width: 2
    });
  }

  const data = {
    nodes: nodesMediana,
    edges: edgesMediana
  };

  const options = {
    nodes: {
      shape: 'circle',
      size: 20,
      borderWidth: 2
    },
    edges: {
      width: 2,
      smooth: false
    },
    physics: {
      enabled: false
    },
    interaction: {
      dragNodes: false,
      dragView: false,
      zoomView: false
    },
    layout: {
      hierarchical: false
    }
  };

  if (networkMediana) {
    networkMediana.destroy();
  }
  
  networkMediana = new Network(medianaContainer.value, data, options);
  
  // Posicionar nodos manualmente
  if (centros.length === 1) {
    networkMediana.moveNode(centros[0], 0, 0);
  } else if (centros.length === 2) {
    networkMediana.moveNode(centros[0], -50, 0);
    networkMediana.moveNode(centros[1], 50, 0);
  }
}

function resetearGrafo() {
  grafoCreado.value = false;
  grafo.value = {
    nodos: [],
    aristas: []
  };
  aristaInput.value = '';
  pesoArista.value = null;
  mensaje.value = '';
  resultadosFloyd.value = null;
  network = null;
  
  if (networkMediana) {
    networkMediana.destroy();
    networkMediana = null;
  }
}

function exportarGrafo() {
  if (!grafoCreado.value) {
    mostrarMensaje("Primero debes crear un grafo para exportar.", true);
    return;
  }

  const exportData = {
    type: 'algoritmo-floyd',
    version: '1.0',
    timestamp: new Date().toISOString(),
    config: {
      cantidadNodos: config.value.cantidadNodos,
      esDirigido: config.value.esDirigido,
      esPonderado: config.value.esPonderado
    },
    grafo: {
      nodos: grafo.value.nodos,
      aristas: grafo.value.aristas
    }
  };

  const tipoStr = config.value.esDirigido ? 'dirigido' : 'no-dirigido';
  const ponderadoStr = config.value.esPonderado ? 'ponderado' : 'no-ponderado';
  const fecha = new Date().toISOString().split('T')[0];
  const filename = `floyd_${tipoStr}_${ponderadoStr}_${fecha}.json`;
  
  downloadJsonFile(exportData, filename);
  mostrarMensaje("Grafo exportado exitosamente.", false);
}

function importarGrafo(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target?.result as string);
      
      // Validaciones básicas
      if (importData.type !== 'algoritmo-floyd') {
        mostrarMensaje("Este archivo no contiene un grafo para el algoritmo de Floyd válido.", true);
        return;
      }

      if (!importData.config || !importData.grafo) {
        mostrarMensaje("El archivo no contiene la configuración completa.", true);
        return;
      }

      // Validar que tenga todos los campos necesarios
      if (typeof importData.config.cantidadNodos !== 'number' || 
          typeof importData.config.esDirigido !== 'boolean' ||
          typeof importData.config.esPonderado !== 'boolean') {
        mostrarMensaje("Configuración inválida en el archivo.", true);
        return;
      }

      if (!Array.isArray(importData.grafo.nodos) || !Array.isArray(importData.grafo.aristas)) {
        mostrarMensaje("Estructura de grafo inválida en el archivo.", true);
        return;
      }

      // Validar números positivos
      if (importData.config.cantidadNodos <= 0) {
        mostrarMensaje("La cantidad de nodos debe ser un número positivo.", true);
        return;
      }

      // Importar configuración
      config.value.cantidadNodos = importData.config.cantidadNodos;
      config.value.esDirigido = importData.config.esDirigido;
      config.value.esPonderado = importData.config.esPonderado;

      // Importar grafo
      grafo.value.nodos = importData.grafo.nodos;
      grafo.value.aristas = importData.grafo.aristas;
      grafoCreado.value = true;

      // Reinicializar visualización
      nextTick(() => {
        inicializarVisualizacion();
      });

      // Reset estados de algoritmos
      resultadosFloyd.value = null;
      
      const tipoStr = config.value.esDirigido ? 'Dirigido' : 'No Dirigido';
      const ponderadoStr = config.value.esPonderado ? 'Ponderado' : 'No Ponderado';
      mostrarMensaje(`Grafo importado exitosamente. Tipo: ${tipoStr}, ${ponderadoStr}, Nodos: ${config.value.cantidadNodos}, Aristas: ${grafo.value.aristas.length}`, false);
      
    } catch (error) {
      mostrarMensaje("Error al leer el archivo. Asegúrate de que sea un JSON válido.", true);
    }
  };
  
  reader.readAsText(file);
  target.value = '';
}
</script>

<style scoped>
.btn-back {
  margin-bottom: 1rem;
}

.create-structure {
  max-width: 600px;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.config-row > div {
  display: flex;
  flex-direction: column;
}

.config-row label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.info-preview {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--code-background-color);
  border-radius: 0.25rem;
  border-left: 3px solid var(--primary);
}

.info-preview p {
  margin: 0.5rem 0;
}

.import-section {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.structure-info {
  max-width: 800px;
  margin: 2rem auto;
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
  max-width: 800px;
  margin: 1rem auto;
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

.floyd-algorithm {
  max-width: 900px;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
}

.floyd-algorithm button {
  flex: 0 1 300px;
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
  margin: 0;
}

.edge-controls button {
  flex-shrink: 0;
  margin: 0;
}

.help-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: var(--muted-color);
  font-style: italic;
}

.message {
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
  border-radius: 0.25rem;
  text-align: center;
  background: var(--primary);
  color: white;
}

.message.error {
  background: #ef4444;
}

.graph-visualization {
  max-width: 1000px;
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
  height: 500px;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
  background: #1e3a5f;
}

.reset-section {
  max-width: 800px;
  margin: 2rem auto;
  text-align: center;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

.floyd-results {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.floyd-results h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.result-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.375rem;
  background: var(--code-background-color);
}

.result-section:last-child {
  margin-bottom: 0;
}

.mediana-visualization {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

#mediana-container {
  width: 200px;
  height: 120px;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
}

.result-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--primary);
}

.matrix-container {
  overflow-x: auto;
}

.distance-matrix {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.distance-matrix th,
.distance-matrix td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--muted-border-color);
}

.distance-matrix thead th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.distance-matrix tbody th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.distance-matrix td {
  background: var(--card-background-color);
  color: var(--color);
}

.excentricidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.excentricidad-item {
  padding: 0.5rem;
  background: var(--code-background-color);
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color);
}

.result-value {
  text-align: center;
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.result-value strong {
  display: block;
  font-size: 1.5rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.result-label {
  display: block;
  font-size: 0.9rem;
  color: var(--muted-color);
  margin-top: 0.5rem;
}
</style>
