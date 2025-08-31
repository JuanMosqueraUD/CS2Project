<script setup lang="ts">
import { ref } from 'vue'
const mode = ref('')
</script>


<template>
  <div>
    <h1>Búsquedas Internas</h1>
    <p>Selecciona un algoritmo:</p>
    <button @click="mode = 'lineal'">Lineal</button>
    <button @click="mode = 'binaria'">Binaria</button>
    <button @click="mode = 'hash'">Hash</button>

    <div v-if="mode === 'lineal'">
      <p>🔹 Aquí se renderizaría la animación/explicación de búsqueda lineal</p>
    </div>
    <div v-if="mode === 'binaria'">
      <p>🔹 Aquí se renderizaría la búsqueda binaria</p>
    </div>
    <div v-if="mode === 'hash'">
      <p>🔹 Aquí se renderizaría la búsqueda hash (cuadrado, módulo, etc.)</p>
    </div>
  </div>
</template>

