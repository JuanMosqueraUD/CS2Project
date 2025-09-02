<script setup>
import { ref } from 'vue';

const mode = ref('');

</script>


<template>
  <nav class="nav">
    <router-link to="/" href="# " class="contrast"> Home</router-link>
    <button @click="mode = 'Busquedas'" href="#" class="contrast"> Busquedas</button>
    <button @click="mode = 'Grafos'" href="#" class="contrast"> Grafos</button>
  </nav>

  <div v-if="mode === 'Busquedas'">
    <button @click="mode = 'Interna'" href="#" class="contrast"> Internas</button>
    <button @click="mode = 'Externa'" href="#" class="contrast"> Externas</button>
  </div>

  <div v-if="mode === 'Grafos'">
    <router-link to="/grafos" href="# " class="contrast"> Ir a Grafos</router-link>
  </div>

</template>

<style scoped>
.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  color: rgb(0, 0, 0);
  
}
</style>
