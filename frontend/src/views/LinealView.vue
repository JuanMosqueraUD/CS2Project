<script setup>
import { ref } from "vue";

const valor = ref("");
const estructura = ref([]);
const resultado = ref(null);
const errorMessage = ref("");

function isValidPositiveInteger(value) {
  // Verificar si es un número entero positivo
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && num.toString() === value.trim();
}

function insertar() {
  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor";
    return;
  }

  if (!isValidPositiveInteger(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números enteros positivos";
    return;
  }

  const numero = parseInt(valor.value);
  
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

  if (!isValidPositiveInteger(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números enteros positivos";
    return;
  }

  const numero = parseInt(valor.value);
  resultado.value = estructura.value.includes(numero);
  errorMessage.value = "";
}

function eliminar() {
  if (!valor.value) {
    errorMessage.value = "Por favor ingresa un valor para eliminar";
    return;
  }

  if (!isValidPositiveInteger(valor.value)) {
    errorMessage.value = "Por favor ingresa solo números enteros positivos";
    return;
  }

  const numero = parseInt(valor.value);
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
  // Permitir solo números enteros positivos
  const validChars = /^\d*$/;
  
  if (!validChars.test(value)) {
    event.target.value = value.slice(0, -1);
    errorMessage.value = "Solo se permiten números enteros positivos";
  } else {
    errorMessage.value = "";
  }
}
</script>

<template>

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
        min="1"
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
      <p v-if="resultado">✅ Elemento encontrado</p>
      <p v-else>❌ Elemento no encontrado</p>
    </div>

    <!-- Visualización de estructura -->
    <h2 >Estructura actual:</h2>
    <ul>
      <li
        v-for="(item, index) in estructura":key="index">
        {{ item }}
      </li>
    </ul>

</template>


<style>
#general-nav {
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

