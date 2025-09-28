<script setup lang="ts">
import { ref, computed } from "vue";
import * as funciones from "../utils/funciones.ts";

const valor = ref("");
const estructura = ref<(number | null)[]>([]);
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const errorMessage = ref("");
// Nueva estado de configuración de la estructura
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null); // 'rango' ahora es capacidad (n espacios)
const digitosClave = ref<number | null>(null); // tamaño de las claves = número de dígitos

function crearEstructura() {
  errorMessage.value = "";
  if (capacidad.value === null || digitosClave.value === null) {
    errorMessage.value = "Por favor completa la capacidad y la cantidad de dígitos.";
    return;
  }
  if (capacidad.value <= 0) {
    errorMessage.value = "La capacidad debe ser un entero positivo.";
    return;
  }
  if (digitosClave.value <= 0) {
    errorMessage.value = "La cantidad de dígitos debe ser un entero positivo.";
    return;
  }

  estructura.value = Array(capacidad.value).fill(null);
  estructuraCreada.value = true;
}

const insertar = () => {
  resultado.value = null;
  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }
  
  // Validar capacidad: buscar primer slot vacío (null)
  if (capacidad.value !== null) {
    const firstEmpty = funciones.busquedaLineal(estructura.value, null);
    if (firstEmpty === -1) {
      errorMessage.value = "Se alcanzó la capacidad máxima de la estructura.";
      return;
    }
    if(funciones.busquedaLineal(estructura.value, num) !== -1){
      errorMessage.value = "El elemento ya existe en la estructura.";
      return;
    }
    estructura.value[firstEmpty] = num;
  }
  estructura.value = funciones.ordenarLista(estructura.value);
  const finalIdx = funciones.busquedaLineal(estructura.value, num);
  if (finalIdx !== -1) {
    errorMessage.value = `Insertado en la posición ${finalIdx + 1}.`;
  } else {
    errorMessage.value = "";
  }
  valor.value = "";
};


function buscar() {
  errorMessage.value = "";
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }

  const index = funciones.busquedaLineal(estructura.value, num);
  if (index !== -1) {
    indexBuscado.value = index + 1; // +1 para posición humana (1-based)
    resultado.value = true;
    errorMessage.value = "";
    return;
  }
  resultado.value = false;
  errorMessage.value = "clave no encontrada";
}

function eliminar() {
  errorMessage.value = "";
  resultado.value = null;
  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }

  const index = funciones.busquedaLineal(estructura.value, num);

  if (index !== -1) {
    estructura.value[index] = null; // liberar slot
    resultado.value = null;
    errorMessage.value = `Eliminado de la posición ${index + 1}.`;
  } else {
    resultado.value = false;
    errorMessage.value = "";
  }
  estructura.value = funciones.ordenarLista(estructura.value);
  valor.value = "";
}

// Función para validar entrada en tiempo real
function validateInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  // Permitir solo números enteros positivos (incluye 0)
  const validChars = /^\d*$/;
  
  if (!validChars.test(value)) {
  target.value = value.slice(0, -1);
    errorMessage.value = "Solo se permiten números enteros positivos";
  } else {
    errorMessage.value = "";
  }
}

// Funciones de exportación e importación
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateLinearImport 
} from "../utils/importExportUtils.ts";

function exportarEstructura() {
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura para exportar.";
    return;
  }

  const config = {
    capacidad: capacidad.value,
    digitosClave: digitosClave.value
  };

  const exportData = createExportData('lineal', config, estructura.value);
  const filename = generateExportFileName('lineal');
  
  downloadJsonFile(exportData, filename);
  errorMessage.value = "Estructura exportada exitosamente.";
}

function importarEstructura(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target?.result as string);
      
      // Usar la utilidad común para validación
      const validation = validateLinearImport(importData);
      if (!validation.isValid) {
        errorMessage.value = validation.error!;
        return;
      }
      
      // Importar exitosamente
      capacidad.value = importData.config.capacidad;
      digitosClave.value = importData.config.digitosClave;
      estructura.value = importData.data;
      estructuraCreada.value = true;
      resultado.value = null;
      indexBuscado.value = -1;
      
      errorMessage.value = `Estructura importada exitosamente. Capacidad: ${capacidad.value}, Dígitos: ${digitosClave.value}`;
      
    } catch (error) {
      errorMessage.value = "Error al leer el archivo. Asegúrate de que sea un JSON válido.";
    }
  };
  
  reader.readAsText(file);
  // Limpiar el input para permitir seleccionar el mismo archivo otra vez
  target.value = '';
}

// Mostrar solo primero, último y ocupados cuando la capacidad es grande
const displayIndices = computed<number[]>(() => {
  if (!estructuraCreada.value || capacidad.value == null) return [];
  const n = estructura.value.length;
  if (n <= 30) return Array.from({ length: n }, (_, i) => i);
  if (n === 0) return [];
  const occupied = estructura.value
    .map((v, i) => (v !== null ? i : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  const set = new Set<number>();
  set.add(0);
  set.add(n - 1);
  for (const i of occupied) set.add(i);
  return Array.from(set).sort((a, b) => a - b);
});
</script>

<template>
    <!-- Botón para volver al inicio -->
    <div class="btn-back">
      <router-link to="/" class="outline contrast">
         Volver al inicio
      </router-link>
    </div>

    <h1>Búsqueda lineal</h1>
    <!-- Controles de creación de estructura (se ocultan cuando ya creada) -->
    <div class="create-structure" v-if="!estructuraCreada">
      <h3>Crear estructura</h3>
      <div>
        <input v-model.number="capacidad" type="number" placeholder="Capacidad (n espacios)" @input="validateInput" />
        <input v-model.number="digitosClave" type="number" placeholder="Cantidad de dígitos por clave" @input="validateInput" />
        <button @click="crearEstructura">Crear estructura</button>
      </div>
      
      <div class="import-option">
        <p><strong>O importar estructura existente:</strong></p>
        <label for="import-file-initial" class="secondary file-upload-btn">📥 Importar desde archivo</label>
        <input id="import-file-initial" type="file" accept=".json" @change="importarEstructura" style="display: none;">
      </div>
    </div>

    <!-- Controles de operación (solo visibles si estructura creada) -->
    <div v-if="estructuraCreada">
      <p>Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}</p>
      
      <!-- Controles de exportación e importación -->
      <div class="import-export-controls">
        <button @click="exportarEstructura" class="secondary">📤 Exportar Estructura</button>
        <label for="import-file" class="secondary file-upload-btn">📥 Importar Estructura</label>
        <input id="import-file" type="file" accept=".json" @change="importarEstructura" style="display: none;">
      </div>
      
      <input
        v-model="valor"
        type="number"
        min="0"
        step="1"
        placeholder="Número entero positivo"
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
      <p v-if="resultado">Elemento encontrado en la posicion {{ indexBuscado }}</p>
    </div>

    <!-- Visualización de estructura -->
    <h2>Estructura actual:</h2>
    <div class="structure-grid">
      <div v-for="i in displayIndices" :key="i" :class="['slot', estructura[i] !== null ? 'occupied' : 'empty']">
        <div class="pos">{{ i + 1 }}</div>
        <div class="value">{{ estructura[i] !== null ? estructura[i] : '' }}</div>
      </div>
    </div>

</template>


<style>
#general-nav {
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.create-structure {
  margin-bottom: 1rem;
}

.create-structure input {
  margin-right: 0.5rem;
}

.import-export-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.import-option {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.file-upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.file-upload-btn:hover {
  opacity: 0.8;
}

.structure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 1rem;
}

.slot {
  position: relative;
  border: 1px solid #e2e8f0; /* light gray-blue */
  border-radius: 8px;
  padding: 12px 8px 10px 8px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.slot .pos {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(15, 23, 42, 0.06);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #334155;
}

.slot .value {
  font-weight: 700;
  margin-top: 14px;
  font-size: 1.1rem;
  color: #0f172a; /* darker for contrast */
}

.slot.empty {
  opacity: 0.7;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.slot.occupied {
  box-shadow: 0 1px 0 rgba(2,6,23,0.04) inset;
  background: linear-gradient(180deg, #eef2ff 0%, #ffffff 100%);
  border-color: #c7d2fe;
}

.slot.empty .value {
  color: #94a3b8; /* muted */
}
</style>
