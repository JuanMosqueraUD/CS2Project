<script setup>
import { ref } from 'vue';

const mode = ref('');

</script>


<template>
  <nav class="nav">
    <router-link to="/" href="# " class="contrast"> Home</router-link>
    <button @click="mode = 'Busquedas'" href="#" class="contrast"> Busquedas</button>
    <router-link to="/grafos" href="#" class="contrast"> Grafos</router-link>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  color: rgb(0, 0, 0);
  
}
</style>
