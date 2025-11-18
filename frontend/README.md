# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Estrategia de colisiones: Arreglos anidados

En la vista `HashMod`, se añadió una estrategia de resolución de colisiones basada en arreglos (listas) anidados:

- Ante una colisión en un índice `i`, se utiliza una segunda estructura paralela del mismo tamaño para almacenar el segundo elemento también en el índice `i`.
- Esta segunda estructura existe desde la creación pero se muestra en la UI solo cuando ocurre al menos una colisión.
- Búsqueda y eliminación consultan primero el arreglo primario y, si no está, el segundo arreglo en el mismo índice.

Limitaciones actuales:

- Por diseño simple, solo se admiten hasta dos elementos por índice (primaria y secundaria). Si ambas están ocupadas, se reporta "estructura anidada llena en ese índice".
- Capacidad permitida para funciones hash: 10, 100, 1000.
