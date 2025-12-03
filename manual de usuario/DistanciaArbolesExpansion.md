# Manual de Usuario: Distancia entre Árboles de Expansión

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

