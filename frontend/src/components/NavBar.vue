<template>
  <nav class="nav">
    <router-link to="/" href="#"> Home</router-link>
    <router-link to="/interna" href="#"> Búsquedas Internas</router-link>
    <router-link to="/externa" href="#"> Búsquedas Externas</router-link>
    <router-link to="/colisiones" href="#"> Colisiones</router-link>
    <router-link to="/grafos" href="#"> Grafos</router-link>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}
</style>
