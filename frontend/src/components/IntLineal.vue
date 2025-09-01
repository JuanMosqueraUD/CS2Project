<script setup lang="ts">
import { ref } from "vue";

const estructura = ref<Set<number>>(new Set());
const temporal = ref<number>();

const buscar = () => {
  alert("Ejecutar búsqueda lineal aquí");
};

const eliminar = () => {
  // Elimina el último elemento insertado (no hay pop en Set, así que debes convertirlo a array)
  const arr = Array.from(estructura.value);
  arr.pop();
  estructura.value = new Set(arr);
};

const agregar = () => {
  if (temporal.value !== undefined) {
    estructura.value.add(temporal.value);
    temporal.value = undefined; // Limpiar el input
  } else {
    alert("Por favor ingresa un número válido.");
  }
};

</script>

<template>

    <h3 class="title">Búsqueda Lineal</h3>
    <p>Implementación de búsqueda lineal en un arreglo.</p>

    <div class="input-row">
      <input id="elemento" v-model="temporal" placeholder="Ingresa elemento" type="number" />
      <button @click="agregar">Agregar</button>
      <button @click="buscar">Buscar</button>
      <button @click="eliminar">Eliminar</button>
    </div>

  <div>
    <p>Elementos: {{ Array.from(estructura).join(', ') }}</p>
    <p>🔹 Aquí se renderizaría la animación/explicación de búsqueda lineal</p>
  </div>

</template>

<style scoped>

.input-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 1em;
    gap: 10px;
}

#elemento {
  width: 300px;
  margin-bottom: 0;
}

</style>