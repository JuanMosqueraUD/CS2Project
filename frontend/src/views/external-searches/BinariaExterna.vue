<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Búsqueda Binaria Externa</h1>
  
  <div class="create-structure" v-if="!estructuraCreada">
    <h3>Crear estructura</h3>
    <div>
      <details class="dropdown">
        <summary>Tamaño del archivo: <strong>{{ tamanoArchivo ?? 'Selecciona' }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="tamanoArchivo = 100">100 elementos</a></li>
          <li><a href="#" @click.prevent="tamanoArchivo = 500">500 elementos</a></li>
          <li><a href="#" @click.prevent="tamanoArchivo = 1000">1000 elementos</a></li>
          <li><a href="#" @click.prevent="tamanoArchivo = 5000">5000 elementos</a></li>
        </ul>
      </details>
      <details class="dropdown">
        <summary>Tipo de datos: <strong>{{ tipoDatos }}</strong></summary>
        <ul>
          <li><a href="#" @click.prevent="tipoDatos = 'numeros'">Números</a></li>
          <li><a href="#" @click.prevent="tipoDatos = 'texto'">Texto</a></li>
        </ul>
      </details>
      <span class="info-text">Los datos serán ordenados automáticamente</span>
      <button @click="crearEstructura" :disabled="!tamanoArchivo">Crear estructura</button>
    </div>
  </div>

  <div v-if="estructuraCreada">
    <p>
      Archivo ordenado creado con {{ tamanoArchivo }} elementos de tipo {{ tipoDatos }}.
      <br />Búsqueda binaria optimizada para archivos externos.
    </p>
    
    <div class="search-controls">
      <input 
        v-model="valorBusqueda" 
        :placeholder="tipoDatos === 'numeros' ? 'Número a buscar' : 'Texto a buscar'" 
        @input="limpiarResultado"
      />
      <button @click="buscarBinaria" class="outline contrast" :disabled="!valorBusqueda">
        🎯 Buscar
      </button>
      <button @click="reiniciarEstructura" class="outline">
        🔄 Reiniciar
      </button>
    </div>

    <!-- Resultados de búsqueda -->
    <div v-if="resultadoBusqueda" class="resultado-container">
      <div class="resultado-info">
        <h4>{{ resultadoBusqueda.encontrado ? '✅ Elemento encontrado' : '❌ Elemento no encontrado' }}</h4>
        <div class="metricas">
          <span class="metrica">
            <strong>Posición:</strong> 
            {{ resultadoBusqueda.encontrado ? resultadoBusqueda.posicion + 1 : 'N/A' }}
          </span>
          <span class="metrica">
            <strong>Comparaciones:</strong> {{ resultadoBusqueda.comparaciones }}
          </span>
          <span class="metrica">
            <strong>Tiempo:</strong> {{ resultadoBusqueda.tiempo }}ms
          </span>
          <span class="metrica">
            <strong>Accesos a disco:</strong> {{ resultadoBusqueda.accesosDisco }}
          </span>
        </div>
      </div>
      
      <!-- Visualización del proceso -->
      <div class="proceso-container">
        <h5>Pasos de la búsqueda binaria:</h5>
        <div class="pasos-lista">
          <div 
            v-for="(paso, index) in pasosBusqueda" 
            :key="index"
            class="paso-item"
            :class="{ 'paso-actual': index === pasoActual }"
          >
            <span class="paso-numero">{{ index + 1 }}</span>
            <span class="paso-descripcion">{{ paso.descripcion }}</span>
            <span class="paso-rango">Rango: [{{ paso.inicio }}, {{ paso.fin }}]</span>
            <span class="paso-medio">Medio: {{ paso.medio }}</span>
          </div>
        </div>
      </div>

      <!-- Comparación con búsqueda lineal -->
      <div class="comparacion-container">
        <h5>⚡ Eficiencia comparada:</h5>
        <div class="comparacion-metricas">
          <div class="metrica-comparacion binaria">
            <strong>Búsqueda Binaria</strong>
            <span>{{ resultadoBusqueda.comparaciones }} comparaciones</span>
            <span>{{ resultadoBusqueda.accesosDisco }} accesos a disco</span>
          </div>
          <div class="metrica-comparacion lineal">
            <strong>Búsqueda Lineal (estimada)</strong>
            <span>{{ comparacionLineal.comparaciones }} comparaciones</span>
            <span>{{ comparacionLineal.accesosDisco }} accesos a disco</span>
          </div>
          <div class="mejora">
            <strong>Mejora: {{ mejoraPorcentaje }}%</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de elementos (primeros 20) -->
    <div v-if="mostrarElementos" class="elementos-container">
      <h5>Primeros 20 elementos del archivo ordenado:</h5>
      <div class="elementos-grid">
        <div 
          v-for="(elemento, index) in elementosVista.slice(0, 20)" 
          :key="index"
          class="elemento"
          :class="{ 
            'elemento-encontrado': index === posicionEncontrada 
          }"
        >
          {{ elemento }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PasoBusqueda {
  descripcion: string;
  inicio: number;
  fin: number;
  medio: number;
}

const tamanoArchivo = ref<number | null>(null);
const tipoDatos = ref<string>('numeros');
const estructuraCreada = ref(false);
const valorBusqueda = ref('');
const resultadoBusqueda = ref<any>(null);
const mostrarElementos = ref(false);
const elementosVista = ref<any[]>([]);
const posicionEncontrada = ref(-1);
const pasosBusqueda = ref<PasoBusqueda[]>([]);
const pasoActual = ref(-1);

const comparacionLineal = computed(() => {
  if (!resultadoBusqueda.value) return { comparaciones: 0, accesosDisco: 0 };
  const posicion = resultadoBusqueda.value.encontrado ? resultadoBusqueda.value.posicion : tamanoArchivo.value!;
  return {
    comparaciones: posicion + 1,
    accesosDisco: Math.ceil((posicion + 1) / 100)
  };
});

const mejoraPorcentaje = computed(() => {
  if (!resultadoBusqueda.value) return 0;
  const binaria = resultadoBusqueda.value.comparaciones;
  const lineal = comparacionLineal.value.comparaciones;
  return Math.round(((lineal - binaria) / lineal) * 100);
});

function crearEstructura() {
  if (!tamanoArchivo.value) return;
  
  // Generar y ordenar datos simulados
  elementosVista.value = [];
  for (let i = 0; i < tamanoArchivo.value; i++) {
    if (tipoDatos.value === 'numeros') {
      elementosVista.value.push(Math.floor(Math.random() * 10000));
    } else {
      elementosVista.value.push(`Item${i.toString().padStart(4, '0')}`);
    }
  }
  
  // Ordenar los elementos
  if (tipoDatos.value === 'numeros') {
    elementosVista.value.sort((a, b) => a - b);
  } else {
    elementosVista.value.sort();
  }
  
  estructuraCreada.value = true;
  mostrarElementos.value = true;
  resultadoBusqueda.value = null;
}

async function buscarBinaria() {
  if (!valorBusqueda.value) return;
  
  const inicio = performance.now();
  let comparaciones = 0;
  let encontrado = false;
  let posicion = -1;
  let accesosDisco = 0;
  const pasos: PasoBusqueda[] = [];
  
  let left = 0;
  let right = elementosVista.value.length - 1;
  
  // Convertir valor de búsqueda al tipo apropiado
  const valorBuscado = tipoDatos.value === 'numeros' ? 
    Number(valorBusqueda.value) : String(valorBusqueda.value);
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparaciones++;
    accesosDisco++;
    
    const elementoMedio = elementosVista.value[mid];
    
    // Registrar paso
    pasos.push({
      descripcion: `Comparando ${valorBuscado} con ${elementoMedio}`,
      inicio: left,
      fin: right,
      medio: mid
    });
    
    if (elementoMedio === valorBuscado) {
      encontrado = true;
      posicion = mid;
      posicionEncontrada.value = mid;
      pasos[pasos.length - 1].descripcion += ' ✓ ¡Encontrado!';
      break;
    } else if (elementoMedio < valorBuscado) {
      left = mid + 1;
      pasos[pasos.length - 1].descripcion += ' → Buscar en mitad derecha';
    } else {
      right = mid - 1;
      pasos[pasos.length - 1].descripcion += ' → Buscar en mitad izquierda';
    }
    
    // Simular tiempo de acceso a disco
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  const fin = performance.now();
  
  pasosBusqueda.value = pasos;
  resultadoBusqueda.value = {
    encontrado,
    posicion,
    comparaciones,
    tiempo: Math.round(fin - inicio),
    accesosDisco,
    valorBuscado: valorBusqueda.value
  };
  
  // Animar los pasos
  animarPasos();
}

async function animarPasos() {
  for (let i = 0; i < pasosBusqueda.value.length; i++) {
    pasoActual.value = i;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  setTimeout(() => {
    pasoActual.value = -1;
  }, 1000);
}

function limpiarResultado() {
  resultadoBusqueda.value = null;
  posicionEncontrada.value = -1;
  pasosBusqueda.value = [];
  pasoActual.value = -1;
}

function reiniciarEstructura() {
  estructuraCreada.value = false;
  tamanoArchivo.value = null;
  tipoDatos.value = 'numeros';
  valorBusqueda.value = '';
  resultadoBusqueda.value = null;
  mostrarElementos.value = false;
  elementosVista.value = [];
  posicionEncontrada.value = -1;
  pasosBusqueda.value = [];
  pasoActual.value = -1;
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
  border-left: 4px solid #10b981;
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

.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.metrica {
  background: #0f172a;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
}

.proceso-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.proceso-container h5 {
  margin: 0 0 1rem 0;
  color: #cbd5e1;
}

.pasos-lista {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #374151;
  border-radius: 4px;
}

.paso-item {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #374151;
  align-items: center;
  transition: all 0.3s ease;
}

.paso-item:last-child {
  border-bottom: none;
}

.paso-actual {
  background: #1e40af;
  color: white;
  font-weight: bold;
}

.paso-numero {
  background: #374151;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.paso-actual .paso-numero {
  background: #f59e0b;
  color: #1f2937;
}

.paso-descripcion {
  color: #e5e7eb;
}

.paso-rango, .paso-medio {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #9ca3af;
}

.comparacion-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.comparacion-container h5 {
  margin: 0 0 1rem 0;
  color: #cbd5e1;
}

.comparacion-metricas {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
}

.metrica-comparacion {
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.metrica-comparacion.binaria {
  background: #10b981;
  color: white;
}

.metrica-comparacion.lineal {
  background: #ef4444;
  color: white;
}

.metrica-comparacion strong {
  display: block;
  margin-bottom: 0.5rem;
}

.metrica-comparacion span {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
}

.mejora {
  background: #f59e0b;
  color: #1f2937;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.elementos-container {
  margin-top: 2rem;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 1rem;
}

.elementos-container h5 {
  margin: 0 0 1rem 0;
  color: #cbd5e1;
}

.elementos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.elemento {
  background: #1f2937;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  border: 1px solid #374151;
  transition: all 0.3s ease;
}

.elemento-encontrado {
  background: #10b981;
  color: white;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metricas {
    grid-template-columns: 1fr;
  }
  
  .comparacion-metricas {
    grid-template-columns: 1fr;
  }
  
  .paso-item {
    grid-template-columns: 40px 1fr;
    gap: 0.5rem;
  }
  
  .paso-rango, .paso-medio {
    grid-column: 1 / -1;
    justify-self: start;
    margin-left: 50px;
  }
}
</style>