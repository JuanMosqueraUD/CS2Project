<script setup>
import { ref } from 'vue';

const mode = ref('');
const searchMode = ref('');
const internalAlgorithm = ref('');
const hashFunction = ref('');
const residuosOpen = ref(false);
const graphMode = ref('');
</script>


<template>
  <nav class="grid">
    <li><strong>Algoritmo:</strong></li>
    <button @click="mode = mode === 'Busquedas' ? '' : 'Busquedas'" class="outline contrast"> Búsquedas</button>
    <button @click="mode = mode === 'Grafos' ? '' : 'Grafos'" class="outline contrast"> Grafos</button>
  </nav>

  <div v-if="mode === 'Busquedas'" id ="subnav">
    <div id="general-nav">
      <button @click="searchMode = searchMode === 'Interna' ? '' : 'Interna'" class="outline contrast">Interna</button>
      <button @click="searchMode = searchMode === 'Externa' ? '' : 'Externa'" class="outline contrast">Externa</button>
    </div>

    <!-- Búsqueda Interna -->
    <div v-if="searchMode === 'Interna'" class="internal-search">
      <div id="general-nav">
        <button class="outline contrast">
          <router-link to="/lineal" class="outline contrast">Búsqueda Lineal</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/binaria" class="outline contrast">Búsqueda Binaria</router-link>
        </button>
        <button @click="internalAlgorithm = internalAlgorithm === 'Hash' ? '' : 'Hash'" class="outline contrast">Funciones Hash</button>
        <button @click="internalAlgorithm = internalAlgorithm === 'Residuos' ? '' : 'Residuos'" class="outline contrast">Otras</button>
      </div>

      <!-- Opciones de Hash -->
      <div v-if="internalAlgorithm === 'Hash'" class="hash-options">
        <h4>Función:</h4>
        <div id="general-nav">
          <button class="outline contrast">
            <router-link :to="{ name: 'hashmod', query: { funcion: 'mod' } }" class="outline contrast">Función Módulo</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'hashmod', query: { funcion: 'cuadrado' } }" class="outline contrast">Función Cuadrado</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'hashmod', query: { funcion: 'truncamiento' } }" class="outline contrast">Función Truncamiento</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'hashmod', query: { funcion: 'plegamiento' } }" class="outline contrast">Función Plegamiento</router-link>
          </button>
        </div>
      </div>

      <!-- Opciones de Residuos -->
      <div v-if="internalAlgorithm === 'Residuos'" class="hash-options">
        <div id="general-nav">
          <button class="outline contrast">
            <router-link :to="{ name: 'residuo-digital' }" class="outline contrast">Árbol Digital</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'residuo-simple' }" class="outline contrast">Árbol de Residuos</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'residuo-multiple' }" class="outline contrast">Árbol de Residuos Múltiples</router-link>
          </button>
          <button class="outline contrast">
            <router-link :to="{ name: 'residuo-huffman' }" class="outline contrast">Árbol de Huffman</router-link>
          </button>
        </div>
      </div>
    </div>

    <!-- Búsqueda Externa -->
    <div v-if="searchMode === 'Externa'" class="external-search">
      <div id="general-nav">
        <button class="outline contrast">
          <router-link to="/external/lineal" class="outline contrast">Búsqueda Lineal</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/external/binaria" class="outline contrast">Búsqueda Binaria</router-link>
        </button>
        <button @click="internalAlgorithm = internalAlgorithm === 'ExternalHash' ? '' : 'ExternalHash'" class="outline contrast">Búsquedas Hash</button>
        <button class="outline contrast">
          <router-link to="/external/estructuras-dinamicas" class="outline contrast">Estructuras Dinámicas</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/external/indices" class="outline contrast">Índices</router-link>
        </button>
      </div>

      <!-- Opciones de Hash Externo -->
      <div v-if="internalAlgorithm === 'ExternalHash'" class="hash-options">
        <h4>Función Hash Externa:</h4>
        <div id="general-nav">
          <button class="outline contrast">
            <router-link to="/external/hash/modulo" class="outline contrast">Módulo</router-link>
          </button>
          <button class="outline contrast">
            <router-link to="/external/hash/cuadrado" class="outline contrast">Cuadrado</router-link>
          </button>
          <button class="outline contrast">
            <router-link to="/external/hash/plegamiento" class="outline contrast">Plegamiento</router-link>
          </button>
          <button class="outline contrast">
            <router-link to="/external/hash/truncamiento" class="outline contrast">Truncamiento</router-link>
          </button>
          <button class="outline contrast">
            <router-link to="/external/hash/cambio-base" class="outline contrast">Cambio de Base</router-link>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="mode === 'Grafos'" id="subnav">
    <div id="general-nav">
      <button @click="graphMode = graphMode === 'Operaciones' ? '' : 'Operaciones'" class="outline contrast">Operaciones con Grafos</button>
      <button @click="graphMode = graphMode === 'Arboles' ? '' : 'Arboles'" class="outline contrast">Árboles</button>
      <button @click="graphMode = graphMode === 'Representacion' ? '' : 'Representacion'" class="outline contrast">Representación de Grafos</button>
    </div>

    <!-- Operaciones de Grafos -->
    <div v-if="graphMode === 'Operaciones'" class="graph-operations">
      <h4>Tipo de operaciones:</h4>
      <div id="general-nav">
        <button class="outline contrast">
          <router-link to="/grafos/operaciones/entre-grafos" class="outline contrast">Operaciones entre 2 Grafos</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/grafos/operaciones/un-grafo" class="outline contrast">Operaciones en un Grafo</router-link>
        </button>
      </div>
    </div>

    <!-- Árboles -->
    <div v-if="graphMode === 'Arboles'" class="graph-trees">
      <div id="general-nav">
        <button class="outline contrast">
          <router-link to="/grafos/arboles/expansion" class="outline contrast">Árboles de Expansión</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/grafos/arboles/floyd" class="outline contrast">Algoritmo de Floyd</router-link>
        </button>
      </div>
    </div>

    <!-- Representación de Grafos -->
    <div v-if="graphMode === 'Representacion'" class="graph-representation">
      <h4>Formas de representación:</h4>
      <div id="general-nav">
        <button class="outline contrast">
          <router-link to="/grafos/representacion/matriz-adyacencia" class="outline contrast">Matriz de Adyacencia</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/grafos/representacion/lista-adyacencia" class="outline contrast">Lista de Adyacencia</router-link>
        </button>
        <button class="outline contrast">
          <router-link to="/grafos/representacion/matriz-incidencia" class="outline contrast">Matriz de Incidencia</router-link>
        </button>
      </div>
    </div>
  </div>

</template>

<style>
#subnav {
  margin-top: 1rem;
}

.internal-search {
  margin-top: 1rem;
  flex-wrap: wrap;
}

.external-search {
  margin-top: 1rem;
  flex-wrap: wrap;
}

.hash-options {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
}

.hash-options h4 {
  margin-bottom: 0.5rem;
  text-align: center;
}

.graph-operations,
.graph-trees,
.graph-representation {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
}

.graph-operations h4,
.graph-trees h4,
.graph-representation h4 {
  margin-bottom: 0.5rem;
  text-align: center;
}

#general-nav {
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
