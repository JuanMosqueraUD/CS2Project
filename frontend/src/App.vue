<script lang="ts" setup>
import NavBar from './components/NavBar.vue'
import { ref } from 'vue';
const message = ref('Ciencias de la computacion 2');


</script>
<template>
    <main >
        <div id="header" class="container">
        <h1 class="title">{{ message }}</h1> 
        <NavBar />
        <router-view id="main-content" />
        </div>
    </main>
</template>

<style>

.subtitle{
    text-align: center;

}

.title {
    text-align: center;
}
</style>


