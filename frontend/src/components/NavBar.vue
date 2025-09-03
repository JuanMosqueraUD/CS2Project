<script setup>
import { ref } from 'vue';
import NavBarSearch from './NavBarSearch.vue';

const mode = ref('');

</script>


<template>
  <nav class="nav">
    <router-link to="/" href="# " class="contrast"> Home</router-link>
    <button @click="mode = 'Busquedas'" href="#" class="contrast"> Busquedas</button>
    <button @click="mode = 'Grafos'" href="#" class="contrast"> Grafos</button>
  </nav>

  <div v-if="mode === 'Busquedas'">
    <NavBarSearch />
  </div>

  <div v-if="mode === 'Grafos'">
    <router-link to="/grafos" href="# " class="contrast"> Ir a Grafos</router-link>
  </div>

</template>

<style>
.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  color: rgb(0, 0, 0);
  
}
</style>
