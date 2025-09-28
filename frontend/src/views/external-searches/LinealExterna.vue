<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Búsqueda Lineal Externa</h1>
  
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
          <li><a href="#" @click.prevent="tipoDatos = 'mixto'">Mixto</a></li>
        </ul>
      </details>
      <button @click="crearEstructura" :disabled="!tamanoArchivo">Crear estructura</button>
    </div>
  </div>

  <div v-if="estructuraCreada">
    <p>
      Archivo creado con {{ tamanoArchivo }} elementos de tipo {{ tipoDatos }}.
      <br />Tiempo de acceso secuencial simulado.
    </p>
    
    <div class="search-controls">
      <input 
        v-model="valorBusqueda" 
        :placeholder="tipoDatos === 'numeros' ? 'Número a buscar' : 'Texto a buscar'" 
        @input="limpiarResultado"
      />
      <button @click="buscarLineal" class="outline contrast" :disabled="!valorBusqueda">
        🔍 Buscar
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
      
      <!-- Visualización del progreso -->
      <div class="progreso-container">
        <h5>Progreso de búsqueda:</h5>
        <div class="barra-progreso">
          <div 
            class="progreso-barra" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span class="progreso-texto">
          {{ resultadoBusqueda.comparaciones }} / {{ tamanoArchivo }} elementos revisados
        </span>
      </div>
    </div>

    <!-- Simulación visual de elementos -->
    <div v-if="mostrarElementos" class="elementos-container">
      <h5>Primeros 20 elementos del archivo:</h5>
      <div class="elementos-grid">
        <div 
          v-for="(elemento, index) in elementosVista.slice(0, 20)" 
          :key="index"
          class="elemento"
          :class="{ 
            'elemento-actual': index === posicionActual,
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

const tamanoArchivo = ref<number | null>(null);
const tipoDatos = ref<string>('numeros');
const estructuraCreada = ref(false);
const valorBusqueda = ref('');
const resultadoBusqueda = ref<any>(null);
const mostrarElementos = ref(false);
const elementosVista = ref<any[]>([]);
const posicionActual = ref(-1);
const posicionEncontrada = ref(-1);

const progressPercentage = computed(() => {
  if (!resultadoBusqueda.value) return 0;
  return (resultadoBusqueda.value.comparaciones / tamanoArchivo.value!) * 100;
});

function crearEstructura() {
  if (!tamanoArchivo.value) return;
  
  // Generar datos simulados
  elementosVista.value = [];
  for (let i = 0; i < tamanoArchivo.value; i++) {
    switch (tipoDatos.value) {
      case 'numeros':
        elementosVista.value.push(Math.floor(Math.random() * 10000));
        break;
      case 'texto':
        elementosVista.value.push(`Item${i.toString().padStart(4, '0')}`);
        break;
      case 'mixto':
        elementosVista.value.push(i % 2 === 0 ? Math.floor(Math.random() * 1000) : `Texto${i}`);
        break;
    }
  }
  
  estructuraCreada.value = true;
  mostrarElementos.value = true;
  resultadoBusqueda.value = null;
}

async function buscarLineal() {
  if (!valorBusqueda.value) return;
  
  const inicio = performance.now();
  let comparaciones = 0;
  let encontrado = false;
  let posicion = -1;
  let accesosDisco = 0;
  
  // Simular búsqueda lineal con accesos a disco
  for (let i = 0; i < elementosVista.value.length; i++) {
    comparaciones++;
    accesosDisco += Math.ceil((i + 1) / 100); // Simular accesos a disco cada 100 elementos
    
    posicionActual.value = i;
    
    // Convertir a string para comparación uniforme
    const elemento = String(elementosVista.value[i]);
    const busqueda = String(valorBusqueda.value);
    
    if (elemento === busqueda || elemento.toLowerCase() === busqueda.toLowerCase()) {
      encontrado = true;
      posicion = i;
      posicionEncontrada.value = i;
      break;
    }
    
    // Simular tiempo de acceso
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }
  
  const fin = performance.now();
  
  resultadoBusqueda.value = {
    encontrado,
    posicion,
    comparaciones,
    tiempo: Math.round(fin - inicio),
    accesosDisco,
    valorBuscado: valorBusqueda.value
  };
  
  // Resetear posición actual después de un momento
  setTimeout(() => {
    posicionActual.value = -1;
  }, 1000);
}

function limpiarResultado() {
  resultadoBusqueda.value = null;
  posicionActual.value = -1;
  posicionEncontrada.value = -1;
}

function reiniciarEstructura() {
  estructuraCreada.value = false;
  tamanoArchivo.value = null;
  tipoDatos.value = 'numeros';
  valorBusqueda.value = '';
  resultadoBusqueda.value = null;
  mostrarElementos.value = false;
  elementosVista.value = [];
  posicionActual.value = -1;
  posicionEncontrada.value = -1;
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
}

.metrica {
  background: #0f172a;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
}

.progreso-container {
  margin-top: 1rem;
}

.progreso-container h5 {
  margin: 0 0 0.5rem 0;
  color: #cbd5e1;
}

.barra-progreso {
  width: 100%;
  height: 20px;
  background: #374151;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progreso-barra {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  transition: width 0.3s ease;
}

.progreso-texto {
  color: #9ca3af;
  font-size: 0.875rem;
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

.elemento-actual {
  background: #fbbf24;
  color: #1f2937;
  font-weight: bold;
  transform: scale(1.05);
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
  
  .elementos-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
}
</style>