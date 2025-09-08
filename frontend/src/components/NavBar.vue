<script setup>
import { ref } from 'vue';

const mode = ref('');
const searchMode = ref('');
const internalAlgorithm = ref('');
const hashFunction = ref('');

</script>


<template>
  <nav class="grid">
    <li><strong>Algoritmo:</strong></li>
    <button @click="mode = 'Busquedas'" class="outline contrast"> Busquedas</button>
    <button @click="mode = 'Grafos'" class="outline contrast"> Grafos</button>
  </nav>

  <div v-if="mode === 'Busquedas'" id ="subnav">
    <div id="general-nav">
      <button @click="searchMode = 'Interna'" class="outline contrast">Interna</button>
      <button @click="searchMode = 'Externa'" class="outline contrast">Externa</button>
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
        <button @click="internalAlgorithm = 'Hash'" class="outline contrast">Funciones Hash</button>
      </div>

      <!-- Opciones de Hash -->
      <div v-if="internalAlgorithm === 'Hash'" class="hash-options">
        <h4>Función:</h4>
        <div id="general-nav">
          <button @click="hashFunction = 'Mod'" class="outline contrast">Función Módulo</button>
          <button @click="hashFunction = 'Cuadrado'" class="outline contrast">Función Cuadrado</button>
          <button @click="hashFunction = 'Truncamiento'" class="outline contrast">Función Truncamiento</button>
          <button @click="hashFunction = 'Plegamiento'" class="outline contrast">Función Plegamiento</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="mode === 'Grafos'">
    <router-link to="/grafos" href="# " class="contrast"> Ir a Grafos</router-link>
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

#general-nav {
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
