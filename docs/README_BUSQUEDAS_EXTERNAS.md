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
Bloque 4: [_, _, _, _]     (sin cambios)
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
- Manejo de colisiones a nivel de bloque mediante estructura secundaria

**Funciones Hash Implementadas:**
- **Hash Módulo**: `hash(clave) = clave % número_de_bloques`
- **Hash Cuadrado**: Eleva la clave al cuadrado y extrae dígitos del medio

**Algoritmo de Búsqueda:**
1. Aplicar función hash para determinar el número de bloque
2. Buscar linealmente dentro del bloque principal correspondiente
3. Si no se encuentra y existe estructura secundaria, buscar en el bloque secundario correspondiente

**Algoritmo de Inserción:**
1. Aplicar función hash para determinar el número de bloque
2. Buscar primera posición disponible en el bloque principal
3. Si el bloque principal está lleno:
   - Activar estructura secundaria (si no está activa)
   - Insertar en el bloque secundario correspondiente al mismo índice hash
4. Si tanto el bloque principal como el secundario están llenos, reportar error

**Resolución de Colisiones - Estructura Secundaria:**

Cuando un bloque se llena completamente, se activa una **estructura secundaria** que:
- Tiene exactamente la misma configuración que la estructura principal
- Mismo número de bloques y elementos por bloque
- Los elementos que colisionan van al mismo índice de bloque en la estructura secundaria
- Se muestra visualmente al lado derecho de la estructura principal
- Solo aparece cuando ocurre la primera colisión por bloque lleno

**Resolución de Colisiones - Área de Colisiones:**

Alternativamente, cada bloque puede manejar colisiones mediante un **área de colisiones interna**:
- Cada bloque contiene tanto un área principal como un área de colisiones
- Ambas áreas tienen el mismo tamaño (elementos por bloque)
- El área de colisiones está siempre presente y visible
- Los elementos se insertan primero en el área principal
- Cuando el área principal se llena, los nuevos elementos van al área de colisiones del mismo bloque
- Se mantiene el límite de capacidad total definido inicialmente

**Comparación de Métodos de Resolución:**

| Aspecto | Estructura Secundaria | Área de Colisiones |
|---------|----------------------|-------------------|
| Visualización | Dos estructuras lado a lado | Áreas dentro del mismo bloque |
| Aparición | Solo cuando ocurre colisión | Siempre visible |
| Organización | Por función hash en estructura separada | Por función hash en áreas del mismo bloque |
| Capacidad | Duplica la capacidad teórica | Duplica la capacidad por bloque |
| Identificación | Bloques en estructura verde | Elementos con prefijo "C" en área amarilla |

**Ejemplo de Colisión con Estructura Secundaria:**
```
Configuración: Capacidad = 16, Elementos por bloque = 4, Número de bloques = 4

Estado inicial - Solo estructura principal:
Bloque 1: [10, 22, _, _]
Bloque 2: [7, 15, 23, 31] (LLENO)
Bloque 3: [_, _, _, _]
Bloque 4: [_, _, _, _]

Insertar elemento 39 (hash(39) = 39 % 4 = 3, corresponde a Bloque 2):
Bloque 2 está lleno → Activar estructura secundaria

Estado final - Ambas estructuras visibles:
Estructura Principal:          Estructura Secundaria:
Bloque 1: [10, 22, _, _]      Bloque 1: [_, _, _, _]
Bloque 2: [7, 15, 23, 31]     Bloque 2: [39, _, _, _] ← Elemento insertado aquí
Bloque 3: [_, _, _, _]         Bloque 3: [_, _, _, _]
Bloque 4: [_, _, _, _]         Bloque 4: [_, _, _, _]
```

**Ejemplo de Colisión con Área de Colisiones:**
```
Configuración: Capacidad = 16, Elementos por bloque = 4, Número de bloques = 4

Estado inicial:
Bloque 1: 
  Área Principal: [10, 22, _, _]
  Área Colisiones: [_, _, _, _]
Bloque 2:
  Área Principal: [7, 15, 23, 31] (LLENO)
  Área Colisiones: [_, _, _, _]

Insertar elemento 39 (hash(39) = 39 % 4 = 3, corresponde a Bloque 2):
Área principal del Bloque 2 está llena → Insertar en área de colisiones

Estado final:
Bloque 1:
  Área Principal: [10, 22, _, _]
  Área Colisiones: [_, _, _, _]
Bloque 2:
  Área Principal: [7, 15, 23, 31]
  Área Colisiones: [39, _, _, _] ← Elemento insertado aquí
```

**Ventajas de la Estructura Secundaria:**
- **Simplicidad**: Fácil de entender e implementar
- **Consistencia**: Mantiene la misma lógica de hash para ambas estructuras
- **Visualización clara**: Las dos estructuras se muestran lado a lado
- **Eficiencia**: Los elementos siguen organizándose por su función hash original

**Ventajas del Área de Colisiones:**
- **Compacta**: Mantiene los elementos de colisión cerca de su bloque original
- **Visualmente integrada**: Todo está en el mismo bloque
- **Siempre presente**: No requiere activación, siempre visible
- **Fácil identificación**: Elementos de colisión claramente marcados

**Control de Capacidad Total:**

Independientemente del método de resolución de colisiones utilizado, el sistema **respeta estrictamente el límite de capacidad** establecido al crear la estructura:

- **Contador de elementos**: Se mantiene un registro preciso de elementos insertados
- **Validación en inserción**: Antes de insertar, se verifica que no se exceda la capacidad
- **Actualización en eliminación**: Al eliminar elementos, se decrementa el contador
- **Visualización del estado**: Se muestra siempre "elementos_actuales/capacidad_total"

```
Ejemplo: Capacidad 10 elementos
- Solo se permiten 10 inserciones exitosas
- Aunque los bloques y áreas puedan contener más elementos físicamente
- El límite lógico de 10 elementos se mantiene siempre
```

**Complejidad Temporal de Búsquedas Hash Externas:**
- **Búsqueda**: O(1) para localizar bloque + O(√n) para búsqueda interna = O(√n) en el peor caso
- **Inserción**: O(1) para localizar bloque + O(√n) para inserción = O(√n)
- **Eliminación**: O(1) para localizar bloque + O(√n) para eliminación = O(√n)

**Métricas de Rendimiento Hash Externas:**
- **Factor de carga**: Porcentaje de ocupación en estructuras principal y secundaria
- **Accesos a bloques**: Máximo 2 bloques por operación (principal + secundario)
- **Colisiones por bloque lleno**: Número de veces que se activa la estructura secundaria
- **Distribución de elementos**: Evaluación de qué tan bien distribuye la función hash

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