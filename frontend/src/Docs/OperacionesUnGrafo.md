# Operaciones en Un Grafo — Manual de Funcionamiento

## Archivos Creados

### 1. OperacionesUnGrafo.vue
**Ubicación**: `/frontend/src/views/grafos/OperacionesUnGrafo.vue`

**Qué hace (resumen)**:
- Proporciona una interfaz visual para crear, editar y aplicar transformaciones a un solo grafo.
- Permite insertar y eliminar nodos y aristas, fusionar y contraer vértices, generar el grafo-línea y calcular el complemento.
- Soporta importación y exportación en formato JSON para guardar o recuperar el estado del grafo.

## Algoritmos y funcionalidades principales

### Creación y visualización del grafo
1. **Crear grafo**: el usuario define el número de nodos; el componente inicializa los nodos numerados y lista de aristas vacía.
2. **Visualización**: el grafo se renderiza con `vis-network` usando `DataSet` para nodos y aristas; la vista se sincroniza con el estado interno tras cada cambio.

### Gestión básica
1. **Insertar nodo**: añade un nuevo nodo con el siguiente ID numérico disponible y etiqueta correspondiente.
2. **Eliminar nodo**: elimina el nodo indicado y todas sus aristas incidentes.
3. **Agregar arista**: crea una arista entre dos nodos si la entrada es válida, no existe ya y no es un bucle (a menos que la operación explícita lo permita).
4. **Borrar arista**: elimina una arista existente especificada por el usuario.
5. **Resetear**: reinicia el estado del componente a vacío tras confirmación.

### Transformaciones y operaciones
1. **Fusionar vértices**: une dos nodos en uno solo, reasignando aristas y deduplicando conexiones.
2. **Contraer arista**: contrae una arista en un único vértice, similar a fusionar, pero orientado a reducir aristas.
3. **Grafo-línea**: transforma el grafo para que cada arista original sea un nodo nuevo; conecta estos nodos si las aristas originales eran adyacentes.
4. **Complemento**: genera todas las aristas faltantes para convertir el grafo en completo (según la definición de grafo simple no dirigido).

### Importación y exportación
1. **Importar**: carga un archivo JSON con la estructura esperada y reconstruye el grafo en memoria.
2. **Exportar**: serializa el grafo actual a JSON y descarga el archivo para persistencia.

## Parámetros de configuración

- **cantidadNodos**: número inicial de nodos al crear el grafo.
- **esDirigido / esPonderado**: flags que condicionan comportamiento en inserción/visualización de aristas.

## Estado de implementación

### Completado
- Creación y render inicial del grafo con `vis-network`.
- Inserción y eliminación de nodos y aristas con validaciones básicas.
- Implementación de fusionar vértices, contraer arista, grafo-línea y complemento.
- Importación/Exportación en JSON con validación de formato.

### Limitaciones observadas
- El parser de entradas distingue solo dígitos consecutivos; no gestiona ids multi-dígito sin separador.
- Operaciones como grafo-línea y complemento crecen con complejidad cuadrática y pueden ser costosas para grafos grandes.

## Características técnicas (resumen)

- **Estado separado de visualización**: el estado (`grafo`) se mantiene independiente y solo se sincroniza con `DataSet`/`Network` para la UI.
- **IDs y etiquetas**: nodos usan ids numéricos o strings, las transformaciones pueden generar ids compuestos (p. ej. "12").
- **Mensajes de usuario**: todas las operaciones informan éxitos o errores mediante mensajes temporales.

## Manejo de errores y validaciones

- Validación al agregar aristas: formato correcto, existencia de nodos, evitar autoconexiones, evitar duplicados.
- Confirmación del usuario antes de operaciones destructivas (reset, generar grafo-línea, generar complemento).
- Al importar JSON se valida la estructura mínima requerida antes de aplicar los datos.

## Algoritmos y detalles de implementación

A continuación se describen con detalle los algoritmos y pasos implementados para cada funcionalidad relevante.

### Inicialización del grafo
- Entrada: `cantidadNodos`.
- Resultado: `grafo` con `nodos` numerados del 1..n y `aristas` vacío.
- Pasos:
  1. Validar `cantidadNodos > 0`.
  2. Crear array de nodos con ids 1..n y labels sencillos.
  3. Inicializar datasets de vis-network y renderizar.

### Sincronización visual
- Objetivo: que la interfaz refleje el estado en memoria.
- Pasos por actualización:
  1. Obtener nodos actuales del `DataSet`.
  2. Eliminar nodos que ya no estén en `grafo.nodos`.
  3. Añadir nodos nuevos que estén en `grafo.nodos` pero no en la visualización.
  4. Limpiar y volver a insertar todas las aristas desde `grafo.aristas`.

### Insertar nodo
- Lógica:
  1. Calcular `nuevoId = max(existing numeric ids) + 1` o 1 si vacío.
  2. Crear nodo `{ id: nuevoId, label: String(nuevoId) }` y hacer `push` en `grafo.nodos`.
  3. Llamar a la sincronización visual.

### Eliminar nodo
- Lógica:
  1. Verificar existencia del id.
  2. Filtrar `grafo.nodos` para eliminarlo.
  3. Filtrar `grafo.aristas` para quitar todas las aristas incidentes.
  4. Sincronizar vista.

### Agregar arista
- Validaciones previas:
  1. Extraer dos nodos desde la entrada (función que limpia y extrae dígitos).
  2. Comprobar que ambos existan.
  3. Evitar `from === to` salvo casos permitidos.
  4. Evitar duplicados (comparación indiferente al orden en grafos no dirigidos).
- Inserción:
  1. Insertar objeto `{ from, to, peso? }` en `grafo.aristas`.
  2. Sincronizar vista.

### Borrar arista
- Lógica inversa de agregar:
  1. Extraer nodos de la entrada.
  2. Buscar índice de arista coincidente (orden indiferente si no dirigido).
  3. `splice` para eliminar y luego sincronizar.

### Resetear grafo
- Pide confirmación y, si afirmativa, limpia `grafo`, destruye/redes inicializa `network` y datasets.

## Transformaciones avanzadas — Algoritmos detallados

Estas operaciones modifican la topología del grafo y deben usarse con precaución en grafos grandes.

### Fusionar vértices
- Objetivo: unir dos nodos u y v en uno solo `uv`.
- Pasos:
  1. Verificar existencia de u y v.
  2. Generar `nuevoId` (p. ej. concatenación o esquema controlado).
  3. Reemplazar en `grafo.aristas` toda referencia a u o v por `nuevoId`.
  4. Si existía arista entre u y v, decidir si mantener bucle según la lógica actual (el componente puede conservarlo).
  5. Deduplicar aristas resultantes (normalizar pares para no dirigir y usar Map/Record para detección).
  6. Reemplazar nodos y sincronizar visual.

### Contraer arista
- Objetivo: eliminar una arista y fusionar sus extremos en un solo vértice.
- Pasos:
  1. Comprobar que la arista exista.
  2. Crear `nuevoId` y reemplazar referencias en `grafo.aristas`.
  3. Filtrar auto-bucles si la operación lo requiere.
  4. Deduplicar y sincronizar.

### Grafo-línea
- Objetivo: transformar cada arista del grafo original en un nodo del grafo-línea.
- Pasos:
  1. Para cada arista original `(a,b)` crear un nodo con id derivado (ej. `${a}-${b}`).
  2. Para cada par de aristas originales que compartan un extremo, crear una arista entre sus nodos derivados.
  3. Reemplazar el grafo actual o mostrar como vista alternativa según la interfaz.
- Complejidad: O(E^2) si se comparan todas las aristas; optimizar indexando aristas por vértice reduce el trabajo a suma de binomios locales.

### Complemento
- Objetivo: añadir las aristas faltantes para formar un grafo completo (no dirigido simple).
- Pasos:
  1. Construir un Set de aristas existentes con clave normalizada (por ejemplo `min,max`).
  2. Recorrer pares (i,j) con i<j; si la clave no existe, añadir la arista.
  3. Insertar todas las nuevas aristas en `grafo.aristas` y sincronizar.
- Complejidad: O(V^2) con consultas O(1) si se usa Set.

## Importación y exportación (detalles)

- Importación:
  1. El usuario selecciona un archivo `.json`.
  2. `FileReader` lee y `JSON.parse` crea el objeto.
  3. Validar presencia de campos mínimos (`version`, `config`, `grafos` o `grafo`) según esquema.
  4. Reconstruir `grafo` en memoria y sincronizar la vista.

- Exportación:
  1. Construir objeto con estructura esperada y versión.
  2. Serializar con `JSON.stringify` y crear `Blob` para descarga.
  3. Disparar descarga con nombre que incluye timestamp.

## Manejo de errores y validaciones (recordatorio)

- Validaciones en inserción de aristas: formato, existencia de nodos, evitar duplicados y autoconexiones.
- Confirmación para operaciones destructivas (reset, generar grafo-línea, complemento).
- Validación de la estructura JSON al importar.

## Guía rápida para entender el flujo cuando abras el componente

1. Ajusta `cantidadNodos` y pulsa "Crear grafo".
2. Usa controles de inserción/eliminación de nodos y aristas para editar el grafo.
3. Aplica transformaciones (fusionar, contraer, grafo-línea, complemento) según necesidad; observa mensajes y confirma acciones destructivas.
4. Importa o exporta el grafo con los controles correspondientes.

## Notas finales

Este documento ofrece una descripción práctica y detallada del comportamiento implementado en `OperacionesUnGrafo.vue`. Para extender o mantener el módulo, revisa especialmente las funciones que manipulan IDs y la lógica de deduplicación en transformaciones, ya que son las partes con mayor probabilidad de introducir errores o consumos elevados de recursos.
