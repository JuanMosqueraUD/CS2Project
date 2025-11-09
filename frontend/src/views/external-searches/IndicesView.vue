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
        <p><strong>Registros por Bloque:</strong> {{ registrosPorBloque }}</p>
        <p><strong>Bloques Necesarios:</strong> {{ bloquesNecesarios }}</p>
        <p><strong>Factor de Bloque (bfr):</strong> {{ factorBloque }}</p>
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
            <strong>Bloques:</strong> {{ estructura.bloques }}
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

      <!-- Visualización de la estructura -->
      <div class="structure-display">
        <h3>Estructura de Índices</h3>
        
        <div v-if="config.estructura === 'simple'" class="indices-simple">
          <div class="bloque-indice" 
               v-for="(bloque, bloqueIndex) in estructura.indiceSimple" 
               :key="`bloque-${bloqueIndex}`"
               :class="{ 'highlight-bloque': ultimoBloqueAfectado === bloqueIndex }">
            <div class="bloque-header">Bloque {{ bloqueIndex + 1 }}</div>
            <div class="bloque-content">
              <div 
                v-for="(entrada, entradaIndex) in bloque" 
                :key="`entrada-${bloqueIndex}-${entradaIndex}`"
                class="entrada-indice"
                :class="{ 
                  'empty': entrada.clave === null,
                  'highlight': ultimaClaveInsertada === entrada.clave
                }">
                <div class="clave">{{ entrada.clave !== null ? entrada.clave : '-' }}</div>
                <div class="puntero" v-if="entrada.clave !== null">→ B{{ entrada.bloqueReferencia }}</div>
              </div>
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
  bfr: number;  // Factor de bloque (registros por bloque)
  bloques: number;  // Número de bloques necesarios
  indiceSimple: EntradaIndice[][];
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
  bloques: 0,
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
const registrosPorBloque = computed(() => {
  if (config.value.Rl <= 0 || config.value.B <= 0) return 0;
  return Math.floor(config.value.B / config.value.Rl);
});

const bloquesNecesarios = computed(() => {
  if (registrosPorBloque.value <= 0 || config.value.r <= 0) return 0;
  return Math.ceil(config.value.r / registrosPorBloque.value);
});

const factorBloque = computed(() => {
  return registrosPorBloque.value;
});

function crearEstructura() {
  if (config.value.Rl <= 0 || config.value.B <= 0 || config.value.r <= 0) {
    mensaje.value = 'Por favor ingrese valores válidos para todos los campos';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const bfr = registrosPorBloque.value;
  const bloques = bloquesNecesarios.value;

  if (bfr <= 0) {
    mensaje.value = 'La capacidad del bloque debe ser mayor que la longitud del registro';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Crear estructura de índice simple
  const indiceSimple: EntradaIndice[][] = [];
  for (let i = 0; i < bloques; i++) {
    const bloque: EntradaIndice[] = [];
    for (let j = 0; j < bfr; j++) {
      bloque.push({
        clave: null,
        bloqueReferencia: i + 1
      });
    }
    indiceSimple.push(bloque);
  }

  estructura.value = {
    bfr,
    bloques,
    indiceSimple,
    registrosInsertados: 0
  };

  estructuraCreada.value = true;
  mensaje.value = 'Estructura de índices creada correctamente';
  setTimeout(() => mensaje.value = '', 3000);
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
    mensaje.value = `La clave ${clave} ya existe en el índice`;
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Verificar si hay espacio disponible
  if (estructura.value.registrosInsertados >= config.value.r) {
    mensaje.value = 'No hay espacio disponible en la estructura';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Insertar en el primer espacio disponible (índice simple)
  let insertado = false;
  for (let i = 0; i < estructura.value.indiceSimple.length && !insertado; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length && !insertado; j++) {
      if (estructura.value.indiceSimple[i][j].clave === null) {
        estructura.value.indiceSimple[i][j].clave = clave;
        estructura.value.registrosInsertados++;
        ultimoBloqueAfectado.value = i;
        ultimaClaveInsertada.value = clave;
        insertado = true;
        
        mensaje.value = `Clave ${clave} insertada en Bloque ${i + 1}`;
        elementoInsertar.value = null;
        
        setTimeout(() => {
          mensaje.value = '';
          ultimoBloqueAfectado.value = null;
          ultimaClaveInsertada.value = null;
        }, 2000);
      }
    }
  }
}

function existeClave(clave: number): boolean {
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      if (estructura.value.indiceSimple[i][j].clave === clave) {
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

  // Buscar en el índice
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      if (estructura.value.indiceSimple[i][j].clave === clave) {
        ultimoBloqueAfectado.value = i;
        ultimaClaveInsertada.value = clave;
        const bloqueRef = estructura.value.indiceSimple[i][j].bloqueReferencia;
        resultado.value = `✓ Clave ${clave} encontrada en Bloque ${i + 1}, apunta al Bloque de datos ${bloqueRef}`;
        
        setTimeout(() => {
          resultado.value = '';
          ultimoBloqueAfectado.value = null;
          ultimaClaveInsertada.value = null;
        }, 3000);
        return;
      }
    }
  }

  resultado.value = `✗ Clave ${clave} no encontrada`;
  setTimeout(() => resultado.value = '', 3000);
}

function eliminar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    mensaje.value = 'Por favor ingrese una clave válida';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const clave = elementoInsertar.value;

  // Buscar y eliminar
  for (let i = 0; i < estructura.value.indiceSimple.length; i++) {
    for (let j = 0; j < estructura.value.indiceSimple[i].length; j++) {
      if (estructura.value.indiceSimple[i][j].clave === clave) {
        estructura.value.indiceSimple[i][j].clave = null;
        estructura.value.registrosInsertados--;
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

function confirmarReset() {
  estructuraCreada.value = false;
  estructura.value = {
    bfr: 0,
    bloques: 0,
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
