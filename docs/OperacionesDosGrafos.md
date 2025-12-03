# Operaciones entre Grafos — Manual de Funcionamiento

## Archivos Creados

### 1. OperacionesDosGrafos.vue
**Ubicación**: `/frontend/src/views/grafos/OperacionesDosGrafos.vue`

**Qué hace (resumen)**:
- Provee una interfaz visual para crear y manipular múltiples grafos en la misma vista.
- Permite insertar y eliminar nodos y aristas en cada grafo individual.
- Ofrece operaciones entre grafos (unión, intersección, suma, suma anillo, producto cartesiano, producto tensorial y composición) y muestra el resultado visualmente.
- Soporta importación/exportación en formato JSON para persistir o cargar grafos.

## Algoritmos y funcionalidades principales

### Creación y visualización de grafos
1. **Crear grafos**: el usuario define cuántos grafos crear y cuántos nodos tiene cada uno. El componente inicializa cada grafo con nodos numerados y etiquetas que incluyen una letra identificadora por grafo (A, B, C...).
2. **Visualización**: cada grafo se pinta usando `vis-network`. Internamente se usan conjuntos de datos (`nodes` y `edges`) para mantener la visualización sincronizada con el estado en memoria.

### Gestión básica (por grafo)
1. **Insertar nodo**: agrega un nuevo nodo con el siguiente ID numérico disponible y una etiqueta compuesta por el número y la letra del grafo.
2. **Eliminar nodo**: elimina el nodo seleccionado y borra todas sus aristas incidentes.
3. **Agregar arista**: permite ingresar una arista mediante un formato simple (ej.: "12") — el sistema extrae dos nodos y crea la arista entre ellos si ambos existen y no hay duplicados ni bucles.
4. **Borrar arista**: elimina una arista dada si existe.
5. **Resetear grafos**: reinicia el estado de la vista y limpia todas las estructuras.

### Operaciones entre grafos (alto nivel)
1. **Unión**: combina los nodos y aristas de todos los grafos, manteniendo identificación por origen (para la visualización se usan identificadores únicos para evitar colisiones; la notación mostrada al usuario conserva el id original + letra del grafo).
2. **Intersección**: determina nodos y aristas presentes en todos los grafos (compara por id).
3. **Suma**: construye un grafo que reúne nodos de todos los grafos y, además de sus aristas internas, añade conexiones entre bloques como conexiones completas entre los conjuntos ya agregados (comportamiento pensado para generar una unión con enlaces entre componentes añadidas sucesivamente).
4. **Suma Anillo**: operación entre los dos primeros grafos donde los nodos son la unión sin repeticiones y las aristas son la unión menos la intersección (se conserva formato de pares).
5. **Producto cartesiano**: crea nodos que son pares (producto) de nodos de dos grafos; conecta pares según las reglas estándar del producto cartesiano: si comparten la primera componente y la segunda está conectada en su grafo, o viceversa.
6. **Producto tensorial**: similar al cartesiano en creación de nodos producto, pero una arista existe solo si ambas componentes están conectadas en sus grafos de origen (condición AND).
7. **Composición**: construye nodos producto secuenciales y crea aristas según varias reglas: componentes conectadas, o una componente igual y la otra conectada en su grafo original. Es una operación más especializada pensada para encadenar relaciones.

### Importación y exportación
1. **Importar**: el componente acepta un JSON con una estructura específica (versión interna) y reconstruye grafos desde él, generando las etiquetas necesarias para visualización.
2. **Exportar**: serializa la configuración y los grafos a un archivo `.json` que el usuario puede descargar.

## Parámetros de configuración

- **cantidadGrafos**: número de grafos a crear en la sesión.
- **byGraph**: arreglo con la cantidad de nodos para cada grafo (permite que cada grafo tenga distintos tamaños).

Estos parámetros se editan en la interfaz y se usan para inicializar las estructuras y la visualización.


- **Separación de estado y visualización**: el componente mantiene el estado de los grafos en memoria y los sincroniza con `vis-network` mediante datasets; esto facilita mantener la lógica del dominio separada de la presentación.
- **Etiquetado consistente**: cada grafo añade una letra identificadora (A, B, C...) a las etiquetas para evitar confusiones al combinar grafos.
- **Operaciones puras sobre estructuras**: las funciones que calculan unión/intersección/productos devuelven nuevos objetos grafo sin mutar los originales cuando es necesario, lo que facilita pruebas y reusabilidad.
- **Mensajes de usuario**: el componente centraliza mensajes de estado y errores para guiar interacciones (por ejemplo al intentar agregar una arista inválida).

## Manejo de errores y validaciones

- Validación de inputs simples (existencia de nodos, evitar autoconexiones, evitar aristas duplicadas).
- Confirmación del usuario para acciones destructivas (resetear).
- Al importar JSON se valida versión y forma mínima esperada antes de aplicar los datos.
## Algoritmos y detalles de implementación

A continuación se describen, paso a paso y con suficiente detalle, los algoritmos y comportamientos implementados para cada funcionalidad principal del componente.

### Inicialización de grafos
- Entrada: `cantidadGrafos` (n), `byGraph` (array con cantidad de nodos por grafo).
- Resultado: arreglo `grafos` con n grafos; cada grafo contiene `nodos` (id, label) y array `aristas` inicialmente vacío.
- Algoritmo:
	1. Validar `cantidadGrafos > 0`.
	2. Si `byGraph` no tiene suficientes entradas, rellenar con valores por defecto (ej. 5).
	3. Para cada grafo i (0..n-1):
		 - Crear nodos con ids numéricos 1..m (m = byGraph[i]).
		 - Asignar `label` como `${id}${letter}` donde `letter` es A, B, C... según índice.
	4. Inicializar estructuras para visualización (`nodesDataSets`, `edgesDataSets`) y llamar a `vis-network` para render.

### Sincronización visual (actualizarVisualizacion)
- Propósito: mantener la vista `vis-network` alineada con el estado interno `grafos`.
- Algoritmo (por grafo idx):
	1. Obtener lista actual de nodos desde `nodesDataSet.get()`.
	2. Comparar con `grafo.nodos`:
		 - Remover de la visualización nodos que ya no estén en `grafo.nodos`.
		 - Añadir nodos nuevos que estén en `grafo.nodos` pero no en la visualización.
	3. Limpiar `edgesDataSet` y volver a insertar todas las aristas de `grafo.aristas` (esto asegura consistencia y evita duplicados visuales).
	4. Aplicar estilos (color, tamaño) según índice de grafo.

### Insertar nodo
- Comportamiento:
	- Calcula el mayor id numérico existente en el grafo y crea un nodo con `id = max + 1` (o 1 si no hay nodos).
	- `label` se forma como `${id}${letter}`.
	- Llama a `actualizarVisualizacion`.

### Eliminar nodo
- Comportamiento:
	- Validar que el `id` exista en el grafo.
	- Filtrar `nodos` para eliminar el elemento con ese `id`.
	- Filtrar `aristas` para eliminar aquellas con `from === id` o `to === id`.
	- Actualizar visual.

### Agregar arista
- Entrada esperada: string de formato simple del usuario (el componente usa un parser que extrae los dígitos en orden).
- Validaciones:
	1. Ambos nodos deben existir en el grafo.
 2. No se permiten autoconexiones (from == to).
 3. No se permiten aristas duplicadas (se revisa indiferente al orden en grafos no dirigidos).
- Algoritmo:
	1. Llamar a `extraerNodos(input)` para obtener `[n1, n2]`.
	2. Validar existencia con `existeNodo`.
	3. Verificar duplicados con `existeArista`.
	4. Insertar `{ from: n1, to: n2 }` en `grafo.aristas`.
	5. `actualizarVisualizacion`.

### Borrar arista
- Proceso inverso de agregar:
	1. Extraer nodos del input.
	2. Buscar índice de una arista que coincida con los dos extremos (sin importar el orden).
	3. Si existe, `splice` para eliminar y luego `actualizarVisualizacion`.

### Resetear grafos
- Pregunta confirmación al usuario.
- Si confirma, reinicia `grafos`, las estructuras de `vis-network` y las referencias DOM correspondientes.

## Operaciones entre grafos — Algoritmos detallados

Nota: para evitar colisiones de IDs en la visualización cuando se combinan grafos, el componente usa prefijos internos (por ejemplo `${gi}_${origId}`) para generar identificadores únicos. La notación que se muestra al usuario conserva el id original acompañado de la letra del grafo (`1A`, `2B`, ...).

### Unión
- Objetivo: producir un grafo que contenga todos los nodos y aristas de los grafos de entrada, manteniendo información de origen.
- Algoritmo:
	1. Crear `resultado` vacío con `nodos: []` y `aristas: []`.
	2. Para cada grafo gi en `grafos`:
		 - Para cada nodo `u` en grafo: crear nodo en `resultado` con `id = `${gi}_${u.id}`` y `label = `${u.id}${letter}``.
		 - Para cada arista `(a,b)` en grafo: añadir `{ from: `${gi}_${a}`, to: `${gi}_${b}` }` a `resultado.aristas`.
	3. No se eliminan duplicados entre grafos distintos porque cada entrada tiene prefijo de origen (si se buscara deduplicar por id original, habría que mapear y comparar labels sin prefijo).
- Complejidad: O(sum V + sum E).

### Intersección
- Objetivo: devolver nodos y aristas que aparecen en todos los grafos (comparación por id original).
- Algoritmo:
	1. Si hay menos de 2 grafos, devuelve vacío o el primero según conveniencia.
	2. Tomar el primer grafo como base (`resultado = copy(grafos[0])`).
	3. Para cada grafo i = 1..k-1:
		 - Filtrar `resultado.nodos` para dejar solo aquellos cuyos ids también existan en `grafos[i]`.
		 - Filtrar `resultado.aristas` dejando solo aquellas aristas cuyo par `(from,to)` coincida con alguna arista en `grafos[i]`.
	4. Retornar `resultado`.
- Consideraciones: la comparación usa `String(id)` para robustez; la operación es sensible a que los IDs sean exactamente iguales entre grafos.

### Suma
- Objetivo: combinar grafos y, además de sus aristas internas, crear conexiones entre bloques ya agregados (comportamiento tipo "conectar todo con todo" entre nuevos bloques y los antiguos en el orden de procesamiento).
- Algoritmo:
	1. Mantener lista `idsActuales` que contiene los IDs internos agregados al resultado hasta el momento.
	2. Iterar grafos en orden; para cada grafo gi:
		 - Añadir sus nodos al resultado (con prefijo `${gi}_`).
		 - Añadir sus aristas internas (con prefijo).
		 - Para cada nodo nuevo `u` del grafo actual y cada id `v` en `idsActuales`, añadir arista `u-v` (si se busca evitar duplicados, comprobar antes si ya existe).
		 - Finalmente, extender `idsActuales` con los ids del grafo actual.
- Resultado: nodos combinados y muchas aristas entre bloques (crecimiento potencialmente cuadrático en total de nodos si hay muchos grafos y nodos por grafo).

### Suma Anillo (entre dos grafos)
- Objetivo: operar sobre los dos primeros grafos G1 y G2 y producir: nodos = unión sin repeticiones; aristas = (unión de aristas) menos (intersección de aristas).
- Algoritmo:
	1. Construir mapa/registro de todos los ids presentes en G1 y G2 para obtener `nodosRes` sin duplicados.
	2. Calcular claves de arista de la forma `from,to` para todos los elementos de G1 (lista) y G2 (map para búsqueda rápida).
	3. Formar `unionAristas = concat(aristasG1, aristasG2)`.
	4. Para cada arista en `unionAristas`, incluirla en `resultado` solo si no aparece en ambos grafos (es decir, si no está en la intersección).
	5. Retornar grafo con nodos `nodosRes` y `aristasRes`.

### Producto cartesiano
- Objetivo: crear nodos que son pares (a,b) donde `a` pertenece a G1 y `b` a G2; conectar pares según reglas: (a1,b1)-(a2,b2) si a1==a2 y (b1-b2) es arista en G2, o b1==b2 y (a1-a2) es arista en G1.
- Algoritmo (opTwoCartesian entre dos grafos A y B):
	1. Para cada nodo `a` en A y cada nodo `b` en B, crear nodo con label `${strip(a.label)}${letterA}${strip(b.label)}${letterB}` (o similar) y `id` único.
	2. Para cada par de nodos producto `(a1,b1)` y `(a2,b2)`:
		 - Si `a1 === a2` y `existeArista(B, b1, b2)`, añadir arista entre los dos nodos producto.
		 - Si `b1 === b2` y `existeArista(A, a1, a2)`, añadir arista entre los dos nodos producto.
	3. Repetir secuencialmente si hay más de dos grafos: el resultado intermedio se usa como A para combinar con el siguiente grafo.
- Observaciones: se usan funciones auxiliares para resolver claves de nodos cuando el grafo de entrada contiene labels/marcadores.

### Producto tensorial
- Objetivo: similar al cartesiano en la generación de nodos producto; pero una arista existe solo si ambas componentes están conectadas en sus grafos originales.
- Algoritmo:
	1. Generar nodos producto como en cartesiano.
	2. Para cada par `(a1,b1)` y `(a2,b2)`, añadir arista si `existeArista(A, a1, a2) && existeArista(B, b1, b2)`.
	3. Operación secuencial para más de dos grafos: resultado intermedio se compone con el siguiente grafo.

### Composición
- Objetivo: construir una estructura producto donde las aristas entre vértices fusionados siguen reglas específicas de composición de grafos.
- Algoritmo (resumen):
	1. Etiquetar nodos de cada grafo con su letra origen.
	2. Para operar entre gA (resultado parcial) y gB (siguiente grafo):
		 - Crear nodos producto combinando las componentes de `gA` y `gB`.
		 - Para cada par de nodos producto, parsear sus componentes (ej. "1A2B" → ["1A","2B"]).
		 - Sean (u₁,v₁) y (u₂,v₂) dos vértices fusionados, donde u viene de gA y v de gB.
		 - Comprobar condiciones para conectarlos:
				a) u₁ está conectado con u₂ en el grafo A (primera componente conectada), O
				b) u₁ = u₂ Y v₁ está conectado con v₂ en el grafo B (primera componente igual y segunda conectada).
	3. Repetir secuencialmente por cada grafo adicional.

## Importación y exportación (detalles)
- Importación:
	1. El usuario selecciona un archivo `.json`.
	2. `FileReader` lee el contenido y se parsea con `JSON.parse`.
	3. Se valida la forma mínima (presencia de `version`, `config`, `grafos`), y si es correcta, se reconstruyen los grafos en memoria (asignando labels según convenga).
	4. Se inicializa la representación visual del nuevo estado.

- Exportación:
	1. Se crea un objeto con la estructura esperada (versión, config, grafos).
	2. Se serializa con `JSON.stringify` y se crea un `Blob` para descarga.
	3. Se dispara la descarga con un nombre que incluye timestamp.

## Manejo de errores y validaciones (recordatorio)

- Comprobaciones al crear aristas: formato de entrada, existencia de nodos, evitar autoconexiones y duplicados.
- Confirmación de usuario para resetear.
- Validación de la estructura del JSON al importar.

## Guía rápida para entender el flujo cuando abras el componente

1. Ajusta `cantidadGrafos` y `byGraph` y crea los grafos.
2. El componente inicializa nodos y datasets y renderiza con `vis-network`.
3. Las interacciones (insertar/eliminar/añadir arista) actualizan el estado y se reflejan en la visualización.
4. Al seleccionar una operación entre grafos, la función correspondiente calcula y devuelve un `grafoResultado` (no muta los originales) y se muestra el resultado en la vista de resultado.
5. Importar/exportar permite persistir o recuperar configuraciones.

## Notas finales

Este documento describe con mayor detalle los algoritmos que ya están implementados en `OperacionesDosGrafos.vue`. Si vas a modificar o ampliar funcionalidades, revisa las funciones que manipulan IDs y etiquetas (parser de entrada, `stripLetter`, creadores de prefijos) y las operaciones que hacen combinaciones de nodos, pues son las que tienen mayor impacto en rendimiento y en la complejidad de las pruebas.
