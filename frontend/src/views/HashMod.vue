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

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }
  const index = funciones.HashModulo(num, capacidad.value!);
  if(estructura.value[index] !== null){
   if(estructura.value[index] == num){
    errorMessage.value = "El elemento ya existe en la estructura.";
    return;
   } else {
    errorMessage.value = "Colisión detectada.";
    return;
   }
  }
  estructura.value[index] = num;

  valor.value = "";
  errorMessage.value = "";
};

const buscar = () => {
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }
  const index = funciones.HashModulo(num, capacidad.value!);
  if(estructura.value[index] === num){
    resultado.value = true;
    indexBuscado.value = index;
  } else {
    errorMessage.value = "El elemento esta en colision o no existe.";
    return;
  }

  valor.value = "";
  errorMessage.value = "";
};

const eliminar = () => {
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }

  const index = funciones.HashModulo(num, capacidad.value!);
  if(estructura.value[index] === num){
    estructura.value[index] = null;
  } else {
    errorMessage.value = "El elemento esta en colision o no existe.";
    return;
  }
  valor.value = "";
  errorMessage.value = "";
};

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

    <h1>Búsqueda Funcion Hash Modulo</h1>
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
      <div v-for="(slot, i) in estructura" :key="i" :class="['slot', slot !== null ? 'occupied' : 'empty']">
        <div class="pos">{{ i + 1 }}</div>
        <div class="value">{{ slot !== null ? slot : '' }}</div>
      </div>
    </div>


</template>