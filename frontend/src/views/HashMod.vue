<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
// Segunda estructura para la estrategia de arreglos/listas anidadas
const estructuraSecundaria = ref<(number | null)[]>([]);
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const errorMessage = ref("");
// Nueva estado de configuración de la estructura
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null); // 'rango' ahora es capacidad (n espacios)
const digitosClave = ref<number | null>(null); // tamaño de las claves = número de dígitos
const estrategiaColision = ref<EstrategiaColision>("lineal");
const funcionHash = ref<FuncionHash>('mod');
// Mostrar la estructura anidada solo cuando se use al menos una vez
const seUsoEstructuraSecundaria = ref(false);

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
  // Precrear estructura secundaria (se oculta hasta usarla)
  estructuraSecundaria.value = Array(capacidad.value).fill(null);
  seUsoEstructuraSecundaria.value = false;
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

  // Estrategia especial: listas/arreglos anidadas (segunda estructura paralela)
  if (estrategiaColision.value === 'listas-anidadas' || estrategiaColision.value === 'arreglos') {
    // si está vacío en primaria, insertar sin colisión
    if (estructura.value[index] === null) {
      estructura.value[index] = num;
      errorMessage.value = `Insertado en la posición ${index + 1}.`;
      valor.value = "";
      return;
    }
    // duplicado en primaria
    if (estructura.value[index] === num) {
      errorMessage.value = `El elemento ya existe en la posición ${index + 1}.`;
      return;
    }
    // colisión: usar secundaria en el mismo índice
    if (estructuraSecundaria.value[index] === null) {
      estructuraSecundaria.value[index] = num;
      seUsoEstructuraSecundaria.value = true;
      errorMessage.value = `Colisión en ${index + 1}. Insertado en estructura anidada (columna 2) posición ${index + 1}.`;
      valor.value = "";
      return;
    }
    if (estructuraSecundaria.value[index] === num) {
      errorMessage.value = `El elemento ya existe en la estructura anidada en la posición ${index + 1}.`;
      return;
    }
    // Sin espacio en el índice (primaria y secundaria ocupadas)
    errorMessage.value = `Colisión múltiple en índice ${index + 1}: la estructura anidada está llena en ese índice.`;
    return;
  }

  // si está vacío, insertar sin colisión (otras estrategias)
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
  // Estrategia listas/arreglos anidadas: buscar en primaria y luego secundaria del mismo índice
  if (estrategiaColision.value === 'listas-anidadas' || estrategiaColision.value === 'arreglos') {
    const vPrim = estructura.value[index];
    if (vPrim === num) {
      resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = ""; return;
    }
    const vSec = estructuraSecundaria.value[index];
    if (vSec === num) {
      resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = "(Encontrado en estructura anidada)"; return;
    }
    errorMessage.value = `El elemento no existe en primaria ni en estructura anidada para el índice ${index + 1}.`;
    return;
  }
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
  // Estrategia listas/arreglos anidadas: eliminar de primaria o secundaria del mismo índice
  if (estrategiaColision.value === 'listas-anidadas' || estrategiaColision.value === 'arreglos') {
    if (estructura.value[index] === num) {
      estructura.value[index] = null; valor.value = ""; errorMessage.value = `Eliminado de la posición ${index + 1}.`; return;
    }
    if (estructuraSecundaria.value[index] === num) {
      estructuraSecundaria.value[index] = null; valor.value = ""; errorMessage.value = `Eliminado de la estructura anidada en posición ${index + 1}.`; return;
    }
    errorMessage.value = `El elemento no existe en primaria ni en estructura anidada en índice ${index + 1}.`;
    return;
  }
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

const displayIndices = computed<number[]>(() => {
  if (!estructuraCreada.value || capacidad.value == null) return [];
  const n = estructura.value.length;
  if (n <= 30) return Array.from({ length: n }, (_, i) => i); // para capacidades pequeñas, mostrar todo
  if (n === 0) return [];
  // Para capacidades grandes, mostrar primero, último y ocupados. Si hay estructura secundaria, incluir sus ocupados también
  const occupiedPrim = estructura.value
    .map((v, i) => (v !== null ? i : -1))
    .filter((i) => i >= 0);
  const occupiedSec = (estrategiaColision.value === 'listas-anidadas' || estrategiaColision.value === 'arreglos')
    ? estructuraSecundaria.value.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0)
    : [];
  const set = new Set<number>();
  set.add(0);
  set.add(n - 1);
  for (const i of occupiedPrim) set.add(i);
  for (const i of occupiedSec) set.add(i);
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
            <li><a href="#" @click.prevent="estrategiaColision = 'arreglos'">Arreglos anidados</a></li>
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
    <div class="structure-grids" :class="{ dual: (estrategiaColision === 'listas-anidadas' || estrategiaColision === 'arreglos') && seUsoEstructuraSecundaria }">
      <!-- Grilla primaria -->
      <div class="structure-grid">
        <div
          v-for="i in displayIndices"
          :key="'prim-'+i"
          :class="['slot', estructura[i] !== null ? 'occupied' : 'empty']"
        >
          <div class="pos">{{ i + 1 }}</div>
          <div class="value">{{ estructura[i] !== null ? estructura[i] : '' }}</div>
        </div>
      </div>
      <!-- Grilla secundaria: solo si se usó alguna vez -->
      <div v-if="(estrategiaColision === 'listas-anidadas' || estrategiaColision === 'arreglos') && seUsoEstructuraSecundaria" class="structure-grid secondary">
        <div
          v-for="i in displayIndices"
          :key="'sec-'+i"
          :class="['slot', estructuraSecundaria[i] !== null ? 'occupied' : 'empty']"
        >
          <div class="pos">{{ i + 1 }}</div>
          <div class="value">{{ estructuraSecundaria[i] !== null ? estructuraSecundaria[i] : '' }}</div>
        </div>
      </div>
    </div>


</template>

<style scoped>
.structure-grids {
  display: grid;
  gap: 16px;
}
.structure-grids.dual {
  grid-template-columns: 1fr 1fr;
  align-items: start;
}
.structure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 1rem;
}
.structure-grid.secondary .slot {
  border-color: #86efac; /* verde suave */
  background: linear-gradient(180deg, #f0fff4 0%, #ffffff 100%);
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