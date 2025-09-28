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
const buckets = ref<number[][]>([]); // encadenamiento (chips)
// Nueva representación: capas de arreglos anidados, creadas bajo demanda
const arreglosLayers = ref<Array<(number | null)[]>>([]);
const resultado = ref(null as null | boolean);
const indexBuscado = ref(-1);
const errorMessage = ref("");
const estructuraCreada = ref(false);
const capacidad = ref<number | null>(null);
const digitosClave = ref<number | null>(null);
const estrategiaColision = ref<EstrategiaColision>("lineal");
const funcionHash = ref<FuncionHash>('mod');
const estructuraAnidadaVisible = ref(false); // solo mostrar la segunda estructura tras la primera colisión

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
  buckets.value = Array(capacidad.value).fill(0).map(() => []);
  // Sin estructuras anidadas al inicio; se crean al ocurrir colisiones
  arreglosLayers.value = [];
  estructuraAnidadaVisible.value = false;
  estructuraCreada.value = true;
}

function indiceInicial(num: number): number {
  if (funcionHash.value === 'mod') return funciones.HashModulo(num, capacidad.value!);
  if (funcionHash.value === 'cuadrado') return funciones.HashCuadrado(num, capacidad.value!);
  if (funcionHash.value === 'truncamiento') return funciones.HashTruncamiento(num, capacidad.value!);
  if (funcionHash.value === 'plegamiento') return funciones.HashPlegamiento(num, capacidad.value!);
  return funciones.HashModulo(num, capacidad.value!);
}

function siguienteIndice(base: number, cap: number, estrategia: string, intento: number): number {
  if (estrategia === 'lineal') return sondeoLineal(base) % cap;
  if (estrategia === 'cuadratica') return sondeoPorCuadrados(base, Math.max(1, intento)) % cap;
  if (estrategia === 'doble-hash') return sondeoDobleHash(base) % cap;
  return sondeoLineal(base) % cap;
}

const insertar = () => {
  resultado.value = null;
  const num = parseInt(valor.value);
  const res = funciones.validarInput(num, digitosClave.value);
  if (res.isError) { errorMessage.value = res.msg; return; }

  const cap = capacidad.value!;
  let index = indiceInicial(num);

  if (estrategiaColision.value === 'encadenamiento') {
    const prim = estructura.value[index];
    if (prim === null) { estructura.value[index] = num; errorMessage.value = `Insertado en la posición ${index + 1}.`; valor.value = ""; return; }
    if (prim === num) { errorMessage.value = `El elemento ya existe en la posición ${index + 1}.`; return; }
    const bucket = buckets.value[index];
    if (bucket.includes(num)) { errorMessage.value = `El elemento ya existe en el encadenamiento del índice ${index + 1}.`; return; }
    bucket.push(num);
    errorMessage.value = `Colisión en ${index + 1}. Insertado en encadenamiento (tamaño ${bucket.length}).`;
    valor.value = ""; return;
  }

  if (estrategiaColision.value === 'arreglos' || estrategiaColision.value === 'listas-anidadas') {
    const prim = estructura.value[index];
    if (prim === null) { estructura.value[index] = num; errorMessage.value = `Insertado en la posición ${index + 1}.`; valor.value = ""; return; }
    if (prim === num) { errorMessage.value = `El elemento ya existe en la posición ${index + 1}.`; return; }
    // Evitar duplicados en capas
    for (const layer of arreglosLayers.value) {
      if (layer[index] === num) { errorMessage.value = `El elemento ya existe en una estructura anidada en la posición ${index + 1}.`; return; }
    }
    // Buscar primera capa con hueco en este índice
    let targetLayer = arreglosLayers.value.find(l => l[index] === null);
    if (!targetLayer) {
      // Crear nueva capa completa (misma capacidad)
      const newLayer = Array(cap).fill(null) as (number | null)[];
      arreglosLayers.value.push(newLayer);
      targetLayer = newLayer;
    }
    targetLayer[index] = num;
    errorMessage.value = `Colisión en ${index + 1}. Insertado en estructura anidada #${arreglosLayers.value.indexOf(targetLayer) + 1}.`;
    valor.value = ""; return;
  }

  // Otras estrategias de sondeo (lineal/cuadrática/doble hash)
  if (estructura.value[index] === null) { estructura.value[index] = num; errorMessage.value = `Insertado en la posición ${index + 1}.`; valor.value = ""; return; }
  if (estructura.value[index] === num) { errorMessage.value = `El elemento ya existe en la posición ${index + 1}.`; return; }

  let intentos = 1; let pasos = 0; const maxPasos = cap; const primeraColision = index;
  while (pasos < maxPasos) {
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    if (estructura.value[index] === null) { estructura.value[index] = num; errorMessage.value = `Colisión en la posición ${primeraColision + 1}. Reubicado a ${index + 1} usando "${estrategiaColision.value}".`; valor.value = ""; return; }
    if (estructura.value[index] === num) { errorMessage.value = `El elemento ya existe (detectado durante resolución) en la posición ${index + 1}.`; return; }
    intentos++; pasos++;
  }
  errorMessage.value = "Tabla llena o no se encontró posición libre tras resolver colisiones.";
};

const buscar = () => {
  resultado.value = null;
  const num = parseInt(valor.value);
  const res = funciones.validarInput(num, digitosClave.value);
  if (res.isError) { errorMessage.value = res.msg; return; }

  const cap = capacidad.value!;
  let index = indiceInicial(num);

  if (estrategiaColision.value === 'encadenamiento') {
    if (estructura.value[index] === num) { resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = ""; return; }
    const bucket = buckets.value[index]; const pos = bucket.indexOf(num);
    if (pos !== -1) { resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = `(Encontrado en encadenamiento, pos ${pos + 1} del bucket)`; return; }
    errorMessage.value = `El elemento no existe en el índice ${index + 1} (ni primaria ni encadenamiento).`; return;
  }

  if (estrategiaColision.value === 'arreglos' || estrategiaColision.value === 'listas-anidadas') {
    if (estructura.value[index] === num) { resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = ""; return; }
    for (let li = 0; li < arreglosLayers.value.length; li++) {
      const layer = arreglosLayers.value[li];
      if (layer[index] === num) { resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = `(Encontrado en estructura anidada #${li + 1})`; return; }
    }
    errorMessage.value = `El elemento no existe en el índice ${index + 1} (ni primaria ni estructuras anidadas).`;
    return;
  }

  let intentos = 1; let pasos = 0; const maxPasos = cap;
  while (pasos < maxPasos) {
    const v = estructura.value[index];
    if (v === null) { errorMessage.value = `El elemento no existe (se encontró hueco).`; return; }
    if (v === num) { resultado.value = true; indexBuscado.value = index + 1; errorMessage.value = ""; return; }
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    intentos++; pasos++;
  }
  errorMessage.value = `No se encontró el elemento tras escanear toda la tabla.`;
};

const eliminar = () => {
  resultado.value = null;
  const num = parseInt(valor.value);
  const res = funciones.validarInput(num, digitosClave.value);
  if (res.isError) { errorMessage.value = res.msg; return; }

  const cap = capacidad.value!;
  let index = indiceInicial(num);

  if (estrategiaColision.value === 'encadenamiento') {
    if (estructura.value[index] === num) {
      const bucket = buckets.value[index];
      if (bucket.length > 0) { estructura.value[index] = bucket.shift()!; errorMessage.value = `Eliminado de la primaria en ${index + 1}. Promovido primer encadenado.`; }
      else { estructura.value[index] = null; errorMessage.value = `Eliminado de la posición ${index + 1}.`; }
      valor.value = ""; return;
    }
    const bucket = buckets.value[index]; const pos = bucket.indexOf(num);
    if (pos !== -1) { bucket.splice(pos, 1); errorMessage.value = `Eliminado del encadenamiento en índice ${index + 1} (posición ${pos + 1} del bucket).`; valor.value = ""; return; }
    errorMessage.value = `El elemento no existe en el índice ${index + 1} (ni primaria ni encadenamiento).`; return;
  }

  if (estrategiaColision.value === 'arreglos' || estrategiaColision.value === 'listas-anidadas') {
    if (estructura.value[index] === num) {
      // Promover desde la primera capa que tenga algo en este índice
      let promoted = false;
      for (const layer of arreglosLayers.value) {
        if (layer[index] !== null) { estructura.value[index] = layer[index]; layer[index] = null; promoted = true; break; }
      }
      if (!promoted) { estructura.value[index] = null; }
      errorMessage.value = `Eliminado de la posición ${index + 1}.`;
      cleanupEmptyLayers();
      valor.value = ""; return;
    }
    for (const layer of arreglosLayers.value) {
      if (layer[index] === num) { layer[index] = null; errorMessage.value = `Eliminado de estructura anidada en índice ${index + 1}.`; cleanupEmptyLayers(); valor.value = ""; return; }
    }
    errorMessage.value = `El elemento no existe en el índice ${index + 1} (ni primaria ni estructuras anidadas).`; return;
  }

  let intentos = 1; let pasos = 0; const maxPasos = cap;
  while (pasos < maxPasos) {
    const v = estructura.value[index];
    if (v === null) { errorMessage.value = `El elemento no existe (se encontró hueco).`; return; }
    if (v === num) { estructura.value[index] = null; valor.value = ""; errorMessage.value = ""; return; }
    index = siguienteIndice(index, cap, estrategiaColision.value, intentos);
    intentos++; pasos++;
  }
  errorMessage.value = `No se encontró el elemento tras escanear toda la tabla.`;
};

function cleanupEmptyLayers() {
  // Remover capas vacías al final (sin ningún valor)
  while (arreglosLayers.value.length > 0) {
    const last = arreglosLayers.value[arreglosLayers.value.length - 1];
    if (last.every(v => v === null)) arreglosLayers.value.pop(); else break;
  }
}

// Función para validar entrada en tiempo real
function validateInput(event: Event) {
  const target = event.target as HTMLInputElement; const value = target.value;
  // Permitir solo números enteros positivos (incluye 0)
  const validChars = /^\d*$/;
  
  if (!validChars.test(value)) { target.value = value.slice(0, -1); errorMessage.value = "Solo se permiten números enteros positivos"; }
  else { errorMessage.value = ""; }
}

const anyNestedLayers = computed(() => arreglosLayers.value.some(layer => layer.some(v => v !== null)));

// Funciones de exportación e importación
import { 
  createExportData, 
  generateExportFileName, 
  downloadJsonFile, 
  validateHashImport 
} from "../utils/importExportUtils.ts";

function exportarEstructura() {
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura para exportar.";
    return;
  }

  const config = {
    capacidad: capacidad.value,
    digitosClave: digitosClave.value,
    funcionHash: funcionHash.value,
    estrategiaColision: estrategiaColision.value
  };

  const data = {
    estructura: estructura.value,
    buckets: buckets.value,
    arreglosLayers: arreglosLayers.value
  };

  const exportData = createExportData('hash', config, data);
  const filename = generateExportFileName('hash', config);
  
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
      const validation = validateHashImport(importData);
      if (!validation.isValid) {
        errorMessage.value = validation.error!;
        return;
      }
      
      // Importar exitosamente
      capacidad.value = importData.config.capacidad;
      digitosClave.value = importData.config.digitosClave;
      funcionHash.value = importData.config.funcionHash;
      estrategiaColision.value = importData.config.estrategiaColision;
      estructura.value = importData.data.estructura;
      buckets.value = importData.data.buckets;
      arreglosLayers.value = importData.data.arreglosLayers;
      estructuraCreada.value = true;
      resultado.value = null;
      indexBuscado.value = -1;
      
      errorMessage.value = `Estructura hash importada exitosamente. Función: ${funcionHash.value}, Estrategia: ${estrategiaColision.value}`;
      
    } catch (error) {
      errorMessage.value = "Error al leer el archivo. Asegúrate de que sea un JSON válido.";
    }
  };
  
  reader.readAsText(file);
  // Limpiar el input para permitir seleccionar el mismo archivo otra vez
  target.value = '';
}

const displayIndices = computed<number[]>(() => {
  if (!estructuraCreada.value || capacidad.value == null) return [];
  const n = estructura.value.length;
  if (n <= 30) return Array.from({ length: n }, (_, i) => i);
  if (n === 0) return [];
  const occupiedPrim = estructura.value.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0);
  const occupiedEnc = (estrategiaColision.value === 'encadenamiento') ? buckets.value.map((b, i) => (b.length ? i : -1)).filter((i) => i >= 0) : [];
  const occupiedLayers = (estrategiaColision.value === 'arreglos' || estrategiaColision.value === 'listas-anidadas')
    ? arreglosLayers.value.reduce<number[]>((acc, layer) => {
        layer.forEach((v, i) => { if (v !== null) acc.push(i); });
        return acc;
      }, [])
    : [];
  const set = new Set<number>(); set.add(0); set.add(n - 1);
  for (const i of occupiedPrim) set.add(i);
  for (const i of occupiedEnc) set.add(i);
  for (const i of occupiedLayers) set.add(i);
  return Array.from(set).sort((a, b) => a - b);
});
</script>

<template>
  <!-- Botón para volver al inicio -->
  <div class="btn-back">
    <router-link to="/" class="outline contrast">Volver al inicio</router-link>
  </div>

  <h1>Búsqueda Funcion Hash ({{ funcionHash }})</h1>

  <div class="create-structure" v-if="!estructuraCreada">
    <h3>Crear estructura</h3>
    <div>
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
    
    <div class="import-option">
      <p><strong>O importar estructura existente:</strong></p>
      <label for="import-file-initial" class="secondary file-upload-btn">📥 Importar desde archivo</label>
      <input id="import-file-initial" type="file" accept=".json" @change="importarEstructura" style="display: none;">
      <p class="import-warning">⚠️ Al importar se mantendrán la función hash, estrategia de colisión y capacidad del archivo.</p>
    </div>
  </div>

  <div v-if="estructuraCreada">
    <p>
      Estructura creada. Capacidad: {{ capacidad }}, Dígitos por clave: {{ digitosClave }}<br />
      Función hash: <strong>{{ funcionHash }}</strong>, Método de colisión: <strong>{{ estrategiaColision }}</strong>
    </p>
    
    <!-- Controles de exportación e importación -->
    <div class="import-export-controls">
      <button @click="exportarEstructura" class="secondary">📤 Exportar Estructura</button>
      <label for="import-file" class="secondary file-upload-btn">📥 Importar Estructura</label>
      <input id="import-file" type="file" accept=".json" @change="importarEstructura" style="display: none;">
    </div>
    
    <input v-model="valor" type="number" min="0" step="1" placeholder="Número entero positivo" @input="validateInput" />
    <div id="general-nav">
      <button @click="insertar" class="outline contrast">Insertar</button>
      <button @click="buscar" class="outline contrast">Buscar</button>
      <button @click="eliminar" class="outline contrast">Eliminar</button>
    </div>
  </div>

  <div v-if="errorMessage"><p>{{ errorMessage }}</p></div>

  <div v-if="resultado !== null"><p v-if="resultado">Elemento encontrado en la posicion {{ indexBuscado }}</p></div>

  <h2>Estructura actual:</h2>

  <!-- Arreglos/listas anidadas: múltiples estructuras paralelas creadas a demanda -->
  <div v-if="(estrategiaColision === 'arreglos' || estrategiaColision === 'listas-anidadas') && anyNestedLayers" class="structure-grids multi" :style="{ gridTemplateColumns: `repeat(${1 + arreglosLayers.length}, 1fr)` }">
    <!-- Primaria -->
    <div class="structure-grid">
      <div v-for="i in displayIndices" :key="'prim-'+i" :class="['slot', estructura[i] !== null ? 'occupied' : 'empty']">
        <div class="pos">{{ i + 1 }}</div>
        <div class="value">{{ estructura[i] !== null ? estructura[i] : '' }}</div>
      </div>
    </div>
    <!-- Capas anidadas -->
    <div v-for="(layer, li) in arreglosLayers" :key="'layer-'+li" class="structure-grid secondary">
      <div class="grid-header">Estructura anidada #{{ li + 1 }}</div>
      <div v-for="i in displayIndices" :key="'layer-'+li+'-'+i" :class="['slot', layer[i] !== null ? 'occupied' : 'empty']">
        <div class="pos">{{ i + 1 }}</div>
        <div class="value">{{ layer[i] !== null ? layer[i] : '' }}</div>
      </div>
    </div>
  </div>

  <!-- Si aún no hay capas anidadas, o en otras estrategias: estructura única -->
  <div v-else class="structure-grid">
    <div v-for="i in displayIndices" :key="'single-'+i" :class="['slot', estructura[i] !== null ? 'occupied' : 'empty']">
      <div class="pos">{{ i + 1 }}</div>
      <div class="value">{{ estructura[i] !== null ? estructura[i] : '' }}</div>
      <!-- Encadenamiento: chips -->
      <div v-if="estrategiaColision === 'encadenamiento' && buckets[i] && buckets[i].length" class="bucket">
        <div class="bucket-title">→ Encadenados:</div>
        <div class="bucket-items">
          <span v-for="(b, bi) in buckets[i]" :key="'enc-'+i+'-'+bi" class="chip">{{ b }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.import-warning {
  font-size: 0.85rem;
  color: #f59e0b;
  margin-top: 0.5rem;
  font-style: italic;
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

.structure-grids.multi { display: grid; gap: 16px; }
.structure-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; margin-top: 1rem; }
.structure-grid.secondary .slot { border-color: #86efac; background: linear-gradient(180deg, #f0fff4 0%, #ffffff 100%); }
.grid-header { grid-column: 1 / -1; font-size: 0.85rem; font-weight: 600; color: #065f46; margin-bottom: 4px; }

.slot {
  position: relative;
  border: 1px solid #e2e8f0;
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
  color: #0f172a;
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
  color: #94a3b8;
}

/* chips encadenamiento se mantienen */
.bucket { margin-top: 8px; text-align: left; }
.bucket-title { font-size: 0.75rem; color: #475569; margin-bottom: 4px; }
.bucket-items { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #eef2ff; border: 1px solid #c7d2fe; font-size: 0.8rem; color: #1e293b; }
</style>