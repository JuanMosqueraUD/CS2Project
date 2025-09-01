<script setup lang="ts">
import { ref } from 'vue';
import IntLineal from '../components/IntLineal.vue';
const mode = ref('')
</script>


<template>
  <div>
    <p>Selecciona un algoritmo:</p>
    <div class="grid">
      <button @click="mode = 'lineal'">Lineal</button>
      <button @click="mode = 'binaria'">Binaria</button>
      <button @click="mode = 'Funciones hash'">Hash</button>
    </div>

    <div v-if="mode === 'lineal'">
      <IntLineal/>
    </div>
    <div v-if="mode === 'binaria'">
      <p>🔹 Aquí se renderizaría la búsqueda binaria</p>
    </div>
    <div v-if="mode === 'hash'">
      <p>🔹 Aquí se renderizaría la búsqueda hash (cuadrado, módulo, etc.)</p>
    </div>
  </div>
</template>

