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
          <div class="info-item">
            <strong>Número de accesos:</strong> {{ numeroAccesos }}
          </div>
        </div>
      </div>

      <!-- Botón de reset -->
      <div class="operations">
        <button @click="mostrarModalReset = true" class="btn-secondary">Resetear Estructura</button>
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
          <div class="estructura-container" id="estructura-indices">
            <h3>Estructura de Índices ({{ config.tipoIndice === 'primario' ? 'Primario' : 'Secundario' }})</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(estructura.indiceSimple)" :key="`indice-${bloqueIdx}`">
                <div class="bloque-vertical bloque-indice">
                  <div class="bloque-header-vertical">Bloque Índice {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="entIdx in getRegistrosARenderizarConLimite(
                      estructura.indiceSimple[bloqueIdx], 
                      bloqueIdx, 
                      config.tipoIndice === 'primario' ? estructura.b : config.r
                    )" :key="`ent-${bloqueIdx}-${entIdx}`">
                      <div class="entrada-indice-item"
                           :class="{ 
                             'highlight': bloqueIdx === 0 && entIdx === 0
                           }">
                        <span class="entrada-pos">E{{ getNumeroEntradaGlobal(bloqueIdx, entIdx) }}</span>
                        <span class="entrada-puntero">
                          <template v-if="config.tipoIndice === 'primario'">
                            → Bloque {{ getNumeroEntradaGlobal(bloqueIdx, entIdx) }}
                          </template>
                          <template v-else>
                            → Registro {{ getNumeroEntradaGlobal(bloqueIdx, entIdx) }}
                          </template>
                        </span>
                      </div>
                      <!-- Indicador de elementos omitidos -->
                      <div v-if="entIdx < estructura.indiceSimple[bloqueIdx].length - 1 && 
                                  !getRegistrosARenderizarConLimite(
                                    estructura.indiceSimple[bloqueIdx], 
                                    bloqueIdx, 
                                    config.tipoIndice === 'primario' ? estructura.b : config.r
                                  ).includes(entIdx + 1)"
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

          <!-- Flecha de demostración (conecta primer índice con primera referencia) -->
          <div class="arrow-demo" v-if="estructura.indiceSimple[0] && estructura.indiceSimple[0][0].clave !== null">
            <svg class="connection-arrow" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="var(--primary)" />
                </marker>
              </defs>
              <path d="M 20 50 Q 100 50, 180 50" 
                    stroke="var(--primary)" 
                    stroke-width="2" 
                    fill="none" 
                    marker-end="url(#arrowhead)" 
                    class="animated-arrow"/>
              <text x="100" y="35" text-anchor="middle" fill="var(--primary)" font-size="12" font-weight="bold">
                Apunta a
              </text>
            </svg>
          </div>

          <!-- Estructura Principal (DERECHA) - Archivo de Datos -->
          <div class="estructura-container" id="estructura-principal">
            <h3>Estructura Principal (Archivo de Datos)</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(estructura.archivoDatos)" :key="`datos-${bloqueIdx}`">
                <div class="bloque-vertical">
                  <div class="bloque-header-vertical">Bloque {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="regIdx in getRegistrosARenderizar(estructura.archivoDatos[bloqueIdx])" :key="`reg-${bloqueIdx}-${regIdx}`">
                      <div class="registro-item empty">
                        <span class="registro-pos">R{{ getNumeroRegistroGlobal(bloqueIdx, regIdx) }}</span>
                        <span class="registro-valor">-</span>
                      </div>
                      <!-- Indicador de elementos omitidos -->
                      <div v-if="regIdx < estructura.archivoDatos[bloqueIdx].length - 1 && 
                                  !getRegistrosARenderizar(estructura.archivoDatos[bloqueIdx]).includes(regIdx + 1)"
                           class="elementos-omitidos">
                        ⋮
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

        <!-- Estructura Multinivel -->
        <div v-else class="estructuras-lado-a-lado">
          <!-- Niveles de índices en orden inverso (nivel superior a la izquierda) -->
          <div v-for="(nivel, nivelIdx) in estructura.indicesMultinivel.slice().reverse()" 
               :key="`nivel-${nivelIdx}`"
               class="estructura-container">
            <h3>Nivel {{ estructura.indicesMultinivel.length - nivelIdx }} de Índices</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(nivel)" :key="`nivel${nivelIdx}-bloque-${bloqueIdx}`">
                <div class="bloque-vertical bloque-indice">
                  <div class="bloque-header-vertical">Bloque Índice {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="entIdx in getRegistrosARenderizarConLimite(
                      nivel[bloqueIdx], 
                      bloqueIdx, 
                      getLimiteDestinoMultinivel(nivelIdx)
                    )" :key="`nivel${nivelIdx}-ent-${bloqueIdx}-${entIdx}`">
                      <div class="entrada-indice-item">
                        <span class="entrada-pos">E{{ bloqueIdx * estructura.bfri + entIdx + 1 }}</span>
                        <span class="entrada-puntero">
                          <template v-if="nivelIdx === estructura.indicesMultinivel.length - 1">
                            <!-- Último nivel (nivel 1) apunta a estructura principal -->
                            <template v-if="config.tipoIndice === 'primario'">
                              → Bloque {{ bloqueIdx * estructura.bfri + entIdx + 1 }}
                            </template>
                            <template v-else>
                              → Registro {{ bloqueIdx * estructura.bfri + entIdx + 1 }}
                            </template>
                          </template>
                          <template v-else>
                            <!-- Niveles superiores apuntan al nivel inferior -->
                            → Bloque {{ bloqueIdx * estructura.bfri + entIdx + 1 }} (Nivel {{ estructura.indicesMultinivel.length - nivelIdx - 1 }})
                          </template>
                        </span>
                      </div>
                      <!-- Indicador de elementos omitidos -->
                      <div v-if="entIdx < nivel[bloqueIdx].length - 1 && 
                                  !getRegistrosARenderizarConLimite(
                                    nivel[bloqueIdx], 
                                    bloqueIdx, 
                                    getLimiteDestinoMultinivel(nivelIdx)
                                  ).includes(entIdx + 1)"
                           class="elementos-omitidos">
                        ⋮
                      </div>
                    </template>
                  </div>
                </div>
                <!-- Indicador de bloques omitidos -->
                <div v-if="bloqueIdx < nivel.length - 1 && 
                           !getBloquesARenderizar(nivel).includes(bloqueIdx + 1)"
                     class="bloques-omitidos">
                  <span>⋮ (bloques {{ bloqueIdx + 2 }} - {{ nivel.length }})</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Estructura Principal a la derecha -->
          <div class="estructura-container">
            <h3>Estructura Principal (Archivo de Datos)</h3>
            <div class="bloques-verticales">
              <template v-for="bloqueIdx in getBloquesARenderizar(estructura.archivoDatos)" :key="`datos-multi-${bloqueIdx}`">
                <div class="bloque-vertical">
                  <div class="bloque-header-vertical">Bloque {{ bloqueIdx + 1 }}</div>
                  <div class="registros-container">
                    <template v-for="regIdx in getRegistrosARenderizar(estructura.archivoDatos[bloqueIdx])" :key="`reg-multi-${bloqueIdx}-${regIdx}`">
                      <div class="registro-item empty">
                        <span class="registro-pos">R{{ getNumeroRegistroGlobal(bloqueIdx, regIdx) }}</span>
                        <span class="registro-valor">-</span>
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
                  <span>⋮ (bloques {{ bloqueIdx + 2 }} - {{ estructura.archivoDatos.length }})</span>
                </div>
              </template>
            </div>
          </div>
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
  indicesMultinivel: EntradaIndice[][][]; // Array de niveles de índices para multinivel [nivel][bloque][entrada]
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
  indicesMultinivel: [],
  registrosInsertados: 0
});

const mensaje = ref('');
const resultado = ref('');
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

const numeroAccesos = computed(() => {
  if (!estructuraCreada.value) return 0;
  if (config.value.estructura === 'simple') {
    return 2; // 1 acceso al índice + 1 acceso a datos
  } else {
    // Multinivel: cantidad de niveles de índices + 1 acceso a datos
    return estructura.value.indicesMultinivel.length + 1;
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
    indicesMultinivel: [],
    registrosInsertados: 0
  };

  // Si es multinivel, construir los niveles adicionales de índices
  if (config.value.estructura === 'multinivel') {
    construirMultinivel();
  }

  // Pre-cargar datos de ejemplo para demostración
  precargarDatosEjemplo();

  estructuraCreada.value = true;
  mensaje.value = 'Estructura de índices creada correctamente con datos de ejemplo';
  setTimeout(() => mensaje.value = '', 3000);
}

function construirMultinivel() {
  const niveles: EntradaIndice[][][] = [];
  
  // Nivel 1: Índice que apunta a la estructura principal (ya creado como indiceSimple)
  niveles.push(estructura.value.indiceSimple);
  
  let nivelActual = estructura.value.indiceSimple;
  let bloquesNivelActual = nivelActual.length;
  
  // Construir niveles superiores hasta que solo necesitemos 1 bloque
  while (bloquesNivelActual > 1) {
    // Calcular cuántos bloques necesita el siguiente nivel para indexar el actual
    const bloquesNuevoNivel = Math.ceil(bloquesNivelActual / estructura.value.bfri);
    
    // Crear nuevo nivel de índices
    const nuevoNivel: EntradaIndice[][] = [];
    for (let i = 0; i < bloquesNuevoNivel; i++) {
      const bloque: EntradaIndice[] = [];
      for (let j = 0; j < estructura.value.bfri; j++) {
        bloque.push({
          clave: null,
          bloqueReferencia: -1
        });
      }
      nuevoNivel.push(bloque);
    }
    
    niveles.push(nuevoNivel);
    nivelActual = nuevoNivel;
    bloquesNivelActual = bloquesNuevoNivel;
  }
  
  estructura.value.indicesMultinivel = niveles;
}

// Pre-carga datos de ejemplo ordenados en la estructura
function precargarDatosEjemplo() {
  // No llenar ninguna estructura - todo se renderiza dinámicamente
  estructura.value.registrosInsertados = 0;
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
function getRegistrosARenderizar(bloque: (number | null)[] | EntradaIndice[]): number[] {
  const totalRegistros = bloque.length;
  if (totalRegistros === 0) return [];
  if (totalRegistros === 1) return [0];
  if (totalRegistros === 2) return [0, 1];
  
  // Solo mostrar primer y último registro
  return [0, totalRegistros - 1];
}

// Obtiene los registros a renderizar considerando el límite de la estructura destino
function getRegistrosARenderizarConLimite(bloque: EntradaIndice[], bloqueIdx: number, limiteDestino: number): number[] {
  const totalRegistros = bloque.length;
  if (totalRegistros === 0) return [];
  
  const registrosValidos: number[] = [];
  
  // Calcular cuáles registros de este bloque apuntan a destinos válidos
  for (let i = 0; i < totalRegistros; i++) {
    const numeroGlobal = bloqueIdx * estructura.value.bfri + i + 1;
    if (numeroGlobal <= limiteDestino) {
      registrosValidos.push(i);
    }
  }
  
  if (registrosValidos.length === 0) return [];
  if (registrosValidos.length === 1) return [registrosValidos[0]];
  if (registrosValidos.length === 2) return registrosValidos;
  
  // Mostrar primero y último válido
  return [registrosValidos[0], registrosValidos[registrosValidos.length - 1]];
}

// Obtiene el límite de destino para un nivel específico en multinivel
function getLimiteDestinoMultinivel(nivelIdx: number): number {
  const nivelReal = estructura.value.indicesMultinivel.length - nivelIdx;
  
  if (nivelReal === 1) {
    // Nivel 1 apunta a estructura principal
    return config.value.tipoIndice === 'primario' ? estructura.value.b : config.value.r;
  } else {
    // Niveles superiores apuntan al nivel inferior
    const nivelInferior = estructura.value.indicesMultinivel[estructura.value.indicesMultinivel.length - nivelReal + 1];
    return nivelInferior.length * estructura.value.bfri;
  }
}

// Calcula el número de registro global (continuo a través de los bloques)
function getNumeroRegistroGlobal(bloqueIdx: number, regIdx: number): number {
  return bloqueIdx * estructura.value.bfr + regIdx + 1;
}

// Calcula el número de entrada de índice global (continuo a través de los bloques)
function getNumeroEntradaGlobal(bloqueIdx: number, entIdx: number): number {
  return bloqueIdx * estructura.value.bfri + entIdx + 1;
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
    indicesMultinivel: [],
    registrosInsertados: 0
  };
  mensaje.value = '';
  resultado.value = '';
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
  max-width: 800px;
  margin: 2rem auto;
}

.indice-description {
  background: var(--card-background-color);
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.indice-description h4 {
  color: var(--primary);
  margin-top: 0;
  margin-bottom: 1rem;
}

.indice-description p {
  margin: 0.75rem 0;
  line-height: 1.6;
}

.indice-description strong {
  color: var(--primary);
}

.indice-description em {
  color: var(--accent);
  font-style: normal;
  font-weight: 600;
}

.indice-description button {
  margin-top: 1rem;
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
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.arrow-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.connection-arrow {
  width: 200px;
  height: 100px;
}

.animated-arrow {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: drawArrow 2s ease-in-out forwards, pulse 2s ease-in-out 2s infinite;
}

@keyframes drawArrow {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 1200px) {
  .estructuras-lado-a-lado {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .arrow-demo {
    display: none;
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
  display: flex;
  justify-content: center;
  align-items: start;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
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
