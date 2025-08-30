<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{
    addTask: [newTask: string]
}>();

const newTask = ref('');
const error = ref('');

function formSubmitted() {
    if (newTask.value.trim() === '') {
        error.value = 'Task cannot be empty';
        return;
    }
    emit('addTask', newTask.value);
    console.log('Form submitted');
    newTask.value = '';
}
</script>

<template>
    <form @submit.prevent="formSubmitted">
        <label>
            New task:
            <input v-model="newTask" name="newTask" :aria-invalid="!!error || undefined"/>
            <small 
            v-if="error" id="invalid-helper" >
                {{ error }}
            </small>
        </label>
    </form>
</template>