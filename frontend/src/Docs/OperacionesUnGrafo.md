# Manual técnico y de usuario — OperacionesUnGrafo.vue

Archivo fuente: [frontend/src/views/grafos/OperacionesUnGrafo.vue](frontend/src/views/grafos/OperacionesUnGrafo.vue)

Resumen rápido
- Este componente Vue implementa un editor / transformador de grafos con visualización usando vis-network.
- Provee creación, importación/guardado, inserción/eliminación de nodos y aristas, fusión y contracción de vértices, grafo-línea y complemento del grafo.
- Las funciones y estados clave están dentro de [frontend/src/views/grafos/OperacionesUnGrafo.vue](frontend/src/views/grafos/OperacionesUnGrafo.vue).

Índice
1. Requerimientos y dependencias
2. Estructuras de datos y estado
3. Explicación detallada de funciones y algoritmos
4. Visualización (vis-network) y sincronización
5. Escalabilidad y rendimiento
6. Pruebas recomendadas (unitarias e integración)
7. Manual de usuario — guía de pruebas y uso

---

1) Requerimientos y dependencias
- Vue 3 (Composition API) — uso de refs y lifecycle hooks.
- vis-network (importado como `DataSet`, `Network`) para la visualización.
- Archivo fuente: [frontend/src/views/grafos/OperacionesUnGrafo.vue](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Asegurar que el contenedor DOM referenciado por `graphContainer` exista antes de inicializar la red.

2) Estructuras de datos y estado (variables principales)
- config: configuración del grafo (cantidadNodos, esDirigido, esPonderado).
  - Referencia: [`config`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- grafo: { nodos: Nodo[], aristas: Arista[] }.
  - Tipo Nodo: { id: number | string, label: string }
  - Tipo Arista: { from: number | string, to: number | string, peso?: number }
  - Referencia: [`grafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Estados booleanos: [`grafoCreado`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`grafoLineaAplicado`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`complementoAplicado`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Backup para revertir transformaciones: [`grafoOriginal`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Complemento info: [`complementoInfo`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Vis-network datasets / instancia: [`nodesDataSet`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`edgesDataSet`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`network`](frontend/src/views/grafos/OperacionesUnGrafo.vue)

3) Explicación detallada de funciones y algoritmos
(Se listan las funciones más importantes con su propósito, comportamiento, complejidad esperada y casos límites.)

- Crear y estructura inicial
  - [`crearGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Crea nodos numerados del 1 a N y limpia aristas.
    - Invoca [`inicializarVisualizacion`](frontend/src/views/grafos/OperacionesUnGrafo.vue).
    - Complejidad O(n) al crear N nodos.
    - Requerimiento: config.cantidadNodos > 0.

- Visualización con vis-network
  - [`inicializarVisualizacion`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Crea `nodesDataSet` y `edgesDataSet` con estilos predefinidos y crea `network`.
    - Maneja errores de inicialización con try/catch.
    - Requiere que `graphContainer` esté presente.
    - Consideración: para grafos grandes, desactivar física o cambiar opciones para rendimiento.
  - [`actualizarVisualizacion`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Sincroniza `nodesDataSet` y `edgesDataSet` con el estado `grafo`.
    - Elimina nodos obsoletos, añade nuevos nodos y reemplaza aristas (se usa clear + add).
    - Complejidad O(V + E) por actualización.

- Gestión de aristas y nodos
  - [`agregarArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Valida formato de entrada con [`extraerNodos`](frontend/src/views/grafos/OperacionesUnGrafo.vue).
    - Verifica existencia con [`existeNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue) y evita bucles y duplicados ([`existeArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue)).
    - Añade arista a `grafo.value.aristas` y actualiza visualización.
    - Complejidad dominada por búsqueda de existencia O(E) por comprobación en arreglo; se puede optimizar con índice o Set para grandes grafos.
  - [`insertarNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Inserta nuevo id secuencial (máx numérico + 1). O(1) para operación de push.
  - [`eliminarNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Filtra nodos y aristas conectadas. Complejidad O(V + E).
  - [`borrarArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Localiza arista considerando dirección/no-dirección y la elimina. O(E).

- Funciones de utilidad y validación
  - [`existeNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue): compara ids con String() para robustez.
  - [`existeArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue): verifica existencia (dirigido/no dirigido).
  - [`extraerNodos`](frontend/src/views/grafos/OperacionesUnGrafo.vue): parsea la entrada de texto (p. ej. "12") extrayendo solo dígitos.
    - Nota: actualmente solo toma los primeros dos dígitos; si se desea soportar ids >9, adaptar el parser (ej: separar por coma o guion).
  - [`mostrarMensaje`](frontend/src/views/grafos/OperacionesUnGrafo.vue): maneja UI de mensajes temporales.

- Fusionar y contraer (transformaciones)
  - [`fusionarVertices`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Algoritmo:
      1. Valida existencia y obtiene nodos a unir.
      2. Crea un nuevo id string `nuevoNodo = `${nodo1}${nodo2}``.
      3. Mapea aristas: reemplaza cualquier referencia a nodo1 o nodo2 por `nuevoNodo`.
      4. Si había arista entre nodo1 y nodo2, se asegura la existencia de un bucle (self-loop) para el nuevo nodo.
      5. Deduplica aristas usando Map con key según si es dirigido.
      6. Actualiza `grafo.value.nodos` y `grafo.value.aristas`.
    - Complejidad: O(E) para mapear y deduplicar. Debe considerarse el tamaño de las cadenas de `id` al usar string-concatenation.
    - Consideración: Usar string como id evita choque con ids numéricos; sin embargo, múltiples fusiones pueden generar ids largos. Para escalabilidad, preferir generar uuid o esquema controlado.
    - Referencia: [`fusionarVertices`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
  - [`contraerArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Algoritmo:
      1. Verifica existencia de la arista.
      2. Elimina la arista contraída y reemplaza referencias a ambos nodos por `nuevoNodo`.
      3. Filtra auto-bucles resultantes.
      4. Deduplica aristas y reemplaza nodos en `grafo`.
    - Complejidad: O(E).
    - Observación: Se filtran auto-bucles, a diferencia de `fusionarVertices` que opcionalmente los mantiene si existían antes.

- Grafo línea
  - [`iniciarGrafoLinea`](frontend/src/views/grafos/OperacionesUnGrafo.vue) y [`generarGrafoLinea`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Idea: cada arista del grafo original se convierte en un nodo en el grafo línea. Dos nodos en grafo-línea se conectan si las aristas originales son adyacentes (comparten un vértice).
    - Implementación:
      - Crea `nuevosNodos` con ids formados por concatenación `${from}${to}`.
      - Recorre pares de aristas y si comparten un extremo, crea una arista entre sus nodos transformados.
    - Complejidad: O(E^2) por doble bucle sobre aristas. Para grafos grandes, hay que optimizar (por ejemplo, construir lista de aristas por vértice y conectar solo pares en el mismo bucket).
    - Revertir: [`revertirGrafoLinea`](frontend/src/views/grafos/OperacionesUnGrafo.vue) restaura backup en `grafoOriginal`.
    - Recomendación: para escalabilidad, preindexar aristas por vértice (map<vertex, aristas[]>) y luego generar conexiones en O(sum_k choose 2) local.

- Complemento del grafo
  - [`iniciarComplemento`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`calcularComplemento`](frontend/src/views/grafos/OperacionesUnGrafo.vue)
    - Fórmula de aristas máximas en grafo no dirigido simple sin loops:
      $$
      m = \frac{n(n-1)}{2}
      $$
      donde n = número de nodos.
    - `calcularComplemento` recorre pares (i,j) con j>i y añade arista si no existe. Complejidad O(V^2) (chequeo de existencia dentro O(E) cada vez -> en total puede ser O(V^2 * E) si no se optimiza).
    - Mejora: construir un Set o Map de pares existentes para consultas O(1); así la generación del complemento es O(V^2).
    - Visualización: [`actualizarVisualizacionComplemento`](frontend/src/views/grafos/OperacionesUnGrafo.vue) colorea aristas nuevas (complemento) en naranja.

- Importar / exportar
  - [`triggerFileInput`](frontend/src/views/grafos/OperacionesUnGrafo.vue) — dispara input file.
  - [`validarFormatoJSON`](frontend/src/views/grafos/OperacionesUnGrafo.vue) — valida estructura JSON esperada.
  - [`importarGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue) — usa FileReader, valida y carga grafo, luego `inicializarVisualizacion`.
  - [`guardarGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue) — serializa y descarga JSON versión `1.0`.

4) Visualización y sincronización
- El código mantiene datasets separados (`DataSet`) y llama a [`actualizarVisualizacion`] tras cada mutación.
- Riesgos:
  - Para muchas actualizaciones rápidas, llamar `clear()` + `add()` repetidamente en `edgesDataSet` puede ser costoso.
  - Para grafos grandes (>500 nodos, >2000 aristas), se deben desactivar animaciones y física (opciones de vis-network) y aplicar paginación o clustering.
- Recomendación para pruebas visuales: testear con grafos pequeños (<=50 nodos) y luego escalar progresivamente monitorizando CPU/heap.

5) Escalabilidad y rendimiento — recomendaciones
- Indexar aristas/nodos:
  - Mantener estructuras auxiliares: Set<string> con key normalizada para aristas (por ejemplo ordenar ids para no-dirigido) para O(1) en existeArista y evitar iteraciones O(E).
- Evitar concatenación descontrolada de ids:
  - Usar id único generado (e.g., `N-F` con separador fijo) o uuid para nuevas entidades.
- Optimizar generación de complemento y grafo-línea:
  - Complemento: construir Set de aristas existentes y recorrer pares (i,j) con consultas O(1).
  - Grafo-línea: indexar por vértice las aristas incidentes y crear conexiones por lista local en lugar de O(E^2).
- Memory: vis-network datasets consumen memoria; liberar `network.destroy()` cuando no sea visible.

6) Estrategia de pruebas (unitarias e integración)
- Unitarias (sugerido con vitest / jest para utilidades puras):
  - Probar [`extraerNodos`] con entradas válidas e inválidas (id >9, espacios, caracteres).
  - Probar [`existeArista`] y [`existeNodo`] con grafos dirigidos/no dirigidos.
  - Probar `calcularComplemento` en varios tamaños y comparar con cálculo teórico.
  - Probar `generarGrafoLinea` contra casos conocidos (3 aristas con cadena de conexión).
  - Probar deduplicación en [`fusionarVertices`] y [`contraerArista`].
- Integración / E2E (Playwright / Cypress):
  - Caso: Crear grafo (5 nodos) → agregar aristas → generar complemento → revertir → validar contenido descargado JSON con [`guardarGrafo`].
  - Caso: Importar fichero válido/ inválido y comprobar mensajes y estado.
- Testing de UI:
  - Validar que `graphContainer` se llena con nodos/edges tras acciones y que `network` no sea null.
  - Simular acciones de fusión y comprobar que la notación de teoría de conjuntos se actualiza.

7) Manual de usuario — guía completa de pruebas y uso
(Interfaz y cada control explicado desde perspectiva del usuario)

Acceso:
- Ruta del módulo en la aplicación: menú Grafos → Operaciones con Grafos → Operaciones en un Grafo. Archivo fuente: [frontend/src/views/grafos/OperacionesUnGrafo.vue](frontend/src/views/grafos/OperacionesUnGrafo.vue)

Controles iniciales (Crear grafo)
- "Cantidad de Nodos": número entero positivo. Si se deja <=0, aparece error.
- "Tipo de Grafo": seleccionar Dirigido / No Dirigido.
- "¿Es Ponderado?": activa campo "Peso" al agregar arista.
- Botón "Crear Grafo": genera nodos numerados 1..N y visualización.

Gestión de aristas
- Campo "Ej: 12": ingresar dos dígitos consecutivos que representan nodos (ej: `12` = nodo 1 y nodo 2).
  - Nota: entrada actualmente extrae dígitos consecutivos; para ids > 9 la entrada debe adaptarse (ej: `1,12` no es soportado).
- Si "Ponderado" está activo, especificar peso numérico antes de añadir.
- Mensajes emergentes en la interfaz indican éxito/errores (por 3s).
- Al agregar arista:
  - Si el grafo es no dirigido, `12` equivale a 1↔2.
  - Se evita crear aristas duplicadas o auto-bucles (salvo casos concretos en fusión).

Operaciones
- Insertar Nodo: añade un nodo con id = maxNum + 1.
- Eliminar Nodo: ingresar número y pulsar Eliminar; todas las aristas incidentes se eliminan.
- Borrar Arista: ingresar `12` para eliminar la arista entre 1 y 2.
- Fusionar nodos: ingresar `12` para fusionar 1 y 2 → nuevo nodo con id "12".
  - Resultado: todas las aristas a 1 o 2 apuntan ahora a "12". Si existía arista entre 1 y 2, puede crearse un bucle.
- Contraer arista: ingresar `12` para contraer la arista entre 1 y 2 en un solo vértice "12".
- Generar Grafo Línea: transforma el grafo actual donde cada arista se convierte en nodo y se conectan si aristas originales eran adyacentes.
  - Precaución: operación destructiva, hay confirmación. Revertir posible con "Revertir Grafo Línea".
- Generar Complemento: añade las aristas faltantes para convertir el grafo en completo.
  - Visual: nuevas aristas mostradas en naranja. Reversible con "Revertir Complemento".

Importar / Exportar / Guardar
- "📥 Importar Grafo": abre selector de archivo JSON con esquema esperado.
  - Formato validado por [`validarFormatoJSON`](frontend/src/views/grafos/OperacionesUnGrafo.vue); muestra error si inválido.
- "💾 Guardar Grafo": descarga JSON con versión `1.0` y la configuración actual.

Sugerencia de pruebas de usuario (Casos)
1. Crear grafo de 5 nodos. Añadir aristas 12, 23, 34, 45. Generar grafo-línea. Verificar que el número de nodos = número de aristas original y que aristas representen adyacencias.
2. Crear grafo de 4 nodos. Añadir arista 12. Generar complemento. Verificar que complemento añade todas las aristas faltantes (usar fórmula $m = \frac{n(n-1)}{2}$).
3. Fusionar nodos 1 y 2 en un grafo con aristas 12 y 23. Verificar que las aristas actualizadas apuntan al nuevo id y que no hay duplicados.
4. Importar un JSON guardado por la función de guardar y comprobar igualdad estructural.

Notas finales y mejoras recomendadas
- Parser de entrada: soportar ids mayores a 9 (ej: "1-12" o "1,12") para robustez.
- Índices: mantener Set/Map para aristas existentes para acelerar comprobaciones de existencia.
- IDs generados: utilizar esquema de id-controlado (p. ej. `${nodo1}_${nodo2}`) o UUID para evitar colisiones y ids muy largos tras múltiples fusiones.
- Tests automatizados: comenzar con unit tests para utilidades puras y mocks de vis-network para pruebas de integración ligera.

Referencias (símbolos principales en el archivo)
- Archivo: [frontend/src/views/grafos/OperacionesUnGrafo.vue](frontend/src/views/grafos/OperacionesUnGrafo.vue)
- Funciones: [`crearGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`inicializarVisualizacion`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`actualizarVisualizacion`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`agregarArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`insertarNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`eliminarNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`borrarArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`fusionarVertices`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`contraerArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`generarGrafoLinea`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`iniciarComplemento`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`calcularComplemento`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`importarGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`guardarGrafo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`extraerNodos`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`existeNodo`](frontend/src/views/grafos/OperacionesUnGrafo.vue), [`existeArista`](frontend/src/views/grafos/OperacionesUnGrafo.vue).

Fin del manual.