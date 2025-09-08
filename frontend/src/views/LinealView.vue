<script setup lang="ts">
import { ref } from "vue";
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
  if (valor.value === "") {
    errorMessage.value = "Ingresa un número para insertar.";
    return;
  }

  const num = parseInt(valor.value);
  if (isNaN(num)) {
    errorMessage.value = "Ingresa un número válido.";
    return;
  }
  if (!funciones.validarDigitosClave(num, digitosClave.value)) {
    errorMessage.value = `La clave debe tener exactamente ${digitosClave.value} dígitos.`;
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

  valor.value = "";
  errorMessage.value = "";
};


function buscar() {

  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor para buscar";
    return;
  }

  const numero = parseInt(valor.value);
  if (isNaN(numero)) {
    errorMessage.value = "Ingresa un número válido.";
    return;
  }

  // Validar cantidad de dígitos en búsqueda
  if (funciones.validarDigitosClave(numero, digitosClave.value) === false) {
    errorMessage.value = `La clave debe tener exactamente ${digitosClave.value} dígitos.`;
    return;
  }

  const index = funciones.busquedaLineal(estructura.value, numero);
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
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear la estructura.";
    return;
  }

  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor para eliminar";
    return;
  }

  const num = parseInt(valor.value);
  if (isNaN(num)) {
    errorMessage.value = "Ingresa un número válido.";
    return;
  }

  // Validar cantidad de dígitos en eliminación
  if (funciones.validarDigitosClave(num, digitosClave.value) === false) {
    errorMessage.value = `La clave debe tener exactamente ${digitosClave.value} dígitos.`;
    return;
  }

  const index = funciones.busquedaLineal(estructura.value, num);

  if (index !== -1) {
    estructura.value[index] = null; // liberar slot
    resultado.value = null;
    errorMessage.value = "";
  } else {
    resultado.value = false;
    errorMessage.value = "";
  }
  
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


</script>

<template>

    <!-- Botón para volver al inicio -->
    <div class="btn-back">
      <router-link to="/" class="outline contrast">
         Volver al inicio
      </router-link>
    </div>

    <h1>Búsqueda Interna - Lineal</h1>
    <!-- Controles de creación de estructura (se ocultan cuando ya creada) -->
    <div class="create-structure" v-if="!estructuraCreada">
      <h3>Crear estructura</h3>
      <div>
        <input v-model.number="capacidad" type="number" placeholder="Capacidad (n espacios)" @input="validateInput" />
        <input v-model.number="digitosClave" type="number" placeholder="Cantidad de dígitos por clave" @input="validateInput" />
        <button @click="crearEstructura">Crear estructura</button>
      </div>
    </div>

    <!-- Controles de operación (solo visibles si estructura creada) -->
    <div v-if="estructuraCreada">
      <p>Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}</p>
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
      <p v-else>Elemento no encontrado</p>
    </div>

    <!-- Visualización de estructura -->
    <h2>Estructura actual:</h2>
    <div class="structure-grid">
      <div v-for="(slot, i) in estructura" :key="i" :class="['slot', slot !== null ? 'occupied' : 'empty']">
        <div class="pos">{{ i + 1 }}</div>
        <div class="value">{{ slot !== null ? slot : '' }}</div>
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

