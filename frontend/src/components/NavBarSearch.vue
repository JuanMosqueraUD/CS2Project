<script setup>
import { ref } from 'vue';

const mode = ref('');

</script>

<template>
  <div class="nav">
    <button @click="mode = 'Interna'" href="#" class="contrast"> Internas</button>
    <button @click="mode = 'Externa'" href="#" class="contrast"> Externas</button>
  </div>

  <div>
    <p v-if="mode === 'Interna'"></p>
    <p v-if="mode === 'Externa'"></p>
  </div>


</template>
