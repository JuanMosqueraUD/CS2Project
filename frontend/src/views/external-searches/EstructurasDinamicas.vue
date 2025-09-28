<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Estructuras Dinámicas Externas</h1>
  
  <div class="create-structure" v-if="!estructuraCreada">
    <h3>Crear estructura</h3>
    <div>
      <details class="dropdown">
        <summary>Tipo de estructura: <strong>{{ tipoEstructura ?? 'Selecciona' }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="tipoEstructura = 'btree'">Árbol B</a></li>
          <li><a href="#" @click.prevent="tipoEstructura = 'btree-plus'">Árbol B+</a></li>
          <li><a href="#" @click.prevent="tipoEstructura = 'hash-extensible'">Hash Extensible</a></li>
          <li><a href="#" @click.prevent="tipoEstructura = 'isam'">ISAM</a></li>
        </ul>
      </details>
      <details class="dropdown">
        <summary>Orden del árbol: <strong>{{ ordenArbol ?? 'Selecciona' }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="ordenArbol = 3">3</a></li>
          <li><a href="#" @click.prevent="ordenArbol = 5">5</a></li>
          <li><a href="#" @click.prevent="ordenArbol = 7">7</a></li>
        </ul>
      </details>
      <input 
        v-model.number="capacidadBloque" 
        type="number" 
        placeholder="Capacidad de bloque"
        min="2" 
        max="20"
      />
      <span class="info-text">Estructura optimizada para almacenamiento externo</span>
      <button @click="crearEstructura" :disabled="!tipoEstructura || !ordenArbol || !capacidadBloque">
        Crear estructura
      </button>
    </div>
  </div>

  <div v-if="estructuraCreada">
    <div class="info-estructura">
      <p>
        <strong>{{ nombreEstructura }} creada:</strong>
        <br />• Tipo: {{ tipoEstructura.toUpperCase() }}
        <br />• Orden: {{ ordenArbol }}
        <br />• Capacidad por bloque: {{ capacidadBloque }}
        <br />• Elementos insertados: {{ elementosInsertados }}
        <br />• Altura del árbol: {{ alturaArbol }}
        <br />• Bloques utilizados: {{ bloquesUtilizados }}
      </p>
    </div>
    
    <div class="search-controls">
      <input 
        v-model.number="valorOperacion" 
        type="number"
        placeholder="Valor a insertar/buscar" 
        @input="limpiarResultado"
      />
      <button @click="insertarElemento" class="outline contrast" :disabled="!valorOperacion">
        ➕ Insertar
      </button>
      <button @click="buscarElemento" class="outline" :disabled="!valorOperacion">
        🔍 Buscar
      </button>
      <button @click="eliminarElemento" class="outline secondary" :disabled="!valorOperacion">
        ❌ Eliminar
      </button>
      <button @click="reiniciarEstructura" class="outline">
        🔄 Reiniciar
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="resultadoOperacion" class="resultado-container">
      <div class="resultado-info">
        <h4>
          {{ resultadoOperacion.exito ? '✅ Operación exitosa' : '❌ Operación fallida' }}
        </h4>
        <div class="detalle-operacion">
          <p><strong>Operación:</strong> {{ resultadoOperacion.tipo }}</p>
          <p><strong>Valor:</strong> {{ resultadoOperacion.valor }}</p>
          <p><strong>Ruta en el árbol:</strong> {{ resultadoOperacion.ruta.join(' → ') }}</p>
          <p><strong>Nivel encontrado:</strong> {{ resultadoOperacion.nivel }}</p>
          <p><strong>Accesos a disco:</strong> {{ resultadoOperacion.accesosDisco }}</p>
          <p><strong>Tiempo:</strong> {{ resultadoOperacion.tiempo }}ms</p>
        </div>
        
        <div v-if="resultadoOperacion.divisiones > 0" class="divisiones-info">
          <p><strong>🌳 Reestructuración del árbol:</strong></p>
          <p>Divisiones de nodo: {{ resultadoOperacion.divisiones }}</p>
          <p>Nuevos bloques creados: {{ resultadoOperacion.nuevosBloques }}</p>
        </div>
      </div>
    </div>

    <!-- Visualización del árbol -->
    <div class="arbol-container">
      <h5>Visualización de la estructura ({{ nombreEstructura }}):</h5>
      
      <div class="metricas-rapidas">
        <span class="metrica-badge">
          📊 Factor de ocupación: {{ factorOcupacion.toFixed(1) }}%
        </span>
        <span class="metrica-badge">
          🏗️ Eficiencia de espacio: {{ eficienciaEspacio.toFixed(1) }}%
        </span>
        <span class="metrica-badge">
          ⚡ Tiempo medio de búsqueda: O(log{{ ordenArbol }} n)
        </span>
      </div>

      <!-- Representación simplificada del árbol -->
      <div class="niveles-arbol">
        <div 
          v-for="(nivel, nivelIndex) in nivelesArbol" 
          :key="nivelIndex"
          class="nivel-arbol"
        >
          <div class="nivel-header">Nivel {{ nivelIndex }}</div>
          <div class="nodos-nivel">
            <div 
              v-for="(nodo, nodoIndex) in nivel" 
              :key="nodoIndex"
              class="nodo-arbol"
              :class="{ 
                'nodo-destacado': nodo.destacado,
                'nodo-lleno': nodo.ocupacion > 0.8,
                'nodo-medio': nodo.ocupacion > 0.5 && nodo.ocupacion <= 0.8,
                'nodo-vacio': nodo.ocupacion <= 0.5
              }"
            >
              <div class="nodo-header">
                Bloque {{ nodo.id }}
              </div>
              <div class="nodo-contenido">
                <div class="elementos-nodo">
                  <span 
                    v-for="(elemento, elemIndex) in nodo.elementos.slice(0, 5)" 
                    :key="elemIndex"
                    class="elemento-nodo"
                  >
                    {{ elemento }}
                  </span>
                  <span v-if="nodo.elementos.length > 5" class="mas-elementos">
                    +{{ nodo.elementos.length - 5 }}
                  </span>
                </div>
                <div class="ocupacion-barra">
                  <div 
                    class="ocupacion-nivel" 
                    :style="{ width: (nodo.ocupacion * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas detalladas -->
      <div class="estadisticas-detalladas">
        <div class="stat-item">
          <strong>Comparaciones promedio:</strong>
          {{ promedioComparaciones.toFixed(1) }}
        </div>
        <div class="stat-item">
          <strong>Profundidad máxima:</strong>
          {{ alturaArbol }}
        </div>
        <div class="stat-item">
          <strong>Bloques internos:</strong>
          {{ bloquesInternos }}
        </div>
        <div class="stat-item">
          <strong>Bloques hoja:</strong>
          {{ bloquesHoja }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface NodoArbol {
  id: number;
  elementos: number[];
  ocupacion: number;
  destacado: boolean;
  esHoja: boolean;
}

const tipoEstructura = ref<string | null>(null);
const ordenArbol = ref<number | null>(null);
const capacidadBloque = ref<number | null>(null);
const estructuraCreada = ref(false);
const valorOperacion = ref<number | null>(null);
const elementosInsertados = ref(0);
const bloquesUtilizados = ref(1);
const alturaArbol = ref(1);
const resultadoOperacion = ref<any>(null);
const nivelesArbol = ref<NodoArbol[][]>([]);

const nombreEstructura = computed(() => {
  const nombres = {
    'btree': 'Árbol B',
    'btree-plus': 'Árbol B+',
    'hash-extensible': 'Hash Extensible',
    'isam': 'ISAM (Indexed Sequential Access Method)'
  };
  return nombres[tipoEstructura.value as keyof typeof nombres] || 'Estructura Desconocida';
});

const factorOcupacion = computed(() => {
  if (!capacidadBloque.value || bloquesUtilizados.value === 0) return 0;
  return (elementosInsertados.value / (bloquesUtilizados.value * capacidadBloque.value)) * 100;
});

const eficienciaEspacio = computed(() => {
  // Fórmula simplificada para eficiencia de espacio
  return Math.max(50, 100 - (bloquesUtilizados.value * 10));
});

const promedioComparaciones = computed(() => {
  // Aproximación basada en la altura del árbol y el orden
  if (!ordenArbol.value || alturaArbol.value === 0) return 0;
  return Math.log(elementosInsertados.value || 1) / Math.log(ordenArbol.value) * 0.7;
});

const bloquesInternos = computed(() => {
  return Math.max(0, bloquesUtilizados.value - Math.ceil(elementosInsertados.value / (capacidadBloque.value || 1)));
});

const bloquesHoja = computed(() => {
  return bloquesUtilizados.value - bloquesInternos.value;
});

function crearEstructura() {
  if (!tipoEstructura.value || !ordenArbol.value || !capacidadBloque.value) return;
  
  // Inicializar estructura básica
  elementosInsertados.value = 0;
  bloquesUtilizados.value = 1;
  alturaArbol.value = 1;
  
  // Crear estructura inicial con algunos elementos de ejemplo
  nivelesArbol.value = [
    [
      {
        id: 1,
        elementos: [],
        ocupacion: 0,
        destacado: false,
        esHoja: true
      }
    ]
  ];
  
  // Insertar algunos elementos de ejemplo
  const elementosEjemplo = [10, 20, 30, 5, 15, 25, 35, 2, 7, 12];
  for (const elemento of elementosEjemplo.slice(0, Math.min(5, capacidadBloque.value))) {
    insertarElementoInterno(elemento, false);
  }
  
  estructuraCreada.value = true;
  resultadoOperacion.value = null;
}

async function insertarElemento() {
  if (!valorOperacion.value) return;
  await insertarElementoInterno(valorOperacion.value, true);
  valorOperacion.value = null;
}

async function insertarElementoInterno(valor: number, mostrarResultado: boolean) {
  const inicio = performance.now();
  
  // Simular búsqueda del lugar de inserción
  const ruta: string[] = [];
  let nivel = 0;
  let accesosDisco = 0;
  let divisiones = 0;
  let nuevosBloques = 0;
  
  // Simular navegación por el árbol
  for (let i = 0; i <= alturaArbol.value; i++) {
    ruta.push(`Nivel ${i}`);
    accesosDisco++;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  
  // Verificar si ya existe
  const yaExiste = existeElemento(valor);
  let exito = false;
  
  if (!yaExiste) {
    // Insertar en la estructura
    const nodoHoja = nivelesArbol.value[nivelesArbol.value.length - 1][0];
    nodoHoja.elementos.push(valor);
    nodoHoja.elementos.sort((a, b) => a - b);
    
    // Verificar si necesita división
    if (nodoHoja.elementos.length > capacidadBloque.value!) {
      divisiones = 1;
      nuevosBloques = 1;
      // Simular división del nodo
      const mitad = Math.floor(nodoHoja.elementos.length / 2);
      const nuevosElementos = nodoHoja.elementos.splice(mitad);
      
      // Crear nuevo nodo
      nivelesArbol.value[nivelesArbol.value.length - 1].push({
        id: bloquesUtilizados.value + 1,
        elementos: nuevosElementos,
        ocupacion: nuevosElementos.length / capacidadBloque.value!,
        destacado: false,
        esHoja: true
      });
      
      bloquesUtilizados.value++;
      
      // Verificar si necesita nuevo nivel
      if (nivelesArbol.value[nivelesArbol.value.length - 1].length > ordenArbol.value!) {
        alturaArbol.value++;
        nivelesArbol.value.unshift([{
          id: bloquesUtilizados.value + 1,
          elementos: [mitad],
          ocupacion: 0.5,
          destacado: false,
          esHoja: false
        }]);
        bloquesUtilizados.value++;
        nuevosBloques++;
      }
    }
    
    // Actualizar ocupación
    nodoHoja.ocupacion = nodoHoja.elementos.length / capacidadBloque.value!;
    elementosInsertados.value++;
    exito = true;
    
    // Destacar nodo afectado
    nodoHoja.destacado = true;
    setTimeout(() => {
      nodoHoja.destacado = false;
    }, 2000);
  }
  
  const fin = performance.now();
  
  if (mostrarResultado) {
    resultadoOperacion.value = {
      tipo: 'Inserción',
      valor,
      ruta,
      nivel: alturaArbol.value,
      exito,
      accesosDisco,
      divisiones,
      nuevosBloques,
      tiempo: Math.round(fin - inicio)
    };
  }
}

async function buscarElemento() {
  if (!valorOperacion.value) return;
  
  const inicio = performance.now();
  const valor = valorOperacion.value;
  const ruta: string[] = [];
  let accesosDisco = 0;
  
  // Simular búsqueda en el árbol
  for (let nivel = 0; nivel < alturaArbol.value; nivel++) {
    ruta.push(`Nivel ${nivel}`);
    accesosDisco++;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  const encontrado = existeElemento(valor);
  
  // Destacar nodos en la ruta
  if (encontrado && nivelesArbol.value.length > 0) {
    const nodoEncontrado = nivelesArbol.value[nivelesArbol.value.length - 1]
      .find(nodo => nodo.elementos.includes(valor));
    if (nodoEncontrado) {
      nodoEncontrado.destacado = true;
      setTimeout(() => {
        nodoEncontrado.destacado = false;
      }, 2000);
    }
  }
  
  const fin = performance.now();
  
  resultadoOperacion.value = {
    tipo: 'Búsqueda',
    valor,
    ruta,
    nivel: encontrado ? alturaArbol.value : -1,
    exito: encontrado,
    accesosDisco,
    divisiones: 0,
    nuevosBloques: 0,
    tiempo: Math.round(fin - inicio)
  };
  
  valorOperacion.value = null;
}

async function eliminarElemento() {
  if (!valorOperacion.value) return;
  
  const inicio = performance.now();
  const valor = valorOperacion.value;
  const ruta: string[] = ['Raíz'];
  let accesosDisco = 1;
  
  const existe = existeElemento(valor);
  let exito = false;
  
  if (existe) {
    // Encontrar y eliminar el elemento
    for (const nivel of nivelesArbol.value) {
      for (const nodo of nivel) {
        const index = nodo.elementos.indexOf(valor);
        if (index !== -1) {
          nodo.elementos.splice(index, 1);
          nodo.ocupacion = nodo.elementos.length / capacidadBloque.value!;
          elementosInsertados.value--;
          exito = true;
          
          // Destacar nodo afectado
          nodo.destacado = true;
          setTimeout(() => {
            nodo.destacado = false;
          }, 2000);
          break;
        }
      }
      if (exito) break;
    }
  }
  
  const fin = performance.now();
  
  resultadoOperacion.value = {
    tipo: 'Eliminación',
    valor,
    ruta,
    nivel: existe ? alturaArbol.value : -1,
    exito,
    accesosDisco,
    divisiones: 0,
    nuevosBloques: 0,
    tiempo: Math.round(fin - inicio)
  };
  
  valorOperacion.value = null;
}

function existeElemento(valor: number): boolean {
  for (const nivel of nivelesArbol.value) {
    for (const nodo of nivel) {
      if (nodo.elementos.includes(valor)) {
        return true;
      }
    }
  }
  return false;
}

function limpiarResultado() {
  resultadoOperacion.value = null;
}

function reiniciarEstructura() {
  estructuraCreada.value = false;
  tipoEstructura.value = null;
  ordenArbol.value = null;
  capacidadBloque.value = null;
  valorOperacion.value = null;
  elementosInsertados.value = 0;
  bloquesUtilizados.value = 1;
  alturaArbol.value = 1;
  resultadoOperacion.value = null;
  nivelesArbol.value = [];
}
</script>

<style scoped>
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

.create-structure input {
  min-width: 150px;
}

.info-text {
  color: #cbd5e1;
  font-weight: 500;
  padding: 0.5rem;
  background: #1f2937;
  border-radius: 4px;
  border-left: 4px solid #8b5cf6;
}

.info-estructura {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.info-estructura strong {
  color: #e0e7ff;
}

.search-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.search-controls input {
  min-width: 200px;
}

.resultado-container {
  background: #1a1a2e;
  border: 1px solid #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.resultado-info h4 {
  margin: 0 0 1rem 0;
  color: #e0e7ff;
}

.detalle-operacion {
  background: #0f172a;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
}

.detalle-operacion p {
  margin: 0.25rem 0;
  color: #cbd5e1;
}

.divisiones-info {
  background: #8b5cf6;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.divisiones-info p {
  margin: 0.25rem 0;
}

.arbol-container {
  margin-top: 2rem;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 1rem;
}

.arbol-container h5 {
  margin: 0 0 1rem 0;
  color: #cbd5e1;
}

.metricas-rapidas {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.metrica-badge {
  background: #1f2937;
  color: #cbd5e1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  border-left: 3px solid #8b5cf6;
}

.niveles-arbol {
  margin-bottom: 1rem;
}

.nivel-arbol {
  margin-bottom: 1rem;
}

.nivel-header {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.nodos-nivel {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nodo-arbol {
  border: 2px solid #374151;
  border-radius: 6px;
  min-width: 150px;
  transition: all 0.3s ease;
}

.nodo-vacio {
  border-color: #6b7280;
}

.nodo-medio {
  border-color: #f59e0b;
}

.nodo-lleno {
  border-color: #ef4444;
}

.nodo-destacado {
  border-color: #10b981 !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  transform: scale(1.05);
}

.nodo-header {
  background: #374151;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.nodo-lleno .nodo-header {
  background: #ef4444;
}

.nodo-medio .nodo-header {
  background: #f59e0b;
  color: #1f2937;
}

.nodo-destacado .nodo-header {
  background: #10b981;
}

.nodo-contenido {
  padding: 0.5rem;
}

.elementos-nodo {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
  min-height: 30px;
}

.elemento-nodo {
  background: #1f2937;
  color: #e5e7eb;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.mas-elementos {
  background: #6b7280;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-style: italic;
}

.ocupacion-barra {
  width: 100%;
  height: 4px;
  background: #374151;
  border-radius: 2px;
  overflow: hidden;
}

.ocupacion-nivel {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  transition: width 0.3s ease;
}

.estadisticas-detalladas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.stat-item {
  background: #1f2937;
  padding: 0.75rem;
  border-radius: 4px;
  color: #cbd5e1;
}

.stat-item strong {
  color: #e0e7ff;
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metricas-rapidas {
    flex-direction: column;
  }
  
  .nodos-nivel {
    justify-content: center;
  }
  
  .estadisticas-detalladas {
    grid-template-columns: 1fr;
  }
}
</style>