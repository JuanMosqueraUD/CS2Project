<script lang="ts" setup>
import NavBar from './components/NavBar.vue'
import { ref } from 'vue';
const message = ref('Ciencias de la computacion 2');


</script>
<template>
    <main>
        <h1>{{ message }}</h1>
        <NavBar />
        <router-view />
    </main>
</template>

<style scoped>
main {
    max-width: 800px;
    margin: 1rem auto;
}
</style>


