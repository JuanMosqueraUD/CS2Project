<script lang="ts" setup>
import NavBar from './components/NavBar.vue'
import { ref } from 'vue';
const message = ref('Ciencias de la computacion 2');


</script>
<template>
    <main class="container">
        <div id="header">
        <h1 class="title">{{ message }}</h1>
        <p class="subtitle">
            Juan Pablo Mosquera Marin
        </p>
        </div>
        <NavBar />
        <router-view id="main-content" />
    </main>
</template>

<style>

.subtitle{
    text-align: center;

}

#header {
    background-color: #243953;
}

.title {
    text-align: center;
}
</style>


