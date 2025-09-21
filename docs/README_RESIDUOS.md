# Búsquedas por Residuos

Este documento detalla la sección de "Residuos" y sirve de referencia rápida para el agente y el equipo.

## Vistas creadas
- Árbol Digital (`ResiduoDigital.vue`): inserción, búsqueda y borrado de letras A–Z basados en su código binario de 5 bits.
- Árbol de Residuos (placeholder): pendiente de lógica.
- Árbol de Residuos Múltiples (placeholder): pendiente de lógica.
- Árbol de Huffman (placeholder): pendiente de lógica.

## Utilidades
- `utils/digitalTree.ts`:
  - `letterToCode(ch)`: mapea A–Z a un string binario de 5 bits.
  - `makeNode(letter)`: crea un nodo con `key` y `code`.
  - `searchLetter(root, letter)`: DFS que retorna `{ found, path, node, parent }`.
  - `insertNode(root, letter)`: inserta sin duplicados. Reutiliza nodos borrados lógicamente si los encuentra.
  - `deleteLetter(root, letter)`: borra el nodo objetivo:
    - Hoja: elimina el nodo.
    - Un hijo: empalma el hijo.
    - Dos hijos: borrado lógico (deja `key = null` y `code = ''`).

## Reglas del Árbol Digital
- Cada letra se traduce a 5 bits; al insertar se recorre según los bits: `0 → izquierda`, `1 → derecha`.
- Si el camino continúa más allá de 5 niveles, se cicla sobre los bits.
- Duplicados no permitidos (verificados por `searchLetter`).
- Borrados lógicos permiten mantener la estructura y ser reutilizados en futuras inserciones.

## Visualización con vis-network
- La vista incluye una opción "Vista gráfica" que usa `vis-network` con layout jerárquico (UD) y colores alineados al proyecto:
  - Nodos: fondo gris oscuro `#111827`, borde `#374151`; highlight ámbar `#f59e0b`.
  - Fuentes: blanco y azules suaves para nodos vacíos (`∅`).
  - Aristas: gris-azul `#94a3b8`, highlight ámbar.
- Se puede alternar entre la vista básica (componentes Vue) y la vista gráfica.
- Al insertar/buscar/borrar, se resalta el nodo objetivo y se centra la cámara.

## Notas de implementación
- El componente recursivo evita TSX y usa `h()` con tipado estricto.
- `highlightPath` se propaga en la recursión para marcar el nodo objetivo con clase `.hl`.
- En modo `vis-network`, se genera un ID por camino (p.ej. `rLRL`) para mapear rutas a nodos.

## Próximos pasos sugeridos
- Añadir animaciones de inserción paso a paso.
- Implementar las vistas de Residuos Simple, Múltiples y Huffman.
- Exportar métricas (altura, número de nodos, distribución por nivel).
