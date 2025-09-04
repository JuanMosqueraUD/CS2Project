<script setup>
import { ref } from 'vue';
import NavBarSearch from './NavBarSearch.vue';

const mode = ref('');

</script>


<template>
  <nav class="grid">
    <li><strong>Algoritmo:</strong></li>
    <button @click="mode = 'Busquedas'" class="outline contrast"> Busquedas</button>
    <button @click="mode = 'Grafos'" class="outline contrast"> Grafos</button>
  </nav>

  <div v-if="mode === 'Busquedas'">
    <div class ="grid" id="subnav">
      <button class="outline contrast">Interna</button>
      <button class="outline contrast">Externa</button>
    </div>
  </div>

  <div v-if="mode === 'Grafos'">
    <router-link to="/grafos" href="# " class="contrast"> Ir a Grafos</router-link>
  </div>

</template>

<style>
#subnav {
  margin-top: 0.8rem;
}

</style>
