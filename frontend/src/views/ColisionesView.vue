<script>

</script>

<template>
  <div>
    <h1 class="title">Colisiones</h1>
    <p>Selecciona un método de resolución de colisiones:</p>
    <button @click="mode = 'encadenamiento'">Encadenamiento</button>
    <button @click="mode = 'direccionAbierta'">Dirección Abierta</button>

    <div v-if="mode === 'encadenamiento'">
      <p>🔹 Aquí se renderizaría la animación/explicación de encadenamiento</p>
    </div>
    <div v-if="mode === 'direccionAbierta'">
      <p>🔹 Aquí se renderizaría la animación/explicación de dirección abierta</p>
    </div>
  </div>
</template>

