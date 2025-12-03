# Manual de Usuario - Algoritmo de Floyd-Warshall

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

