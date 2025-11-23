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
