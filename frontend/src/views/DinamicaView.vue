<template>
  <div>
    <button @click="$router.back()" class="btn-back">← Volver</button>
    
    <h1>Estructuras Dinámicas</h1>

    <!-- Crear estructura -->
    <div v-if="!estructuraCreada" class="create-structure">
      <h3>Crear Estructura Dinámica</h3>
      
      <div class="config-row">
        <div>
          <label>Cantidad de Cubetas:</label>
          <input 
            type="number" 
            v-model.number="config.cubetas" 
            min="1"
          />
        </div>
        
        <div>
          <label>Registros por Cubeta:</label>
          <input 
            type="number" 
            v-model.number="config.registrosPorCubeta" 
            min="1"
            placeholder="Ej: 2"
          />
        </div>
      </div>

      <div class="config-row">
        <div>
          <label>Tipo de Expansión/Reducción:</label>
          <select v-model="config.tipoOperacion">
            <option value="total">Total</option>
            <option value="parcial">Parcial</option>
          </select>
        </div>
      </div>

      <div class="info-preview" v-if="config.cubetas > 0 && config.registrosPorCubeta > 0">
        <p><strong>Capacidad Total:</strong> {{ config.cubetas * config.registrosPorCubeta }} registros</p>
        <p><strong>Umbral de Expansión:</strong> 75% ({{ Math.floor(config.cubetas * config.registrosPorCubeta * 0.75) }} registros)</p>
        <p><strong>Umbral de Reducción:</strong> Densidad < 80% (< {{ (config.cubetas * 0.8).toFixed(1) }} registros/cubetas)</p>
        <p><strong>Tipo:</strong> {{ config.tipoOperacion === 'total' ? 'Total (duplicar/dividir)' : 'Parcial (2 parciales = 1 total)' }}</p>
        <p><strong>Hash:</strong> Módulo sobre {{ config.cubetas }} cubetas</p>
      </div>

      <button @click="crearEstructura">Crear Estructura</button>
    </div>

    <!-- Estructura creada -->
    <div v-else>
      <!-- Info de la estructura -->
      <div class="structure-info">
        <div class="info-grid">
          <div class="info-item">
            <strong>Cubetas:</strong> {{ estructura.cubetas }}
          </div>
          <div class="info-item">
            <strong>Registros/Cubeta:</strong> {{ estructura.registrosPorCubeta }}
          </div>
          <div class="info-item">
            <strong>Capacidad Total:</strong> {{ estructura.capacidadTotal }}
          </div>
          <div class="info-item">
            <strong>Registros Ocupados:</strong> {{ cantidadElementos }}
          </div>
          <div class="info-item">
            <strong>Ocupación:</strong> {{ porcentajeOcupacion.toFixed(2) }}%
          </div>
          <div class="info-item">
            <strong>Densidad Reducción:</strong> {{ densidadReduccion.toFixed(2) }}
          </div>
          <div class="info-item">
            <strong>Tipo Operación:</strong> {{ config.tipoOperacion }}
          </div>
          <div class="info-item" v-if="config.tipoOperacion === 'parcial'">
            <strong>Expansiones Parciales:</strong> {{ estructura.expansionesParciales }}
          </div>
          <div class="info-item" v-if="config.tipoOperacion === 'parcial'">
            <strong>Reducciones Parciales:</strong> {{ estructura.reduccionesParciales }}
          </div>
        </div>
      </div>

      <!-- Operaciones -->
      <div class="operations">
        <input 
          type="number" 
          v-model.number="elementoInsertar" 
          placeholder="Elemento a insertar"
          @keyup.enter="insertar"
        />
        <div id="general-nav">
          <button @click="insertar">Insertar</button>
          <button @click="buscar">Buscar</button>
          <button @click="eliminar">Eliminar</button>
          <button @click="resetearEstructura" class="btn-danger">Resetear</button>
        </div>
      </div>

      <!-- Mensaje -->
      <p v-if="mensaje" class="message">{{ mensaje }}</p>

      <!-- Resultado de búsqueda -->
      <p v-if="resultado" class="result">{{ resultado }}</p>

      <!-- Visualización de la estructura -->
      <div class="structure-display">
        <h3>Estructura Dinámica</h3>
        
        <div class="cubetas-container">
          <div 
            v-for="index in estructura.cubetas" 
            :key="`cubeta-${index-1}`"
            class="cubeta"
            :class="{ 'highlight-cubeta': ultimaCubetaAfectada === (index-1) }"
          >
            <div class="cubeta-header">Cubeta {{ index-1 }}</div>
            
            <div class="cubeta-content">
              <!-- Registros dentro de la capacidad -->
              <div 
                v-for="regIndex in estructura.registrosPorCubeta" 
                :key="`reg-${index-1}-${regIndex-1}`"
                class="registro"
                :class="{ 
                  'empty': !estructura.tabla[index-1][regIndex-1],
                  'highlight': ultimoElementoInsertado === estructura.tabla[index-1][regIndex-1]
                }"
              >
                <div class="pos">{{ index-1 }}.{{ regIndex-1 }}</div>
                <div class="value">
                  {{ estructura.tabla[index-1][regIndex-1] || '-' }}
                </div>
              </div>
            </div>

            <!-- Registros desbordados (fuera de la estructura) -->
            <div v-if="estructura.desbordamientos[index-1] && estructura.desbordamientos[index-1].length > 0" 
                 class="desbordamiento-area">
              <div class="desbordamiento-header">Desbordamiento</div>
              <div 
                v-for="(valor, desbIndex) in estructura.desbordamientos[index-1]" 
                :key="`desb-${index-1}-${desbIndex}`"
                class="registro desbordamiento"
                :class="{ 'highlight': ultimoElementoInsertado === valor }"
              >
                <div class="pos">D{{ desbIndex }}</div>
                <div class="value">{{ valor }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicador de expansión -->
        <div v-if="mostrarIndicadorExpansion" class="expansion-indicator">
          ⚠️ Se alcanzó el 80% de ocupación - Expandiendo estructura...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { HashModulo } from '../utils/funciones';

interface Config {
  cubetas: number;
  registrosPorCubeta: number;
  tipoOperacion: 'total' | 'parcial';
}

interface Estructura {
  cubetas: number;
  registrosPorCubeta: number;
  capacidadTotal: number;
  tabla: (number | null)[][];
  desbordamientos: number[][];
  expansiones: number;
  reducciones: number;
  expansionesParciales: number;
  reduccionesParciales: number;
}

const config = ref<Config>({
  cubetas: 8,
  registrosPorCubeta: 2,
  tipoOperacion: 'total'
});

const estructuraCreada = ref(false);
const estructura = ref<Estructura>({
  cubetas: 0,
  registrosPorCubeta: 0,
  capacidadTotal: 0,
  tabla: [],
  desbordamientos: [],
  expansiones: 0,
  reducciones: 0,
  expansionesParciales: 0,
  reduccionesParciales: 0
});

const elementoInsertar = ref<number | null>(null);
const mensaje = ref('');
const resultado = ref('');
const ultimaCubetaAfectada = ref<number | null>(null);
const ultimoElementoInsertado = ref<number | null>(null);
const mostrarIndicadorExpansion = ref(false);

const cantidadElementos = computed(() => {
  let count = 0;
  // Contar elementos en la tabla
  for (let i = 0; i < estructura.value.cubetas; i++) {
    for (let j = 0; j < estructura.value.registrosPorCubeta; j++) {
      if (estructura.value.tabla[i][j] !== null) {
        count++;
      }
    }
  }
  // Contar elementos desbordados
  for (let i = 0; i < estructura.value.cubetas; i++) {
    count += estructura.value.desbordamientos[i].length;
  }
  return count;
});

const porcentajeOcupacion = computed(() => {
  if (estructura.value.capacidadTotal === 0) return 0;
  return (cantidadElementos.value / estructura.value.capacidadTotal) * 100;
});

const densidadReduccion = computed(() => {
  if (estructura.value.cubetas === 0) return 0;
  return cantidadElementos.value / estructura.value.cubetas;
});

function crearEstructura() {
  if (config.value.cubetas <= 0 || config.value.registrosPorCubeta <= 0) {
    alert('Por favor ingrese valores válidos para cubetas y registros');
    return;
  }

  estructura.value = {
    cubetas: config.value.cubetas,
    registrosPorCubeta: config.value.registrosPorCubeta,
    capacidadTotal: config.value.cubetas * config.value.registrosPorCubeta,
    tabla: Array.from({ length: config.value.cubetas }, () => 
      Array(config.value.registrosPorCubeta).fill(null)
    ),
    desbordamientos: Array.from({ length: config.value.cubetas }, () => []),
    expansiones: 0,
    reducciones: 0,
    expansionesParciales: 0,
    reduccionesParciales: 0
  };

  estructuraCreada.value = true;
  mensaje.value = 'Estructura creada correctamente';
  setTimeout(() => mensaje.value = '', 3000);
}

function insertar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    mensaje.value = 'Por favor ingrese un elemento válido';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const elemento = elementoInsertar.value;
  
  // Verificar si el elemento ya existe
  if (existeElemento(elemento)) {
    mensaje.value = `El elemento ${elemento} ya existe en la estructura`;
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  // Calcular hash módulo
  const cubeta = HashModulo(elemento, estructura.value.cubetas);
  
  // Intentar insertar en la cubeta correspondiente
  let insertado = false;
  for (let i = 0; i < estructura.value.registrosPorCubeta; i++) {
    if (estructura.value.tabla[cubeta][i] === null) {
      estructura.value.tabla[cubeta][i] = elemento;
      insertado = true;
      break;
    }
  }

  // Si no hay espacio, agregar a desbordamiento
  if (!insertado) {
    estructura.value.desbordamientos[cubeta].push(elemento);
  }

  ultimaCubetaAfectada.value = cubeta;
  ultimoElementoInsertado.value = elemento;
  mensaje.value = `Elemento ${elemento} insertado en cubeta ${cubeta}`;
  elementoInsertar.value = null;

  setTimeout(() => {
    mensaje.value = '';
    ultimaCubetaAfectada.value = null;
    ultimoElementoInsertado.value = null;
  }, 2000);

  // Verificar si se necesita expansión
  verificarExpansion();
}

function existeElemento(elemento: number): boolean {
  // Buscar en la tabla
  for (let i = 0; i < estructura.value.cubetas; i++) {
    for (let j = 0; j < estructura.value.registrosPorCubeta; j++) {
      if (estructura.value.tabla[i][j] === elemento) {
        return true;
      }
    }
    // Buscar en desbordamientos
    if (estructura.value.desbordamientos[i].includes(elemento)) {
      return true;
    }
  }
  return false;
}

function buscar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    resultado.value = 'Por favor ingrese un elemento válido';
    setTimeout(() => resultado.value = '', 3000);
    return;
  }

  const elemento = elementoInsertar.value;
  const cubeta = HashModulo(elemento, estructura.value.cubetas);

  // Buscar en la tabla
  for (let i = 0; i < estructura.value.registrosPorCubeta; i++) {
    if (estructura.value.tabla[cubeta][i] === elemento) {
      ultimaCubetaAfectada.value = cubeta;
      ultimoElementoInsertado.value = elemento;
      resultado.value = `✓ Elemento ${elemento} encontrado en cubeta ${cubeta}, posición ${i}`;
      
      setTimeout(() => {
        resultado.value = '';
        ultimaCubetaAfectada.value = null;
        ultimoElementoInsertado.value = null;
      }, 3000);
      return;
    }
  }

  // Buscar en desbordamientos
  const indexDesb = estructura.value.desbordamientos[cubeta].indexOf(elemento);
  if (indexDesb !== -1) {
    ultimaCubetaAfectada.value = cubeta;
    ultimoElementoInsertado.value = elemento;
    resultado.value = `✓ Elemento ${elemento} encontrado en desbordamiento de cubeta ${cubeta}`;
    
    setTimeout(() => {
      resultado.value = '';
      ultimaCubetaAfectada.value = null;
      ultimoElementoInsertado.value = null;
    }, 3000);
    return;
  }

  resultado.value = `✗ Elemento ${elemento} no encontrado`;
  setTimeout(() => resultado.value = '', 3000);
}

function eliminar() {
  if (elementoInsertar.value === null || elementoInsertar.value === undefined) {
    mensaje.value = 'Por favor ingrese un elemento válido';
    setTimeout(() => mensaje.value = '', 3000);
    return;
  }

  const elemento = elementoInsertar.value;
  const cubeta = HashModulo(elemento, estructura.value.cubetas);

  // Buscar en la tabla
  for (let i = 0; i < estructura.value.registrosPorCubeta; i++) {
    if (estructura.value.tabla[cubeta][i] === elemento) {
      estructura.value.tabla[cubeta][i] = null;
      ultimaCubetaAfectada.value = cubeta;
      mensaje.value = `Elemento ${elemento} eliminado de cubeta ${cubeta}`;
      elementoInsertar.value = null;
      
      setTimeout(() => {
        mensaje.value = '';
        ultimaCubetaAfectada.value = null;
      }, 2000);
      
      // Verificar si se necesita reducción
      verificarReduccion();
      return;
    }
  }

  // Buscar en desbordamientos
  const indexDesb = estructura.value.desbordamientos[cubeta].indexOf(elemento);
  if (indexDesb !== -1) {
    estructura.value.desbordamientos[cubeta].splice(indexDesb, 1);
    ultimaCubetaAfectada.value = cubeta;
    mensaje.value = `Elemento ${elemento} eliminado del desbordamiento de cubeta ${cubeta}`;
    elementoInsertar.value = null;
    
    setTimeout(() => {
      mensaje.value = '';
      ultimaCubetaAfectada.value = null;
    }, 2000);
    
    // Verificar si se necesita reducción
    verificarReduccion();
    return;
  }

  mensaje.value = `Elemento ${elemento} no encontrado`;
  setTimeout(() => mensaje.value = '', 3000);
}

function verificarExpansion() {
  if (porcentajeOcupacion.value >= 75) {
    mostrarIndicadorExpansion.value = true;
    
    setTimeout(() => {
      expandirEstructura();
      mostrarIndicadorExpansion.value = false;
    }, 1500);
  }
}

function verificarReduccion() {
  // Verificar si se necesita reducción: densidad menor a 80% (0.8 registros por cubeta)
  // Solo reducir si hay más de 2 cubetas para evitar estructuras muy pequeñas
  if (densidadReduccion.value < 0.8 && estructura.value.cubetas > 2) {
    setTimeout(() => {
      reducirEstructura();
    }, 1500);
  }
}

function expandirEstructura() {
  // Guardar todos los elementos en orden de inserción
  const elementosOrdenados: number[] = [];
  
  // Recorrer cubetas en orden
  for (let i = 0; i < estructura.value.cubetas; i++) {
    // Primero los elementos de la tabla
    for (let j = 0; j < estructura.value.registrosPorCubeta; j++) {
      const valor = estructura.value.tabla[i][j];
      if (valor !== null) {
        elementosOrdenados.push(valor);
      }
    }
    // Luego los desbordamientos
    estructura.value.desbordamientos[i].forEach(valor => {
      elementosOrdenados.push(valor);
    });
  }

  let nuevasCubetas: number;
  let tipoExpansion: string;

  if (config.value.tipoOperacion === 'parcial') {
    // Lógica de expansión parcial
    estructura.value.expansionesParciales++;
    
    // Cada 2 expansiones parciales = 1 total
    if (estructura.value.expansionesParciales % 2 === 1) {
      // Primera expansión parcial: +1 cubeta
      nuevasCubetas = estructura.value.cubetas + 1;
      tipoExpansion = `Parcial ${estructura.value.expansionesParciales}`;
    } else {
      // Segunda expansión parcial: duplicar desde 2 posiciones atrás
      // Secuencia: 2->3->4->6->8->10->12->20->24
      const posicionesAtras = estructura.value.cubetas - 1; // Una posición atrás de la actual
      nuevasCubetas = estructura.value.cubetas + posicionesAtras;
      tipoExpansion = `Parcial ${estructura.value.expansionesParciales} (=Total)`;
      estructura.value.expansiones++;
    }
  } else {
    // Expansión total: duplicar
    nuevasCubetas = estructura.value.cubetas * 2;
    estructura.value.expansiones++;
    tipoExpansion = `Total ${estructura.value.expansiones}`;
  }

  estructura.value.cubetas = nuevasCubetas;
  estructura.value.capacidadTotal = nuevasCubetas * estructura.value.registrosPorCubeta;
  estructura.value.tabla = Array.from({ length: nuevasCubetas }, () => 
    Array(estructura.value.registrosPorCubeta).fill(null)
  );
  estructura.value.desbordamientos = Array.from({ length: nuevasCubetas }, () => []);

  // Reinsertar todos los elementos en orden
  elementosOrdenados.forEach(elemento => {
    const cubeta = HashModulo(elemento, estructura.value.cubetas);
    
    let insertado = false;
    for (let i = 0; i < estructura.value.registrosPorCubeta; i++) {
      if (estructura.value.tabla[cubeta][i] === null) {
        estructura.value.tabla[cubeta][i] = elemento;
        insertado = true;
        break;
      }
    }
    
    if (!insertado) {
      estructura.value.desbordamientos[cubeta].push(elemento);
    }
  });

  mensaje.value = `¡Estructura expandida! Ahora tiene ${nuevasCubetas} cubetas (Expansión ${tipoExpansion})`;
  setTimeout(() => mensaje.value = '', 4000);
}

function reducirEstructura() {
  // Guardar todos los elementos en orden de inserción
  const elementosOrdenados: number[] = [];
  
  // Recorrer cubetas en orden
  for (let i = 0; i < estructura.value.cubetas; i++) {
    // Primero los elementos de la tabla
    for (let j = 0; j < estructura.value.registrosPorCubeta; j++) {
      const valor = estructura.value.tabla[i][j];
      if (valor !== null) {
        elementosOrdenados.push(valor);
      }
    }
    // Luego los desbordamientos
    estructura.value.desbordamientos[i].forEach(valor => {
      elementosOrdenados.push(valor);
    });
  }

  let nuevasCubetas: number;
  let tipoReduccion: string;

  if (config.value.tipoOperacion === 'parcial') {
    // Lógica de reducción parcial
    estructura.value.reduccionesParciales++;
    
    // Cada 2 reducciones parciales = 1 total
    if (estructura.value.reduccionesParciales % 2 === 1) {
      // Primera reducción parcial: -1 cubeta
      nuevasCubetas = Math.max(2, estructura.value.cubetas - 1);
      tipoReduccion = `Parcial ${estructura.value.reduccionesParciales}`;
    } else {
      // Segunda reducción parcial: reducir más significativamente
      // Inverso de la lógica de expansión
      const reduccionExtra = Math.floor(estructura.value.cubetas / 3);
      nuevasCubetas = Math.max(2, estructura.value.cubetas - reduccionExtra);
      tipoReduccion = `Parcial ${estructura.value.reduccionesParciales} (=Total)`;
      estructura.value.reducciones++;
    }
  } else {
    // Reducción total: dividir a la mitad
    nuevasCubetas = Math.max(2, Math.floor(estructura.value.cubetas / 2));
    estructura.value.reducciones++;
    tipoReduccion = `Total ${estructura.value.reducciones}`;
  }

  estructura.value.cubetas = nuevasCubetas;
  estructura.value.capacidadTotal = nuevasCubetas * estructura.value.registrosPorCubeta;
  estructura.value.tabla = Array.from({ length: nuevasCubetas }, () => 
    Array(estructura.value.registrosPorCubeta).fill(null)
  );
  estructura.value.desbordamientos = Array.from({ length: nuevasCubetas }, () => []);

  // Reinsertar todos los elementos en orden
  elementosOrdenados.forEach(elemento => {
    const cubeta = HashModulo(elemento, estructura.value.cubetas);
    
    let insertado = false;
    for (let i = 0; i < estructura.value.registrosPorCubeta; i++) {
      if (estructura.value.tabla[cubeta][i] === null) {
        estructura.value.tabla[cubeta][i] = elemento;
        insertado = true;
        break;
      }
    }
    
    if (!insertado) {
      estructura.value.desbordamientos[cubeta].push(elemento);
    }
  });

  mensaje.value = `¡Estructura reducida! Ahora tiene ${nuevasCubetas} cubetas (Reducción ${tipoReduccion})`;
  setTimeout(() => mensaje.value = '', 4000);
}

function resetearEstructura() {
  if (confirm('¿Estás seguro de que deseas resetear la estructura?')) {
    estructuraCreada.value = false;
    estructura.value = {
      cubetas: 0,
      registrosPorCubeta: 0,
      capacidadTotal: 0,
      tabla: [],
      desbordamientos: [],
      expansiones: 0,
      reducciones: 0,
      expansionesParciales: 0,
      reduccionesParciales: 0
    };
    elementoInsertar.value = null;
    mensaje.value = '';
    resultado.value = '';
    ultimaCubetaAfectada.value = null;
    ultimoElementoInsertado.value = null;
  }
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
  max-width: 600px;
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

.cubetas-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  justify-content: flex-start;
}

.cubeta {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
  padding: 0.75rem;
  min-width: 120px;
  max-width: 150px;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
}

.cubeta.highlight-cubeta {
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
}

.cubeta-header {
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

.cubeta-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 28px;
}

.registro {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px 8px 8px 8px;
  text-align: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  min-height: 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.registro .pos {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(15, 23, 42, 0.06);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #334155;
}

.registro .value {
  font-weight: 700;
  margin-top: 8px;
  font-size: 1rem;
  color: #0f172a;
}

.registro.empty {
  opacity: 0.5;
  background: linear-gradient(180deg, #ffffff 0%, #fefefe 100%);
  border-style: dashed;
}

.registro.empty .value {
  color: #94a3b8;
}

.registro.highlight {
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

.desbordamiento-area {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 2px dashed #f59e0b;
}

.desbordamiento-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: #92400e;
  text-align: center;
  margin-bottom: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.25rem;
  border-radius: 4px;
}

.registro.desbordamiento {
  border-color: #fbbf24;
  background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);
}

.registro.desbordamiento .pos {
  background: rgba(245, 158, 11, 0.15);
  color: #92400e;
}

.expansion-indicator {
  margin-top: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 2px solid #f59e0b;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: #92400e;
  animation: expandPulse 1.5s infinite;
}

@keyframes expandPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .config-row {
    flex-direction: column;
  }
  
  .config-row > div {
    width: 100%;
  }
  
  .cubetas-container {
    padding: 0.5rem;
  }
  
  .cubeta {
    min-width: 100px;
  }
  
  .registro {
    min-height: 45px;
  }
  
  .registro .value {
    font-size: 0.9rem;
  }
}
</style>
