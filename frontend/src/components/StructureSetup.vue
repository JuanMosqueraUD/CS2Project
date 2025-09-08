<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  capacidad: number | null;
  digitosClave: number | null;
  error?: string;
}>();

const emit = defineEmits<{
  (e: "create", capacidad: number | null, digitosClave: number | null): void;
  (e: "update:capacidad", v: number | null): void;
  (e: "update:digitosClave", v: number | null): void;
  (e: "input", ev: Event): void;
}>();

const cap = ref<number | null>(props.capacidad);
const dig = ref<number | null>(props.digitosClave);

watch(
  () => props.capacidad,
  v => (cap.value = v)
);
watch(
  () => props.digitosClave,
  v => (dig.value = v)
);

function onCreate() {
  emit("create", cap.value, dig.value);
}
</script>

<template>
  <div class="create-structure">
    <h3>Crear estructura</h3>
    <div class="row">
      <input
        :value="cap"
        @input="(e:any)=>{ emit('input', e); emit('update:capacidad', e.target.value ? Number(e.target.value) : null) }"
        type="number"
        placeholder="Capacidad (n espacios)"
      />
      <input
        :value="dig"
        @input="(e:any)=>{ emit('input', e); emit('update:digitosClave', e.target.value ? Number(e.target.value) : null) }"
        type="number"
        placeholder="Cantidad de dígitos por clave"
      />
      <button @click="onCreate">Crear estructura</button>
    </div>
    <p v-if="props.error" class="error">{{ props.error }}</p>
  </div>
</template>

<style scoped>
.row { display: flex; gap: .5rem; flex-wrap: wrap; }
.error { color: #b91c1c; margin-top: .5rem; }
</style>
