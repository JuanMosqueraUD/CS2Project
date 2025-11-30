<script setup>
import { ref, provide } from 'vue';
import { NavigationKey } from '../composables/useNavigation';

// Sistema de navegación por niveles
const currentLevel = ref('main'); // main, busquedas, grafos, interna, externa, hash, residuos, externalHash, graphOperations, graphTrees, graphRepresentation
const previousLevel = ref([]);

// Funciones de navegación
function navigateTo(level) {
  previousLevel.value.push(currentLevel.value);
  currentLevel.value = level;
}

function goBack() {
  if (previousLevel.value.length > 0) {
    currentLevel.value = previousLevel.value.pop();
  }
}

function resetNavigation() {
  currentLevel.value = 'main';
  previousLevel.value = [];
}

// Proveer contexto de navegación a las vistas
provide(NavigationKey, { navigateTo });
</script>


<template>
  <!-- Nivel Principal -->
  <nav v-if="currentLevel === 'main'" class="main-nav">
    <button @click="navigateTo('busquedas')" class="outline contrast">Búsquedas</button>
    <button @click="navigateTo('grafos')" class="outline contrast">Grafos</button>
  </nav>

  <!-- Nivel: Búsquedas (Interna/Externa) -->
  <nav v-if="currentLevel === 'busquedas'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div id="general-nav">
      <button @click="navigateTo('interna')" class="outline contrast">Búsqueda Interna</button>
      <button @click="navigateTo('externa')" class="outline contrast">Búsqueda Externa</button>
    </div>
  </nav>

  <!-- Nivel: Búsqueda Interna -->
  <nav v-if="currentLevel === 'interna'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div id="general-nav">
      <button class="outline contrast">
        <router-link to="/lineal" class="outline contrast">Búsqueda Lineal</router-link>
      </button>
      <button class="outline contrast">
        <router-link to="/binaria" class="outline contrast">Búsqueda Binaria</router-link>
      </button>
      <button @click="navigateTo('hash')" class="outline contrast">Funciones Hash</button>
      <button @click="navigateTo('residuos')" class="outline contrast">Otras</button>
    </div>
  </nav>

  <!-- Nivel: Funciones Hash (Interna) -->
  <nav v-if="currentLevel === 'hash'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div class="hash-options">
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
  </nav>

  <!-- Nivel: Otras (Residuos) -->
  <nav v-if="currentLevel === 'residuos'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div class="hash-options">

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
  </nav>

  <!-- Nivel: Búsqueda Externa -->
  <nav v-if="currentLevel === 'externa'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div id="general-nav">
      <button class="outline contrast">
        <router-link to="/external/lineal" class="outline contrast">Búsqueda Lineal</router-link>
      </button>
      <button class="outline contrast">
        <router-link to="/external/binaria" class="outline contrast">Búsqueda Binaria</router-link>
      </button>
      <button @click="navigateTo('externalHash')" class="outline contrast">Búsquedas Hash</button>
      <button class="outline contrast">
        <router-link to="/external/estructuras-dinamicas" class="outline contrast">Estructuras Dinámicas</router-link>
      </button>
      <button class="outline contrast">
        <router-link to="/external/indices" class="outline contrast">Índices</router-link>
      </button>
    </div>
  </nav>

  <!-- Nivel: Hash Externo -->
  <nav v-if="currentLevel === 'externalHash'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div class="hash-options">
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
  </nav>

  <!-- Nivel: Grafos (Operaciones/Árboles/Representación) -->
  <nav v-if="currentLevel === 'grafos'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div id="general-nav">
      <button @click="navigateTo('graphOperations')" class="outline contrast">Operaciones con Grafos</button>
      <button @click="navigateTo('graphTrees')" class="outline contrast">Árboles</button>
      <button @click="navigateTo('graphRepresentation')" class="outline contrast">Representación de Grafos</button>
    </div>
  </nav>

  <!-- Nivel: Operaciones con Grafos -->
  <nav v-if="currentLevel === 'graphOperations'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div class="graph-section">
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
  </nav>

  <!-- Nivel: Árboles -->
  <nav v-if="currentLevel === 'graphTrees'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div id="general-nav">
      <button class="outline contrast">
        <router-link to="/grafos/arboles/expansion" class="outline contrast">Árboles de Expansión</router-link>
      </button>
      <button class="outline contrast">
        <router-link to="/grafos/arboles/floyd" class="outline contrast">Algoritmo de Floyd</router-link>
      </button>
    </div>
  </nav>

  <!-- Nivel: Representación de Grafos -->
  <nav v-if="currentLevel === 'graphRepresentation'" id="subnav">
    <button @click="goBack()" class="btn-back outline">← Volver</button>
    <div class="graph-section">
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
  </nav>

</template>

<style>
.main-nav {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.main-nav button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

#subnav {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.btn-back {
  flex-shrink: 0;
  width: auto;
  padding: 0.5rem 1rem;
  font-weight: 600;
  margin: 0;
}

.hash-options {
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
}

.hash-options h4 {
  margin-bottom: 1rem;
  margin-top: 0;
  text-align: center;
}

.graph-section {
  flex: 1;
  padding: 1rem;
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
}

.graph-section h4 {
  margin-bottom: 1rem;
  margin-top: 0;
  text-align: center;
}

#general-nav {
  flex: 1;
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
}

#general-nav button {
  padding: 0.75rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 500;
}

/* Asegurar que los enlaces dentro de botones no tengan estilos conflictivos */
button.outline.contrast a {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
