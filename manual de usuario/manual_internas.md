# Manual de Usuario - Manual Búsquedas Internas

Esta seccion del documento contiene los manuales de usuario internos para las vistas y módulos del aplicativo. Cada sección replica exactamente la estructura y profundidad del manual de `AlgoritmoFloyd.md` y está adaptada a la funcionalidad de cada módulo. Las secciones aparecen secuencialmente y están pensadas para un usuario sin conocimientos previos de algoritmos.

---

## BinariaView

### Descripción General

La vista `Binaria` proporciona una interfaz interactiva para comprender y practicar la búsqueda binaria en un arreglo ordenado. El usuario puede crear una estructura de datos ordenada (lista/array), configurar parámetros de prueba, insertar elementos en orden, y realizar operaciones de búsqueda y eliminación. La interfaz visualiza el arreglo dividido en índices y resalta pasos de la búsqueda binaria para que el usuario siga el algoritmo paso a paso.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

Al ingresar a la vista se presenta un formulario con los campos principales:

1. **Capacidad (tamaño del arreglo)**: Ingrese el número máximo de elementos que la estructura podrá contener (ej.: 20).
   - Recomendación: usar valores mayores a 10 para prácticas más ilustrativas.
2. **Tipo de datos**: Seleccione el tipo de claves a manejar (por ejemplo, `numérico` o `alfabético`).
3. **Orden de inserción**: Opción para definir si la inserción mantiene el arreglo `ascendente` o `descendente`.

#### Paso 2: Crear la Estructura

- Haga clic en el botón **"Crear estructura"**.
- El sistema generará un arreglo vacío con la `capacidad` indicada y mostrará la vista del arreglo con índices (0..capacidad-1) listo para insertar elementos.

#### Alternativa: Importar una Estructura Existente

Si ya tiene un arreglo guardado previamente:
- Haga clic en **"Abrir desde archivo"**.
- Seleccione el archivo JSON con extensión `.json` que contiene la estructura serializada.
- El arreglo se cargará con su configuracion y elementos, y la vista se actualizará automáticamente.

---

### Gestionar Elementos

#### Agregar Elementos

Una vez creada la estructura aparece la sección **"Insertar"** con los campos:

1. **Campo de valor**: Ingrese la clave a insertar (ej.: `42` o `A`).
2. **Botón "Insertar"**: Inserta el valor manteniendo el orden. La inserción se realiza en lugar correcto desplazando elementos si es necesario.

- La vista valida duplicados y muestra un mensaje en caso de intento de insertar un elemento ya existente.
- Si el arreglo está lleno el sistema alerta que no se puede insertar.

#### Buscar Elementos

- Campo **"Buscar"**: Ingrese la clave y haga clic en **"Buscar"**.
- La interfaz ejecuta la búsqueda binaria y resalta los índices `izquierda`, `derecha` y `medio` en cada paso, mostrando comparaciones y resultado final.
- Si el elemento existe se resalta su posición; si no, se muestra la posición donde debería insertarse.

#### Eliminar Elementos

- Campo **"Clave"**: Ingrese la clave y haga clic en **"Eliminar"**.
- El sistema localiza la posición (usando búsqueda binaria) y elimina el elemento desplazando los elementos restantes para mantener el orden.

#### Visualización del Arreglo

La visualización muestra:
- **Índices**: filas numeradas 0..n-1
- **Valores**: cada celda con su contenido o `null` si está vacía
- **Resaltados**: durante la búsqueda se indican `izquierda`, `derecha` y `medio` en cada iteración

Puede interactuar con la vista para seguir la animación paso a paso o ejecutar la búsqueda automáticamente.

---

### Guardar y Cargar Estructuras

#### Guardar la Estructura

1. Haga clic en **"Guardar"**.
2. El sistema generará un archivo JSON que contiene:
   - Configuración (`capacidad`, `tipo`, `orden`)
   - Contenido del arreglo
   - Fecha y etiqueta en el nombre del archivo
3. El archivo se descargará automáticamente.

#### Abrir una Estructura Guardada

1. Haga clic en **"Abrir"** (operaciones)
2. Seleccione el archivo JSON previamente guardado
3. La estructura se cargará y la vista se actualizará

---

### Ejecutar la Búsqueda Binaria

#### Ejecutar el Algoritmo

1. Inserte los datos o cargue una estructura.
2. Ingrese la clave a buscar y pulse **"Buscar"**.
3. El sistema realizará la búsqueda binaria y mostrará cada paso de comparación.

#### Interpretar los Resultados

##### 1. Paso a paso de la Búsqueda
- Se muestran las variables `izquierda`, `derecha` y `medio` en cada iteración.
- Se indica si `valor_en_medio < objetivo`, `> objetivo` o `== objetivo`.

##### 2. Resultado final
- Si el elemento existe: se muestra la posición exacta.
- Si no existe: se indica `No encontrado` y la posición sugerida para la inserción.

---

### Resetear la Estructura

Para empezar desde cero:
1. Desplácese hasta el final de la vista
2. Haga clic en **"Resetear"** (botón rojo)
3. Confirme la acción
4. Volverá a la pantalla de configuración inicial

**Nota**: Esta acción elimina la estructura actual. Guarde antes si desea conservarla.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear estructura** | Configuración inicial | Genera el arreglo con los parámetros especificados |
| **Abrir desde archivo** (inicial) | Debajo de "Crear estructura" | Importa una estructura antes de crear una nueva |
| **Guardar Estructura** | Barra de operaciones | Exporta el arreglo actual a JSON |
| **Abrir Estructura** (operaciones) | Barra de operaciones | Importa una estructura reemplazando la actual |
| **Insertar** | Sección de inserción | Inserta un elemento manteniendo el orden |
| **Buscar** | Sección de búsqueda | Ejecuta búsqueda binaria mostrando pasos |
| **Eliminar** | Sección de borrado | Elimina el elemento y compacta el arreglo |
| **Resetear** | Final de la página | Elimina la estructura actual y vuelve al inicio |

---

## LinealView

### Descripción General

La vista `Busqueda Lineal` provee una interfaz para practicar la búsqueda lineal dentro de bloques (simulación de búsqueda externa por bloques) y operaciones relacionadas: insertar, buscar y eliminar. El objetivo pedagógico es mostrar cómo funciona la búsqueda secuencial dentro de bloques y el impacto de los corrimientos al insertar o eliminar.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **Capacidad total**: número máximo de elementos del archivo.
2. **Tamaño de bloque (B)**: número de elementos por bloque (puede calcularse automáticamente como ⌊√capacidad⌋).
3. **Tipo de clave**: `numérico` o `alfabético`.

-#### Paso 2: Crear la Estructura

- Presione **"Crear estructura"** para generar los bloques vacíos.
- Se renderizarán los bloques en la vista, cada uno con sus índices internos.

#### Alternativa: Importar Estructura

- Use **"Abrir desde archivo"** para cargar un JSON previamente exportado.

---

### Gestionar Elementos

#### Agregar Elementos

1. **Campo de clave**: ingrese el valor a insertar.
2. **Insertar**: ubica el bloque objetivo (comparando con último elemento del bloque) y realiza corrimientos si es necesario.

- Si el bloque está lleno, `insertarConCorrimiento` desplaza elementos a bloques siguientes.
- Se validan duplicados y se muestra un mensaje claro si ya existe la clave.

#### Buscar Elementos

- La búsqueda determina el bloque candidato y realiza búsqueda lineal (recorrido secuencial) dentro del bloque hasta encontrar la clave o llegar a una celda vacía.
- Muestra el bloque y la posición dentro del bloque.

#### Eliminar Elementos

- Localiza la clave y aplica `eliminarConCorrimiento` para compactar el bloque hacia la izquierda.

#### Visualización

- Muestra bloques verticales con índices globales y locales.
- Resalta el bloque en búsqueda y los desplazamientos durante inserciones/eliminaciones.

---

### Guardar y Cargar Estructuras

#### Guardar

- Botón **"Guardar"** descarga un JSON con `type: 'lineal-externa'`, `config` (capacidad, B) y `data` (bloques).

#### Abrir

- Botón **"Abrir"** permite seleccionar un JSON válido y restaurar la estructura.

---

### Ejecutar Operaciones

#### Ejecutar la Búsqueda

1. Inserte o cargue la estructura.
2. Ingrese la clave a buscar y pulse **"Buscar"**.
3. El sistema determinará bloque candidato y efectuará búsqueda lineal dentro de él.

#### Interpretar Resultados

##### 1. Bloque candidato
- Se indica cuál bloque fue elegido por la heurística (comparación con último elemento del bloque).

##### 2. Posición en bloque
- Si se encuentra, se muestra el índice global y local; si no, se indica la ausencia.

---

### Resetear la Estructura

- Use **"Resetear"** para borrar la estructura y volver a la configuración inicial. Confirme la acción.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear estructura** | Configuración inicial | Genera bloques vacíos según parámetros |
| **Abrir desde archivo** (inicial) | Debajo de "Crear estructura" | Importa una estructura antes de crear una nueva |
| **Guardar Estructura** | Barra de operaciones | Exporta los bloques a JSON |
| **Abrir Estructura** (operaciones) | Barra de operaciones | Importa estructura reemplazando la actual |
| **Insertar** | Sección de inserción | Inserta en bloque con corrimiento si aplica |
| **Buscar** | Sección de búsqueda | Encuentra la clave por búsqueda lineal en bloque |
| **Eliminar** | Sección de borrado | Elimina y compacta el bloque |
| **Resetear** | Final de la página | Elimina la estructura actual |

---

## HashMod

### Descripción General

La vista `FuncionesHash` implementa una interfaz para explorar hashing por módulo y técnicas de resolución de colisiones (área de colisiones o estructura secundaria). Es una herramienta didáctica para experimentar con parámetros como `capacidad`, `digitosClave` y la estrategia de colisiones, observando cómo se distribuyen las claves en bloques principales y áreas de colisión.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **Capacidad**: número total de posiciones que la estructura puede contener (mínimo recomendado 10).
2. **Digitos por clave**: cantidad de dígitos/carácteres esperados en la clave (ej.: 1 para claves simples).
3. **Resolución de colisiones**: seleccione `estructura-secundaria` o `area-colisiones`.

#### Paso 2: Crear la Estructura

- Pulse **"Crear estructura"** para inicializar bloques principales y, según la estrategia, bloques secundarios o áreas de colisiones.

#### Alternativa: Importar

- Use **"Abrir desde archivo"** para restaurar desde un JSON exportado previamente.

---

### Gestionar Elementos

#### Agregar Elementos

1. **Campo de clave**: ingrese la clave a insertar (entera positiva o formato definido por la vista).
2. **Insertar**: se aplica `hashModulo(clave, numeroBloques)` para localizar el bloque principal.
   - Si el bloque principal tiene espacio, se coloca en la primera posición libre.
   - Si está lleno, se usa `areaColisiones` o se inserta en `estructuraSecundaria` según la estrategia.

- Mensajes claros informan sobre duplicados, inserciones exitosas o errores de capacidad.

#### Buscar Elementos

- Calcula el mismo hash y busca por orden: bloque principal → área de colisiones → bloque secundario (si aplica).
- Muestra la ruta de búsqueda y la posición si se encuentra.

#### Eliminar Elementos

- Localiza la clave y la elimina si existe; actualiza contadores de ocupación.

#### Visualización

- Muestra bloques principales y, cuando corresponde, áreas de colisión o bloques secundarios.
- Resalta el bloque objetivo y las posiciones exploradas durante búsquedas o corrimientos.

---

### Guardar y Cargar Estructuras

#### Guardar

- **"Guardar"** descarga JSON con `type: 'hash-modulo-externo'`, config y estructuras internas.

#### Abrir

- **"Abrir"** valida el JSON y restaura la estructura si el `type` y `config` son compatibles.

---

### Ejecutar Operaciones

#### Insertar/Buscar/Eliminar

- Uso típico: crear estructura → insertar varias claves → buscar para verificar posiciones → eliminar si se necesita.
- Interpretación: la distribución muestra cuántas claves van al bloque principal vs. área de colisiones, permitiendo evaluar la eficiencia del hash.

---

### Resetear la Estructura

- Botón **"Resetear"** borra toda la estructura; confirme para proceder.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear estructura** | Configuración inicial | Inicializa bloques principales y secundarios/áreas según estrategia |
| **Abrir desde archivo** (inicial) | Debajo de "Crear estructura" | Importa una estructura antes de crear una nueva |
| **Guardar Estructura** | Barra de operaciones | Exporta la estructura a JSON |
| **Abrir Estructura** (operaciones) | Barra de operaciones | Importa estructura reemplazando la actual |
| **Insertar** | Sección de inserción | Inserta clave usando hash por módulo |
| **Buscar** | Sección de búsqueda | Localiza clave por recorrido de áreas |
| **Eliminar** | Sección de borrado | Elimina la clave si existe |
| **Resetear** | Final de la página | Elimina la estructura actual |

---

## ResiduoDigital

### Descripción General

La vista `Arbol Digital` implementa un árbol digital (trie/árbol binario por bits) para indexar claves basadas en su representación binaria. Permite insertar letras/clave, buscar, eliminar y visualizar el árbol en forma gráfica con `vis-network`. Es útil para comprender búsquedas por prefijos y navegación bit a bit.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **Profundidad / dígitos por clave**: define cuántos bits se usan para representar cada clave.
2. **Opciones de visualización**: activar/desactivar `Vista gráfica`.

#### Paso 2: Crear la Estructura

- Inserte una clave en el campo correspondiente y pulse **"Insertar"** para crear la raíz y comenzar a construir el árbol.

#### Alternativa: Importar

- **"Abrir"** permite cargar un JSON previamente exportado con la estructura del árbol y códigos almacenados.

---

### Gestionar Elementos

#### Agregar Elementos

1. **Campo de clave**: ingrese una letra o clave compatible.
2. **Insertar**: la vista convierte la letra a `binary code` (usando `letterToCode`), divide en grupos y recorre el árbol asignando la clave en la hoja correspondiente.

- El sistema informa `duplicado` o `insertado` con la ruta en índices de hijos.

#### Buscar Elementos

- Convierte la clave a código binario y recorre los grupos para localizar la hoja; si existe muestra la ruta y resalta el nodo.

#### Eliminar Elementos

- Localiza la hoja y borra `key` y `code` (eliminación lógica), actualizando la vista.

#### Visualización

- `vis-network` renderiza conectores y hojas; los conectores muestran `labelBits` y las hojas muestran la `key`.
- La vista permite centrar y seleccionar nodos según la ruta calculada.

---

### Guardar y Cargar Estructuras

#### Guardar

- **"Guardar"** descarga un JSON con `type: 'residuo-digital'`, config y el árbol serializado.

#### Abrir

- **"Abrir"** valida e importa el JSON restaurando la plantilla y claves.

---

### Ejecutar Operaciones

#### Insertar/Buscar/Eliminar

- Pasos típicos: crear plantilla → insertar letras → buscar para comprobar ubicación → eliminar si es necesario.
- Interpretación: la ruta y los `groups` binarios explican cómo se accede a cada hoja.

---

### Resetear la Estructura

- **"Resetear"** borra la estructura actual y reinicia la configuración. Confirme antes de continuar.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear estructura** | Configuración inicial | Genera plantilla del árbol según parámetros |
| **Abrir** (inicial) | Debajo de "Crear estructura" | Importa árbol antes de crear uno nuevo |
| **Guardar** | Barra de operaciones | Exporta el árbol a JSON |
| **Abrir** (operaciones) | Barra de operaciones | Importa árbol reemplazando el actual |
| **Insertar** | Sección de inserción | Inserta clave recorriendo grupos binarios |
| **Buscar** | Sección de búsqueda | Encuentra la clave y resalta la ruta |
| **Borrar** | Sección de borrado | Elimina la clave de la hoja correspondiente |
| **Reiniciar** | Final de la página | Elimina la estructura actual |

---

## ResiduoHuffman

### Descripción General

La vista `Arbol de Huffman` ofrece una interfaz para construir y experimentar con códigos de Huffman aplicados a cadenas de texto. Con esta vista el usuario aprende a calcular frecuencias, generar códigos prefijo, codificar y decodificar textos, y evaluar métricas de eficiencia. Incluye export/import del árbol y la representación serializable para ejercicios y pruebas.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **InputText**: área de texto donde el usuario pega la cadena a codificar.
2. **Opciones de normalización**: por ejemplo, eliminar saltos de línea o considerar mayúsculas/minúsculas.

#### Paso 2: Construir Huffman

- Haga clic en **"Construir"** para calcular frecuencias, formar el árbol y generar códigos.
- Se mostrará la tabla de frecuencias y el mapa `codes`.

#### Alternativa: Importar

- Use **"Abrir"** para cargar un JSON con `type: 'huffman'` y restaurar árbol, códigos y texto original.

---

### Gestionar Elementos

#### Calcular Frecuencias

- Tras pegar `inputText`, pulse el botón para calcular frecuencias; la tabla mostrará símbolo y frecuencia.

#### Generar Códigos y Codificar

- **Generar códigos**: ejecuta la construcción de Huffman.
- **Codificar**: convierte `inputText` a `encodedBits` usando el mapa `codes`.
- **Decodificar**: con el árbol construído se puede recuperar el texto a partir de la secuencia binaria.

#### Visualización

- Tabla de frecuencias ordenada por frecuencia descendente.
- Vista gráfica del árbol con `vis-network`, aristas etiquetadas `0/1`.

---

### Guardar y Cargar

#### Guardar

- **"Guardar"** descarga un JSON con `type: 'huffman'`, `frequencies`, `tree` y `config`.

#### Abrir

- **"Abrir"** valida `type === 'huffman'` y restaura la vista con árbol, códigos y texto.

---

### Ejecutar Operaciones

#### Codificar/Decodificar

- Paso a paso: pegar texto → construir → codificar → descargar o decodificar para verificar integridad.

#### Interpretar Resultados

##### 1. Tabla de frecuencias
- Muestra cada símbolo y su frecuencia.

##### 2. Longitud ponderada L
- `L = Σ(frecuencia * longitud_codigo)` y el total de bits codificados; se compara con el tamaño en bits original.

---

### Reiniciar la Vista

- **"Reiniciar"** borra `inputText` y el `huffmanResult`. Confirme antes de proceder.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Construir** | Sección principal | Calcula frecuencias y construye árbol |
| **Codificar** | Controles | Convierte texto a bits según códigos |
| **Decodificar** | Controles | Reconstruye texto desde bits usando el árbol |
| **Guardar** | Barra de operaciones | Exporta datos a JSON |
| **Abrir** | Barra de operaciones | Importa JSON y restaura estado |
| **Reiniciar** | Final de la página | Limpia la vista |

---

## ResiduoMultiple

### Descripción General

`Residuo Multiple` implementa una estructura de residuos múltiples (árbol multinivel) que agrupa claves según su codificación binaria dividida en grupos de `m` bits. Es una herramienta pedagógica para visualizar cómo los bits de una clave determinan la ruta dentro de un árbol y cómo se almacenan claves en hojas.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **m (bits por grupo)**: valor entre 1 y 3 que define el número de hijos por conector (`2^m`).
2. **Selector de vista**: `Vista gráfica` activable para mostrar el árbol con `vis-network`.

#### Paso 2: Crear la Plantilla

- Pulse **"Crear estructura"** para generar el `buildRMTemplate(m)` y habilitar operaciones.

#### Alternativa: Importar

- **"Abrir"** restaura un JSON exportado con `type: 'residuo-multiple'`.

---

### Gestionar Elementos

#### Insertar

1. **Campo clave (A-Z)**: ingrese una letra y pulse **"Insertar"**.
2. La vista convierte la letra a código binario (`letterToCode`), lo divide en grupos (`groupBits`) y recorre el árbol asignando la clave en la hoja.

- Mensajes informan `duplicado` o `insertado` con la ruta de índices.

#### Buscar

- Similar al insert: se calcula `groups` y se recorre el árbol; si se encuentra muestra `✓ Encontrada` con ruta.

#### Borrar

- Busca la hoja y limpia `key` y `code`, mostrando la ruta del nodo afectado.

#### Visualización

- `buildGraphData` genera nodos y aristas para `vis-network`.
- Conectores muestran `labelBits`, hojas muestran la `key`.
- Al buscar/insertar se centra la vista en el nodo objetivo.

---

### Guardar y Cargar

#### Guardar

- **"Guardar"** descarga `residuo-multiple` JSON con `config.base` y `data` (raíz del árbol).

#### Abrir

- **"Abrir"** valida con `validateResidueMultipleImport` y restaura `m`, `root` y el estado.

---

### Ejecutar Operaciones

- Pasos: crear plantilla → insertar varias claves → usar `Buscar` para comprobar ubicación → `Borrar` si se desea.
- Interpretación de mensajes: se muestran grupos y ruta `→` realizada en el árbol.

---

### Reiniciar la Estructura

- **"Reiniciar"** destruye la plantilla y limpia la vista.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear estructura** | Panel inicial | Genera `buildRMTemplate(m)` |
| **Abrir** (inicial) | Panel inicial | Importa estructura antes de crear una nueva |
| **Guardar** | Herramientas | Exporta árbol a JSON |
| **Abrir** (operaciones) | Herramientas | Importa árbol reemplazando el actual |
| **Insertar** | Controles | Inserta letra recorriendo grupos binarios |
| **Buscar** | Controles | Busca letra y resalta ruta |
| **Borrar** | Controles | Elimina la clave en la hoja correspondiente |
| **Reiniciar** | Final | Borra la plantilla |

---

## ResiduoSimple

### Descripción General

`ResiduoSimple` muestra la versión básica de tabla por residuos: `h(k) = k mod m`. Sirve para entender particionamiento por módulo y comparar estrategias de resolución de colisiones como encadenamiento y sondeo.

---

### Crear la Estructura

#### Paso 1: Configuración Inicial

1. **m (tamaño de tabla)**: número de casillas en la tabla.
2. **Estrategia de colisión**: seleccione `encadenamiento` o `sondeo`.

#### Paso 2: Crear la Tabla

- Pulse **"Crear Tabla"** para inicializar las casillas vacías.

#### Alternativa: Importar

- **"Abrir"** restaura una tabla desde JSON con `type: 'residuo-simple'`.

---

### Gestionar Elementos

#### Insertar

1. **Campo clave**: ingrese valor numérico o letra (según la conversión definida).
2. **Insertar**: calcula `h(k)` y aplica la estrategia seleccionada.

- Encadenamiento: añade el elemento a la lista en `table[h]` si no está duplicado.
- Sondeo: busca la siguiente posición libre `i = (i+1)%m` hasta encontrar espacio o duplicado.

#### Buscar

- Calcula `h(k)` y recorre la lista (encadenamiento) o la secuencia de sondeo para localizar la clave.

#### Eliminar

- Elimina la clave y actualiza métricas de carga.

#### Visualización

- Tabla con casillas mostrando listas o valores según la estrategia.
- Resalta la casilla objetivo y pasos de sondeo si aplica.

---

### Guardar y Cargar

#### Guardar

- **"Guardar"** exporta JSON con `type: 'residuo-simple'`, `config` y `data`.

#### Abrir

- **"Abrir"** valida y restaura la tabla.

---

### Ejecutar Operaciones

- Crear tabla → insertar claves → buscar/ eliminar → observar métricas (load factor).
- Interpretación: la distribución en la tabla y la longitud de las listas permiten evaluar la eficiencia.

---

### Reiniciar la Tabla

- **"Reiniciar"** elimina la tabla; confirme antes de realizar la acción.

---

### Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear Tabla** | Configuración inicial | Inicializa la tabla con `m` casillas |
| **Abrir Tabla** (inicial) | Debajo de "Crear Tabla" | Importa una tabla antes de crear una nueva |
| **Guardar** | Barra de operaciones | Exporta la tabla a JSON |
| **Abrir** (operaciones) | Barra de operaciones | Importa tabla reemplazando la actual |
| **Insertar** | Sección de inserción | Inserta clave aplicando `h(k)` y la estrategia |
| **Buscar** | Sección de búsqueda | Localiza la clave según la estrategia |
| **Borrar** | Sección de borrado | Elimina la clave y actualiza métricas |
| **Reiniciar** | Final de la página | Borra la tabla |

---

## Controles y Campos (Sección adicional)

Esta sección agrega una descripción detallada y accesible de los controles e inputs comunes en todas las vistas documentadas. Se incluye para facilitar al usuario final sin conocimientos técnicos.

### Campos comunes

- **Capacidad / m / tamaño**: número que define el tamaño de la estructura; siempre debe ser entero positivo. Si no está seguro, usar un valor moderado (ej. 20) para evitar vistas saturadas.
- **Clave / Valor / InputText**: campo donde se ingresa la clave a insertar/buscar; para letras use una sola letra (A-Z), para números use enteros positivos.
- **Tamaño de bloque (B)**: en vistas externas, define cuántos elementos hay por bloque; se sugiere usar la raíz cuadrada de la capacidad como punto de partida.
- **Estrategia de colisión**: opciones típicas: `encadenamiento`, `sondeo`, `area-colisiones`, `estructura-secundaria`. La elección afecta visiblemente la distribución de datos.

### Botones comunes

- **Crear / Construir / Crear Estructura**: inicializa la estructura según parámetros.
- **Insertar / Agregar**: agrega un elemento, aplicando la lógica interna (orden, hash o recorrido).
- **Buscar**: ejecuta la operación de búsqueda y muestra resultados paso a paso.
- **Borrar / Eliminar**: quita la clave si se encuentra.
- **Guardar / Exportar**: descarga la estructura actual en JSON para compartir o preservar el estado.
- **Abrir / Importar**: carga una estructura previamente exportada; el archivo debe cumplir el `type` y la forma esperada.
- **Resetear**: borra la estructura actual; confirmar antes de proceder.

### Mensajes y validaciones

- El sistema valida entradas (ej.: capacidad >= 2, claves no vacías) y muestra mensajes de ayuda cuando una acción no es posible (duplicado, estructura llena, JSON inválido).
- Lea siempre el mensaje mostrado en la interfaz tras cada operación: son el registro inmediato del éxito o fallo.

---

## Fin del Manual Internas