<template>
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>
  
  <h1>Búsqueda Lineal Externa</h1>
  
  <!-- Configuración inicial -->
  <div v-if="!estructuraCreada" class="create-structure">
    <h3>Crear estructura</h3>
    <div>
      <input v-model.number="capacidad" type="number" placeholder="Capacidad (mínimo 10)" @input="validateInput" />
      <input v-model.number="digitosClave" type="number" placeholder="Cantidad de dígitos por clave" @input="validateInput" />
      <button @click="crearEstructura">Crear estructura</button>
    </div>
    
    <div v-if="capacidad && capacidad >= 10" class="info-preview">
      <p><strong>Elementos por bloque:</strong> {{ elementosPorBloque }} (⌊√{{ capacidad }}⌋) | <strong>Número de bloques:</strong> {{ numeroBloques }}</p>
    </div>
    
    <div class="import-option">
      <p><strong>O abrir estructura existente:</strong></p>
      <label for="import-file-initial" class="secondary file-upload-btn">Abrir desde archivo</label>
      <input id="import-file-initial" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
  </div>

  <!-- Controles de operación -->
  <div v-if="estructuraCreada">
    <p>Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}, Elementos por bloque: {{ elementosPorBloque }}</p>
    
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
    <p v-if="resultado">Elemento encontrado en Bloque {{ bloqueBuscado }}, Posición {{ indexBuscado }}</p>
    <p v-else>Elemento no encontrado</p>
  </div>

  <!-- Visualización de la estructura -->
  <div v-if="estructuraCreada">
    <h2>Estructura actual:</h2>
    <div class="blocks-container">
      <div 
        v-for="(bloque, index) in estructura" 
        :key="index" 
        class="block"
        :class="{ 'highlight-block': index === bloqueBuscado }"
      >
        <div class="block-header">Bloque {{ index }}</div>
        <div class="block-content">
          <div 
            v-for="pos in getDisplayIndicesForBlock(bloque)" 
            :key="pos" 
            class="element"
            :class="{ 
              'empty': bloque[pos] === null,
              'highlight': index === bloqueBuscado && pos === indexBuscado
            }"
          >
            <div class="pos">{{ pos + 1 }}</div>
            <div class="value">{{ bloque[pos] !== null ? bloque[pos] : '' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import * as funciones from "../../utils/funciones.ts";

const valor = ref("");
const estructura = ref<(number | null)[][]>([]); // Array de bloques
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const bloqueBuscado = ref(-1);
const errorMessage = ref("");
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null);
const digitosClave = ref<number | null>(null);

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

function crearEstructura() {
  errorMessage.value = "";
  if (capacidad.value === null || digitosClave.value === null) {
    errorMessage.value = "Por favor completa la capacidad y la cantidad de dígitos.";
    return;
  }
  if (capacidad.value < 10) {
    errorMessage.value = "La capacidad mínima para búsquedas externas es 10.";
    return;
  }
  if (digitosClave.value <= 0) {
    errorMessage.value = "La cantidad de dígitos debe ser un entero positivo.";
    return;
  }

  // Crear estructura de bloques
  const bloques = [];
  for (let i = 0; i < numeroBloques.value; i++) {
    bloques.push(Array(elementosPorBloque.value).fill(null));
  }
  estructura.value = bloques;
  estructuraCreada.value = true;
}

const insertar = () => {
  resultado.value = null;
  
  // Verificar que la estructura esté creada
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura.";
    return;
  }
  
  const res = funciones.validarInputConCeros(valor.value, digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }
  
  const num = parseInt(valor.value);
  
  // Verificar si el elemento ya existe
  const existeResult = buscarElemento(num);
  if (existeResult.encontrado) {
    errorMessage.value = "El elemento ya existe en la estructura.";
    return;
  }
  
  // Insertar en orden
  const insercionExitosa = insertarEnOrden(num);
  if (insercionExitosa) {
    errorMessage.value = `Insertado ${num} correctamente.`;
    valor.value = "";
  }
  // Si no fue exitosa, insertarEnOrden ya estableció el errorMessage
};

function buscarElemento(elemento: number) {
  for (let i = 0; i < estructura.value.length; i++) {
    const bloque = estructura.value[i];
    const ultimoElemento = obtenerUltimoElemento(bloque);
    
    // Si el bloque está vacío o el elemento es menor que el último, buscar en este bloque
    if (ultimoElemento === null || elemento <= ultimoElemento) {
      // Búsqueda lineal dentro del bloque
      for (let j = 0; j < bloque.length; j++) {
        if (bloque[j] === null) break;
        if (bloque[j] === elemento) {
          return { encontrado: true, bloque: i, posicion: j };
        }
      }
      // Si llegamos aquí, el elemento no está en este bloque
      return { encontrado: false, bloque: i, posicion: -1 };
    }
  }
  // Si no se encontró en ningún bloque
  return { encontrado: false, bloque: estructura.value.length - 1, posicion: -1 };
}

function obtenerUltimoElemento(bloque: (number | null)[]): number | null {
  for (let i = bloque.length - 1; i >= 0; i--) {
    if (bloque[i] !== null) {
      return bloque[i];
    }
  }
  return null;
}

function insertarEnOrden(elemento: number): boolean {
  // Verificar si hay espacio total en la estructura
  const totalOcupados = estructura.value.flat().filter(el => el !== null).length;
  const capacidadTotal = capacidad.value!;
  
  if (totalOcupados >= capacidadTotal) {
    errorMessage.value = "La estructura está completamente llena.";
    return false;
  }
  
  // Encontrar el bloque y posición donde debe insertarse en orden global
  let bloqueDestino = 0;
  let posicionDestino = 0;
  let encontrado = false;
  
  for (let i = 0; i < estructura.value.length && !encontrado; i++) {
    const bloque = estructura.value[i];
    
    for (let j = 0; j < bloque.length; j++) {
      if (bloque[j] === null || elemento <= bloque[j]!) {
        bloqueDestino = i;
        posicionDestino = j;
        encontrado = true;
        break;
      }
    }
  }
  
  // Si no se encontró posición, insertar al final
  if (!encontrado) {
    for (let i = estructura.value.length - 1; i >= 0; i--) {
      const bloque = estructura.value[i];
      for (let j = bloque.length - 1; j >= 0; j--) {
        if (bloque[j] !== null) {
          bloqueDestino = i;
          posicionDestino = j + 1;
          if (posicionDestino >= bloque.length) {
            bloqueDestino = i + 1;
            posicionDestino = 0;
          }
          encontrado = true;
          break;
        }
      }
      if (encontrado) break;
    }
  }
  
  // Realizar la inserción con corrimiento
  insertarConCorrimiento(bloqueDestino, posicionDestino, elemento);
  return true;
}

function insertarConCorrimiento(bloqueInicial: number, posicion: number, elemento: number) {
  let elementoAMover = elemento;
  
  for (let i = bloqueInicial; i < estructura.value.length; i++) {
    const bloque = estructura.value[i];
    
    if (i === bloqueInicial && posicion < bloque.length) {
      // En el bloque inicial, insertar en la posición correcta
      let ultimoElemento = null;
      
      // Si hay un último elemento, guardarlo para corrimiento
      if (bloque[bloque.length - 1] !== null) {
        ultimoElemento = bloque[bloque.length - 1];
      }
      
      // Desplazar elementos hacia la derecha desde la posición de inserción
      for (let j = bloque.length - 1; j > posicion; j--) {
        bloque[j] = bloque[j - 1];
      }
      bloque[posicion] = elementoAMover;
      
      // Si había un elemento al final, se convierte en el próximo a mover
      if (ultimoElemento !== null) {
        elementoAMover = ultimoElemento;
      } else {
        // No hay más elementos que mover
        break;
      }
    } else {
      // En bloques siguientes, insertar al inicio y desplazar
      let ultimoElemento = null;
      
      // Guardar el último elemento si existe
      if (bloque[bloque.length - 1] !== null) {
        ultimoElemento = bloque[bloque.length - 1];
      }
      
      // Desplazar todos los elementos hacia la derecha
      for (let j = bloque.length - 1; j > 0; j--) {
        bloque[j] = bloque[j - 1];
      }
      bloque[0] = elementoAMover;
      
      // Si no había último elemento, terminamos
      if (ultimoElemento === null) {
        break;
      }
      elementoAMover = ultimoElemento;
    }
  }
}

function buscar() {
  errorMessage.value = "";
  resultado.value = null;
  bloqueBuscado.value = -1;
  indexBuscado.value = -1;

  const res = funciones.validarInputConCeros(valor.value, digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }

  const num = parseInt(valor.value);
  const resultadoBusqueda = buscarElemento(num);
  
  if (resultadoBusqueda.encontrado) {
    resultado.value = true;
    bloqueBuscado.value = resultadoBusqueda.bloque;
    indexBuscado.value = resultadoBusqueda.posicion;
    errorMessage.value = `Encontrado en Bloque ${resultadoBusqueda.bloque}, Posición ${resultadoBusqueda.posicion}.`;
  } else {
    resultado.value = false;
    errorMessage.value = "Elemento no encontrado.";
  }
}

function eliminar() {
  errorMessage.value = "";
  resultado.value = null;

  const res = funciones.validarInputConCeros(valor.value, digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }

  const num = parseInt(valor.value);
  const resultadoBusqueda = buscarElemento(num);
  
  if (resultadoBusqueda.encontrado) {
    // Eliminar elemento y hacer corrimiento hacia la izquierda
    eliminarConCorrimiento(resultadoBusqueda.bloque, resultadoBusqueda.posicion);
    
    errorMessage.value = `Eliminado del Bloque ${resultadoBusqueda.bloque}.`;
    valor.value = "";
  } else {
    errorMessage.value = "Elemento no encontrado para eliminar.";
  }
}

function eliminarConCorrimiento(bloqueInicial: number, posicion: number) {
  // Eliminar el elemento y hacer corrimiento hacia la izquierda
  for (let i = bloqueInicial; i < estructura.value.length; i++) {
    const bloque = estructura.value[i];
    
    if (i === bloqueInicial) {
      // En el bloque inicial, desplazar desde la posición eliminada
      for (let j = posicion; j < bloque.length - 1; j++) {
        bloque[j] = bloque[j + 1];
      }
      bloque[bloque.length - 1] = null;
      
      // Si el siguiente bloque tiene elementos, traer el primer elemento
      if (i + 1 < estructura.value.length) {
        const siguienteBloque = estructura.value[i + 1];
        if (siguienteBloque[0] !== null) {
          bloque[bloque.length - 1] = siguienteBloque[0];
        }
      }
    } else {
      // En bloques siguientes, desplazar todo hacia la izquierda
      for (let j = 0; j < bloque.length - 1; j++) {
        bloque[j] = bloque[j + 1];
      }
      bloque[bloque.length - 1] = null;
      
      // Si hay un siguiente bloque con elementos, traer el primer elemento
      if (i + 1 < estructura.value.length) {
        const siguienteBloque = estructura.value[i + 1];
        if (siguienteBloque[0] !== null) {
          bloque[bloque.length - 1] = siguienteBloque[0];
        } else {
          // No hay más elementos que mover
          break;
        }
      } else {
        // Es el último bloque, no hay más que mover
        break;
      }
    }
  }
}

// Funciones de exportación e importación
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateExternalLinearImport 
} from "../../utils/importExportUtils.ts";

function exportarEstructura() {
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura para exportar.";
    return;
  }

  const config = {
    capacidad: capacidad.value,
    digitosClave: digitosClave.value,
    elementosPorBloque: elementosPorBloque.value,
    numeroBloques: numeroBloques.value
  };

  const exportData = createExportData('lineal-externa', config, estructura.value);
  const filename = generateExportFileName('lineal-externa');
  
  downloadJsonFile(exportData, filename);
  errorMessage.value = "Estructura externa exportada exitosamente.";
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
      const validation = validateExternalLinearImport(importData);
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
      bloqueBuscado.value = -1;
      
      errorMessage.value = `Estructura externa importada exitosamente. Capacidad: ${capacidad.value}, Dígitos: ${digitosClave.value}`;
      
    } catch (error) {
      errorMessage.value = "Error al leer el archivo. Asegúrate de que sea un JSON válido.";
    }
  };
  
  reader.readAsText(file);
  // Limpiar el input para permitir seleccionar el mismo archivo otra vez
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

.config-row input {
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

.blocks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
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

.element.highlight {
  background: var(--primary);
  border-color: var(--primary);
  transform: scale(1.05);
}

.element.highlight .pos {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary);
  font-weight: bold;
}

.element.highlight .value {
  color: white;
}

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
  }
  
  .config-row input {
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