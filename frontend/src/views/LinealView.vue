<script setup>
import { ref } from "vue";

const valor = ref("");
const estructura = ref([]);
const resultado = ref(null);
const errorMessage = ref("");

function isValidNumber(value) {
  // Verificar si es un número válido (entero o decimal)
  return !isNaN(value) && !isNaN(parseFloat(value)) && value.trim() !== "";
}

function insertar() {
  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor";
    return;
  }

  if (!isValidNumber(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números válidos";
    return;
  }

  const numero = parseFloat(valor.value);
  
  if (estructura.value.includes(numero)) {
    errorMessage.value = "El número ya existe en la estructura";
    return;
  }

  estructura.value.push(numero);
  resultado.value = null;
  errorMessage.value = "";
  valor.value = "";
}

function buscar() {
  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor para buscar";
    return;
  }

  if (!isValidNumber(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números válidos";
    return;
  }

  const numero = parseFloat(valor.value);
  resultado.value = estructura.value.includes(numero);
  errorMessage.value = "";
}

function eliminar() {
  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor para eliminar";
    return;
  }

  if (!isValidNumber(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números válidos";
    return;
  }

  const numero = parseFloat(valor.value);
  const index = estructura.value.indexOf(numero);
  
  if (index !== -1) {
    estructura.value.splice(index, 1);
    resultado.value = null;
    errorMessage.value = "";
  } else {
    resultado.value = false;
    errorMessage.value = "";
  }
  
  valor.value = "";
}

// Función para validar entrada en tiempo real
function validateInput(event) {
  const value = event.target.value;
  // Permitir números, punto decimal y signo negativo
  const validChars = /^-?\d*\.?\d*$/;
  
  if (!validChars.test(value)) {
    event.target.value = value.slice(0, -1);
    errorMessage.value = "Solo se permiten números";
  } else {
    errorMessage.value = "";
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Botón para volver al inicio -->
    <div class="mb-4">
      <router-link to="/" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
        ← Volver al inicio
      </router-link>
    </div>

    <h1>Búsqueda Interna - Lineal</h1>
    <!-- Controles -->
    <div>
      <input
        v-model="valor"
        type="number"
        step="any"
        placeholder="Número a insertar/buscar/eliminar"
        class="border px-2 py-1 rounded"
        @input="validateInput"
      />
      <button @click="insertar">
        Insertar
      </button>
      <button @click="buscar">
        Buscar
      </button>
      <button @click="eliminar">
        Eliminar
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorMessage" class="mb-4">
      <p class="text-red-400">⚠️ {{ errorMessage }}</p>
    </div>

    <!-- Resultado -->
    <div v-if="resultado !== null" class="mb-4">
      <p v-if="resultado" class="text-green-400">✅ Elemento encontrado</p>
      <p v-else class="text-red-400">❌ Elemento no encontrado</p>
    </div>

    <!-- Visualización de estructura -->
    <h2 class="text-lg font-semibold">Estructura actual:</h2>
    <ul class="flex gap-2 mt-2">
      <li
        v-for="(item, index) in estructura"
        :key="index"
        class="bg-gray-700 px-3 py-1 rounded"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>


