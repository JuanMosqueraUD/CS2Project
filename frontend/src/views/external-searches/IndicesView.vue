<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Índices</h1>

    <!-- Crear estructura -->
    <div v-if="!estructuraCreada" class="create-structure">
      <h3>Crear Estructura de Índices</h3>
      
      <div class="config-row">
        <div>
          <label>Tipo de Índice:</label>
          <select v-model="config.tipoIndice">
            <option value="primario">Primario</option>
            <option value="secundario">Secundario</option>
          </select>
        </div>
        
        <div>
          <label>Estructura:</label>
          <select v-model="config.estructura">
            <option value="simple">Simple</option>
            <option value="multinivel">Multinivel</option>
          </select>
        </div>
      </div>

      <div class="config-row">
        <div>
          <label>Longitud del Registro (Rl - bytes):</label>
          <input 
            type="number" 
            v-model.number="config.Rl" 
            min="1"
            placeholder="Ej: 100"
          />
        </div>
        
        <div>
          <label>Capacidad del Bloque (B - bytes):</label>
          <input 
            type="number" 
            v-model.number="config.B" 
            min="1"
            placeholder="Ej: 512"
          />
        </div>
        
        <div>
          <label>Cantidad de Registros (r):</label>
          <input 
            type="number" 
            v-model.number="config.r" 
            min="1"
            placeholder="Ej: 1000"
          />
        </div>
      </div>

      <div class="info-preview" v-if="config.Rl > 0 && config.B > 0 && config.r > 0">
        <p><strong>Tipo:</strong> Índice {{ config.tipoIndice === 'primario' ? 'Primario' : 'Secundario' }}</p>
        <p><strong>Estructura:</strong> {{ config.estructura === 'simple' ? 'Simple' : 'Multinivel' }}</p>
        
        <h5>Estructura Principal:</h5>
        <p><strong>Registros por bloque (bfr):</strong> {{ bfrPrincipal }}</p>
        <p><strong>Bloques necesarios (b):</strong> {{ bloquesPrincipal }}</p>
        
        <h5>Estructura de Índices:</h5>
        <p><strong>Longitud registro índice (Rli):</strong> {{ Rli }} bytes</p>
        <p><strong>Registros índice por bloque (bfri):</strong> {{ bfriIndices }}</p>
        <p><strong>Bloques de índices (bi):</strong> {{ bloquesIndices }}</p>
      </div>

      <button @click="crearEstructura">Crear Estructura</button>
    </div>

    <!-- Estructura creada -->
    <div v-else>
      <!-- Info de la estructura -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-item">
            <strong>Tipo:</strong> {{ config.tipoIndice === 'primario' ? 'Primario' : 'Secundario' }}
          </div>
          <div class="info-item">
            <strong>Estructura:</strong> {{ config.estructura === 'simple' ? 'Simple' : 'Multinivel' }}
          </div>
          <div class="info-item">
            <strong>Rl:</strong> {{ config.Rl }} bytes
          </div>
          <div class="info-item">
            <strong>B:</strong> {{ config.B }} bytes
          </div>
          <div class="info-item">
            <strong>r:</strong> {{ config.r }} registros
          </div>
          <div class="info-item">
            <strong>bfr:</strong> {{ estructura.bfr }}
          </div>
          <div class="info-item">
            <strong>b (bloques principal):</strong> {{ estructura.b }}
          </div>
          <div class="info-item">
            <strong>bfri:</strong> {{ estructura.bfri }}
          </div>
          <div class="info-item">
            <strong>bi (bloques índice):</strong> {{ estructura.bi }}
          </div>
        </div>
      </div>

      <!-- Operaciones -->
      <div class="operations">
        <input 
          type="number" 
          v-model.number="elementoInsertar" 
          placeholder="Clave a insertar/buscar"
          @keyup.enter="insertar"
        />
        <div id="general-nav">
          <button @click="insertar">Insertar</button>
          <button @click="buscar">Buscar</button>
          <button @click="eliminar">Eliminar</button>
          <button @click="mostrarModalReset = true" class="btn-danger">Resetear</button>
        </div>
      </div>

      <!-- Modal de confirmación para resetear -->
      <div v-if="mostrarModalReset" class="modal-overlay" @click="cancelarReset">
        <div class="modal-content" @click.stop>
          <h3>Confirmar Reseteo</h3>
          <p>¿Estás seguro de que deseas resetear la estructura? Se perderán todos los datos.</p>
          <div class="modal-buttons">
            <button @click="confirmarReset" class="btn-danger">Sí, Resetear</button>
            <button @click="cancelarReset" class="btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message">{{ mensaje }}</p>

      <!-- Resultado de búsqueda -->
      <p v-if="resultado" class="result">{{ resultado }}</p>

      <!-- Visualización de las estructuras -->
      <div class="structure-display">
        <div v-if="config.estructura === 'simple'" class="estructuras-lado-a-lado">
          <!-- Estructura de Índices (IZQUIERDA) -->
          <div class="estructura-container">
            <h3>Estructura de Índices ({{ config.tipoIndice === 'primario' ? 'Primario' : 'Secundario' }})</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(estructura.indiceSimple)" :key="`indice-${bloqueIdx}`">
                <div class="bloque-vertical bloque-indice">
                  <div class="bloque-header-vertical">Bloque Índice {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="entIdx in getRegistrosARenderizar(estructura.indiceSimple[bloqueIdx])" :key="`ent-${bloqueIdx}-${entIdx}`">
                      <div class="entrada-indice-item"
                           :class="{ 
                             'empty': estructura.indiceSimple[bloqueIdx][entIdx].clave === null,
                             'highlight': estructura.indiceSimple[bloqueIdx][entIdx].clave === ultimaClaveInsertada
                           }">
                        <span class="entrada-pos">E{{ getNumeroEntradaGlobal(bloqueIdx, entIdx) }}</span>
                        <span class="entrada-clave">
                          {{ estructura.indiceSimple[bloqueIdx][entIdx].clave !== null ? 
                             estructura.indiceSimple[bloqueIdx][entIdx].clave : '-' }}
                        </span>
                        <span v-if="estructura.indiceSimple[bloqueIdx][entIdx].clave !== null" 
                              class="entrada-puntero">
                          → B{{ estructura.indiceSimple[bloqueIdx][entIdx].bloqueReferencia }}
                        </span>
                      </div>
                      <!-- Indicador de elementos omitidos -->
                      <div v-if="entIdx < estructura.indiceSimple[bloqueIdx].length - 1 && 
                                  !getRegistrosARenderizar(estructura.indiceSimple[bloqueIdx]).includes(entIdx + 1)"
                           class="elementos-omitidos">
                        ⋮
                      </div>
                    </template>
                  </div>
                </div>
                
                <!-- Indicador de bloques omitidos -->
                <div v-if="bloqueIdx < estructura.indiceSimple.length - 1 && 
                           !getBloquesARenderizar(estructura.indiceSimple).includes(bloqueIdx + 1)"
                     class="bloques-omitidos">
                  <span>⋮ (bloques {{ bloqueIdx + 2 }} - {{ estructura.indiceSimple.length }})</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Estructura Principal (DERECHA) - Archivo de Datos -->
          <div class="estructura-container">
            <h3>Estructura Principal (Archivo de Datos)</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(estructura.archivoDatos)" :key="`datos-${bloqueIdx}`">
                <div class="bloque-vertical" 
                     :class="{ 'highlight-bloque': ultimoBloqueAfectado === bloqueIdx }">
                  <div class="bloque-header-vertical">Bloque {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="regIdx in getRegistrosARenderizar(estructura.archivoDatos[bloqueIdx])" :key="`reg-${bloqueIdx}-${regIdx}`">
                      <div class="registro-item"
                           :class="{ 
                             'empty': estructura.archivoDatos[bloqueIdx][regIdx] === null,
                             'highlight': estructura.archivoDatos[bloqueIdx][regIdx] === ultimaClaveInsertada
                           }">
                        <span class="registro-pos">R{{ getNumeroRegistroGlobal(bloqueIdx, regIdx) }}</span>
                        <span class="registro-valor">
                          {{ estructura.archivoDatos[bloqueIdx][regIdx] !== null ? estructura.archivoDatos[bloqueIdx][regIdx] : '-' }}
                        </span>
                      </div>
                      <!-- Indicador de elementos omitidos -->
                      <div v-if="regIdx < estructura.archivoDatos[bloqueIdx].length - 1 && 
                                  !getRegistrosARenderizar(estructura.archivoDatos[bloqueIdx]).includes(regIdx + 1)"
                           class="elementos-omitidos">
                        ⋮
                      </div>
                    </template>
                  </div>
                </div>
                
                <!-- Indicador de bloques omitidos -->
                <div v-if="bloqueIdx < estructura.archivoDatos.length - 1 && 
                           !getBloquesARenderizar(estructura.archivoDatos).includes(bloqueIdx + 1)"
                     class="bloques-omitidos">
                  <span>⋮ (bloques {{ bloqueIdx + 2 }} - {{ estructura.archivoDatos.length - 1 }})</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-else class="indices-multinivel">
          <p class="info-multinivel">Estructura multinivel (implementación próximamente)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Config {
  tipoIndice: 'primario' | 'secundario';
  estructura: 'simple' | 'multinivel';
  Rl: number;  // Longitud del registro en bytes
  B: number;   // Capacidad del bloque en bytes
  r: number;   // Cantidad de registros
}

interface EntradaIndice {
  clave: number | null;
  bloqueReferencia: number;
}

interface Estructura {
  // Estructura Principal
  bfr: number;   // Factor de bloque de estructura principal: ⌊B / Rl⌋
  b: number;     // Bloques de estructura principal: ⌈r / bfr⌉
  
  // Estructura de Índices
  Rli: number;   // Longitud del registro índice (siempre 15 bytes)
  bfri: number;  // Factor de bloque de índices: ⌊B / Rli⌋
  bi: number;    // Bloques de índices (según tipo: primario usa b, secundario usa r)
  
  // Datos
  archivoDatos: (number | null)[][];  // Estructura principal de datos [bloque][registro]
  indiceSimple: EntradaIndice[][];    // Estructura de índices [bloque][entrada]
  registrosInsertados: number;
}

const config = ref<Config>({
  tipoIndice: 'primario',
  estructura: 'simple',
  Rl: 100,
  B: 512,
  r: 1000
});

const estructuraCreada = ref(false);
const estructura = ref<Estructura>({
  bfr: 0,
  b: 0,
  Rli: 15,
  bfri: 0,
  bi: 0,
  archivoDatos: [],
  indiceSimple: [],
  registrosInsertados: 0
});

const elementoInsertar = ref<number | null>(null);
const mensaje = ref('');
const resultado = ref('');
const ultimoBloqueAfectado = ref<number | null>(null);
const ultimaClaveInsertada = ref<number | null>(null);
const mostrarModalReset = ref(false);

// Computed properties para cálculos
// Estructura Principal
const bfrPrincipal = computed(() => {
  if (config.value.Rl <= 0 || config.value.B <= 0) return 0;
  // bfr = ⌊B / Rl⌋
  return Math.floor(config.value.B / config.value.Rl);
});

const bloquesPrincipal = computed(() => {
  if (bfrPrincipal.value <= 0 || config.value.r <= 0) return 0;
  // b = ⌈r / bfr⌉
  return Math.ceil(config.value.r / bfrPrincipal.value);
});

// Estructura de Índices
const Rli = 15; // Longitud del registro índice (constante)

const bfriIndices = computed(() => {
  if (config.value.B <= 0) return 0;
  // bfri = ⌊B / Rli⌋
  return Math.floor(config.value.B / Rli);
});

const bloquesIndices = computed(() => {
  if (bfriIndices.value <= 0) return 0;
  
  if (config.value.tipoIndice === 'primario') {
    // Índice Primario: bi = ⌈b / bfri⌉ (usa bloques de la principal)
    if (bloquesPrincipal.value <= 0) return 0;
    return Math.ceil(bloquesPrincipal.value / bfriIndices.value);
  } else {
    // Índice Secundario: bi = ⌈r / bfri⌉ (usa cantidad de registros)
    if (config.value.r <= 0) return 0;
    return Math.ceil(config.value.r / bfriIndices.value);
  }
});

function crearEstructura() {
  if (config.value.Rl <= 0 || config.value.B <= 0 || config.value.r <= 0) {
    mensaje.value = 'Por favor ingrese valores válidos para todos los campos';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Calcular variables de estructura principal
  const bfr = bfrPrincipal.value;
  const b = bloquesPrincipal.value;

  if (bfr <= 0) {
    mensaje.value = 'La capacidad del bloque debe ser mayor que la longitud del registro';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Calcular variables de estructura de índices
  const bfri = bfriIndices.value;
  const bi = bloquesIndices.value;

  if (bfri <= 0) {
    mensaje.value = 'Error en el cálculo del factor de bloque de índices';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Crear estructura del archivo de datos principal
  const archivoDatos: (number | null)[][] = [];
  for (let i = 0; i < b; i++) {
    const bloque: (number | null)[] = [];
    for (let j = 0; j < bfr; j++) {
      bloque.push(null);
    }
    archivoDatos.push(bloque);
  }

  // Crear estructura de índice simple basada en bi (bloques de índices)
  const indiceSimple: EntradaIndice[][] = [];
  for (let i = 0; i < bi; i++) {
    const bloque: EntradaIndice[] = [];
    for (let j = 0; j < bfri; j++) {
      bloque.push({
        clave: null,
        bloqueReferencia: -1  // -1 indica que no apunta a ningún bloque aún
      });
    }
    indiceSimple.push(bloque);
  }

  estructura.value = {
    bfr,
    b,
    Rli,
    bfri,
    bi,
    archivoDatos,
    indiceSimple,
    registrosInsertados: 0
  };

  estructuraCreada.value = true;
  mensaje.value = 'Estructura de índices creada correctamente';
  setTimeout(() => mensaje.value = '', 3000);
}

// Funciones auxiliares para renderizado condicional
// Obtiene los índices de bloques a renderizar (primer y último bloque, más bloques con datos)
function getBloquesARenderizar(estructura: (number | null)[][] | EntradaIndice[][]): number[] {
  const totalBloques = estructura.length;
  if (totalBloques === 0) return [];
  if (totalBloques <= 10) return Array.from({ length: totalBloques }, (_, i) => i);
  
  const bloquesConDatos = estructura
    .map((bloque, index) => {
      const tieneDatos = bloque.some(elem => {
        if (elem === null) return false;
        if (typeof elem === 'object' && elem !== null && 'clave' in elem) {
          return elem.clave !== null;
        }
        return true;
      });
      return tieneDatos ? index : -1;
    })
    .filter(i => i >= 0);
  
  const set = new Set<number>();
  set.add(0); // Primer bloque
  set.add(totalBloques - 1); // Último bloque
  bloquesConDatos.forEach(i => set.add(i));
  
  return Array.from(set).sort((a, b) => a - b);
}

// Obtiene los índices de registros a renderizar dentro de un bloque
function getRegistrosARenderizar(bloque: (number | null)[] | EntradaIndice[], maxRegistros = 20): number[] {
  const totalRegistros = bloque.length;
  if (totalRegistros === 0) return [];
  if (totalRegistros <= maxRegistros) return Array.from({ length: totalRegistros }, (_, i) => i);
  
  const registrosConDatos = bloque
    .map((elem, index) => {
      if (elem === null) return -1;
      if (typeof elem === 'object' && 'clave' in elem) {
        return elem.clave !== null ? index : -1;
      }
      return index;
    })
    .filter(i => i >= 0)
    .sort((a, b) => a - b);
  
  const set = new Set<number>();
  set.add(0); // Primer registro
  set.add(totalRegistros - 1); // Último registro
  registrosConDatos.forEach(i => set.add(i));
  
  return Array.from(set).sort((a, b) => a - b);
}

// Calcula el número de registro global (continuo a través de los bloques)
function getNumeroRegistroGlobal(bloqueIdx: number, regIdx: number): number {
  return bloqueIdx * estructura.value.bfr + regIdx + 1;
}

// Calcula el número de entrada de índice global (continuo a través de los bloques)
function getNumeroEntradaGlobal(bloqueIdx: number, entIdx: number): number {
  return bloqueIdx * estructura.value.bfri + entIdx + 1;
}

function insertar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    mensaje.value = 'Por favor ingrese una clave válida';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const clave = elementoInsertar.value;

  // Verificar si la clave ya existe
  if (existeClave(clave)) {
    mensaje.value = `La clave ${clave} ya existe en la estructura`;
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Verificar si hay espacio disponible
  if (estructura.value.registrosInsertados >= config.value.r) {
    mensaje.value = 'No hay espacio disponible en la estructura';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Insertar en el archivo de datos de forma ordenada
  const posicionInsercion = encontrarPosicionInsercion(clave);
  const bloqueDestino = posicionInsercion.bloque;
  const registroDestino = posicionInsercion.registro;

  // Insertar en el archivo de datos
  estructura.value.archivoDatos[bloqueDestino][registroDestino] = clave;
  estructura.value.registrosInsertados++;

  // Actualizar índice según el tipo
  if (config.value.tipoIndice === 'primario') {
    // Índice Primario: Una entrada por bloque (primera clave del bloque)
    actualizarIndicePrimario(bloqueDestino);
  } else {
    // Índice Secundario: Una entrada por registro
    insertarIndiceSecundario(clave, bloqueDestino);
  }

  ultimoBloqueAfectado.value = bloqueDestino;
  ultimaClaveInsertada.value = clave;
  
  mensaje.value = `Clave ${clave} insertada en Bloque ${bloqueDestino + 1}, Registro ${registroDestino + 1}`;
  elementoInsertar.value = null;
  
  setTimeout(() => {
    mensaje.value = '';
    ultimoBloqueAfectado.value = null;
    ultimaClaveInsertada.value = null;
  }, 2000);
}

// Encuentra la posición de inserción manteniendo el orden
function encontrarPosicionInsercion(clave: number): { bloque: number; registro: number } {
  // Buscar la posición correcta para mantener el orden
  for (let i = 0; i < estructura.value.archivoDatos.length; i++) {
    for (let j = 0; j < estructura.value.archivoDatos[i].length; j++) {
      const valorActual = estructura.value.archivoDatos[i][j];
      
      if (valorActual === null) {
        // Espacio vacío encontrado
        // Verificar si debe ir aquí (es menor que el siguiente valor o es el último)
        const siguienteValor = encontrarSiguienteValor(i, j);
        if (siguienteValor === null || clave < siguienteValor) {
          return { bloque: i, registro: j };
        }
      } else if (clave < valorActual) {
        // Necesita hacer corrimiento
        hacerCorrimiento(i, j);
        return { bloque: i, registro: j };
      }
    }
  }
  
  // Si no se encontró posición, significa que va al final
  for (let i = estructura.value.archivoDatos.length - 1; i >= 0; i--) {
    for (let j = estructura.value.archivoDatos[i].length - 1; j >= 0; j--) {
      if (estructura.value.archivoDatos[i][j] === null) {
        return { bloque: i, registro: j };
      }
    }
  }
  
  return { bloque: 0, registro: 0 };
}

// Encuentra el siguiente valor no nulo en la estructura
function encontrarSiguienteValor(bloqueActual: number, registroActual: number): number | null {
  for (let i = bloqueActual; i < estructura.value.archivoDatos.length; i++) {
    const startJ = (i === bloqueActual) ? registroActual + 1 : 0;
    for (let j = startJ; j < estructura.value.archivoDatos[i].length; j++) {
      if (estructura.value.archivoDatos[i][j] !== null) {
        return estructura.value.archivoDatos[i][j];
      }
    }
  }
  
  return null;
}

// Hace corrimiento de elementos para insertar en medio
function hacerCorrimiento(bloqueInicio: number, registroInicio: number) {
  // Encontrar el último elemento no nulo
  let ultimoBloque = -1;
  let ultimoRegistro = -1;
  
  for (let i = estructura.value.archivoDatos.length - 1; i >= 0; i--) {
    for (let j = estructura.value.archivoDatos[i].length - 1; j >= 0; j--) {
      if (estructura.value.archivoDatos[i][j] !== null) {
        ultimoBloque = i;
        ultimoRegistro = j;
        break;
      }
    }
    if (ultimoBloque !== -1) break;
  }
  
  if (ultimoBloque === -1) return; // No hay elementos para correr
  
  // Correr elementos hacia la derecha
  let bloqueActual = ultimoBloque;
  let registroActual = ultimoRegistro;
  
  while (bloqueActual > bloqueInicio || (bloqueActual === bloqueInicio && registroActual >= registroInicio)) {
    const valorActual = estructura.value.archivoDatos[bloqueActual][registroActual];
    
    // Calcular siguiente posición
    let siguienteBloque = bloqueActual;
    let siguienteRegistro = registroActual + 1;
    
    if (siguienteRegistro >= estructura.value.archivoDatos[siguienteBloque].length) {
      siguienteBloque++;
      siguienteRegistro = 0;
    }
    
    if (siguienteBloque < estructura.value.archivoDatos.length) {
      estructura.value.archivoDatos[siguienteBloque][siguienteRegistro] = valorActual;
    }
    
    // Retroceder
    registroActual--;
    if (registroActual < 0) {
      bloqueActual--;
      if (bloqueActual >= 0) {
        registroActual = estructura.value.archivoDatos[bloqueActual].length - 1;
      }
    }
  }
  
  // Limpiar la posición de inserción
  estructura.value.archivoDatos[bloqueInicio][registroInicio] = null;
}

// Actualiza el índice primario (una entrada por bloque con la ÚLTIMA clave del bloque)
function actualizarIndicePrimario(bloqueModificado: number) {
  // En índice primario, cada entrada apunta a un bloque y contiene la ÚLTIMA clave del bloque
  // Esto permite hacer búsqueda binaria: si buscamos K, encontramos el primer índice donde clave >= K
  
  // Encontrar la última clave no nula del bloque
  let ultimaClave: number | null = null;
  for (let i = estructura.value.archivoDatos[bloqueModificado].length - 1; i >= 0; i--) {
    if (estructura.value.archivoDatos[bloqueModificado][i] !== null) {
      ultimaClave = estructura.value.archivoDatos[bloqueModificado][i];
      break;
    }
  }
  
  if (ultimaClave !== null) {
    // Buscar o crear entrada en el índice para este bloque
    let entradaEncontrada = false;
    
    for (let i = 0; i < estructura.value.indiceSimple.length && !entradaEncontrada; i++) {
      for (let j = 0; j < estructura.value.indiceSimple[i].length && !entradaEncontrada; j++) {
        const entrada = estructura.value.indiceSimple[i][j];
        
        if (entrada.bloqueReferencia === bloqueModificado + 1) {
          // Actualizar entrada existente con la última clave
          entrada.clave = ultimaClave;
          entradaEncontrada = true;
        } else if (entrada.clave === null) {
          // Crear nueva entrada con la última clave
          entrada.clave = ultimaClave;
          entrada.bloqueReferencia = bloqueModificado + 1;
          entradaEncontrada = true;
        }
      }
    }
  }
}

// Inserta una entrada en el índice secundario (una por registro)
function insertarIndiceSecundario(clave: number, bloqueReferencia: number) {
  // En índice secundario, cada registro tiene su propia entrada
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      if (estructura.value.indiceSimple[i][j].clave === null) {
        estructura.value.indiceSimple[i][j].clave = clave;
        estructura.value.indiceSimple[i][j].bloqueReferencia = bloqueReferencia + 1;
        return;
      }
    }
  }
}

function existeClave(clave: number): boolean {
  for (let i = 0; i < estructura.value.archivoDatos.length; i++) {
    for (let j = 0; j < estructura.value.archivoDatos[i].length; j++) {
      if (estructura.value.archivoDatos[i][j] === clave) {
        return true;
      }
    }
  }
  return false;
}

function buscar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    resultado.value = 'Por favor ingrese una clave válida';
    setTimeout(() => resultado.value = '', 3000);
    return;
  }

  const clave = elementoInsertar.value;

  if (config.value.tipoIndice === 'primario') {
    // Búsqueda en Índice Primario usando búsqueda binaria
    const bloqueDestino = busquedaBinariaIndicePrimario(clave);
    
    if (bloqueDestino !== -1) {
      // Buscar dentro del bloque encontrado
      const bloque = estructura.value.archivoDatos[bloqueDestino];
      for (let i = 0; i < bloque.length; i++) {
        if (bloque[i] === clave) {
          ultimoBloqueAfectado.value = bloqueDestino;
          ultimaClaveInsertada.value = clave;
          resultado.value = `✓ Clave ${clave} encontrada en Bloque ${bloqueDestino + 1}, Registro ${getNumeroRegistroGlobal(bloqueDestino, i)}`;
          
          setTimeout(() => {
            resultado.value = '';
            ultimoBloqueAfectado.value = null;
            ultimaClaveInsertada.value = null;
          }, 3000);
          return;
        }
      }
    }
  } else {
    // Búsqueda en Índice Secundario (búsqueda lineal en índice)
    for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
      for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
        if (estructura.value.indiceSimple[i][j].clave === clave) {
          const bloqueRef = estructura.value.indiceSimple[i][j].bloqueReferencia - 1;
          ultimoBloqueAfectado.value = bloqueRef;
          ultimaClaveInsertada.value = clave;
          resultado.value = `✓ Clave ${clave} encontrada (Índice Secundario apunta al Bloque ${estructura.value.indiceSimple[i][j].bloqueReferencia})`;
          
          setTimeout(() => {
            resultado.value = '';
            ultimoBloqueAfectado.value = null;
            ultimaClaveInsertada.value = null;
          }, 3000);
          return;
        }
      }
    }
  }

  resultado.value = `✗ Clave ${clave} no encontrada`;
  setTimeout(() => resultado.value = '', 3000);
}

// Búsqueda binaria en el índice primario para encontrar el bloque correspondiente
function busquedaBinariaIndicePrimario(clave: number): number {
  // Obtener todas las entradas no nulas del índice ordenadas
  const entradasIndice: { clave: number; bloque: number }[] = [];
  
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      const entrada = estructura.value.indiceSimple[i][j];
      if (entrada.clave !== null) {
        entradasIndice.push({
          clave: entrada.clave,
          bloque: entrada.bloqueReferencia - 1
        });
      }
    }
  }
  
  if (entradasIndice.length === 0) return -1;
  
  // Ordenar por clave (aunque ya deberían estar ordenadas)
  entradasIndice.sort((a, b) => a.clave - b.clave);
  
  // Búsqueda binaria: encontrar el primer índice donde la clave sea >= clave buscada
  let izq = 0;
  let der = entradasIndice.length - 1;
  let resultado = -1;
  
  while (izq <= der) {
    const med = Math.floor((izq + der) / 2);
    
    if (entradasIndice[med].clave >= clave) {
      resultado = entradasIndice[med].bloque;
      der = med - 1;
    } else {
      izq = med + 1;
    }
  }
  
  return resultado;
}

function eliminar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    mensaje.value = 'Por favor ingrese una clave válida';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const clave = elementoInsertar.value;

  // Buscar y eliminar del archivo de datos
  let encontrado = false;
  for (let i = 0; i < estructura.value.archivoDatos.length && !encontrado; i++) {
    for (let j = 0; j < estructura.value.archivoDatos[i].length && !encontrado; j++) {
      if (estructura.value.archivoDatos[i][j] === clave) {
        // Eliminar y hacer corrimiento hacia la izquierda
        eliminarYCorrerIzquierda(i, j);
        estructura.value.registrosInsertados--;
        encontrado = true;
        
        // Reorganizar índices después de la eliminación
        reorganizarIndices();
        
        ultimoBloqueAfectado.value = i;
        mensaje.value = `Clave ${clave} eliminada del Bloque ${i + 1}`;
        elementoInsertar.value = null;
        
        setTimeout(() => {
          mensaje.value = '';
          ultimoBloqueAfectado.value = null;
        }, 2000);
        return;
      }
    }
  }

  mensaje.value = `Clave ${clave} no encontrada`;
  setTimeout(() => mensaje.value = '', 3000);
}

// Elimina un elemento y corre todos los elementos posteriores hacia la izquierda
function eliminarYCorrerIzquierda(bloqueInicio: number, registroInicio: number) {
  // Encontrar el último elemento no nulo
  let ultimoBloque = -1;
  let ultimoRegistro = -1;
  
  for (let i = estructura.value.archivoDatos.length - 1; i >= 0; i--) {
    for (let j = estructura.value.archivoDatos[i].length - 1; j >= 0; j--) {
      if (estructura.value.archivoDatos[i][j] !== null) {
        ultimoBloque = i;
        ultimoRegistro = j;
        break;
      }
    }
    if (ultimoBloque !== -1) break;
  }
  
  // Correr todos los elementos hacia la izquierda desde la posición de eliminación
  let bloqueActual = bloqueInicio;
  let registroActual = registroInicio;
  
  while (bloqueActual < ultimoBloque || (bloqueActual === ultimoBloque && registroActual < ultimoRegistro)) {
    // Calcular siguiente posición
    let siguienteBloque = bloqueActual;
    let siguienteRegistro = registroActual + 1;
    
    if (siguienteRegistro >= estructura.value.archivoDatos[siguienteBloque].length) {
      siguienteBloque++;
      siguienteRegistro = 0;
    }
    
    if (siguienteBloque < estructura.value.archivoDatos.length) {
      // Copiar el siguiente valor a la posición actual
      estructura.value.archivoDatos[bloqueActual][registroActual] = 
        estructura.value.archivoDatos[siguienteBloque][siguienteRegistro];
    }
    
    // Avanzar
    bloqueActual = siguienteBloque;
    registroActual = siguienteRegistro;
  }
  
  // Limpiar la última posición
  if (ultimoBloque !== -1) {
    estructura.value.archivoDatos[ultimoBloque][ultimoRegistro] = null;
  }
}

// Reorganiza todos los índices después de una eliminación
function reorganizarIndices() {
  // Limpiar todos los índices
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      estructura.value.indiceSimple[i][j].clave = null;
      estructura.value.indiceSimple[i][j].bloqueReferencia = -1;
    }
  }
  
  if (config.value.tipoIndice === 'primario') {
    // Índice Primario: Reconstruir con la última clave de cada bloque usado
    let indiceGlobal = 0;
    for (let bloqueIdx = 0; bloqueIdx < estructura.value.archivoDatos.length; bloqueIdx++) {
      // Verificar si el bloque tiene datos
      const tieneDatos = estructura.value.archivoDatos[bloqueIdx].some(v => v !== null);
      
      if (tieneDatos) {
        // Encontrar la última clave del bloque
        let ultimaClave: number | null = null;
        for (let i = estructura.value.archivoDatos[bloqueIdx].length - 1; i >= 0; i--) {
          if (estructura.value.archivoDatos[bloqueIdx][i] !== null) {
            ultimaClave = estructura.value.archivoDatos[bloqueIdx][i];
            break;
          }
        }
        
        if (ultimaClave !== null && indiceGlobal < estructura.value.indiceSimple.length * estructura.value.bfri) {
          const bloqueIndice = Math.floor(indiceGlobal / estructura.value.bfri);
          const posIndice = indiceGlobal % estructura.value.bfri;
          
          estructura.value.indiceSimple[bloqueIndice][posIndice].clave = ultimaClave;
          estructura.value.indiceSimple[bloqueIndice][posIndice].bloqueReferencia = bloqueIdx + 1;
          indiceGlobal++;
        }
      }
    }
  } else {
    // Índice Secundario: Reconstruir con todas las claves
    let indiceGlobal = 0;
    for (let bloqueIdx = 0; bloqueIdx < estructura.value.archivoDatos.length; bloqueIdx++) {
      for (let regIdx = 0; regIdx < estructura.value.archivoDatos[bloqueIdx].length; regIdx++) {
        const clave = estructura.value.archivoDatos[bloqueIdx][regIdx];
        
        if (clave !== null && indiceGlobal < estructura.value.indiceSimple.length * estructura.value.bfri) {
          const bloqueIndice = Math.floor(indiceGlobal / estructura.value.bfri);
          const posIndice = indiceGlobal % estructura.value.bfri;
          
          estructura.value.indiceSimple[bloqueIndice][posIndice].clave = clave;
          estructura.value.indiceSimple[bloqueIndice][posIndice].bloqueReferencia = bloqueIdx + 1;
          indiceGlobal++;
        }
      }
    }
  }
}

function confirmarReset() {
  estructuraCreada.value = false;
  estructura.value = {
    bfr: 0,
    b: 0,
    Rli: 15,
    bfri: 0,
    bi: 0,
    archivoDatos: [],
    indiceSimple: [],
    registrosInsertados: 0
  };
  elementoInsertar.value = null;
  mensaje.value = '';
  resultado.value = '';
  ultimoBloqueAfectado.value = null;
  ultimaClaveInsertada.value = null;
  mostrarModalReset.value = false;
}

function cancelarReset() {
  mostrarModalReset.value = false;
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
  max-width: 800px;
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

.config-row > div {
  flex: 1;
  min-width: 200px;
}

.config-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.config-row input,
.config-row select {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.info-preview {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--code-background-color);
  border-radius: 0.25rem;
}

.info-preview p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.structure-info {
  max-width: 1000px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid var(--muted-border-color);
  border-radius: 0.5rem;
  background: var(--card-background-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  margin: 0 auto 1rem auto;
  display: block;
}

#general-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

#general-nav button {
  flex: 1;
  min-width: 100px;
  max-width: 150px;
}

.btn-danger {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-secondary {
  background: #6b7280;
  border-color: #6b7280;
}

.btn-secondary:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.message {
  color: #e5e7eb;
  font-size: 0.9rem;
  margin: 1rem auto;
  max-width: 600px;
  text-align: center;
}

.result {
  margin: 1rem auto;
  padding: 1rem;
  max-width: 600px;
  color: var(--primary);
  font-weight: bold;
  text-align: center;
}

.structure-display {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1rem;
}

.estructuras-lado-a-lado {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 1200px) {
  .estructuras-lado-a-lado {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.estructura-container {
  display: flex;
  flex-direction: column;
}

.estructura-container h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  position: sticky;
  top: 0;
  background: var(--background-color);
  padding: 0.5rem;
  z-index: 10;
}

.bloques-verticales {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bloque-vertical {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 1rem;
  transition: all 0.3s ease;
}

.bloque-vertical.bloque-indice {
  background: linear-gradient(180deg, #fef3c7 0%, #fef9e7 100%);
  border-color: #fbbf24;
}

.bloque-vertical.highlight-bloque {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.bloque-header-vertical {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.75rem;
}

.registros-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.registro-item,
.entrada-indice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  min-height: 40px;
}

.registro-item.empty,
.entrada-indice-item.empty {
  opacity: 0.5;
  background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
  border-style: dashed;
}

.registro-item.highlight,
.entrada-indice-item.highlight {
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  animation: pulse 0.8s ease-in-out;
}

.registro-pos,
.entrada-pos {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  min-width: 40px;
}

.registro-valor,
.entrada-clave {
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
  flex: 1;
  text-align: center;
}

.registro-item.empty .registro-valor,
.entrada-indice-item.empty .entrada-clave {
  color: #94a3b8;
}

.entrada-puntero {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.elementos-omitidos,
.bloques-omitidos {
  text-align: center;
  color: #94a3b8;
  font-size: 1.2rem;
  padding: 0.25rem 0;
  user-select: none;
}

.bloques-omitidos span {
  font-size: 0.75rem;
  color: #64748b;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.structure-display h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.indices-simple {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.bloque-indice {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 0.75rem;
  min-width: 200px;
  max-width: 300px;
  transition: all 0.3s ease;
  position: relative;
}

.bloque-indice.highlight-bloque {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.bloque-header {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bloque-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 28px;
}

.entrada-indice {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.entrada-indice .clave {
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
  flex: 1;
}

.entrada-indice .puntero {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
}

.entrada-indice.empty {
  opacity: 0.5;
  background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
  border-style: dashed;
}

.entrada-indice.empty .clave {
  color: #94a3b8;
}

.entrada-indice.highlight {
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  animation: pulse 0.8s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.info-multinivel {
  text-align: center;
  padding: 2rem;
  color: var(--muted-color);
  font-style: italic;
}

/* Estilos para visualización vertical lado a lado */
.estructuras-lado-a-lado {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.estructura-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.estructura-container h3 {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--primary);
  text-align: center;
}

.bloques-verticales {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.bloque-vertical {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 1rem;
  transition: all 0.3s ease;
}

.bloque-vertical.highlight-bloque {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.bloque-vertical.bloque-indice {
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fbbf24;
}

.bloque-header-vertical {
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
}

.registros-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.registro-item,
.entrada-indice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  min-height: 40px;
}

.registro-item.empty,
.entrada-indice-item.empty {
  opacity: 0.5;
  background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
  border-style: dashed;
}

.registro-item.highlight,
.entrada-indice-item.highlight {
  border-color: var(--primary);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  animation: pulse 0.8s ease-in-out;
}

.registro-pos,
.entrada-pos {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  min-width: 30px;
}

.registro-valor,
.entrada-clave {
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
  flex: 1;
  text-align: center;
}

.registro-item.empty .registro-valor,
.entrada-indice-item.empty .entrada-clave {
  color: #94a3b8;
}

.entrada-puntero {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.elementos-omitidos,
.bloques-omitidos {
  text-align: center;
  padding: 0.5rem;
  color: #94a3b8;
  font-size: 1.2rem;
  letter-spacing: 0.2rem;
}

.bloques-omitidos span {
  font-size: 0.8rem;
  letter-spacing: normal;
}

@media (max-width: 1024px) {
  .estructuras-lado-a-lado {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* Modal de confirmación */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--card-background-color);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--primary);
}

.modal-content p {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color);
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-buttons button {
  flex: 1;
  max-width: 150px;
}

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
  }
  
  .config-row > div {
    width: 100%;
  }
  
  .indices-simple {
    padding: 0.5rem;
  }
  
  .bloque-indice {
    min-width: 180px;
    width: 100%;
  }
}
</style>
