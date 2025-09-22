# Búsquedas por Residuos

Este documento detalla la sección de "Residuos" y sirve de referencia rápida para el agente y el equipo.

## Vistas creadas
- Árbol Digital (`ResiduoDigital.vue`): inserción, búsqueda y borrado de letras A–Z basados en su código binario de 5 bits.
- Árbol por Residuos (Simple) (`ResiduoSimple.vue`): binario, con conectores internos y letras sólo en hojas.
- Árbol de Residuos Múltiples (`ResiduoMultiple.vue`): m-ario (m∈[1,3]), conectores con aridad 2^m, preconstruido sin colisiones.
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

- `utils/residueTree.ts` (Árbol por Residuos Simple):
  - Nodo RS: `key|null` en hojas, `null` en conectores; `code` en hojas; `left/right` hijos.
  - `insertRS(root, letter)`: inserta sin duplicados. Internos son conectores (sin `key`); letras sólo en hojas. En colisión con hoja, se convierte en conector y se re-inserta la hoja existente avanzando al siguiente bit.
  - `searchRS(root, letter)`: recorre por los 5 bits (sin ciclar), retornando la ruta y si encuentra la hoja.
  - `deleteRS(root, letter)`: borra la hoja y hace poda hacia arriba de conectores vacíos hasta la raíz si corresponde.

- `utils/residueMultiTree.ts` (Árbol de Residuos Múltiples m-ario):
  - Nodo RM: `key|null` (hoja o conector), `code` en hojas, `children[]` para conectores y `labelBits` para indicar el grupo de bits representado.
  - `groupBits(code, m)`: agrupa el string binario de 5 bits en chunks de tamaño m (el último puede ser 1–2 si 5 % m ≠ 0).
  - `buildRMTemplate(m)`: preconstruye el trie completo de conectores para todos los caminos posibles, sin letras. Cada conector conoce sus `labelBits` (p.ej., para m=2: "00", "01", "10", "11").
  - `searchRM(root, letter, m)`: recorre los grupos (índices) y verifica si la hoja está presente.
  - `insertRM(root, letter, m)`: si `root` es nulo, construye la plantilla con `buildRMTemplate(m)`; luego navega por los índices de los grupos hasta el conector terminal y lo convierte en hoja con la letra (no hay colisiones en tiempo de inserción).

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
- Implementar la vista de Huffman.
- Exportar métricas (altura, número de nodos, distribución por nivel).

---

## Árbol por Residuos (Simple): reglas y comportamiento
- Letra → 5 bits (A–Z).
- Estructura estrictamente binaria con conectores internos (sin `key`) y hojas con letras.
- Inserción guiada por bits (0→izquierda, 1→derecha). Si en el camino se encuentra una hoja donde debería seguir descendiendo, dicho nodo se convierte en conector y la hoja existente se re-inserta a partir del siguiente bit, repitiendo hasta separar en ramas distintas.
- Borrado elimina la hoja y realiza poda de conectores vacíos hacia arriba.
- Búsqueda retorna la ruta de bits y permite resaltado/centrado en la visualización.

Visualización:
- Conectores se dibujan con un estilo diferenciado (tonos más fríos y etiqueta "○").
- Hojas muestran la letra.
- Se usan placeholders invisibles para mantener alineación izquierda/derecha cuando un padre tiene un solo hijo.

---

## Árbol de Residuos Múltiples (m-ario): reglas y comportamiento
- Letra → 5 bits; agrupamos en chunks de tamaño m (m∈[1,3]). Ejemplos:
  - m=1 → grupos de 1 bit (2 hijos por conector).
  - m=2 → grupos de 2 bits (4 hijos por conector); el último grupo es 1 bit (2 opciones) cuando 5 % 2 = 1.
  - m=3 → grupos de 3 y 2 bits (8 hijos, luego 4 hijos).
- La aridad por nivel es 2^m (o 2^(chunk final)).
- El trie de conectores se preconstruye totalmente con `buildRMTemplate(m)`; no existen colisiones durante inserción porque todos los caminos posibles ya están presentes como conectores terminales.
- Inserción: se navega por los índices de cada grupo y, al llegar al conector terminal del último grupo, éste se convierte en hoja con la letra.
- Búsqueda: sigue los mismos índices y verifica si el nodo terminal es una hoja con la letra buscada.

Visualización:
- Conectores muestran `labelBits` (p.ej., para m=2 la primera capa: "00", "01", "10", "11").
- Tema oscuro coherente con el proyecto. Se resalta y centra el nodo terminal de la operación.
- Se mantienen espacios con placeholders invisibles para que el orden de hijos (0..2^m−1) sea consistente.
