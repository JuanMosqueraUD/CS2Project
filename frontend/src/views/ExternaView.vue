<script setup>

</script>


<template>
  <div>
    <h1 class="title">Búsquedas Externas</h1>
    <p>Selecciona un algoritmo:</p>
    <button @click="mode = 'arbolB'">Árbol B</button>
    <button @click="mode = 'arbolBMas'">Árbol B+</button>
    <button @click="mode = 'arbolBStar'">Árbol B*</button>

    <div v-if="mode === 'arbolB'">
      <p>🔹 Aquí se renderizaría la animación/explicación de árbol B</p>
    </div>
    <div v-if="mode === 'arbolBMas'">
      <p>🔹 Aquí se renderizaría la animación/explicación de árbol B+</p>
    </div>
    <div v-if="mode === 'arbolBStar'">
      <p>🔹 Aquí se renderizaría la animación/explicación de árbol B*</p>
    </div>
  </div>
</template>