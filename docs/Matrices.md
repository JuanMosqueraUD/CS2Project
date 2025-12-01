# Matrices — Manual de Funcionamiento del Módulo Matrices.vue

## Archivo

### 1. `Matrices.vue`
**Ubicación**: `/frontend/src/views/grafos/Matrices.vue`

**Qué hace (resumen)**:
- Proporciona una interfaz visual para crear y manipular un grafo simple (un único grafo) y visualizarlo con `vis-network`.
- Permite operaciones básicas: crear grafo con N nodos, insertar/eliminar nodos, agregar/borrar aristas, importar y exportar grafos en JSON.
- Muestra tres matrices derivadas del grafo que se actualizan reactivamente:
  - Matriz de adyacencia (nodos × nodos)
  - Matriz de adyacencia (aristas × aristas)
  - Matriz de incidencia (nodos × aristas) — con soporte para grafos dirigidos, usando +1/-1 según dirección.
- Añade controles de UI para ajustar dinámicamente la altura (scroll) de las matrices y presenta las matrices apiladas y centradas.

## Tecnologías y dependencias
- Vue 3 (Single File Component, `script setup`, `ref`, `computed`).
- `vis-network/standalone` para la visualización interactiva del grafo (`DataSet`, `Network`).
- CSS scoped para estilos del módulo.

## Resumen de la arquitectura
- Estado principal: variable reactiva `grafo` con la forma { nodos: Nodo[], aristas: Arista[] }.
- Sincronización: el estado se sincroniza con `vis-network` mediante `DataSet` (`nodesDataSet` y `edgesDataSet`).
- Derivados: matrices calculadas con `computed` (`adjacencyMatrixNodes`, `adjacencyMatrixEdges`, `incidenceMatrix`), y `nodeIds`/`edgeIds` para etiquetas de cabecera.
- Control visual: `matrixMaxHeight` (ref) controla la altura máxima de las áreas con scroll de las matrices (con un `input[type=range]`).

## Tipos y estructuras
- `Config`: configuración del grafo: `cantidadNodos`, `esDirigido`, `esPonderado`.
- `Nodo`: `{ id: number | string; label: string }`.
- `Arista`: `{ from: number | string; to: number | string; peso?: number }`.
- `Grafo`: `{ nodos: Nodo[]; aristas: Arista[] }`.

## Funcionalidades y algoritmos principales

### Creación y visualización del grafo
1. **Crear grafo (`crearGrafo`)**
   - Valida que `cantidadNodos` sea > 0.
   - Initializa `grafo.nodos` con IDs numerados del `1` a `cantidadNodos` y `label` igual al id.
   - Inicializa `grafo.aristas` vacío y marca `grafoCreado = true`.
   - Llama `inicializarVisualizacion()` en `nextTick()` para montar `vis-network`.

2. **Inicializar visualización (`inicializarVisualizacion`)**
   - Construye `nodesDataSet` y `edgesDataSet` a partir del `grafo`.
   - Crea `Network` con opciones de visualización (nodos circulares, tamaños, fuentes, colorización, física).
   - Maneja errores de inicialización y registra información útil en consola.

3. **Actualizar visualización (`actualizarVisualizacion`)**
   - Mantiene sincronizados `nodesDataSet` y `edgesDataSet` con el estado `grafo`:
     - Elimina nodos que ya no existen en `grafo.nodos`.
     - Añade nuevos nodos si faltan en el dataset.
     - Reconstruye las aristas en `edgesDataSet` — el código limpia y vuelve a agregar todas las aristas para evitar inconsistencias.

### Gestión básica del grafo
1. **Insertar nodo (`insertarNodo`)**
   - Calcula el siguiente id numérico libre (max existing numeric id + 1).
   - Añade el nodo con `label` igual al id y llama `actualizarVisualizacion()`.

2. **Eliminar nodo (`eliminarNodo`)**
   - Valida la entrada y la existencia del nodo.
   - Filtra `grafo.nodos` para eliminar el nodo y filtra `grafo.aristas` para eliminar aristas incidentes.
   - Llama `actualizarVisualizacion()`.

3. **Agregar arista (`agregarArista`)**
   - Lee la entrada del usuario (campo de texto), la parsea con `extraerNodos`.
   - Valida existencia de nodos, evita bucles (from==to) y duplicados con `existeArista`.
   - Si es ponderado, toma el `peso` del input y lo guarda en la arista.
   - Inserta la arista en `grafo.aristas` y llama `actualizarVisualizacion()`.

4. **Borrar arista (`borrarArista`)**
   - Parsea la entrada con `extraerNodos` y busca el índice de la arista (considerando no dirigido cuando corresponde).
   - Elimina la arista si existe y actualiza la visualización.

5. **Contar aristas (`contarAristas`)**
   - Retorna `grafo.aristas.length`.

6. **Resetear grafo (`resetearGrafo`)**
   - Pide confirmación al usuario y reinicia `grafo`, `grafoCreado`, y las referencias de `vis-network`.

### Importar / Exportar
1. **Trigger File Input (`triggerFileInput`)**
   - Abre el selector de archivos oculto.

2. **Importar grafo (`importarGrafo`)**
   - Lee el `.json` seleccionado con `FileReader`, parsea y valida su formato con `validarFormatoJSON`.
   - Si es válido, aplica `config` y carga nodos/aristas en `grafo` y llama `inicializarVisualizacion()`.
   - Muestra mensajes de feedback y limpia el input.

3. **Guardar grafo (`guardarGrafo`)**
   - Serializa un objeto `GrafoJSON` con `version`, `config` y `grafo` y descarga el archivo `.json` con `Blob`.

### Representación en teoría de conjuntos
1. **Formatear conjuntos**
   - `formatearConjuntoNodos()` retorna una representación `{1, 2, 3}` o `∅` si no hay nodos.
   - `formatearConjuntoAristas()` realiza una deduplicación para grafos no dirigidos y genera una representación en pares `(from, to[, peso])`.

### Parsing y utilidades
1. **Extraer nodos de entrada (`extraerNodos`)**
   - El parser actual elimina caracteres no numéricos y toma los dos primeros dígitos como nodos.
   - Importante: la implementación actual soporta correctamente entradas simples como `12` (nodo 1 y 2), pero no está preparada para IDs de múltiples dígitos o separadores explícitos (como `1,2` o `1-2`) — se recomienda mejorar si se requieren IDs mayores a 9.

2. **Existencia**
   - `existeNodo(id)`: verifica existencia por comparación de `String(id)`.
   - `existeArista(from,to)`: compara teniendo en cuenta si el grafo es dirigido o no (compara ambos órdenes en no dirigido).

3. **Normalización de IDs (`normalizeId`)**
   - Convierte IDs a `String` y hace `trim()` para comparaciones robustas entre nodos/aristas (ayuda a resolver problemas de tipos y espacios).

## Matrices dinámicas — algoritmos concretos

Las matrices se calculan con propiedades computadas (`computed`) y se actualizan automáticamente cuando cambia `grafo`.

1. **`nodeIds` / `edgeIds`**
   - `nodeIds`: lista de `String(n.id)` para usar en cabeceras de filas/columnas.
   - `edgeIds`: lista de strings `"from-to"` creada con template `${a.from}-${a.to}`.

2. **Matriz de adyacencia de nodos (`adjacencyMatrixNodes`)**
   - Devuelve una matriz binaria n×n donde n = número de nodos.
   - Regla aplicada:
     - La diagonal se fuerza a `0` (ninguna arista se considera consigo misma en la diagonal).
     - `mat[i][j] = 1` si existe una arista `i→j` (o `i-j` en no dirigido), 0 en caso contrario.
   - Implementación: doble bucle for i,j; uso de `grafo.value.aristas.some(...)` para comprobar existencia.

3. **Matriz de adyacencia de aristas (`adjacencyMatrixEdges`)**
   - Sea m = número de aristas; se construye una matriz m×m con valores binarios.
   - Regla aplicada:
     - La diagonal se fuerza a `0` (una arista no es adyacente a sí misma en la diagonal).
     - `mat[i][j] = 1` si las aristas `i` y `j` comparten un extremo (cualquier coincidencia entre from/to), 0 en caso contrario.

4. **Matriz de incidencia (`incidenceMatrix`)**
   - Matriz n×m (n nodos, m aristas).
   - Regla aplicada:
     - Si `config.esDirigido === false`: celda = `1` si el nodo es incidente en la arista (sea origen o destino).
     - Si `config.esDirigido === true`: celda = `+1` si el nodo es el origen (`from`), `-1` si el nodo es el destino (`to`), `0` en caso contrario.
   - Se usan `normalizeId` para convertir `from`/`to` y `node` a strings saneados antes de comparar.

### Notas sobre la reactividad y consistencia
- Las `computed` matrices dependen de `grafo.value.nodos` y `grafo.value.aristas`, por lo que cualquier modificación al estado actualiza automáticamente la visualización y las tablas.
- `matrixMaxHeight` (ref) se enlaza mediante `:style` a los contenedores `.matrix-scroll` para permitir un control dinámico del tamaño del área con scroll.

## Interfaz de usuario y controles
- Inputs para crear grafo (`cantidadNodos`), selector `Tipo de Grafo` (dirigido/no dirigido) y `¿Es Ponderado?`.
- Controles para administrar aristas (campo `aristaInput`, `pesoArista`) y botones para agregar/borrar aristas, insertar/eliminar nodos.
- Panel de notación con `V = {...}` y `A = {...}` mostrando conjuntos.
- Paneles de matrices apilados verticalmente (dos matrices de adyacencia y la matriz de incidencia), con control de tamaño por slider:
  - Slider con rango `200px..900px` y valor por defecto `360px`.

## Estilos y disposición
- Las tablas usan fuente monospace (`Courier New`) para mantener alineación y legibilidad de números.
- Cada celda está centrada y la tabla usa `table-layout: fixed` con anchos mínimos para columnas, lo que mantiene una disposición compacta y homogénea.
- El área con scroll por matriz tiene `max-height` controlable y `overflow: auto`.

## Manejo de errores y validaciones
- Validaciones de entradas del usuario: formato de aristas, existencia de nodos, evitar bucles, evitar duplicados.
- Importación de JSON: `validarFormatoJSON` asegura que el archivo incluye `version`, `config` y el grafo con nodos/aristas en la forma esperada.
- Mensajes de estado y error centralizados con `mostrarMensaje(msg, error)` que indica y limpia el mensaje tras 3s.

## Consideraciones de implementación, limitaciones y mejoras recomendadas

- Parser de aristas (`extraerNodos`) actual: elimina todos los caracteres no numéricos y usa los dos primeros dígitos como nodos. Esto limita IDs a un solo dígito por nodo y no soporta separadores explícitos (como `1,2` o `1-2`) ni IDs multi-dígito. Recomendación: mejorar el parser para aceptar separadores y números multi-dígito (por ejemplo, con una expresión regular que capture tokens numéricos \d+).

- Las matrices se calculan con bucles O(n^2) / O(m^2) y comparaciones con `some(...)` — para grafos muy grandes esto puede ser costoso. Si la aplicación requiere escalabilidad, considere:
  - Mantener índices o mapas auxiliares para vecinos (listas de adyacencia) y para lista de aristas por nodo, reduciendo las búsquedas a O(1) o O(deg).
  - Caché de matrices parciales y actualización incremental al añadir/quitar aristas en lugar de recomputar toda la matriz.

- Las aristas se reinsertan por completo en `edgesDataSet` en cada `actualizarVisualizacion()` — para grafos grandes esto puede afectar rendimiento visual; se sugiere actualizar solo los cambios incrementales cuando sea posible.

- `normalizeId` ayuda a comparaciones robustas entre strings/números, pero si el proyecto requiere tipos complejos de ids (UUIDs, cadenas con prefijos), asegúrese de normalizar consistentemente en todas las funciones (inserción, búsqueda, importación/exportación).

## Flujo de uso rápido
1. En la UI: seleccionar `Cantidad de Nodos`, `Tipo de Grafo` (dirigido/no), y `¿Es Ponderado?` → presionar `Crear Grafo`.
2. Manipular aristas con el campo de texto (ej. `12`) y los botones `Agregar Arista` / `Borrar`.
3. Insertar o eliminar nodos usando los controles correspondientes.
4. Mover el slider `Tamaño matrices` para ajustar la altura visible de las matrices sin activar scroll tan rápido.
5. Importar/Exportar grafos vía los botones `Importar Grafo` / `Guardar Grafo`.

## Resumen final
`Matrices.vue` es un módulo interactivo y bien estructurado para trabajar con un grafo y presentar sus representaciones matriciales. Está diseñado para ser educativo y práctico: mezcla visualización usando `vis-network` con representaciones matriciales formales (incluyendo la convención ±1 para grafos dirigidos en la matriz de incidencia).

Si planeas ampliar este módulo para grafos de mayor tamaño o con IDs complejos, las mejoras prioritarias son: parser de entradas robusto, estructuras de datos auxiliares (vecindad/índices) para acelerar los cálculos, y actualizaciones incrementales de la visualización.
