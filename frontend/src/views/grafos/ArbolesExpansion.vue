<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Árboles de Expansión</h1>

    <!-- Crear grafo -->
    <div v-if="!grafoCreado" class="create-structure">
      <h3>Crear Grafo Ponderado</h3>
      
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
      </div>

      <div class="info-preview" v-if="config.cantidadNodos > 0">
        <p><strong>Nodos:</strong> {{ config.cantidadNodos }} (numerados del 1 al {{ config.cantidadNodos }})</p>
        <p><strong>Tipo:</strong> {{ config.esDirigido ? 'Dirigido' : 'No Dirigido' }}</p>
        <p><strong>Ponderado:</strong> Sí (siempre)</p>
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
            <strong>Ponderado:</strong> Sí
          </div>
        </div>
      </div>

      <!-- Botones de operaciones -->
      <div class="operations" style="display: flex; gap: 1rem; justify-content: center; align-items: center; margin-top: 1rem;">
        <button @click="exportarGrafo" class="btn-secondary">Guardar Grafo</button>
        <label for="import-file" class="btn-secondary" style="cursor: pointer; display: inline-block; padding: 0.65rem 1.5rem; margin: 0;">Abrir Grafo</label>
        <input id="import-file" type="file" accept=".json" @change="importarGrafo" style="display: none;">
      </div>

      <!-- Crear Aristas -->
      <div class="edge-management">
        <h3>Crear Aristas</h3>
        <div class="edge-controls">
          <input 
            type="text" 
            v-model="aristaInput" 
            placeholder="Ej: 12 o 1 2 para conectar nodo 1 y 2"
            maxlength="10"
            @keyup.enter="agregarArista"
          />
          <input
            type="number"
            v-model.number="pesoArista"
            placeholder="Peso (entero positivo)"
            step="1"
            min="1"
          />
          <button @click="agregarArista">Agregar Arista</button>
        </div>
        <p class="help-text">
          {{ config.esDirigido ? 
            'Formato: "12" o "1 2" crea arista 1→2 con el peso indicado' : 
            'Formato: "12" o "1 2" crea arista bidireccional 1↔2 con el peso indicado' 
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

      <!-- Ramas y Cuerdas (solo visible después de calcular árbol) -->
      <div v-if="arbolCalculado" class="tree-sets">
        <div class="notation-content">
          <p><strong>Ramas (T) =</strong> {{ formatearConjuntoRamas() }}</p>
          <p><strong>Cuerdas (C) =</strong> {{ formatearConjuntoCuerdas() }}</p>
        </div>
      </div>

      <!-- Árbol Complemento (T') - solo visible después de calcular árbol -->
      <div v-if="arbolCalculado" class="complemento-section" style="text-align: center;">
        <button @click="generarArbolComplemento" class="outline contrast">
          Generar Árbol Complemento (T')
        </button>
        
        <div v-if="arbolComplemento.mostrado" class="complemento-visualization">
          <h3 style="text-align: center;">Árbol Complemento (T')</h3>
          <div id="complemento-container" ref="complementoContainer"></div>
          <div class="set-notation">
            <div class="notation-content">
              <p><strong>T' =</strong> {{ formatearConjuntoCuerdas() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Algoritmos de Árboles de Expansión -->
      <div class="expansion-algorithms">
        <button @click="calcularArbolExpansionMinimo" class="outline contrast">
          Árbol de Expansión Mínimo
        </button>
        <button @click="calcularArbolExpansionMaximo" class="outline contrast">
          Árbol de Expansión Máximo
        </button>
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

interface AristaConId extends Arista {
  id: string;
}

interface Grafo {
  nodos: Nodo[];
  aristas: Arista[];
}

const config = ref<Config>({
  cantidadNodos: 5,
  esDirigido: false
});

const grafoCreado = ref(false);
const grafo = ref<Grafo>({
  nodos: [],
  aristas: []
});

const aristaInput = ref('');
const pesoArista = ref<number | null>(null);
const mensaje = ref('');
const esError = ref(false);

// Variables para árbol de expansión
const arbolCalculado = ref(false);
const aristasOriginales = ref<AristaConId[]>([]);
const ramasArbol = ref<Arista[]>([]);
const cuerdasArbol = ref<Arista[]>([]);
const matrizCortes = ref<number[][] | null>(null);
const matrizCircuitos = ref<number[][] | null>(null);
const arbolComplemento = ref({
  mostrado: false
});

const graphContainer = ref<HTMLElement | null>(null);
const complementoContainer = ref<HTMLElement | null>(null);
let network: Network | null = null;
let networkComplemento: Network | null = null;
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
  mostrarMensaje('Grafo ponderado creado correctamente', false);

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

  edgesDataSet = new DataSet(
    grafo.value.aristas.map((arista, index) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: `${arista.peso}`,
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

  if (pesoArista.value === null || pesoArista.value === undefined) {
    mostrarMensaje('Por favor ingrese el peso de la arista', true);
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
  grafo.value.aristas.push({
    from: nodo1,
    to: nodo2,
    peso: pesoArista.value
  });

  // Actualizar visualización
  actualizarVisualizacion();

  mostrarMensaje(`Arista ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2} agregada con peso ${pesoArista.value}`, false);
  aristaInput.value = '';
  pesoArista.value = null;
}

function actualizarVisualizacion() {
  if (!edgesDataSet) return;

  edgesDataSet.clear();
  edgesDataSet.add(
    grafo.value.aristas.map((arista, index) => ({
      id: index,
      from: arista.from,
      to: arista.to,
      label: `${arista.peso}`,
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
    return `(${a.from}${simbolo}${a.to}, ${a.peso})`;
  });
  
  return `{ ${aristas.join(', ')} }`;
}

function formatearConjuntoRamas(): string {
  if (ramasArbol.value.length === 0) return '{ }';
  
  const ramas = ramasArbol.value.map(a => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    return `(${a.from}${simbolo}${a.to}, ${a.peso})`;
  });
  
  return `{ ${ramas.join(', ')} }`;
}

function formatearConjuntoCuerdas(): string {
  if (cuerdasArbol.value.length === 0) return '{ }';
  
  const cuerdas = cuerdasArbol.value.map(a => {
    const simbolo = config.value.esDirigido ? '→' : '↔';
    return `(${a.from}${simbolo}${a.to}, ${a.peso})`;
  });
  
  return `{ ${cuerdas.join(', ')} }`;
}

function calcularArbolExpansionMinimo() {
  if (grafo.value.aristas.length === 0) {
    mostrarMensaje('El grafo no tiene aristas', true);
    return;
  }

  // Guardar aristas originales antes de calcular el árbol
  aristasOriginales.value = grafo.value.aristas.map((a) => ({
    ...a,
    id: `${a.from}-${a.to}`
  }));

  // Algoritmo de Kruskal para árbol de expansión mínimo
  // 1. Ordenar aristas por peso (menor a mayor)
  const aristasOrdenadas = [...grafo.value.aristas].sort((a, b) => a.peso - b.peso);
  
  // 2. Crear nuevo grafo con los mismos nodos
  const arbolExpansion: Arista[] = [];
  const nodosConectados = new Map<number, Set<number>>();
  
  // Inicializar cada nodo en su propio conjunto
  grafo.value.nodos.forEach(nodo => {
    nodosConectados.set(nodo.id, new Set([nodo.id]));
  });
  
  // 3. Agregar aristas sin formar ciclos
  for (const arista of aristasOrdenadas) {
    const conjuntoFrom = nodosConectados.get(arista.from)!;
    const conjuntoTo = nodosConectados.get(arista.to)!;
    
    // Verificar si formaría un ciclo (ambos nodos ya están conectados)
    const formaCiclo = Array.from(conjuntoFrom).some(nodo => conjuntoTo.has(nodo));
    
    if (!formaCiclo) {
      // Agregar arista al árbol
      arbolExpansion.push(arista);
      
      // Unir conjuntos
      const nuevoConjunto = new Set([...conjuntoFrom, ...conjuntoTo]);
      nuevoConjunto.forEach(nodo => {
        nodosConectados.set(nodo, nuevoConjunto);
      });
    }
    
    // Si ya tenemos n-1 aristas, hemos completado el árbol
    if (arbolExpansion.length === grafo.value.nodos.length - 1) {
      break;
    }
  }
  
  // Calcular ramas (aristas del árbol) y cuerdas (aristas no incluidas)
  ramasArbol.value = arbolExpansion;
  cuerdasArbol.value = aristasOriginales.value.filter(original => 
    !arbolExpansion.some(rama => 
      rama.from === original.from && rama.to === original.to
    )
  );
  
  // Actualizar visualización
  grafo.value.aristas = arbolExpansion;
  actualizarVisualizacion();
  
  arbolCalculado.value = true;
  const pesoTotal = arbolExpansion.reduce((sum, a) => sum + a.peso, 0);
  mostrarMensaje(`Árbol de expansión mínimo calculado. Peso total: ${pesoTotal}`, false);
}

function calcularArbolExpansionMaximo() {
  if (grafo.value.aristas.length === 0) {
    mostrarMensaje('El grafo no tiene aristas', true);
    return;
  }

  // Guardar aristas originales antes de calcular el árbol
  aristasOriginales.value = grafo.value.aristas.map((a) => ({
    ...a,
    id: `${a.from}-${a.to}`
  }));

  // Algoritmo de Kruskal para árbol de expansión máximo
  // 1. Ordenar aristas por peso (mayor a menor)
  const aristasOrdenadas = [...grafo.value.aristas].sort((a, b) => b.peso - a.peso);
  
  // 2. Crear nuevo grafo con los mismos nodos
  const arbolExpansion: Arista[] = [];
  const nodosConectados = new Map<number, Set<number>>();
  
  // Inicializar cada nodo en su propio conjunto
  grafo.value.nodos.forEach(nodo => {
    nodosConectados.set(nodo.id, new Set([nodo.id]));
  });
  
  // 3. Agregar aristas sin formar ciclos
  for (const arista of aristasOrdenadas) {
    const conjuntoFrom = nodosConectados.get(arista.from)!;
    const conjuntoTo = nodosConectados.get(arista.to)!;
    
    // Verificar si formaría un ciclo (ambos nodos ya están conectados)
    const formaCiclo = Array.from(conjuntoFrom).some(nodo => conjuntoTo.has(nodo));
    
    if (!formaCiclo) {
      // Agregar arista al árbol
      arbolExpansion.push(arista);
      
      // Unir conjuntos
      const nuevoConjunto = new Set([...conjuntoFrom, ...conjuntoTo]);
      nuevoConjunto.forEach(nodo => {
        nodosConectados.set(nodo, nuevoConjunto);
      });
    }
    
    // Si ya tenemos n-1 aristas, hemos completado el árbol
    if (arbolExpansion.length === grafo.value.nodos.length - 1) {
      break;
    }
  }
  
  // Calcular ramas (aristas del árbol) y cuerdas (aristas no incluidas)
  ramasArbol.value = arbolExpansion;
  cuerdasArbol.value = aristasOriginales.value.filter(original => 
    !arbolExpansion.some(rama => 
      rama.from === original.from && rama.to === original.to
    )
  );
  
  // Actualizar visualización
  grafo.value.aristas = arbolExpansion;
  actualizarVisualizacion();
  
  arbolCalculado.value = true;
  const pesoTotal = arbolExpansion.reduce((sum, a) => sum + a.peso, 0);
  mostrarMensaje(`Árbol de expansión máximo calculado. Peso total: ${pesoTotal}`, false);
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
  arbolCalculado.value = false;
  aristasOriginales.value = [];
  ramasArbol.value = [];
  cuerdasArbol.value = [];
  matrizCortes.value = null;
  matrizCircuitos.value = null;
  arbolComplemento.value.mostrado = false;
  
  if (network) {
    network.destroy();
    network = null;
  }
  if (networkComplemento) {
    networkComplemento.destroy();
    networkComplemento = null;
  }
  nodesDataSet = null;
  edgesDataSet = null;
}

function generarArbolComplemento() {
  if (!arbolCalculado.value) {
    mostrarMensaje('Primero debe calcular un árbol de expansión', true);
    return;
  }

  arbolComplemento.value.mostrado = true;
  
  nextTick(() => {
    if (!complementoContainer.value) return;

    // Crear visualización del árbol complemento (solo cuerdas)
    const nodesComplemento = new DataSet(
      grafo.value.nodos.map(nodo => ({
        id: nodo.id,
        label: nodo.label,
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
          size: 16,
          face: 'Arial'
        }
      }))
    );

    const edgesComplemento = new DataSet(
      cuerdasArbol.value.map((arista, index) => ({
        id: index,
        from: arista.from,
        to: arista.to,
        label: `${arista.peso}`,
        arrows: config.value.esDirigido ? 'to' : undefined,
        color: {
          color: '#94a3b8',
          highlight: '#f59e0b'
        },
        font: {
          color: '#e5e7eb',
          size: 14,
          background: '#1e3a5f'
        }
      }))
    );

    const data = {
      nodes: nodesComplemento,
      edges: edgesComplemento
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
          iterations: 200
        }
      },
      interaction: {
        hover: true
      }
    };

    networkComplemento = new Network(complementoContainer.value, data, options);
    mostrarMensaje('Árbol complemento (T\') generado', false);
  });
}

function exportarGrafo() {
  if (!grafoCreado.value) {
    mostrarMensaje("Primero debes crear un grafo para exportar.", true);
    return;
  }

  const exportData = {
    type: 'arbol-expansion',
    version: '1.0',
    timestamp: new Date().toISOString(),
    config: {
      cantidadNodos: config.value.cantidadNodos,
      esDirigido: config.value.esDirigido
    },
    grafo: {
      nodos: grafo.value.nodos,
      aristas: grafo.value.aristas
    }
  };

  const tipoStr = config.value.esDirigido ? 'dirigido' : 'no-dirigido';
  const fecha = new Date().toISOString().split('T')[0];
  const filename = `arbol_expansion_${tipoStr}_${fecha}.json`;
  
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
      if (importData.type !== 'arbol-expansion') {
        mostrarMensaje("Este archivo no contiene un grafo de árbol de expansión válido.", true);
        return;
      }

      if (!importData.config || !importData.grafo) {
        mostrarMensaje("El archivo no contiene la configuración completa.", true);
        return;
      }

      // Validar que tenga todos los campos necesarios
      if (typeof importData.config.cantidadNodos !== 'number' || 
          typeof importData.config.esDirigido !== 'boolean') {
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

      // Importar grafo
      grafo.value.nodos = importData.grafo.nodos;
      grafo.value.aristas = importData.grafo.aristas;
      grafoCreado.value = true;

      // Reinicializar visualización
      nextTick(() => {
        inicializarVisualizacion();
      });

      // Reset estados de algoritmos
      arbolCalculado.value = false;
      arbolComplemento.value.mostrado = false;
      
      const tipoStr = config.value.esDirigido ? 'Dirigido' : 'No Dirigido';
      mostrarMensaje(`Grafo importado exitosamente. Tipo: ${tipoStr}, Nodos: ${config.value.cantidadNodos}, Aristas: ${grafo.value.aristas.length}`, false);
      
    } catch (error) {
      mostrarMensaje("Error al leer el archivo. Asegúrate de que sea un JSON válido.", true);
    }
  };
  
  reader.readAsText(file);
  target.value = '';
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

.import-section {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
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

.expansion-algorithms {
  max-width: 900px;
  margin: 2rem auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.expansion-algorithms button {
  flex: 1;
  max-width: 300px;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.operation-card {
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--code-background-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.operation-card h4 {
  margin: 0;
  color: var(--primary);
  text-align: center;
}

.operation-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted-color);
  text-align: center;
  line-height: 1.5;
}

.operation-card input {
  margin: 0;
}

.operation-card button {
  margin: 0;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
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

#graph-container {
  width: 100%;
  height: 600px;
  border: 2px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: #1e3a5f;
}

.complemento-visualization {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.complemento-visualization h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

#complemento-container {
  width: 100%;
  height: 600px;
  border: 2px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: #1e3a5f;
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

.tree-sets {
  max-width: 800px;
  margin: 1rem auto;
  padding: 0.75rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
  background: var(--code-background-color);
}

.matrix-buttons {
  max-width: 900px;
  margin: 2rem auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.matrix-buttons button {
  flex: 1;
  max-width: 350px;
  min-width: 250px;
}

.matrix-result {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.matrix-result h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--primary);
}

.matrix-container {
  overflow-x: auto;
}

.fundamental-matrix {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.fundamental-matrix th,
.fundamental-matrix td {
  padding: 0.5rem;
  text-align: center;
  border: 1px solid var(--muted-border-color);
}

.fundamental-matrix thead th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.fundamental-matrix tbody th {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.fundamental-matrix td {
  background: var(--card-background-color);
  color: var(--color);
}
</style>
