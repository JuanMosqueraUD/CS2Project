# Búsquedas Externas

> **Nota sobre Numeración:** Esta documentación utiliza numeración 1-indexed para bloques y elementos, donde los bloques van de 1 a n y los elementos mantienen numeración global de 1 a capacidad_total, mejorando la intuición del usuario.

## Introducción

Las **búsquedas externas** son técnicas de organización y acceso a datos que están diseñadas para trabajar con memoria secundaria (disco duro, SSD, etc.). A diferencia de las búsquedas internas que operan completamente en memoria RAM, las búsquedas externas dividen los datos en **bloques** para optimizar las operaciones de entrada/salida.

## Conceptos Fundamentales

### Bloques de Datos

Un **bloque** es la unidad básica de transferencia entre la memoria secundaria y la memoria principal. En nuestras búsquedas externas:

- Los datos se organizan en bloques de tamaño fijo
- Cada bloque contiene múltiples elementos
- Los bloques se numeran secuencialmente (Bloque 1, Bloque 2, etc.)
- Los elementos se numeran globalmente de 1 a n respetando la capacidad total

### Cálculo del Tamaño de Bloque

El número de elementos por bloque se calcula usando la fórmula:

```
Elementos por bloque = ⌊√n⌋
```

Donde:
- `n` = capacidad total de la estructura
- `⌊⌋` = función piso (redondeo hacia abajo)

**Ejemplo:**
- Capacidad total: 20 elementos
- Elementos por bloque: ⌊√20⌋ = ⌊4.47⌋ = 4 elementos
- Número total de bloques: ⌈20/4⌉ = 5 bloques

### Numeración de Bloques y Elementos

**Numeración de Bloques (1-indexed):**
Los bloques se numeran desde 1 hasta n, facilitando la comprensión al usuario.

**Numeración de Elementos (1-indexed, capacidad global):**
Los elementos se numeran de 1 a n respetando la capacidad total de la estructura, independientemente del bloque al que pertenezcan.

**Ejemplo con capacidad de 20 elementos:**
```
Bloque 1: Elementos 1-4   (posiciones globales 1, 2, 3, 4)
Bloque 2: Elementos 5-8   (posiciones globales 5, 6, 7, 8) 
Bloque 3: Elementos 9-12  (posiciones globales 9, 10, 11, 12)
Bloque 4: Elementos 13-16 (posiciones globales 13, 14, 15, 16)
Bloque 5: Elementos 17-20 (posiciones globales 17, 18, 19, 20)
```

**Fórmula para índice global:**
```
índice_global = (índice_bloque * elementos_por_bloque) + posición_interna + 1
```

## Tipos de Búsquedas Externas

### 1. Búsqueda Externa Binaria

**Características:**
- Los datos están ordenados tanto globalmente como dentro de cada bloque
- Se requiere inserción ordenada
- Utiliza comparación con el último elemento del bloque

**Algoritmo de Búsqueda:**
1. Buscar el bloque apropiado comparando con el último elemento de cada bloque
2. Una vez encontrado el bloque correcto, realizar búsqueda binaria dentro del bloque
3. Si el elemento es menor al último elemento del bloque, explorar ese bloque

**Algoritmo de Inserción:**
1. Encontrar el bloque donde debe insertarse el elemento
2. Si el bloque tiene espacio, insertar en orden
3. Si el bloque está lleno, aplicar **corrimiento de bloques**

### 2. Búsqueda Externa Lineal

**Características:**
- Organización en bloques con datos ordenados globalmente
- Búsqueda secuencial dentro de cada bloque
- Utiliza comparación con el último elemento de cada bloque para localización
- Capacidad mínima requerida: 10 elementos

**Algoritmo de Búsqueda Detallado:**
1. **Localización del bloque**: Recorrer bloques secuencialmente
   - Comparar el elemento buscado con el último elemento de cada bloque
   - Si el elemento es menor o igual al último elemento del bloque, buscar en ese bloque
   - Si el bloque está vacío (último elemento es null), buscar en ese bloque
2. **Búsqueda interna**: Una vez localizado el bloque correcto
   - Realizar búsqueda lineal desde el inicio del bloque
   - Comparar elemento por elemento hasta encontrar o agotar el bloque
3. **Resultado**: Devolver posición (bloque, índice) si se encuentra

**Algoritmo de Inserción Detallado:**
1. **Localización del bloque destino**: Encontrar donde debe insertarse
   - Usar la misma lógica de búsqueda para localizar el bloque
   - Determinar la posición exacta dentro del bloque manteniendo el orden
2. **Verificación de espacio**:
   - Si el bloque tiene espacio: insertar directamente con desplazamiento local
   - Si el bloque está lleno: aplicar **corrimiento de bloques**
3. **Corrimiento de bloques** (cuando es necesario):
   - Desplazar el último elemento del bloque actual al primer espacio del siguiente
   - Propagar este proceso hasta encontrar un bloque con espacio disponible
   - Insertar el nuevo elemento en la posición correcta del bloque inicial

**Ejemplo Práctico de Inserción:**

Configuración: Capacidad = 16, Elementos por bloque = 4

**Estado inicial:**
```
Bloque 1: [2, 8, 12, 18]  (lleno)        - Elementos en posiciones globales 1-4
Bloque 2: [22, 25, 30, _] (espacio disponible) - Elementos en posiciones globales 5-8
Bloque 3: [_, _, _, _]     (vacío)        - Posiciones globales 9-12
Bloque 4: [_, _, _, _]     (vacío)        - Posiciones globales 13-16
```

**Insertar elemento 15:**
1. Comparar 15 con último elemento de Bloque 1 (18): 15 < 18 → buscar en Bloque 1
2. Encontrar posición: después de 12, antes de 18 (posición global 3)
3. Bloque 1 está lleno → aplicar corrimiento:
   - Mover 18 (último de Bloque 1) a primera posición de Bloque 2
   - Desplazar elementos en Bloque 2: [18, 22, 25, 30]
   - Insertar 15 en posición 3 de Bloque 1: [2, 8, 15, 18]

**Estado final:**
```
Bloque 1: [2, 8, 15, 18]  (elemento insertado)
Bloque 2: [18, 22, 25, 30] (elementos desplazados)
Bloque 3: [_, _, _, _]     (sin cambios)
Bloque 3: [_, _, _, _]     (sin cambios)
```

**Ventajas de la Búsqueda Lineal Externa:**
- **Simplicidad**: Algoritmo más simple que la búsqueda binaria externa
- **Orden mantenido**: Los datos permanecen ordenados facilitando operaciones
- **Eficiencia en inserciones**: Mejor rendimiento para inserciones frecuentes
- **Localidad de datos**: Elementos relacionados se mantienen en el mismo bloque

**Complejidad Temporal:**
- **Búsqueda**: O(√n) para localizar bloque + O(√n) para búsqueda interna = O(√n)
- **Inserción**: O(√n) para localización + O(n) para corrimiento en el peor caso
- **Eliminación**: O(√n) para búsqueda + O(√n) para compactación local

**Métricas Específicas:**
- **Accesos a bloques por búsqueda**: Entre 1 y ⌊√n⌋ bloques
- **Factor de utilización**: Varía según patrón de inserciones/eliminaciones
- **Fragmentación**: Mínima debido al mantenimiento de orden

### 3. Búsqueda Externa Hash

**Características:**
- Utiliza función hash para determinar el bloque
- Los elementos dentro del bloque pueden no estar ordenados
- Manejo de colisiones a nivel de bloque

**Algoritmo:**
1. Aplicar función hash para determinar el número de bloque
2. Buscar dentro del bloque correspondiente
3. En caso de colisión, usar técnicas de resolución

## Corrimiento de Bloques

Cuando un bloque está lleno y se necesita insertar un nuevo elemento:

### Estrategia de Corrimiento
1. **Identificar el punto de inserción** en el bloque lleno
2. **Desplazar elementos hacia bloques posteriores**:
   - El último elemento del bloque actual se mueve al primer espacio del siguiente bloque
   - Este proceso se propaga hasta encontrar un bloque con espacio disponible
3. **Insertar el nuevo elemento** en la posición correcta

### Ejemplo de Corrimiento

**Estado inicial:**
```
Bloque 1: [1, 3, 5, 7] (lleno)        - Posiciones globales 1-4
Bloque 2: [9, 11, 13, 15] (lleno)     - Posiciones globales 5-8  
Bloque 3: [17, 19, _, _] (espacio disponible) - Posiciones globales 9-12
```

**Insertar elemento 6:**
```
Bloque 1: [1, 3, 5, 6] (insertar 6, mover 7)    - Posición global 4
Bloque 2: [7, 9, 11, 13] (recibir 7, mover 15)  - Posiciones globales 5-8
Bloque 3: [15, 17, 19, _] (recibir 15)          - Posiciones globales 9-12
```

## Ventajas de las Búsquedas Externas

1. **Eficiencia en E/S**: Minimiza el número de accesos a disco
2. **Escalabilidad**: Maneja grandes volúmenes de datos que no caben en memoria
3. **Localidad**: Los datos relacionados se almacenan en el mismo bloque
4. **Flexibilidad**: Se adapta a diferentes tamaños de datos

## Métricas de Rendimiento

- **Accesos a bloques**: Número de bloques leídos/escritos
- **Factor de utilización**: Porcentaje de ocupación de los bloques
- **Tiempo de búsqueda**: Tiempo promedio para encontrar un elemento
- **Tiempo de inserción**: Tiempo promedio para insertar un elemento

## Implementación

Las búsquedas externas se implementan considerando:

1. **Gestión de bloques**: Estructura para manejar múltiples bloques
2. **Algoritmos de búsqueda**: Adaptación de algoritmos internos para trabajar con bloques
3. **Operaciones de E/S**: Simulación de transferencias entre memoria secundaria y principal
4. **Visualización**: Representación gráfica de la organización en bloques

---

*Esta documentación proporciona la base teórica para la implementación de búsquedas externas en el sistema de estructuras de datos.*