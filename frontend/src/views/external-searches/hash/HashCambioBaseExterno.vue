<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Hash Cambio de Base Externa</h1>
  
  <!-- Configuración inicial -->
  <div v-if="!estructuraCreada" class="create-structure">
    <h3>Crear estructura</h3>
    <div>
      <input v-model.number="capacidad" type="number" placeholder="Capacidad (mínimo 10)" @input="validateInput" />
      <input v-model.number="digitosClave" type="number" placeholder="Cantidad de dígitos por clave" @input="validateInput" />
      
      <!-- Selector de base para cambio de base -->
      <select v-model.number="base">
        <option value="2">Base 2</option>
        <option value="3">Base 3</option>
        <option value="4">Base 4</option>
        <option value="5">Base 5</option>
        <option value="6">Base 6</option>
        <option value="7">Base 7</option>
        <option value="8">Base 8</option>
        <option value="9">Base 9</option>
      </select>
      
      <!-- Selector de resolución de colisiones -->
      <select v-model="resolucionColisiones">
        <option value="estructura-secundaria">Estructura Secundaria</option>
        <option value="area-colisiones">Área de Colisiones</option>
      </select>
      
      <button @click="crearEstructura">Crear estructura</button>
    </div>
    
    <div v-if="capacidad && capacidad >= 10" class="info-preview">
      <p><strong>Elementos por bloque:</strong> {{ elementosPorBloque }} (⌊√{{ capacidad }}⌋) | <strong>Número de bloques:</strong> {{ numeroBloques }}</p>
      <p><strong>Función Hash:</strong> Cambio de Base {{ base }} | <strong>Resolución:</strong> {{ resolucionColisiones }}</p>
    </div>
    
    <div class="import-option">
      <p><strong>O abrir estructura existente:</strong></p>
      <label for="import-file-initial" class="secondary file-upload-btn">Abrir desde archivo</label>
      <input id="import-file-initial" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
  </div>

  <!-- Controles de operación -->
  <div v-if="estructuraCreada">
    <p>Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}, Elementos por bloque: {{ elementosPorBloque }}, Base: {{ base }}</p>
    <p><strong>Función Hash:</strong> Cambio de Base {{ base }} | <strong>Resolución de Colisiones:</strong> {{ resolucionColisiones }}</p>
    
    <!-- Controles de exportación e importación -->
    <div class="import-export-controls">
      <button @click="exportarEstructura" class="secondary">Guardar Estructura</button>
      <label for="import-file" class="secondary file-upload-btn">Abrir Estructura</label>
      <input id="import-file" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
    
    <input
      v-model="valor"
      type="text"
      placeholder="Clave entera positiva"
      @input="validateInput"
    />
    <div id="general-nav">
      <button @click="insertar" class="outline contrast">Insertar</button>
      <button @click="buscar" class="outline contrast">Buscar</button>
      <button @click="eliminar" class="outline contrast">Eliminar</button>
    </div>
  </div>

  <!-- Mensaje de error -->
  <div v-if="errorMessage">
    <p>{{ errorMessage }}</p>
  </div>

  <!-- Resultado -->
  <div v-if="resultado !== null">
    <p v-if="resultado">Elemento encontrado en Bloque {{ bloqueBuscado + 1 }}, Posición {{ getGlobalIndex(bloqueBuscado, indexBuscado) }}</p>
    <p v-else>Elemento no encontrado</p>
  </div>

  <!-- Visualización de la estructura -->
  <div v-if="estructuraCreada">
    <h2>Estructura actual: ({{ elementosInsertados }}/{{ capacidad }} elementos)</h2>
    
    <!-- Visualización con Área de Colisiones -->
    <div v-if="resolucionColisiones === 'area-colisiones'" class="blocks-container">
      <div 
        v-for="(bloque, index) in estructura" 
        :key="'collision-' + index" 
        class="block-with-collision"
        :class="{ 'highlight-block': index === bloqueBuscado }"
      >
        <div class="block-header">Bloque {{ index + 1 }}</div>
        
        <!-- Área Principal -->
        <div class="area-section">
          <div class="area-header">Área Principal</div>
          <div class="block-content">
            <div 
              v-for="pos in getDisplayIndicesForBlock(bloque)" 
              :key="'main-' + index + '-' + pos" 
              class="element"
              :class="{ 
                'empty': bloque[pos] === null
              }"
            >
              <div class="pos">{{ getGlobalIndex(index, pos) }}</div>
              <div class="value">{{ bloque[pos] !== null ? bloque[pos] : '' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Área de Colisiones -->
        <div class="area-section collision-area">
          <div class="area-header">Área de Colisiones</div>
          <div class="block-content">
            <div 
              v-for="pos in getDisplayIndicesForBlock(areaColisiones[index])" 
              :key="'collision-' + index + '-' + pos" 
              class="element collision-element"
              :class="{ 
                'empty': areaColisiones[index][pos] === null
              }"
            >
              <div class="pos">C{{ pos + 1 }}</div>
              <div class="value">{{ areaColisiones[index][pos] !== null ? areaColisiones[index][pos] : '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualización con Estructura Secundaria (original) -->
    <div v-else class="structures-flex-container">
      <!-- Estructura Principal -->
      <div class="structure-container">
        <h3>Estructura Principal</h3>
        <div class="blocks-container">
          <div 
            v-for="(bloque, index) in estructura" 
            :key="'main-' + index" 
            class="block"
            :class="{ 'highlight-block': index === bloqueBuscado }"
          >
            <div class="block-header">Bloque {{ index + 1 }}</div>
            <div class="block-content">
              <div 
                v-for="pos in getDisplayIndicesForBlock(bloque)" 
                :key="'main-' + index + '-' + pos" 
                class="element"
                :class="{ 
                  'empty': bloque[pos] === null
                }"
              >
                <div class="pos">{{ getGlobalIndex(index, pos) }}</div>
                <div class="value">{{ bloque[pos] !== null ? bloque[pos] : '' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estructura Secundaria (solo visible cuando se activa) -->
      <div v-if="estructuraSecundariaVisible" class="structure-container">
        <h3>Estructura Secundaria</h3>
        <div class="blocks-container">
          <div 
            v-for="(bloque, index) in estructuraSecundaria" 
            :key="'sec-' + index" 
            class="block secondary"
            :class="{ 'highlight-block': index === bloqueBuscado }"
          >
            <div class="block-header">Bloque {{ index + 1 }}</div>
            <div class="block-content">
              <div 
                v-for="pos in getDisplayIndicesForBlock(bloque)" 
                :key="'sec-' + index + '-' + pos" 
                class="element"
                :class="{ 
                  'empty': bloque[pos] === null
                }"
              >
                <div class="pos">{{ getGlobalIndex(index, pos) }}</div>
                <div class="value">{{ bloque[pos] !== null ? bloque[pos] : '' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import * as funciones from "../../../utils/funciones.ts";

const valor = ref("");
const estructura = ref<(number | null)[][]>([]); // Array de bloques principales
const estructuraSecundaria = ref<(number | null)[][]>([]); // Array de bloques secundarios para colisiones
const areaColisiones = ref<(number | null)[][]>([]); // Array de áreas de colisiones dentro de cada bloque
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const bloqueBuscado = ref(-1);
const errorMessage = ref("");
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null);
const digitosClave = ref<number | null>(null);
const base = ref<number>(2); // Base para cambio de base (2-9)
const resolucionColisiones = ref<string>("estructura-secundaria");
const estructuraSecundariaVisible = ref(false); // Solo mostrar cuando se use
const elementosInsertados = ref(0); // Contador para limitar la capacidad total

// Calcular elementos por bloque usando la fórmula ⌊√n⌋
const elementosPorBloque = computed(() => {
  if (!capacidad.value) return 0;
  return Math.floor(Math.sqrt(capacidad.value));
});

// Calcular número de bloques
const numeroBloques = computed(() => {
  if (!capacidad.value || !elementosPorBloque.value) return 0;
  return Math.ceil(capacidad.value / elementosPorBloque.value);
});

// Función para obtener índices limitados de elementos a mostrar dentro de un bloque
// Para estructuras grandes (>20 elementos por bloque), solo muestra elementos ocupados + primer y último elemento
const getDisplayIndicesForBlock = (bloque: (number | null)[], maxElements = 20) => {
  const n = bloque.length;
  if (n <= maxElements) return Array.from({ length: n }, (_, i) => i);
  if (n === 0) return [];
  
  const occupied = bloque
    .map((v, i) => (v !== null ? i : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  
  const set = new Set<number>();
  set.add(0); // Primer elemento
  set.add(n - 1); // Último elemento
  for (const i of occupied) set.add(i); // Elementos ocupados
  
  return Array.from(set).sort((a, b) => a - b);
};

// Función para calcular el índice global (1-indexed) basado en bloque y posición
const getGlobalIndex = (blockIndex: number, positionIndex: number) => {
  return blockIndex * elementosPorBloque.value + positionIndex + 1;
};

const crearEstructura = () => {
  errorMessage.value = "";
  resultado.value = null;
  indexBuscado.value = -1;
  bloqueBuscado.value = -1;
  
  // Validaciones básicas
  if (!capacidad.value || capacidad.value < 10) {
    errorMessage.value = "La capacidad debe ser al menos 10.";
    return;
  }
  
  if (!digitosClave.value || digitosClave.value < 1) {
    errorMessage.value = "Debe especificar al menos 1 dígito por clave.";
    return;
  }

  if (!base.value || base.value < 2 || base.value > 9) {
    errorMessage.value = "La base debe estar entre 2 y 9.";
    return;
  }

  // Crear estructura de bloques principales
  const bloques = [];
  for (let i = 0; i < numeroBloques.value; i++) {
    bloques.push(Array(elementosPorBloque.value).fill(null));
  }
  estructura.value = bloques;
  
  // Crear estructura de bloques secundarios (inicialmente vacía)
  const bloquesSecundarios = [];
  for (let i = 0; i < numeroBloques.value; i++) {
    bloquesSecundarios.push(Array(elementosPorBloque.value).fill(null));
  }
  estructuraSecundaria.value = bloquesSecundarios;
  estructuraSecundariaVisible.value = false;
  
  // Crear áreas de colisiones para cada bloque (siempre presentes)
  const areasColisiones = [];
  for (let i = 0; i < numeroBloques.value; i++) {
    areasColisiones.push(Array(elementosPorBloque.value).fill(null));
  }
  areaColisiones.value = areasColisiones;
  
  // Reiniciar contador de elementos
  elementosInsertados.value = 0;
  
  estructuraCreada.value = true;
};

// Función hash cambio de base para determinar el bloque
const hashCambioBaseBloque = (clave: number): number => {
  const hash = funciones.HashCambioBase(clave, numeroBloques.value, base.value);
  // Verificar que el hash sea válido y esté en rango
  if (isNaN(hash) || hash < 0 || hash >= numeroBloques.value) {
    // Usar hash módulo directo como respaldo
    return clave % numeroBloques.value;
  }
  return hash;
};

// Búsqueda de elemento usando hash para encontrar bloque y búsqueda lineal dentro del bloque
function buscarElemento(elemento: number) {
  const bloqueHash = hashCambioBaseBloque(elemento);
  
  // Verificar que el índice sea válido
  if (bloqueHash < 0 || bloqueHash >= estructura.value.length) {
    return { encontrado: false, bloque: bloqueHash, posicion: -1, esSecundario: false, esAreaColision: false };
  }
  
  const bloque = estructura.value[bloqueHash];
  
  // Búsqueda lineal dentro del bloque principal
  for (let i = 0; i < bloque.length; i++) {
    if (bloque[i] === elemento) {
      return { encontrado: true, bloque: bloqueHash, posicion: i, esSecundario: false, esAreaColision: false };
    }
  }
  
  // Buscar en área de colisiones del mismo bloque
  const areaColision = areaColisiones.value[bloqueHash];
  for (let i = 0; i < areaColision.length; i++) {
    if (areaColision[i] === elemento) {
      return { encontrado: true, bloque: bloqueHash, posicion: i, esSecundario: false, esAreaColision: true };
    }
  }
  
  // Buscar en estructura secundaria si está visible
  if (estructuraSecundariaVisible.value) {
    const bloqueSecundario = estructuraSecundaria.value[bloqueHash];
    for (let i = 0; i < bloqueSecundario.length; i++) {
      if (bloqueSecundario[i] === elemento) {
        return { encontrado: true, bloque: bloqueHash, posicion: i, esSecundario: true, esAreaColision: false };
      }
    }
  }
  
  return { encontrado: false, bloque: bloqueHash, posicion: -1, esSecundario: false, esAreaColision: false };
}

// Inserción usando hash para determinar el bloque y colocación lineal dentro del bloque
function insertarElemento(elemento: number): boolean {
  // Verificar límite de capacidad total
  if (elementosInsertados.value >= capacidad.value!) {
    errorMessage.value = `Capacidad máxima alcanzada (${capacidad.value} elementos).`;
    return false;
  }

  // Verificar si ya existe
  const existeResult = buscarElemento(elemento);
  if (existeResult.encontrado) {
    errorMessage.value = "El elemento ya existe en la estructura.";
    return false;
  }
  
  const bloqueHash = hashCambioBaseBloque(elemento);
  const bloque = estructura.value[bloqueHash];
  
  // Intentar insertar en el bloque principal
  for (let i = 0; i < bloque.length; i++) {
    if (bloque[i] === null) {
      bloque[i] = elemento;
      elementosInsertados.value++;
      return true;
    }
  }
  
  // Si el bloque principal está lleno, usar la estrategia de resolución de colisiones
  if (resolucionColisiones.value === "area-colisiones") {
    // Intentar insertar en área de colisiones
    const areaColision = areaColisiones.value[bloqueHash];
    for (let i = 0; i < areaColision.length; i++) {
      if (areaColision[i] === null) {
        areaColision[i] = elemento;
        elementosInsertados.value++;
        return true;
      }
    }
    errorMessage.value = "El bloque y su área de colisiones están llenos.";
    return false;
  } else {
    // Usar estructura secundaria
    estructuraSecundariaVisible.value = true;
    const bloqueSecundario = estructuraSecundaria.value[bloqueHash];
    for (let i = 0; i < bloqueSecundario.length; i++) {
      if (bloqueSecundario[i] === null) {
        bloqueSecundario[i] = elemento;
        elementosInsertados.value++;
        return true;
      }
    }
    errorMessage.value = "El bloque principal y secundario están llenos.";
    return false;
  }
}

// Eliminar elemento de la estructura
function eliminarElemento(elemento: number): boolean {
  const resultado = buscarElemento(elemento);
  
  if (!resultado.encontrado) {
    return false;
  }
  
  // Eliminar del lugar correspondiente
  if (resultado.esAreaColision) {
    areaColisiones.value[resultado.bloque][resultado.posicion] = null;
  } else if (resultado.esSecundario) {
    estructuraSecundaria.value[resultado.bloque][resultado.posicion] = null;
  } else {
    estructura.value[resultado.bloque][resultado.posicion] = null;
  }
  
  elementosInsertados.value--;
  return true;
}

// Botones de operaciones
const buscar = () => {
  errorMessage.value = "";
  resultado.value = null;
  indexBuscado.value = -1;
  bloqueBuscado.value = -1;

  const num = parseInt(valor.value);
  if (isNaN(num) || num < 0) {
    errorMessage.value = "Por favor, ingresa un número válido.";
    return;
  }

  const validacion = funciones.validarInput(num, digitosClave.value);
  if (validacion.isError) {
    errorMessage.value = validacion.msg;
    return;
  }

  const searchResult = buscarElemento(num);
  resultado.value = searchResult.encontrado;
  
  if (searchResult.encontrado) {
    bloqueBuscado.value = searchResult.bloque;
    indexBuscado.value = searchResult.posicion;
  }
};

const insertar = () => {
  errorMessage.value = "";
  resultado.value = null;
  indexBuscado.value = -1;
  bloqueBuscado.value = -1;

  const num = parseInt(valor.value);
  if (isNaN(num) || num < 0) {
    errorMessage.value = "Por favor, ingresa un número válido.";
    return;
  }

  const validacion = funciones.validarInput(num, digitosClave.value);
  if (validacion.isError) {
    errorMessage.value = validacion.msg;
    return;
  }

  const insertado = insertarElemento(num);
  if (insertado) {
    errorMessage.value = `Elemento ${num} insertado exitosamente.`;
    valor.value = "";
  }
};

const eliminar = () => {
  errorMessage.value = "";
  resultado.value = null;
  indexBuscado.value = -1;
  bloqueBuscado.value = -1;

  const num = parseInt(valor.value);
  if (isNaN(num) || num < 0) {
    errorMessage.value = "Por favor, ingresa un número válido.";
    return;
  }

  const validacion = funciones.validarInput(num, digitosClave.value);
  if (validacion.isError) {
    errorMessage.value = validacion.msg;
    return;
  }

  const eliminado = eliminarElemento(num);
  if (eliminado) {
    errorMessage.value = `Elemento ${num} eliminado exitosamente.`;
    valor.value = "";
  } else {
    errorMessage.value = `Elemento ${num} no encontrado en la estructura.`;
  }
};

// Funciones de exportación e importación
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateExternalHashImport 
} from "../../../utils/importExportUtils.ts";
import type { ValidationResult } from "../../../utils/importExportUtils.ts";

function exportarEstructura() {
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura para exportar.";
    return;
  }

  try {
    const config = {
      capacidad: capacidad.value,
      digitosClave: digitosClave.value,
      elementosPorBloque: elementosPorBloque.value,
      numeroBloques: numeroBloques.value,
      funcionHash: 'cambio-base',
      base: base.value,
      resolucionColisiones: resolucionColisiones.value
    };

    const dataToExport = {
      estructura: estructura.value,
      estructuraSecundaria: estructuraSecundaria.value,
      areaColisiones: areaColisiones.value,
      elementosInsertados: elementosInsertados.value
    };

    const exportData = createExportData('hash-cambio-base-externo', config, dataToExport);
    const filename = generateExportFileName('hash-cambio-base-externo', config);
    
    downloadJsonFile(exportData, filename);
    errorMessage.value = "Estructura hash externa exportada exitosamente.";
  } catch (error) {
    errorMessage.value = "Error al exportar la estructura.";
  }
}

function importarEstructura(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target?.result as string);
      
      // Validación con la función centralizada
      const validation: ValidationResult = validateExternalHashImport(importData);
      
      if (!validation.isValid) {
        errorMessage.value = validation.error || "Archivo inválido.";
        return;
      }
      
      // Verificar que sea específicamente hash-cambio-base-externo
      if (importData.type !== 'hash-cambio-base-externo') {
        errorMessage.value = `El archivo no corresponde a una estructura hash cambio de base externa. Tipo recibido: ${importData.type}`;
        return;
      }
      
      // Verificar que la función hash sea cambio-base
      if (importData.config.funcionHash !== 'cambio-base') {
        errorMessage.value = `El archivo usa función hash "${importData.config.funcionHash}". Solo se acepta "cambio-base" aquí.`;
        return;
      }
      
      // Verificar que tenga la base
      if (!importData.config.base || importData.config.base < 2 || importData.config.base > 9) {
        errorMessage.value = "El archivo no contiene una base válida (2-9).";
        return;
      }
      
      // Importar exitosamente
      capacidad.value = importData.config.capacidad;
      digitosClave.value = importData.config.digitosClave;
      base.value = importData.config.base;
      resolucionColisiones.value = importData.config.resolucionColisiones || "estructura-secundaria";
      
      // Importar las estructuras de datos
      estructura.value = importData.data.estructura || importData.data;
      estructuraSecundaria.value = importData.data.estructuraSecundaria || [];
      areaColisiones.value = importData.data.areaColisiones || [];
      elementosInsertados.value = importData.data.elementosInsertados || 0;
      
      // Actualizar estado de visibilidad de estructura secundaria
      estructuraSecundariaVisible.value = resolucionColisiones.value === 'estructura-secundaria' && 
                                          estructuraSecundaria.value.some(bloque => bloque.some((el: number | null) => el !== null));
      
      estructuraCreada.value = true;
      resultado.value = null;
      indexBuscado.value = -1;
      bloqueBuscado.value = -1;
      
      errorMessage.value = `Estructura hash externa importada exitosamente. Capacidad: ${capacidad.value}, Dígitos: ${digitosClave.value}, Base: ${base.value}`;
      
    } catch (error) {
      errorMessage.value = "Error al leer el archivo. Asegúrate de que sea un JSON válido.";
    }
  };
  
  reader.readAsText(file);
  target.value = '';
}

// Función para validar entrada en tiempo real
function validateInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const validChars = /^\d*$/;
  
  if (!validChars.test(value)) {
    target.value = value.slice(0, -1);
    errorMessage.value = "Solo se permiten claves enteras positivas";
  } else {
    errorMessage.value = "";
  }
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

.config-row input, select {
  max-width: 200px;
  margin: 0;
}

.info-section {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--code-background-color);
  border-radius: 0.25rem;
}

.info-section p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.structure-info {
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  text-align: center;
  padding: 0.5rem;
}

.operations {
  max-width: 600px;
  margin: 2rem auto;
}

.operations input {
  width: 100%;
  max-width: 300px;
  margin-bottom: 1rem;
}

#general-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.import-option {
  margin-top: 1rem;
}

.file-upload-btn {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.25rem;
  background: var(--background-color);
  color: var(--color);
  transition: all 0.2s ease;
  display: inline-block;
}

.file-upload-btn:hover {
  background: var(--muted-color);
  border-color: var(--color);
}

.import-export-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.info-preview {
  margin: 1rem 0;
  padding: 0.5rem;
  background: var(--card-background-color);
  border-radius: 0.25rem;
}

.message {
  color: #e5e7eb;
  font-size: 0.9rem;
  margin: 1rem auto;
  max-width: 600px;
}

.result {
  margin: 1rem auto;
  padding: 1rem;
  max-width: 600px;
  color: var(--primary);
  font-weight: bold;
}

.structure-display {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.structure-display h3 {
  margin-bottom: 1.5rem;
}

.structures-flex-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: space-around;
  flex-wrap: wrap;
}

.structure-container {
  flex: 1;
  min-width: 300px;
}

.structure-container h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--primary);
}

.blocks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: center;
}

.block-with-collision {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 0.75rem;
  min-width: 300px;
  max-width: 400px;
  transition: all 0.3s ease;
  position: relative;
}

.block-with-collision.highlight-block {
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.area-section {
  margin-bottom: 1rem;
}

.area-section:last-child {
  margin-bottom: 0;
}

.area-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.25rem;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 4px;
}

.collision-area .area-header {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.collision-element {
  border-color: #fbbf24;
  background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);
}

.collision-element .pos {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.block {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 0.75rem;
  min-width: 200px;
  max-width: 300px;
  transition: all 0.3s ease;
  position: relative;
}

.block.highlight-block {
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.block.secondary {
  border-color: #86efac;
  background: linear-gradient(180deg, #f0fdf4 0%, #f7fbff 100%);
}

.block.secondary .block-header {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.block.secondary .element {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.block-header {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: normal;
}

.block-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 8px;
  margin-top: 20px;
  padding: 0;
}

.element {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 8px 10px 8px;
  text-align: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.element .pos {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(15, 23, 42, 0.06);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #334155;
}

.element .value {
  font-weight: 700;
  margin-top: 14px;
  font-size: 1.1rem;
  color: #0f172a;
}

.element.empty {
  opacity: 0.6;
  background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
}

.element.empty .value {
  color: transparent;
}

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
  }
  
  .config-row input, select {
    max-width: 250px;
    width: 100%;
  }
  
  .blocks-container {
    padding: 0 0.5rem;
    justify-content: center;
  }
  
  .block {
    min-width: 280px;
    width: 100%;
  }
  
  .element {
    min-height: 50px;
  }
  
  .element .value {
    font-size: 1rem;
    margin-top: 12px;
  }
  
  .element .pos {
    font-size: 0.7rem;
  }
}
</style>
