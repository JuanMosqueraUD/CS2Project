# Manual de Usuario - Grafos

Esta seccion del documento agrupa las vistas relacionadas con grafos del proyecto. Cada sección sigue la misma plantilla: descripción, creación, gestión de aristas/nodos, importación/guardado, ejecución de algoritmos (si aplica), interpretación de resultados, reinicio y resumen de botones con los textos exactos de la interfaz.

---

# Árboles de Expansión

## Introducción

La herramienta de **Árboles de Expansión** te permite crear un grafo ponderado y calcular su árbol de expansión mínimo o máximo. Un árbol de expansión es un subconjunto de las aristas del grafo que conecta todos los nodos sin formar ciclos, y el árbol de expansión mínimo es aquel cuya suma de pesos de las aristas es la menor posible.

## ¿Qué es un Árbol de Expansión?

Imagina que tienes varias ciudades y quieres conectarlas todas con carreteras, pero cada carretera tiene un costo diferente. Un árbol de expansión mínimo te ayuda a encontrar la manera más económica de conectar todas las ciudades, asegurándote de que todas estén conectadas pero sin gastar de más en rutas redundantes.

---

## Paso 1: Crear tu Grafo

### Configuración Inicial

1. **Ingresar cantidad de nodos**: Escribe cuántos nodos (puntos) deseas en tu grafo. Por ejemplo, si escribes "6", tendrás 6 nodos numerados del 1 al 6.

2. **Hacer clic en "Crear Grafo"**: Una vez que hayas ingresado la cantidad de nodos, haz clic en el botón para crear tu grafo.

### Importar un Grafo Existente

Si ya tienes un grafo guardado anteriormente, puedes importarlo:

- Haz clic en **"Abrir Grafo"**
- Selecciona el archivo JSON que guardaste previamente
- El grafo se cargará automáticamente con todas sus aristas

---

## Paso 2: Agregar Aristas (Conexiones)

Una vez creado el grafo, puedes conectar los nodos mediante aristas con pesos.

### Cómo Agregar una Arista

1. **Seleccionar nodos a conectar**: En el campo de texto, escribe los dos nodos que quieres conectar.
   - Puedes escribir: `12` (sin espacio) o `1 2` (con espacio)
   - Ambos formatos crean una conexión entre el nodo 1 y el nodo 2

2. **Ingresar el peso**: En el campo "Peso", escribe un número entero positivo (por ejemplo: 5, 10, 15).
   -  **Importante**: El peso debe ser un número entero mayor o igual a 1

3. **Agregar la arista**: Haz clic en el botón **"Agregar Arista"** o presiona Enter

### Visualización del Grafo

- Verás tu grafo representado visualmente con:
  - **Círculos naranjas**: Representan los nodos
  - **Líneas grises**: Representan las aristas
  - **Números en las líneas**: Muestran los pesos de cada arista

### Información del Grafo

Debajo de la visualización verás:
- **V =** Conjunto de vértices (nodos)
- **A =** Conjunto de aristas con sus conexiones
- **Cantidad de aristas**: Número total de conexiones

---

## Paso 3: Calcular Árbol de Expansión

### Árbol de Expansión Mínimo

1. Haz clic en el botón **"Árbol de Expansión Mínimo"**
2. El sistema calculará automáticamente el árbol con el menor peso total posible
3. Verás:
   - Un mensaje indicando el peso total del árbol
   - La visualización se actualizará mostrando solo las aristas seleccionadas

### Árbol de Expansión Máximo

1. Haz clic en el botón **"Árbol de Expansión Máximo"**
2. El sistema calculará el árbol con el mayor peso total posible
3. Similar al mínimo, verás el resultado con el peso total

**Información mostrada:**
- **T =** Conjunto de aristas del árbol de expansión
- **Peso Total**: Suma de todos los pesos de las aristas seleccionadas

---

## Paso 4: Generar Árbol Complemento

El árbol complemento (T') contiene todas las aristas del grafo original que NO están en el árbol de expansión.

### Cómo Generar el Complemento

1. Primero debes calcular un árbol de expansión (mínimo o máximo)
2. Haz clic en **"Generar Árbol Complemento (T')"**
3. Verás una nueva visualización con:
   - Las aristas que NO fueron seleccionadas en el árbol de expansión
   - **T' =** Conjunto de aristas complementarias

### ¿Para qué sirve?

El árbol complemento te muestra las conexiones "alternativas" o "redundantes" que no se necesitan para conectar todos los nodos. Es útil para:
- Identificar rutas de respaldo
- Analizar la estructura del grafo original
- Estudiar las diferencias entre el árbol mínimo y el grafo completo

---    

## Paso 5: Guardar y Abrir Grafos

### Guardar tu Trabajo

1. Haz clic en **"Guardar Grafo"**
2. Se descargará un archivo JSON con:
   - La configuración del grafo
   - Todos los nodos y aristas
   - El árbol de expansión calculado (si existe)
3. El archivo se guardará con un nombre automático que incluye la fecha

### Abrir un Grafo Guardado

1. Haz clic en **"Abrir Grafo"**
2. Selecciona el archivo JSON que guardaste
3. Todo el grafo se restaurará:
   - Nodos y aristas originales
   - Árbol de expansión (si estaba calculado)
   - Árbol complemento (si estaba generado)

---

## Paso 6: Reiniciar

Si deseas empezar de nuevo:

1. Haz clic en **"Resetear Grafo"** (botón rojo)
2. Se borrarán todos los datos:
   - Nodos y aristas
   - Árboles calculados
   - Visualizaciones
3. Podrás crear un nuevo grafo desde cero

---



###  Restricciones

- Los pesos de las aristas deben ser **números enteros positivos** (1, 2, 3, etc.)
- No puedes crear aristas de un nodo consigo mismo (bucles)
- No puedes crear aristas duplicadas entre los mismos nodos
- Debes tener al menos 2 nodos para crear aristas

---

# Distancia entre Árboles de Expansión

## Introducción

La herramienta de **Distancia entre Árboles de Expansión** te permite comparar dos grafos diferentes calculando sus árboles de expansión mínimos y determinando qué tan diferentes son entre sí. Esta métrica de distancia es útil para analizar similitudes y diferencias entre estructuras de red.

## ¿Qué es la Distancia entre Árboles?

Imagina que tienes dos diseños diferentes de red de transporte para conectar las mismas ciudades. La distancia entre árboles te dice qué tan diferentes son estos dos diseños, considerando tanto las rutas que comparten como las que son únicas de cada uno.

Un valor de distancia **bajo** significa que los árboles son muy similares, mientras que un valor **alto** indica que son muy diferentes.

---

## Paso 1: Crear los Dos Grafos

### Configuración Inicial

1. **Ingresar cantidad de nodos para Grafo 1**: Escribe cuántos nodos deseas en el primer grafo (ejemplo: 5 nodos)

2. **Ingresar cantidad de nodos para Grafo 2**: Escribe cuántos nodos deseas en el segundo grafo (ejemplo: 6 nodos)
   - Los grafos pueden tener diferente cantidad de nodos

3. **Hacer clic en "Crear Grafos"**: Ambos grafos se crearán simultáneamente

### Importar Grafos Existentes

Si ya tienes grafos guardados:

**Antes de crear:**
- Haz clic en **"Abrir Grafos"**
- Selecciona el archivo JSON guardado previamente
- Ambos grafos se cargarán automáticamente

**Después de crear:**
- También puedes importar grafos después de haberlos creado
- Usa el botón **"Abrir Grafos"** en la sección de operaciones

---

## Paso 2: Seleccionar el Grafo a Modificar

Antes de agregar aristas, debes elegir en cuál de los dos grafos deseas trabajar.

### Botones de Selección

Verás dos botones claramente marcados:
- **Grafo 1**: Selecciona el primer grafo para modificarlo
- **Grafo 2**: Selecciona el segundo grafo para modificarlo

El botón activo se mostrará resaltado para indicar cuál grafo estás editando actualmente.

---

## Paso 3: Agregar Aristas a los Grafos

### Cómo Agregar Aristas

1. **Asegúrate de tener el grafo correcto seleccionado** (verás "Crear Aristas - Grafo 1" o "Crear Aristas - Grafo 2")

2. **Ingresar los nodos a conectar**:
   - Escribe dos números para conectar esos nodos
   - Formatos aceptados: `12` o `1 2`
   - Ejemplo: `34` conecta el nodo 3 con el nodo 4

3. **Ingresar el peso**:
   - Escribe un número entero positivo (1, 2, 3, etc.)
   -  **Importante**: Solo se aceptan números enteros mayores o igual a 1

4. **Agregar la arista**:
   - Haz clic en **"Agregar Arista"** o presiona Enter

5. **Cambiar de grafo si es necesario**:
   - Haz clic en el botón del otro grafo
   - Repite el proceso para agregar aristas al segundo grafo

### Visualización en Tiempo Real

Verás dos paneles de visualización lado a lado:

**Panel Izquierdo - Grafo 1:**
- Círculos naranjas representan los nodos
- Líneas grises representan las aristas
- Números en las líneas muestran los pesos

**Panel Derecho - Grafo 2:**
- Mismo formato de visualización
- Independiente del Grafo 1

Debajo de cada visualización verás:
- **V₁ / V₂** = Conjunto de vértices (nodos)
- **A₁ / A₂** = Conjunto de aristas con sus conexiones

---

## Paso 4: Generar Árboles de Expansión

Una vez que ambos grafos tengan suficientes aristas, puedes calcular sus árboles de expansión mínimos.

### Cómo Generar los Árboles

1. **Haz clic en "Generar Árbol de Expansión"**
   - Este botón genera ambos árboles simultáneamente
   - Cada grafo se transformará mostrando solo las aristas de su árbol de expansión mínimo

2. **Visualización Actualizada**:
   - Los paneles ahora muestran los árboles de expansión en lugar de los grafos completos
   - El título cambia a "Árboles de Expansión Mínimos"
   - Los subtítulos indican "Árbol de Expansión - Grafo 1" y "Árbol de Expansión - Grafo 2"

3. **Información Mostrada**:
   - **T₁** = Conjunto de aristas del árbol 1
   - **T₂** = Conjunto de aristas del árbol 2
   - Los árboles permanecen en el mismo lugar donde estaban los grafos originales

### Requisitos para Generar Árboles

Para que el árbol de expansión se pueda calcular correctamente:
- El grafo debe tener al menos n-1 aristas (donde n es el número de nodos)
- Todos los nodos deben estar conectados entre sí (grafo conexo)

---

## Paso 5: Calcular la Distancia entre Árboles

Una vez que ambos árboles de expansión han sido generados, puedes calcular qué tan diferentes son.

### Cómo Calcular la Distancia

1. **Haz clic en "Calcular Distancia de Árboles"**

2. **Validación Automática**:
   - El sistema verifica que ambos grafos sean árboles válidos
   - Un árbol válido tiene exactamente n-1 aristas y no tiene ciclos
   - Si alguno no es un árbol válido, recibirás un mensaje de error

3. **Resultado**:
   - Si ambos son árboles válidos, verás un cuadro destacado con:
     - **"Distancia entre Árboles"**
     - El valor numérico de la distancia

### ¿Cómo se Calcula la Distancia?

La distancia se calcula usando la siguiente fórmula:

**Distancia = (Suma de pesos de aristas únicas) / 2**

Donde las "aristas únicas" son aquellas que están en uno de los árboles pero no en el otro, considerando tanto las aristas diferentes como las diferencias en sus pesos.

### Interpretación del Resultado

- **Distancia = 0**: Los árboles son idénticos (mismas aristas con mismos pesos)
- **Distancia baja (1-5)**: Los árboles son muy similares
- **Distancia media (6-15)**: Los árboles tienen algunas diferencias significativas
- **Distancia alta (>15)**: Los árboles son muy diferentes

---

## Paso 6: Guardar y Abrir Grafos

### Guardar tu Trabajo

1. **Haz clic en "Guardar Grafos"**
2. Se descargará un archivo JSON que contiene:
   - Configuración de ambos grafos
   - Todos los nodos y aristas de ambos grafos
   - Fecha y hora del guardado
3. El archivo tiene un nombre automático como `distancia-arboles-1733123456789.json`

### Abrir Grafos Guardados

1. **Haz clic en "Abrir Grafos"**
2. Selecciona el archivo JSON
3. Ambos grafos se restaurarán completamente con:
   - Todos los nodos y aristas
   - Las mismas configuraciones originales
   - Visualizaciones listas para trabajar

---

## Paso 7: Reiniciar

Si deseas empezar de nuevo con grafos diferentes:

1. **Haz clic en "Resetear Grafos"** (botón rojo al final)
2. Se borrarán:
   - Ambos grafos completos
   - Árboles de expansión calculados
   - Distancia calculada
   - Todas las visualizaciones
3. Volverás al inicio para crear nuevos grafos


---



## Flujo de Trabajo Recomendado

1. **Planificación** ➜ Define cuántos nodos necesita cada grafo
2. **Creación** ➜ Crea ambos grafos con "Crear Grafos"
3. **Construcción Grafo 1** ➜ Selecciona Grafo 1 y agrega todas sus aristas
4. **Construcción Grafo 2** ➜ Selecciona Grafo 2 y agrega todas sus aristas
5. **Guardar** ➜ Guarda los grafos
6. **Generar Árboles** ➜ Calcula ambos árboles de expansión
7. **Calcular Distancia** ➜ Obtén la métrica de diferencia
8. **Analizar** ➜ Interpreta el resultado según tus necesidades



---
# Algoritmo de Floyd-Warshall

## Descripción General

El Algoritmo de Floyd-Warshall es una herramienta interactiva para calcular las distancias mínimas entre todos los pares de vértices en un grafo ponderado o no ponderado. Esta vista permite crear grafos personalizados, agregar aristas con o sin pesos, y calcular métricas importantes como excentricidades, distancias de vértices, mediana y diámetro del grafo.

---

## Crear un Grafo

### Paso 1: Configuración Inicial

Al ingresar a la vista, se presenta un formulario con tres campos de configuración:

1. **Cantidad de Nodos**: Ingrese el número de nodos que tendrá su grafo (ej: 5)
   - Los nodos se numerarán automáticamente del 1 al número especificado

2. **Tipo de Grafo**: Seleccione entre:
   - **No Dirigido**: Las conexiones entre nodos son bidireccionales (A↔B)
   - **Dirigido**: Las conexiones tienen una dirección específica (A→B)

3. **Ponderado**: Seleccione si desea asignar pesos a las aristas:
   - **Sí**: Las aristas tendrán valores numéricos (distancias, costos, etc.)
   - **No**: Todas las aristas tendrán peso 1

### Paso 2: Crear el Grafo

- Haga clic en el botón **"Crear Grafo"**
- El sistema generará los nodos especificados y mostrará la visualización inicial del grafo

### Alternativa: Importar un Grafo Existente

Si ya tiene un grafo guardado previamente:
- Haga clic en el botón **"Abrir Grafo"** ubicado debajo del botón "Crear Grafo"
- Seleccione el archivo JSON con la extensión `.json`
- El grafo se cargará automáticamente con su configuración y aristas

---

## Gestionar Aristas

### Agregar Aristas

Una vez creado el grafo, aparecerá la sección **"Crear Aristas"** con los siguientes campos:

1. **Campo de Conexión**: Ingrese los dos nodos que desea conectar
   - Formato aceptado: `12` o `1 2` (conecta el nodo 1 con el nodo 2)
   - Ejemplo: Para conectar nodos 3 y 5, escriba `35` o `3 5`

2. **Campo de Peso** (solo si el grafo es ponderado):
   - Ingrese el valor numérico del peso de la arista
   - Ejemplo: `4.5` o `10`
   - Este campo es obligatorio para grafos ponderados

3. **Botón "Agregar Arista"**: Haga clic para confirmar la conexión
   - La arista aparecerá inmediatamente en la visualización
   - Un mensaje confirmará la operación exitosa

### Visualización del Grafo

La visualización interactiva muestra:
- **Nodos**: Círculos naranjas numerados con su identificador
- **Aristas**: Líneas grises que conectan los nodos
- **Pesos**: Números sobre las aristas (si el grafo es ponderado)
- **Direcciones**: Flechas en las aristas (si el grafo es dirigido)

Puede:
- Hacer clic y arrastrar los nodos para reorganizar la visualización
- Acercar o alejar usando la rueda del mouse
- Pasar el cursor sobre elementos para resaltarlos

---

## Guardar y Cargar Grafos

### Guardar un Grafo

En la sección de botones de operaciones:
1. Haga clic en **"Guardar Grafo"**
2. El sistema generará un archivo JSON con:
   - Configuración del grafo (tipo, nodos, ponderación)
   - Todas las aristas y sus propiedades
   - Fecha de exportación en el nombre del archivo
3. El archivo se descargará automáticamente con el formato:
   - `floyd_dirigido_ponderado_2025-12-02.json`
   - `floyd_no-dirigido_no-ponderado_2025-12-02.json`

### Abrir un Grafo Guardado

Después de crear un grafo:
1. Haga clic en **"Abrir Grafo"** (al lado de "Guardar Grafo")
2. Seleccione el archivo JSON previamente guardado
3. El grafo se cargará con todas sus configuraciones y aristas
4. La visualización se actualizará automáticamente

---

## Calcular Distancias con el Algoritmo de Floyd-Warshall

### Ejecutar el Algoritmo

Una vez que su grafo tenga al menos una arista:
1. Localice el botón **"Calcular Distancias"** debajo de la visualización
2. Haga clic en el botón
3. El sistema ejecutará el algoritmo y mostrará los resultados

### Interpretar los Resultados

Los resultados se dividen en varias secciones:

#### 1. Matriz Final del Algoritmo

Una tabla que muestra las distancias mínimas entre todos los pares de vértices:

| Matriz | 1 | 2 | 3 | 4 |
|--------|---|---|---|---|
| **1**  | 0 | 2 | 5 | 7 |
| **2**  | 2 | 0 | 3 | 5 |
| **3**  | 5 | 3 | 0 | 2 |
| **4**  | 7 | 5 | 2 | 0 |

- **Diagonal (0)**: Distancia de un vértice a sí mismo
- **Números**: Distancia mínima entre dos vértices
- **∞ (Infinito)**: No existe camino entre los vértices

#### 2. Excentricidades por Vértice

La excentricidad de un vértice es la máxima distancia desde ese vértice a cualquier otro vértice del grafo.

**Ejemplo:**
- Vértice 1: 7
- Vértice 2: 5
- Vértice 3: 5
- Vértice 4: 7

**Interpretación**: El vértice 2 tiene excentricidad 5, lo que significa que el vértice más lejano está a distancia 5.

#### 3. Distancia de Vértice (Suma de Caminos Mínimos)

Para cada vértice, se muestra la suma de todas las distancias mínimas hacia los demás vértices.

**Ejemplo:**
- Vértice 1: 14 (suma: 0+2+5+7)
- Vértice 2: 10 (suma: 2+0+3+5)
- Vértice 3: 10 (suma: 5+3+0+2)
- Vértice 4: 14 (suma: 7+5+2+0)

**Interpretación**: 
- Vértices con menor distancia total están más "centrales" en el grafo
- Útil para identificar nodos estratégicos en redes de transporte o comunicación

#### 4. Mediana (Excentricidad Mínima)

La mediana es el valor mínimo entre todas las excentricidades.

**Visualización:**
- Se muestra un pequeño grafo con el(los) vértice(s) centro
- **Centro**: Un solo vértice con excentricidad mínima (un nodo naranja)
- **Bicentro**: Dos vértices con excentricidad mínima (dos nodos naranjas conectados)

**Ejemplo:**
- Mediana: 5
- Centro: Vértices 2, 3 (Bicentro)

**Interpretación**: Los vértices centro son los más centrales del grafo, minimizando la distancia máxima a cualquier otro vértice.

#### 5. Diámetro (Excentricidad Máxima)

El diámetro es el valor máximo entre todas las excentricidades, representando la mayor distancia mínima entre dos vértices cualesquiera del grafo.

**Ejemplo:**
- Diámetro: 7

**Interpretación**: La mayor distancia mínima en el grafo es 7, entre los vértices 1 y 4 (o 4 y 1).


---

## Resetear el Grafo

Para empezar desde cero:
1. Desplácese hasta el final de la página
2. Haga clic en el botón **"Resetear Grafo"** (botón rojo)
3. Confirme la acción
4. Volverá a la pantalla de configuración inicial

**Nota**: Esta acción elimina permanentemente el grafo actual. Asegúrese de guardarlo antes si desea conservarlo.


---


## Resumen de Botones y Acciones

| Botón/Acción | Ubicación | Función |
|--------------|-----------|---------|
| **Crear Grafo** | Configuración inicial | Genera el grafo con los parámetros especificados |
| **Abrir Grafo** (inicial) | Debajo de "Crear Grafo" | Importa un grafo antes de crear uno nuevo |
| **Guardar Grafo** | Barra de operaciones | Exporta el grafo actual a JSON |
| **Abrir Grafo** (operaciones) | Barra de operaciones | Importa un grafo reemplazando el actual |
| **Agregar Arista** | Sección de aristas | Crea una conexión entre dos nodos |
| **Calcular Distancias** | Debajo de visualización | Ejecuta el algoritmo de Floyd-Warshall |
| **Resetear Grafo** | Final de la página | Elimina el grafo actual y vuelve al inicio |

---



## Matrices y Adyacencias

**Descripción General:**

Vista centrada en mostrar matrices dinámicas relacionadas con un grafo: matriz de adyacencia (nodos), adyacencia de aristas y matriz de incidencia. Permite crear grafos, agregar/borrar aristas y nodos, ver notación en teoría de conjuntos y exportar/importar grafos.

**Crear un Grafo**
- **Botón:** `Crear Grafo`
- Campos: `Cantidad de Nodos`, `Tipo de Grafo` (No Dirigido / Dirigido), `¿Es Ponderado?` (Sí / No)
- Importación inicial: botón ` Importar Grafo` (siempre visible)

**Gestionar Aristas y Nodos**
- Campo conexión: placeholder `Ej: 12 para conectar nodo 1 y 2`
- Campo peso: placeholder `Peso` (si `¿Es Ponderado?` está activo)
- Botones: `Agregar Arista`, `Agregar Nodo` (etiquetado en UI como `Agregar Nodo`), `Eliminar` (para eliminar nodo), `Borrar` (para arista)

**Paneles de Matrices**
- `Matriz de Adyacencia de Nodos`
- `Adyacencia de Aristas`
- `Matriz de Incidencia`
- Control dinámico de tamaño: slider con etiqueta `Tamaño matrices` y valor en `px`

**Operaciones / Guardado**
- Botones: `Resetear Grafo`, `Guardar Grafo`

**Resumen de botones**
- ` Importar Grafo`, `Crear Grafo`, `Agregar Arista`, `Agregar Nodo`, `Eliminar`, `Borrar`, `Resetear Grafo`, ` Guardar Grafo`

---

### Detalles técnicos

- Matrices disponibles:
   - **Matriz de adyacencia (nodos)**: matriz A de tamaño n×n (n = |V|). Para grafos no ponderados A[i][j] ∈ {0,1}; para grafos ponderados A[i][j] contiene el peso de la arista o 0/∞ cuando no existe conexión. En grafos dirigidos la matriz no es necesariamente simétrica.
   - **Adyacencia de aristas**: matriz E×E donde cada fila/columna representa una arista; la entrada indica si dos aristas comparten un extremo. Útil para construir el grafo línea.
   - **Matriz de incidencia**: matriz B de tamaño n×m (m = |E|). Convención usada en la UI: en grafos no dirigidos B[i][j] ∈ {0,1}; en dirigidos se usa {1,-1,0} según la orientación (1 si el nodo es origen, -1 si es destino, 0 si no participa).

- Usos prácticos en la vista:
   - **Comprobación de conectividad y grados**: grados de nodos se calculan sumando filas/columnas de la matriz de adyacencia o sumando columnas en la matriz de incidencia.
   - **Caminos de longitud k**: la k-ésima potencia de la matriz de adyacencia (A^k) da el número de caminos de longitud k entre pares (operación teórica, costosa para n grandes).
   - **Visualización**: las matrices se muestran con scroll y control de tamaño para mantener legibilidad en grafos grandes.

### Recomendaciones de uso

- Para grafos grandes preferir la representación por listas de adyacencia (no visualizada) y regenerar matrices solo bajo demanda (export/import o al abrir la pestaña de matrices).
- Los archivos JSON exportados contienen nodos y aristas explícitos: conservarlos para importación sin pérdida de información.

## Matrices y Circuitos

**Descripción General:**

Vista especializada en análisis de circuitos y cortes de un grafo ponderado. Calcula todos los circuitos, circuitos fundamentales, matrices de circuitos, conjuntos de corte y sus matrices, además del árbol de expansión máximo (ramas/cuerdas).

**Crear un Grafo**
- **Botón:** `Crear Grafo`
- Importación siempre disponible: botón `Abrir Grafo`
- Campos: `Cantidad de Nodos`, `Tipo de Grafo`, `¿Es Ponderado?` (bloqueado a `Sí` en la UI)

**Gestionar Aristas y Nodos**
- Campo conexión: placeholder `Ej: 12 para conectar nodo 1 y 2`
- Campo peso: placeholder `Peso`
- Botones: `Agregar Arista`, `Insertar Nodo`, `Eliminar`, `Borrar`

**Paneles y Salidas**
- `Ramas (T) — Árbol de expansión máximo`
- `Cuerdas (C)`
- `Todos los Circuitos` y `Matriz de Circuitos`
- `Circuitos Fundamentales` y `Matriz de Circuitos Fundamentales`
- `Conjuntos de Corte` y `Matriz de Conjuntos de Corte`
- `Cortes Fundamentales` y su matriz

**Operaciones / Guardado**
- Botones: `Resetear Grafo`, ` Guardar Grafo`

**Resumen de botones (texto literal en UI)**
- `Abrir Grafo`, `Crear Grafo`, `Agregar Arista`, `Insertar Nodo`, `Eliminar`, `Borrar`, `Resetear Grafo`, `Guardar Grafo`

---

### Detalles técnicos y definiciones

- Definiciones clave:
   - **Circuito (ciclo simple)**: recorrido cerrado sin repetir aristas ni vértices (excepto vértice inicial=final). La vista lista "Todos los Circuitos" detectados por algoritmos basados en búsqueda DFS y eliminación de duplicados por rotación y reflejo.
   - **Circuito fundamental**: dado un árbol generador (spanning tree) T, cada arista fuera de T define exactamente un circuito fundamental (la arista más el camino en T entre sus extremos). El conjunto de circuitos fundamentales forma una base del espacio de ciclos.
   - **Conjunto de corte (cut-set)**: conjunto de aristas que separa el grafo en dos componentes; los cortes fundamentales se definen respecto a un árbol generador.

- Matrices y convenciones usadas en la vista:
   - **Matriz de circuitos**: filas = circuitos, columnas = aristas; entradas en {1,-1,0}. La convención de signo indica orientación relativa con la arista de referencia (1 si la arista aparece en el circuito con la misma orientación, -1 si con orientación inversa, 0 si no participa).
   - **Matriz de cortes**: similar a la matriz de circuitos pero con 1/0 según inclusión de arista en el corte; en cortes dirigidos puede usarse el signo para distinguir origen/destino.

- Algoritmos y complejidad:
   - Encontrar "todos los circuitos" es una tarea combinatoria (puede crecer exponencialmente con m). La vista aplica heurísticas y límites prácticos para evitar explosión computacional en grafos grandes.
   - Construcción de circuitos fundamentales y matrices de cortes/fundamentales se hace en O(n + m) tras obtener un árbol generador (DFS/BFS + procesamiento de aristas restantes).
   - El número de circuitos independientes (dimensión del espacio de ciclos) es el número ciclomático: μ = m - n + c (c = componentes conectadas).

### Recomendaciones de uso

- Evitar solicitar "Todos los Circuitos" en grafos con más de ~20 aristas — la operación puede tomar mucho tiempo. Para análisis exhaustivos, prefiera primero generar un árbol (árbol de expansión) y trabajar con los circuitos fundamentales.

## Operaciones entre N Grafos

**Descripción General:**

Vista para crear N grafos (configurable), gestionar cada grafo por separado y ejecutar operaciones binarias entre grafos: unión, intersección, suma, suma anillo, productos y composición.

**Crear Grafos**
- **Botón:** `Crear Grafos`
- Importación: `Abrir Grafos` (siempre visible)
- Configuración: `Cantidad de Grafos`, y la cantidad de nodos para cada grafo

**Gestionar Aristas y Nodos**
- Selector dinámico de grafo: botones con etiquetas `G1`, `G2`, ... (en UI aparecen como `Grafo G${i}` y botones seleccionables `G${i}`)
- Campo conexión: placeholder `Ej: 12 para conectar nodo 1 y 2`
- Botones: `Agregar Arista`, `Insertar Nodo`, `Eliminar`, `Borrar`

**Operaciones entre Grafos**
- `Unión (G₁ ∪ G₂)`
- `Intersección (G₁ ∩ G₂)`
- `Suma (G₁ + G₂)`
- `Suma Anillo (G₁ ⊕ G₂)`
- `Producto Cartesiano (G₁ × G₂)`
- `Producto Tensorial (G₁ ⊗ G₂)`
- `Composición (G₁ ∘ G₂)`

**Resultados**
- Panel de resultado con visualización del grafo resultado y notación (V, A)
- Cerrar panel: `Cerrar Resultado`

**Reset / Guardado**
- Botones: `Resetear Grafos`, `Guardar Grafos`

---

### Definiciones y detalles técnicos

- Operaciones elementales (definiciones usadas como referencia):
   - **Unión (G1 ∪ G2)**: V = V1 ∪ V2, A = A1 ∪ A2. Si las etiquetas de vértice coinciden se mantienen; en implementaciones donde se crean grafos nuevos puede realizarse renumeración para evitar colisiones.
   - **Intersección (G1 ∩ G2)**: V = V1 ∩ V2, A = A1 ∩ A2 (solo se mantienen los vértices y aristas presentes en ambos grafos).
   - **Suma (G1 + G2)**: en este contexto se interpreta como **unión disjunta** (disjoint union) — los vértices se renumeran/etiquetan para mantener grafos independientes y luego se combinan; resultado: |V| = |V1| + |V2|, |A| = |A1| + |A2|.
   - **Suma Anillo (G1 ⊕ G2)**: diferencia simétrica de aristas sobre V = V1 ∪ V2, A = (A1 ∪ A2) \ (A1 ∩ A2).
   - **Producto Cartesiano (G1 × G2)**: V = V1 × V2; hay arista entre (u1,v1) y (u2,v2) si (u1=u2 and (v1,v2) ∈ A2) o (v1=v2 and (u1,u2) ∈ A1). Tamaño crece multiplicativamente: |V| = |V1|·|V2|.
   - **Producto Tensorial (G1 ⊗ G2)**: V = V1 × V2; hay arista entre (u1,v1) y (u2,v2) si (u1,u2) ∈ A1 and (v1,v2) ∈ A2.
   - **Composición (G1 ∘ G2)**: operación que combina relaciones de adyacencia por composición de relaciones; implementación y semántica pueden variar, la UI ofrece una versión comúnmente usada en teoría de grafos (consulte la referencia en la sección de ayuda interna si necesita la fórmula exacta usada en esta vista).

- Complejidad y consideraciones:
   - Muchas operaciones tienen coste O(|V1|·|V2| + |A1|·|A2|) en worst-case (especialmente productos), por lo que la vista limita o advierte cuando los tamaños combinados son grandes.
   - Al usar operaciones que amplían el conjunto vértice, tenga en cuenta memoria/tiempo y prefiera trabajar con grafos pequeños o con ejemplos reducidos.

### Ejemplos rápidos

- Unión: G1 con V1={1,2}, A1={(1,2)} y G2 con V2={2,3}, A2={(2,3)} → G1 ∪ G2 tiene V={1,2,3} y A={(1,2),(2,3)}.
- Suma Anillo: con los mismos G1,G2 → A resultado es {(1,2),(2,3)} \\ {(2,3) si estuviera en ambos} = diferencia simétrica.

## Operaciones en un Grafo

**Descripción General:**

Vista de operaciones avanzadas sobre un grafo único: fusionar vértices, contraer aristas, generar grafo línea y generar complemento del grafo. Incluye import/export y control de transformaciones reversibles.

**Crear un Grafo**
- **Botón:** `Crear Grafo`
- Importación siempre disponible: `Abrir Grafo`
- Campos: `Cantidad de Nodos`, `Tipo de Grafo`, `¿Es Ponderado?`

**Gestionar Aristas y Nodos**
- Campo conexión: placeholder `Ej: 12 para conectar nodo 1 y 2`
- Campo peso: placeholder `Peso` (si aplica)
- Botones: `Agregar Arista`, `Insertar Nodo`, `Eliminar`, `Borrar`

**Operaciones Avanzadas (textos literales)**
- Fusionar vértices: sección `Fusionar nodos` → botón `Fusionar` (ingresar pares en placeholder `Ej: 12`)
- Contraer arista: sección `Contraer Arista` → botón `Contraer` (placeholder `Ej: 12`)
- Generar grafo línea: `Generar Línea` (botón dentro de `Generar Grafo Línea`)
- Generar complemento: `Generar Complemento` (botón dentro de `Generar Complemento del Grafo`)
- Reversión: `Revertir Grafo Línea`, `Revertir Complemento` (botones de reversión)

**Reset / Guardado**
- Botones: `Resetear Grafo`, `Guardar Grafo`

---

### Detalles técnicos y definiciones

- Transformaciones soportadas (definiciones y efectos):
   - **Fusionar vértices (identificación)**: identificar dos vértices u,v en uno solo (u≈v). Todas las aristas incidentes a u o v pasan a incidir en el vértice resultante; pueden generarse bucles (autoincidencias) y aristas paralelas, que la vista puede mantener o normalizar según opción.
   - **Contraer arista**: operación que elimina una arista e identifica sus extremos (equivalente a fusionar los dos vértices que dicha arista une). Es básica en algoritmos de conectividad y en reducción de grafos para obtener menores topológicos.
   - **Grafo línea (L(G))**: vértices de L(G) = aristas de G; hay arista entre dos vértices de L(G) si las aristas correspondientes en G comparten un extremo. En la UI la generación de grafo línea convierte la lista de aristas en nodos y reconstruye las conexiones mediante comprobación de incidencia.
   - **Complemento de G (Ḡ)**: mismo conjunto de vértices; aristas = pares no conectados en G. Efectos: |E(Ḡ)| = n(n-1)/2 - |E(G)| (para grafos simples no dirigidos).

- Propiedades y reversibilidad:
   - **Contracción vs reversión**: contraer una arista es generalmente irreversible si no se guarda el histórico (porque se pierde la distinción entre las aristas paralelas o el orden original); la vista ofrece botones `Revertir Grafo Línea` y `Revertir Complemento` para deshacer transformaciones específicas cuando se dispone del grafo original en memoria.
   - **Cambio en métricas**: la contracción reduce n y típicamente reduce la distancia entre nodos; el grafo línea aumenta el número de nodos (|V(L(G))| = |E(G)|) y cambia la estructura utilizada para algoritmos basados en aristas.

### Recomendaciones de uso

- Antes de aplicar transformaciones destructivas (fusionar/contraer), guarde el estado original con ` Guardar Grafo` si piensa revertir.
- Al generar el grafo línea o el complemento, revisar visualmente la correspondencia entre nodos/aristas para validar que la operación aplicada corresponde a la transformación matemática esperada.

## Notas finales y recomendaciones

- Antes de ejecutar operaciones destructivas (p. ej. `Resetear Grafo`) guarde el grafo con `Guardar Grafo` o `Guardar Grafos` según corresponda.
- Para importar, use archivos `.json` generados por las propias vistas (las validaciones internas advierten si el formato no coincide).

---

