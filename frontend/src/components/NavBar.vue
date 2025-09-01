<template>
  <nav class="nav">
    <router-link to="/" href="# " class="contrast"> Home</router-link>
    <router-link to="/interna" href="#" class="contrast"> Búsquedas Internas</router-link>
    <router-link to="/externa" href="#" class="contrast"> Búsquedas Externas</router-link>
    <router-link to="/colisiones" href="#" class="contrast"> Colisiones</router-link>
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
