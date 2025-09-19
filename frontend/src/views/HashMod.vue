<script setup lang="ts">
import { ref, watch } from "vue";
import * as funciones from "../utils/funciones.ts";
import { sondeoLineal, sondeoPorCuadrados, sondeoDobleHash } from "../utils/colisiones.ts";

type EstrategiaColision =
  |  ""
  | "lineal"
  | "cuadratica"
  | "doble-hash"
  | "arreglos"
  | "listas-anidadas"
  | "encadenamiento";

type FuncionHash = 'mod' | 'cuadrado' | 'truncamiento' | 'plegamiento';

const props = defineProps<{ funcion?: string | null }>();

const valor = ref("");
const estructura = ref<(number | null)[]>([]);
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const errorMessage = ref("");
// Nueva estado de configuración de la estructura
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null); // 'rango' ahora es capacidad (n espacios)
const digitosClave = ref<number | null>(null); // tamaño de las claves = número de dígitos
const estrategiaColision = ref<EstrategiaColision>("lineal");
const funcionHash = ref<FuncionHash>('mod');

// inicializar desde prop si viene
if (props.funcion) {
  const lower = String(props.funcion).toLowerCase();
  if (lower === 'mod' || lower === 'cuadrado' || lower === 'truncamiento' || lower === 'plegamiento') {
    funcionHash.value = lower as FuncionHash;
  }
}

watch(
  () => props.funcion,
  (n) => {
    if (!n) return;
    const lower = String(n).toLowerCase();
    if (lower === 'mod' || lower === 'cuadrado' || lower === 'truncamiento' || lower === 'plegamiento') {
      funcionHash.value = lower as FuncionHash;
    }
  }
);


function crearEstructura() {
  errorMessage.value = "";
  if (capacidad.value === null || digitosClave.value === null) {
    errorMessage.value = "Por favor completa la capacidad y la cantidad de dígitos.";
    return;
  }
  // Solo permitir 10, 100, 1000 en funciones hash
  const permitidas = [10, 100, 1000];
  if (!permitidas.includes(capacidad.value)) {
    errorMessage.value = "Capacidad inválida. Solo se permite 10, 100 o 1000 en funciones hash.";
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

function siguienteIndice(base: number, capacidad: number, estrategia: string, intento: number): number {
  if (estrategia === 'lineal') {
    return sondeoLineal(base) % capacidad;
  }
  if (estrategia === 'cuadratica') {
    return sondeoPorCuadrados(base, Math.max(1, intento)) % capacidad;
  }
  if (estrategia === 'doble-hash') {
    return sondeoDobleHash(base) % capacidad;
  }
  // por defecto, lineal
  return sondeoLineal(base) % capacidad;
}

function indiceInicial(num: number): number {
  if (funcionHash.value === 'mod') return funciones.HashModulo(num, capacidad.value!);
  if (funcionHash.value === 'cuadrado') return funciones.HashCuadrado(num, capacidad.value!);
  if (funcionHash.value === 'truncamiento') return funciones.HashTruncamiento(num, capacidad.value!);
  if (funcionHash.value === 'plegamiento') return funciones.HashPlegamiento(num, capacidad.value!);
  return funciones.HashModulo(num, capacidad.value!);
}

const insertar = () => {
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) {
    errorMessage.value = res.msg;
    return;
  }
  
  const cap = capacidad.value!;
  let index = indiceInicial(num);

  // si está vacío, insertar sin colisión
  if (estructura.value[index] === null) {
    estructura.value[index] = num;
    errorMessage.value = `Insertado en la posición ${index + 1}.`;
    valor.value = "";
    return;
  }

  // si el mismo número ya está, reportar duplicado
  if (estructura.value[index] === num) {
    errorMessage.value = `El elemento ya existe en la posición ${index + 1}.`;
    return;
  }

  // resolver colisiones según estrategia seleccionada
  let intentos = 1; // para cuadrática, 1-based
  let pasos = 0;
  const maxPasos = cap; // evitar bucle infinito
  const primeraColision = index; // guardamos dónde ocurrió la primera colisión

  while (pasos < maxPasos) {
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    if (estructura.value[index] === null) {
      estructura.value[index] = num;
      errorMessage.value = `Colisión en la posición ${primeraColision + 1}. Reubicado a ${index + 1} usando "${estrategiaColision.value}".`;
      valor.value = "";
      return;
    }
    if (estructura.value[index] === num) {
      errorMessage.value = `El elemento ya existe (detectado durante resolución) en la posición ${index + 1}.`;
      return;
    }
    intentos++; pasos++;
  }

  errorMessage.value = "Tabla llena o no se encontró posición libre tras resolver colisiones.";
};

const buscar = () => {
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) { errorMessage.value = res.msg; return; }

  const cap = capacidad.value!;
  let index = indiceInicial(num);
  let intentos = 1;
  let pasos = 0;
  const maxPasos = cap;

  while (pasos < maxPasos) {
    const v = estructura.value[index];
    if (v === null) { // hueco vacío: no está
      errorMessage.value = `El elemento no existe (se encontró hueco).`;
      return;
    }
    if (v === num) { resultado.value = true; indexBuscado.value = index+1; errorMessage.value = ""; return; }
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    intentos++; pasos++;
  }
  errorMessage.value = `No se encontró el elemento tras escanear toda la tabla.`;
};

const eliminar = () => {
  resultado.value = null;

  const num = parseInt(valor.value);
  const res = funciones.validarInput(num,digitosClave.value);
  if (res.isError) { errorMessage.value = res.msg; return; }

  const cap = capacidad.value!;
  let index = indiceInicial(num);
  let intentos = 1;
  let pasos = 0;
  const maxPasos = cap;

  while (pasos < maxPasos) {
    const v = estructura.value[index];
    if (v === null) { // hueco vacío: no está
      errorMessage.value = `El elemento no existe (se encontró hueco).`;
      return;
    }
    if (v === num) { estructura.value[index] = null; valor.value = ""; errorMessage.value = ""; return; }
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    intentos++; pasos++;
  }
  errorMessage.value = `No se encontró el elemento tras escanear toda la tabla.`;
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

    <h1>Búsqueda Funcion Hash ({{ funcionHash }})</h1>
    <!-- Controles de creación de estructura (se ocultan cuando ya creada) -->
    <div class="create-structure" v-if="!estructuraCreada">
      <h3>Crear estructura</h3>
      <div>
        <!-- Reemplazo: capacidad por dropdown de Pico CSS -->
        <details class="dropdown">
          <summary>Capacidad: <strong>{{ capacidad ?? 'Selecciona' }}</strong></summary>
          <ul>
            <li><a href="#" @click.prevent="capacidad = 10">10</a></li>
            <li><a href="#" @click.prevent="capacidad = 100">100</a></li>
            <li><a href="#" @click.prevent="capacidad = 1000">1000</a></li>
          </ul>
        </details>
        
        <input v-model.number="digitosClave" type="number" placeholder="Cantidad de dígitos por clave" @input="validateInput" />
        
        <details class="dropdown">
          <summary>Método de colisión: <strong>{{ estrategiaColision }}</strong></summary>
          <ul>
            <li><a href="#" @click.prevent="estrategiaColision = 'lineal'">Lineal</a></li>
            <li><a href="#" @click.prevent="estrategiaColision = 'cuadratica'">Cuadrática</a></li>
            <li><a href="#" @click.prevent="estrategiaColision = 'doble-hash'">Doble función hash</a></li>
            <li><a href="#" @click.prevent="estrategiaColision = 'listas-anidadas'">Listas anidadas</a></li>
            <li><a href="#" @click.prevent="estrategiaColision = 'encadenamiento'">Encadenamiento</a></li>
          </ul>
        </details>

        <button @click="crearEstructura">Crear estructura</button>
      </div>
    </div>

    <!-- Controles de operación (solo visibles si estructura creada) -->
    <div v-if="estructuraCreada">
      <p>
        Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}
        <br />
        Método de colisión seleccionado: <strong>{{ estrategiaColision }}</strong>
      </p>
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