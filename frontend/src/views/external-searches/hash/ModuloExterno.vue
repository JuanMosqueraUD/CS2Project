<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Búsqueda Hash Externa - Función Módulo</h1>
  
  <div class="create-structure" v-if="!estructuraCreada">
    <h3>Crear estructura</h3>
    <div>
      <details class="dropdown">
        <summary>Tamaño de tabla: <strong>{{ tamanoTabla ?? 'Selecciona' }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="tamanoTabla = 101">101 (primo)</a></li>
          <li><a href="#" @click.prevent="tamanoTabla = 211">211 (primo)</a></li>
          <li><a href="#" @click.prevent="tamanoTabla = 503">503 (primo)</a></li>
          <li><a href="#" @click.prevent="tamanoTabla = 1009">1009 (primo)</a></li>
        </ul>
      </details>
      <details class="dropdown">
        <summary>Factor de carga: <strong>{{ factorCarga ?? 'Selecciona' }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="factorCarga = 0.5">0.5 (50%)</a></li>
          <li><a href="#" @click.prevent="factorCarga = 0.7">0.7 (70%)</a></li>
          <li><a href="#" @click.prevent="factorCarga = 0.85">0.85 (85%)</a></li>
        </ul>
      </details>
      <span class="info-text">Archivo hash externo con función módulo</span>
      <button @click="crearEstructura" :disabled="!tamanoTabla || !factorCarga">Crear estructura</button>
    </div>
  </div>

  <div v-if="estructuraCreada">
    <div class="info-estructura">
      <p>
        <strong>Tabla hash externa creada:</strong>
        <br />• Tamaño: {{ tamanoTabla }} buckets
        <br />• Elementos insertados: {{ elementosInsertados }}
        <br />• Factor de carga: {{ factorCargaActual.toFixed(2) }}
        <br />• Función: h(k) = k mod {{ tamanoTabla }}
      </p>
    </div>
    
    <div class="search-controls">
      <input 
        v-model.number="valorBusqueda" 
        type="number"
        placeholder="Número a buscar" 
        @input="limpiarResultado"
      />
      <button @click="insertarElemento" class="outline contrast" :disabled="!valorBusqueda || factorCargaActual >= 0.9">
        ➕ Insertar
      </button>
      <button @click="buscarElemento" class="outline" :disabled="!valorBusqueda">
        🔍 Buscar
      </button>
      <button @click="reiniciarEstructura" class="outline">
        🔄 Reiniciar
      </button>
    </div>

    <!-- Resultados -->
    <div v-if="resultadoOperacion" class="resultado-container">
      <div class="resultado-info">
        <h4>{{ resultadoOperacion.exito ? '✅ Operación exitosa' : '❌ Operación fallida' }}</h4>
        <div class="detalle-operacion">
          <p><strong>Operación:</strong> {{ resultadoOperacion.tipo }}</p>
          <p><strong>Valor:</strong> {{ resultadoOperacion.valor }}</p>
          <p><strong>Hash calculado:</strong> {{ resultadoOperacion.valor }} mod {{ tamanoTabla }} = {{ resultadoOperacion.hash }}</p>
          <p><strong>Bucket:</strong> {{ resultadoOperacion.hash }}</p>
          <p><strong>Accesos a disco:</strong> {{ resultadoOperacion.accesosDisco }}</p>
          <p><strong>Tiempo:</strong> {{ resultadoOperacion.tiempo }}ms</p>
        </div>
        
        <div v-if="resultadoOperacion.colisiones > 0" class="colisiones-info">
          <p><strong>⚠️ Colisiones detectadas:</strong> {{ resultadoOperacion.colisiones }}</p>
          <p>Elementos en el bucket {{ resultadoOperacion.hash }}: {{ buckets[resultadoOperacion.hash]?.length || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Visualización de buckets -->
    <div class="buckets-container">
      <h5>Estado de la tabla hash (primeros 20 buckets):</h5>
      <div class="buckets-grid">
        <div 
          v-for="(bucket, index) in buckets.slice(0, 20)" 
          :key="index"
          class="bucket"
          :class="{ 
            'bucket-vacio': !bucket || bucket.length === 0,
            'bucket-lleno': bucket && bucket.length > 0,
            'bucket-colision': bucket && bucket.length > 1,
            'bucket-destacado': index === bucketDestacado
          }"
        >
          <div class="bucket-header">{{ index }}</div>
          <div class="bucket-content">
            <span v-if="!bucket || bucket.length === 0" class="vacio">vacío</span>
            <div v-else class="elementos">
              <span 
                v-for="(elemento, elemIndex) in bucket" 
                :key="elemIndex"
                class="elemento-bucket"
              >
                {{ elemento }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estadísticas -->
      <div class="estadisticas">
        <div class="stat">
          <strong>Buckets ocupados:</strong> {{ bucketsOcupados }}
        </div>
        <div class="stat">
          <strong>Buckets vacíos:</strong> {{ tamanoTabla - bucketsOcupados }}
        </div>
        <div class="stat">
          <strong>Total colisiones:</strong> {{ totalColisiones }}
        </div>
        <div class="stat">
          <strong>Cadena más larga:</strong> {{ cadenaMaxima }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const tamanoTabla = ref<number | null>(null);
const factorCarga = ref<number | null>(null);
const estructuraCreada = ref(false);
const valorBusqueda = ref<number | null>(null);
const buckets = ref<number[][]>([]);
const elementosInsertados = ref(0);
const resultadoOperacion = ref<any>(null);
const bucketDestacado = ref(-1);

const factorCargaActual = computed(() => {
  if (!tamanoTabla.value) return 0;
  return elementosInsertados.value / tamanoTabla.value;
});

const bucketsOcupados = computed(() => {
  return buckets.value.filter(bucket => bucket && bucket.length > 0).length;
});

const totalColisiones = computed(() => {
  return buckets.value.reduce((total, bucket) => {
    return total + (bucket && bucket.length > 1 ? bucket.length - 1 : 0);
  }, 0);
});

const cadenaMaxima = computed(() => {
  return buckets.value.reduce((max, bucket) => {
    return Math.max(max, bucket ? bucket.length : 0);
  }, 0);
});

function crearEstructura() {
  if (!tamanoTabla.value || !factorCarga.value) return;
  
  // Inicializar tabla hash
  buckets.value = Array(tamanoTabla.value).fill(null).map(() => []);
  
  // Llenar con datos aleatorios hasta el factor de carga deseado
  const elementosAInsertar = Math.floor(tamanoTabla.value * factorCarga.value);
  const elementosGenerados = new Set<number>();
  
  for (let i = 0; i < elementosAInsertar; i++) {
    let valor;
    do {
      valor = Math.floor(Math.random() * 10000) + 1;
    } while (elementosGenerados.has(valor));
    
    elementosGenerados.add(valor);
    const hash = valor % tamanoTabla.value;
    buckets.value[hash].push(valor);
  }
  
  elementosInsertados.value = elementosAInsertar;
  estructuraCreada.value = true;
  resultadoOperacion.value = null;
}

async function insertarElemento() {
  if (!valorBusqueda.value) return;
  
  const inicio = performance.now();
  const valor = valorBusqueda.value;
  const hash = valor % tamanoTabla.value!;
  
  // Simular acceso a disco
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Verificar si ya existe
  const bucket = buckets.value[hash];
  const yaExiste = bucket.includes(valor);
  
  let accesosDisco = 1; // Acceso inicial al bucket
  let colisiones = 0;
  
  if (bucket.length > 0) {
    colisiones = bucket.length;
    accesosDisco += bucket.length; // Accesos adicionales por colisiones
  }
  
  if (!yaExiste && factorCargaActual.value < 0.9) {
    bucket.push(valor);
    elementosInsertados.value++;
  }
  
  const fin = performance.now();
  
  // Destacar bucket
  bucketDestacado.value = hash;
  setTimeout(() => {
    bucketDestacado.value = -1;
  }, 2000);
  
  resultadoOperacion.value = {
    tipo: 'Inserción',
    valor,
    hash,
    exito: !yaExiste && factorCargaActual.value < 0.9,
    accesosDisco,
    colisiones,
    tiempo: Math.round(fin - inicio)
  };
  
  valorBusqueda.value = null;
}

async function buscarElemento() {
  if (!valorBusqueda.value) return;
  
  const inicio = performance.now();
  const valor = valorBusqueda.value;
  const hash = valor % tamanoTabla.value!;
  
  // Simular acceso a disco
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const bucket = buckets.value[hash];
  const encontrado = bucket.includes(valor);
  
  let accesosDisco = 1; // Acceso inicial al bucket
  let colisiones = 0;
  
  if (bucket.length > 1) {
    colisiones = bucket.length - 1;
    accesosDisco += colisiones; // Accesos adicionales por búsqueda en colisiones
  }
  
  const fin = performance.now();
  
  // Destacar bucket
  bucketDestacado.value = hash;
  setTimeout(() => {
    bucketDestacado.value = -1;
  }, 2000);
  
  resultadoOperacion.value = {
    tipo: 'Búsqueda',
    valor,
    hash,
    exito: encontrado,
    accesosDisco,
    colisiones,
    tiempo: Math.round(fin - inicio)
  };
}

function limpiarResultado() {
  resultadoOperacion.value = null;
  bucketDestacado.value = -1;
}

function reiniciarEstructura() {
  estructuraCreada.value = false;
  tamanoTabla.value = null;
  factorCarga.value = null;
  valorBusqueda.value = null;
  buckets.value = [];
  elementosInsertados.value = 0;
  resultadoOperacion.value = null;
  bucketDestacado.value = -1;
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

.info-text {
  color: #cbd5e1;
  font-weight: 500;
  padding: 0.5rem;
  background: #1f2937;
  border-radius: 4px;
  border-left: 4px solid #f59e0b;
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

.colisiones-info {
  background: #fbbf24;
  color: #1f2937;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.colisiones-info p {
  margin: 0.25rem 0;
}

.buckets-container {
  margin-top: 2rem;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 1rem;
}

.buckets-container h5 {
  margin: 0 0 1rem 0;
  color: #cbd5e1;
}

.buckets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bucket {
  border: 2px solid #374151;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.bucket-vacio {
  border-color: #6b7280;
}

.bucket-lleno {
  border-color: #10b981;
}

.bucket-colision {
  border-color: #f59e0b;
}

.bucket-destacado {
  border-color: #ef4444 !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

.bucket-header {
  background: #374151;
  color: white;
  padding: 0.25rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.bucket-lleno .bucket-header {
  background: #10b981;
}

.bucket-colision .bucket-header {
  background: #f59e0b;
  color: #1f2937;
}

.bucket-destacado .bucket-header {
  background: #ef4444;
}

.bucket-content {
  padding: 0.5rem;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vacio {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  margin-top: 0.5rem;
}

.elementos {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.elemento-bucket {
  background: #1f2937;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.875rem;
  text-align: center;
  color: #e5e7eb;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.stat {
  background: #1f2937;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  color: #cbd5e1;
}

.stat strong {
  color: #e0e7ff;
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .buckets-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .estadisticas {
    grid-template-columns: 1fr;
  }
}
</style>