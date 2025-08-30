<script lang="ts" setup>
import { ref } from 'vue';
import Form from './components/Form.vue';
const message = ref('Hello World');

function addTask(newTask: string) {
    console.log('New task added:', newTask);
}

</script>
<template>
    <main>
        <h1>{{ message }}</h1>
        <Form @add-task="addTask"/>
    </main>
</template>

<style scoped>
main {
    max-width: 800px;
    margin: 1rem auto;
}
</style>


