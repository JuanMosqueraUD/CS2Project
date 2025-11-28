# Documentación de Vistas de Grafos

## Árboles de Expansión

### Descripción General
Vista dedicada a la visualización y cálculo de árboles de expansión en grafos ponderados. Los árboles de expansión son subgrafos que conectan todos los vértices del grafo original usando el menor número de aristas posible (sin formar ciclos).

### Especificaciones de Requisitos

#### Configuración Inicial del Grafo

**Parámetros de Entrada:**
- **Cantidad de Nodos**: Número entero positivo que define cuántos vértices tendrá el grafo
- **Tipo de Grafo**: 
  - No Dirigido: Las aristas no tienen dirección, conexión bidireccional
  - Dirigido: Las aristas tienen dirección específica
- **Ponderación**: Siempre habilitada (todos los grafos son ponderados en esta vista)

**Restricciones:**
- Todos los grafos creados son ponderados obligatoriamente
- Los nodos se numeran automáticamente del 1 hasta n
- No se permiten bucles (aristas de un nodo a sí mismo)
- No se permiten aristas duplicadas

#### Gestión de Aristas

**Formato de Entrada:**
- Input de texto para especificar los nodos a conectar
- **Formatos aceptados:**
  - **Sin espacios:** "12" para conectar nodo 1 con nodo 2
  - **Con espacios:** "1 2" para conectar nodo 1 con nodo 2
  - Ambos formatos son equivalentes y funcionan de la misma manera
- Input numérico para especificar el peso de la arista (obligatorio)
- El peso debe ser un número positivo

**Comportamiento:**
- En grafos no dirigidos: crea una arista bidireccional
- En grafos dirigidos: crea una arista unidireccional del primer nodo al segundo
- Validación automática de existencia de nodos
- Prevención de aristas duplicadas

### Diseño de Interfaz

**Distribución de Elementos:**
1. **Información del grafo:** Panel superior con estadísticas (nodos, aristas, tipo)
2. **Gestión de aristas:** Controles para agregar aristas con pesos
3. **Visualización del grafo:** Canvas interactivo con vis-network (elemento principal)
4. **Notación de teoría de conjuntos:** Representación matemática justo debajo del grafo
5. **Botones de algoritmos:** Sección destacada con botones para ejecutar algoritmos
6. **Botón de reseteo:** Control para limpiar y reiniciar el grafo

**Estilo de Botones de Algoritmos:**
- **Botón de Árbol de Expansión Mínimo:** 
  - Color verde con gradiente (#10b981 → #059669)
  - Icono: 🌳
  - Efecto hover: elevación y sombra aumentada
- **Botón de Árbol de Expansión Máximo:**
  - Color naranja con gradiente (#f59e0b → #d97706)
  - Icono: 🌲
  - Efecto hover: elevación y sombra aumentada
- **Características comunes:**
  - Padding generoso (1rem vertical, 1.5rem horizontal)
  - Bordes redondeados (0.5rem)
  - Fuente bold (font-weight: 600)
  - Sombras para profundidad visual
  - Transiciones suaves (0.3s ease)
  - Contenedor con fondo y borde para destacar la sección

#### Algoritmos Implementados

**Árbol de Expansión Mínimo (AEM):**
- Encuentra el árbol que conecta todos los vértices con el menor peso total
- Algoritmos candidatos: Kruskal o Prim
- Objetivo: minimizar la suma de pesos de todas las aristas seleccionadas

**Árbol de Expansión Máximo:**
- Encuentra el árbol que conecta todos los vértices con el mayor peso total
- Objetivo: maximizar la suma de pesos de todas las aristas seleccionadas
- Puede implementarse invirtiendo los pesos y aplicando algoritmo de AEM

#### Visualización

**Representación del Grafo:**
- Visualización interactiva usando vis-network
- Nodos: círculos numerados con colores distintivos
- Aristas: líneas con etiquetas mostrando el peso
- Flechas en aristas dirigidas
- Resaltado al hacer hover sobre elementos

**Teoría de Conjuntos:**
- Representación matemática del grafo
- Conjunto V: lista de todos los vértices
- Conjunto A: lista de todas las aristas con formato (u→v, peso) o (u↔v, peso)

#### Operaciones Disponibles

**Gestión del Grafo:**
- Agregar aristas con peso específico
- Visualización en tiempo real del grafo
- Reseteo completo del grafo

**Algoritmos de Árbol de Expansión:**
- Calcular Árbol de Expansión Mínimo
- Calcular Árbol de Expansión Máximo

#### Estado de Implementación

**Funcionalidades Completadas:**
- ✅ Creación de grafo ponderado (dirigido/no dirigido)
- ✅ Gestión de aristas con pesos
- ✅ Visualización interactiva del grafo
- ✅ Representación en teoría de conjuntos
- ✅ Validaciones de entrada
- ✅ Interfaz de usuario completa
- ✅ Algoritmo de Kruskal para Árbol de Expansión Mínimo
- ✅ Algoritmo de Kruskal para Árbol de Expansión Máximo
- ✅ Visualización del árbol resultante
- ✅ Cálculo y visualización del peso total

### Algoritmo de Kruskal

**Propósito:** Encontrar el árbol de expansión de peso mínimo o máximo que conecta todos los nodos del grafo.

**Pasos del Algoritmo:**
1. **Ordenar aristas** por peso (ascendente para mínimo, descendente para máximo)
2. **Inicializar conjuntos:** Cada nodo en su propio conjunto disjunto
3. **Iterar sobre aristas ordenadas:**
   - Verificar si la arista conecta dos conjuntos diferentes (no forma ciclo)
   - Si no forma ciclo: agregar arista al árbol y unir los conjuntos
   - Si forma ciclo: descartar arista
4. **Terminar:** Al alcanzar n-1 aristas (donde n = número de nodos)

**Detección de Ciclos:** Utiliza estructura de conjuntos disjuntos (Union-Find). Cada nodo mantiene referencia a su conjunto. Una arista forma ciclo si ambos nodos ya pertenecen al mismo conjunto.

**Complejidad Temporal:** O(E log E) donde E es el número de aristas. La complejidad está dominada por el ordenamiento de aristas.

**Diferencia Mínimo vs Máximo:** Únicamente el orden de clasificación de aristas cambia (ascendente vs descendente).

---

## Algoritmo de Floyd-Warshall

Vista para calcular los caminos más cortos entre todos los pares de vértices en un grafo.

### Requisitos

- El grafo puede ser dirigido o no dirigido
- El grafo puede ser ponderado o no ponderado
- Si no es ponderado, todas las aristas tienen peso 1 por defecto
- Los pesos son opcionales al agregar aristas (solo si el grafo es ponderado)
- Formato de entrada: "12" o "1 2" para conectar nodos 1 y 2

### Funcionalidades

- Creación de grafos con configuración flexible (dirigido/no dirigido, ponderado/no ponderado)
- Gestión de aristas con pesos opcionales según configuración
- Visualización interactiva del grafo
- Representación en teoría de conjuntos (V, A)
- Cálculo de caminos más cortos entre todos los pares de nodos

### Algoritmo de Floyd-Warshall

**Propósito:** Encontrar la distancia más corta entre todos los pares de vértices en un grafo, permitiendo aristas con pesos negativos (pero sin ciclos negativos).

**Método:** Programación dinámica que considera todos los vértices como intermediarios potenciales.

**Pasos del Algoritmo:**

1. **Inicializar Matriz de Distancias:**
   - Crear matriz D de tamaño n×n (donde n = número de vértices)
   - Diagonal principal = 0 (distancia de un vértice a sí mismo)
   - Si existe arista directa de i a j: D[i][j] = peso de la arista
   - Si no existe arista: D[i][j] = ∞
   - Para grafos dirigidos: solo se consideran aristas salientes
   - Para grafos no dirigidos: aristas bidireccionales

2. **Aplicar Algoritmo (Triple Iteración):**
   ```
   Para k = 1 hasta n:
     Para i = 1 hasta n:
       Para j = 1 hasta n:
         Si D[i][k] + D[k][j] < D[i][j]:
           D[i][j] = D[i][k] + D[k][j]
   ```
   - k: vértice intermediario considerado
   - i: vértice origen
   - j: vértice destino
   - Condición: si el camino i→k→j es más corto que i→j directo, actualizar

3. **Calcular Métricas del Grafo:**
   - **Excentricidad de vértice v:** Distancia máxima desde v a cualquier otro vértice
   - **Mediana (Radio):** Excentricidad mínima del grafo
   - **Centro:** Vértice(s) con excentricidad mínima
   - **Bicentro:** Cuando hay exactamente 2 centros
   - **Diámetro:** Excentricidad máxima del grafo (distancia más larga entre cualquier par)

**Complejidad Temporal:** O(n³) donde n es el número de vértices.

**Ventajas:**
- Calcula todas las distancias en una sola ejecución
- Funciona con pesos negativos (sin ciclos negativos)
- Permite detectar ciclos negativos
- Simple de implementar

**Aplicaciones:**
- Cálculo de matriz de distancias mínimas
- Detección de ciclos negativos
- Problemas de caminos en redes de transporte
- Análisis de conectividad en grafos
- Identificación de centros y diámetros de grafos

**Visualización de Resultados:**
- Matriz de distancias final con símbolo ∞ para distancias inalcanzables
- Lista de excentricidades por vértice
- Identificación de centro/bicentro (vértices con menor excentricidad)
- Valor del diámetro del grafo

**Estado:** ✅ Implementado completamente

---

## Matrices Fundamentales en Árboles de Expansión

### Conceptos Básicos

Cuando se calcula un árbol de expansión T de un grafo conexo G, las aristas se dividen en dos conjuntos:

- **Ramas**: Aristas que pertenecen al árbol T (exactamente n-1 aristas para n vértices)
- **Cuerdas**: Aristas de G que no están en T (m - (n-1) aristas, donde m es el total de aristas)

### Matriz de Circuitos Fundamentales

**Definición:** Para cada cuerda del grafo, existe un único circuito fundamental que se forma al agregar esa cuerda al árbol de expansión.

**Propiedades:**
- Número de circuitos fundamentales = Número de cuerdas = m - (n-1)
- Cada circuito contiene:
  - Una cuerda (la que define el circuito)
  - Solo ramas del árbol (las que forman el camino único entre los extremos de la cuerda)
  - **Nunca contiene otras cuerdas**

**Construcción:** Para cada cuerda e = (u,v):
1. Identificar la cuerda e
2. Encontrar el camino único en el árbol T entre los vértices u y v usando BFS
3. El circuito fundamental es: cuerda e + ramas del camino único

**Representación:** Matriz Bf de dimensión [cuerdas × aristas]
- Bf[i][j] = 1 si la arista j pertenece al circuito fundamental de la cuerda i
- Bf[i][j] = 0 en caso contrario

### Matriz de Cortes Fundamentales

**Definición:** Para cada rama del árbol, existe un único conjunto de corte fundamental que separa el grafo en dos componentes al eliminar esa rama.

**Propiedades:**
- Número de cortes fundamentales = Número de ramas = n-1
- Cada conjunto de corte contiene:
  - Una rama del árbol (la que define el corte)
  - Solo cuerdas que conectan los dos componentes separados
  - **Nunca contiene otras ramas**

**Construcción:** Para cada rama e = (u,v):
1. Eliminar temporalmente la rama e del árbol
2. Esto divide el árbol en dos componentes: C1 (contiene u) y C2 (contiene v)
3. Identificar cuerdas que tienen un extremo en C1 y otro en C2
4. El conjunto de corte fundamental es: rama e + cuerdas que cruzan entre C1 y C2

**Representación:** Matriz Qf de dimensión [ramas × aristas]
- Qf[i][j] = 1 si la arista j pertenece al conjunto de corte fundamental de la rama i
- Qf[i][j] = 0 en caso contrario

**Aplicaciones:**
- Análisis de conectividad en grafos
- Circuitos eléctricos (Leyes de Kirchhoff)
- Diseño de redes tolerantes a fallos
- Identificación de rutas redundantes

**Estado:** ✅ Implementado en vista de Árboles de Expansión

### Consideraciones Técnicas

**Dependencias:**
- Vue 3 con Composition API y TypeScript
- vis-network para visualización de grafos
- Estructura de datos basada en lista de adyacencia

**Validaciones Implementadas:**
- Verificación de existencia de nodos antes de crear aristas
- Prevención de bucles
- Prevención de aristas duplicadas
- Validación de formato de entrada
- Obligatoriedad del peso en todas las aristas

**Mejoras Futuras Sugeridas:**
- Añadir opción de importar/exportar grafo
- Implementar paso a paso de los algoritmos
- Añadir comparación visual entre AEM y máximo
- Estadísticas del árbol (peso total, número de aristas)
- Soporte para grafos desconectados (bosque de expansión)
