# Manual de Usuario: Árboles de Expansión

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

