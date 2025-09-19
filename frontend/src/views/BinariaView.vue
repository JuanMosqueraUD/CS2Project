<script lang="ts" setup>
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
    if(funciones.busquedaBinaria(estructura.value, num) !== -1){
      errorMessage.value = "El elemento ya existe en la estructura.";
      return;
    }
    estructura.value[firstEmpty] = num;
  }
  estructura.value = funciones.ordenarLista(estructura.value);
  const finalIdx = funciones.busquedaBinaria(estructura.value, num);
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

  const index = funciones.busquedaBinaria(estructura.value, num);
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

  const index = funciones.busquedaBinaria(estructura.value, num);

  if (index !== -1) {
    estructura.value[index] = null; // liberar slot
    estructura.value = funciones.ordenarLista(estructura.value);
    resultado.value = null;
    errorMessage.value = `Eliminado de la posición ${index + 1}.`;
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

    <h1>Búsqueda Binaria</h1>
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