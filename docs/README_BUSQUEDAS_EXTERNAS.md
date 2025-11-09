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

## Estructuras Dinámicas (Hashing Extensible)

### Introducción

Las **estructuras dinámicas** son tablas hash que se adaptan automáticamente al número de elementos almacenados, expandiéndose cuando la densidad de ocupación es alta y reduciéndose cuando es baja. A diferencia de las estructuras hash estáticas, estas estructuras cambian su tamaño dinámicamente para mantener un factor de carga óptimo.

### Conceptos Fundamentales

#### Componentes de la Estructura

Una estructura dinámica consta de:

- **Cubetas**: Unidades básicas de almacenamiento (equivalente a bloques en otras búsquedas externas)
- **Registros por Cubeta**: Capacidad máxima de elementos que puede contener cada cubeta
- **Área de Desbordamiento**: Espacio adicional fuera de la estructura para elementos que no caben en las cubetas
- **Función Hash**: Mapea elementos a cubetas (se usa Hash Módulo)

#### Configuración Inicial

Al crear una estructura dinámica se especifica:

1. **Cantidad de Cubetas**: Número inicial de cubetas (columnas)
2. **Registros por Cubeta**: Capacidad de cada cubeta (filas por columna)
3. **Tamaño de Clave**: Cantidad obligatoria de dígitos para todas las claves
4. **Tipo de Operación**: Total o Parcial (para expansión/reducción)

**Ejemplo de Configuración:**
```
Cubetas: 8
Registros por Cubeta: 2
Tamaño de Clave: 2 dígitos
Capacidad Total: 8 × 2 = 16 registros
```

### Función Hash: Hash Módulo

La estructura utiliza exclusivamente **Hash Módulo** para determinar la cubeta destino:

```
hash(clave) = clave % número_de_cubetas
```

**Ejemplo:**
```
Clave: 45
Número de cubetas: 8
hash(45) = 45 % 8 = 5
→ El elemento va a la Cubeta 5
```

### Validación de Claves

Todas las claves deben tener **exactamente** el tamaño especificado en la configuración:

- Si tamaño = 2: solo claves de 2 dígitos (10-99)
- Si tamaño = 3: solo claves de 3 dígitos (100-999)
- Claves de tamaño incorrecto son **rechazadas** con mensaje descriptivo

**Ejemplo de Validación:**
```
Configuración: Tamaño de clave = 2 dígitos

Insertar 45  → ✓ Válido (2 dígitos)
Insertar 5   → ✗ Rechazado (1 dígito)
Insertar 123 → ✗ Rechazado (3 dígitos)
```

### Operaciones Básicas

#### 1. Inserción

**Algoritmo:**
1. Validar que la clave tenga el tamaño correcto
2. Verificar que el elemento no exista (no se permiten duplicados)
3. Calcular cubeta con hash módulo
4. Buscar primer registro vacío en la cubeta
5. Si hay espacio: insertar en la tabla
6. Si no hay espacio: insertar en área de desbordamiento
7. Verificar si se alcanzó el umbral de expansión (≥75%)

**Ejemplo:**
```
Configuración: 4 cubetas, 2 registros/cubeta
Insertar 24: hash(24) = 24 % 4 = 0

Cubeta 0:
  Registro 0: 24 ← Insertado aquí
  Registro 1: vacío
```

#### 2. Búsqueda

**Algoritmo:**
1. Calcular cubeta con hash módulo
2. Buscar linealmente en los registros de la cubeta
3. Si no se encuentra, buscar en el área de desbordamiento de esa cubeta
4. Devolver resultado con ubicación exacta

**Ejemplo:**
```
Buscar 24:
hash(24) = 24 % 4 = 0
→ Buscar en Cubeta 0
→ Encontrado en Registro 0
```

#### 3. Eliminación con Reconstrucción

Cuando se elimina un elemento de la tabla (no del desbordamiento), **se reconstruye la cubeta** automáticamente para eliminar huecos.

**Algoritmo de Eliminación:**
1. Localizar elemento en tabla o desbordamiento
2. Si está en tabla:
   - Invocar función `reconstruirCubeta()`
   - Mover elementos posteriores hacia arriba
3. Si está en desbordamiento:
   - Eliminar directamente del array de desbordamiento
4. Verificar si se alcanzó el umbral de reducción (densidad ≤0.8)

### Reconstrucción de Cubeta ⭐

Este es el proceso más importante al eliminar elementos de la tabla principal.

#### Proceso Detallado

**Paso 1: Identificar posición eliminada**
```
Cubeta 3 antes de eliminar:
  Registro 0: 24
  Registro 1: 49 ← Elemento a eliminar
  Registro 2: 42
  Registro 3: 128
  Desbordamiento: [53, 18]
```

**Paso 2: Recolectar elementos restantes**
- Desde registro 2 en adelante: `[42, 128]`
- Del desbordamiento: `[53, 18]`
- Lista completa: `[42, 128, 53, 18]`

**Paso 3: Limpiar desde posición eliminada**
```
Cubeta 3 después de limpiar:
  Registro 0: 24    ← No tocado
  Registro 1: null  ← Limpiado
  Registro 2: null  ← Limpiado
  Registro 3: null  ← Limpiado
  Desbordamiento: [] ← Vaciado
```

**Paso 4: Reinsertar desde posición eliminada**
```
Cubeta 3 reconstruida:
  Registro 0: 24    ← Original
  Registro 1: 42    ← Primer elemento recolectado
  Registro 2: 128   ← Segundo elemento
  Registro 3: 53    ← Tercer elemento
  Desbordamiento: [18] ← Cuarto elemento no cabe
```

#### Código de Implementación

```typescript
function reconstruirCubeta(cubeta: number, posicionEliminada: number) {
  // Recolectar todos los elementos restantes de la cubeta
  const elementosRestantes: number[] = [];
  
  // Agregar elementos de la tabla desde la posición siguiente
  for (let i = posicionEliminada + 1; i < registrosPorCubeta; i++) {
    const valor = tabla[cubeta][i];
    if (valor !== null) {
      elementosRestantes.push(valor);
    }
  }
  
  // Agregar todos los elementos del desbordamiento
  elementosRestantes.push(...desbordamientos[cubeta]);
  
  // Limpiar desde la posición eliminada hasta el final
  for (let i = posicionEliminada; i < registrosPorCubeta; i++) {
    tabla[cubeta][i] = null;
  }
  
  // Limpiar desbordamiento
  desbordamientos[cubeta] = [];
  
  // Reinsertar elementos en la cubeta
  let posicionActual = posicionEliminada;
  for (const elemento of elementosRestantes) {
    if (posicionActual < registrosPorCubeta) {
      // Insertar en la tabla
      tabla[cubeta][posicionActual] = elemento;
      posicionActual++;
    } else {
      // Insertar en desbordamiento
      desbordamientos[cubeta].push(elemento);
    }
  }
}
```

#### Ventajas de la Reconstrucción

1. **Eliminación de huecos**: No quedan espacios vacíos intermedios
2. **Reducción de desbordamientos**: Los elementos desbordados pueden entrar a la tabla
3. **Eficiencia en búsquedas**: Menos elementos en desbordamiento = búsquedas más rápidas
4. **Mantenimiento de orden**: Los elementos se mantienen en el orden en que fueron insertados

#### Ejemplo Completo

**Configuración:**
```
Cubetas: 4
Registros por cubeta: 2
Elementos: [24, 49, 42, 128, 53, 18] en Cubeta 0
```

**Estado Inicial:**
```
Cubeta 0:
  Registro 0: 24
  Registro 1: 49
  Desbordamiento: [42, 128, 53, 18]
```

**Eliminar 49:**
```
1. Recolectar: [42, 128, 53, 18] (del desbordamiento)
2. Limpiar registro 1 y desbordamiento
3. Reinsertar desde registro 1:
   - Registro 1: 42
   - Desbordamiento: [128, 53, 18]
```

**Estado Final:**
```
Cubeta 0:
  Registro 0: 24
  Registro 1: 42 ← Elemento promovido desde desbordamiento
  Desbordamiento: [128, 53, 18] ← Un elemento menos
```

### Expansión Dinámica

#### Umbral de Expansión

La estructura se expande automáticamente cuando:
```
Porcentaje de Ocupación ≥ 75%

Porcentaje = (Registros Ocupados / Capacidad Total) × 100
```

**Ejemplo:**
```
Cubetas: 8
Registros por cubeta: 2
Capacidad total: 16
Umbral: 16 × 0.75 = 12 elementos

Cuando se inserta el elemento #12 → Se activa expansión
```

#### Expansión Total

**Proceso:**
1. Guardar todos los elementos en orden de inserción
2. Duplicar el número de cubetas
3. Reinicializar tabla y desbordamientos
4. Reinsertar todos los elementos con nuevo número de cubetas

**Ejemplo:**
```
Antes de expansión:
- 8 cubetas
- 12 elementos insertados (75% ocupación)

Durante expansión:
1. Recolectar: [24, 49, 42, 12, 53, 14, 15, 128, 18, 21, 22, 23]
2. Duplicar cubetas: 8 → 16
3. Nueva capacidad: 16 × 2 = 32 registros

Después de expansión:
- 16 cubetas
- 12 elementos reinsertados
- Ocupación: 12/32 = 37.5%
```

**Código de Expansión:**
```typescript
function expandirEstructura() {
  // Recolectar todos los elementos en orden
  const elementosOrdenados: number[] = [];
  
  for (let i = 0; i < cubetas; i++) {
    // Elementos de la tabla
    for (let j = 0; j < registrosPorCubeta; j++) {
      if (tabla[i][j] !== null) {
        elementosOrdenados.push(tabla[i][j]);
      }
    }
    // Elementos del desbordamiento
    elementosOrdenados.push(...desbordamientos[i]);
  }

  // Duplicar cubetas (expansión total)
  const nuevasCubetas = cubetas * 2;
  cubetas = nuevasCubetas;
  capacidadTotal = nuevasCubetas * registrosPorCubeta;
  
  // Reinicializar estructuras
  tabla = Array.from({ length: nuevasCubetas }, () => 
    Array(registrosPorCubeta).fill(null)
  );
  desbordamientos = Array.from({ length: nuevasCubetas }, () => []);

  // Reinsertar todos los elementos
  for (const elemento of elementosOrdenados) {
    const cubeta = elemento % nuevasCubetas;
    // ... lógica de inserción
  }
}
```

#### Expansión Parcial (Implementación Futura)

**Estrategia:**
- Primera expansión parcial: +1 cubeta
- Segunda expansión parcial: Expansión mayor
- Patrón: 2 expansiones parciales = 1 expansión total

**Secuencia de expansiones:**
```
Inicio: 2 cubetas
1ª Parcial: 2 → 3 cubetas (+1)
2ª Parcial: 3 → 4 cubetas (+1, equivale a total desde 2)
3ª Parcial: 4 → 6 cubetas (+2)
4ª Parcial: 6 → 8 cubetas (+2, equivale a total desde 4)
```

### Reducción Dinámica

#### Umbral de Reducción

La estructura se reduce automáticamente cuando:
```
Densidad ≤ 0.8

Densidad = Registros Ocupados / Número de Cubetas
```

**Ejemplo:**
```
Cubetas: 16
Elementos: 10
Densidad: 10/16 = 0.625 ≤ 0.8 → Se activa reducción
```

**Restricción:** Solo se reduce si hay más de 2 cubetas

#### Reducción Total

**Proceso:**
1. Recolectar todos los elementos en orden
2. Dividir el número de cubetas a la mitad
3. Reinicializar tabla y desbordamientos
4. Reinsertar todos los elementos

**Ejemplo:**
```
Antes de reducción:
- 16 cubetas
- 10 elementos (densidad = 0.625)

Durante reducción:
1. Recolectar 10 elementos
2. Dividir cubetas: 16 → 8
3. Nueva capacidad: 8 × 2 = 16 registros

Después de reducción:
- 8 cubetas
- 10 elementos reinsertados
- Ocupación: 10/16 = 62.5%
- Densidad: 10/8 = 1.25
```

**Ventajas de la Reducción:**
- Libera memoria no utilizada
- Mejora el factor de carga
- Reduce espacio desperdiciado

### Visualización de la Estructura

#### Organización Visual

Las estructuras dinámicas se muestran horizontalmente:

```
Cubeta 0    Cubeta 1    Cubeta 2    Cubeta 3
┌─────┐     ┌─────┐     ┌─────┐     ┌─────┐
│ 24  │     │ 49  │     │ 42  │     │ 12  │  ← Registro 0
├─────┤     ├─────┤     ├─────┤     ├─────┤
│ 128 │     │ 53  │     │ 14  │     │  -  │  ← Registro 1
└─────┘     └─────┘     └─────┘     └─────┘
   │           │
   ▼           ▼
 [18, 21]    [22, 23]  ← Desbordamientos
```

#### Elementos de la Interfaz

1. **Encabezado de Cubeta**: Muestra "Cubeta N" en la esquina superior
2. **Registros**: Numerados como "N.M" (cubeta.registro)
3. **Área de Desbordamiento**: Debajo de la cubeta con borde punteado
4. **Colores distintivos**:
   - Registros normales: Fondo blanco con gradiente azul claro
   - Registros vacíos: Borde punteado con opacidad reducida
   - Desbordamientos: Fondo amarillo con borde ámbar

### Métricas y Estadísticas

La interfaz muestra en tiempo real:

1. **Cubetas**: Número actual de cubetas
2. **Registros/Cubeta**: Capacidad de cada cubeta
3. **Capacidad Total**: Cubetas × Registros/Cubeta
4. **Registros Ocupados**: Elementos en tabla + desbordamientos
5. **Ocupación**: Porcentaje de capacidad utilizada
6. **Densidad Reducción**: Elementos / Cubetas
7. **Expansiones**: Contador de expansiones realizadas
8. **Reducciones**: Contador de reducciones realizadas

### Complejidad Temporal

| Operación | Complejidad | Descripción |
|-----------|-------------|-------------|
| Inserción | O(1) promedio, O(n) peor caso | O(n) cuando ocurre expansión |
| Búsqueda | O(1) promedio, O(k) peor caso | k = elementos en cubeta + desbordamiento |
| Eliminación | O(1) promedio, O(k+n) peor caso | k = reconstrucción, n = reducción |
| Expansión | O(n) | n = número total de elementos |
| Reducción | O(n) | n = número total de elementos |

### Ventajas de las Estructuras Dinámicas

1. **Adaptabilidad**: Se ajusta automáticamente al número de elementos
2. **Eficiencia de espacio**: No desperdicia memoria con estructuras sobre-dimensionadas
3. **Rendimiento constante**: Mantiene factor de carga óptimo
4. **Sin reorganización manual**: Expansión/reducción automática
5. **Reconstrucción inteligente**: Elimina fragmentación al eliminar elementos

### Comparación con Hash Estático

| Aspecto | Hash Estático | Hash Dinámico |
|---------|--------------|---------------|
| Tamaño | Fijo | Variable |
| Desbordamientos | Frecuentes con alta carga | Minimizados con expansión |
| Memoria | Puede desperdiciar | Optimizada |
| Rendimiento | Degradado con alta carga | Mantenido con expansiones |
| Complejidad | Simple | Mayor complejidad |

## Índices

### Introducción

Los **índices** son estructuras auxiliares que facilitan el acceso rápido a registros en archivos de datos. Similar a un índice de un libro, un índice de base de datos contiene pares de valores clave y referencias (punteros) a los registros correspondientes en el archivo de datos.

### Conceptos Fundamentales

#### Parámetros de Configuración

Para crear una estructura de índices se requieren los siguientes parámetros:

- **Rl (Longitud del Registro)**: Tamaño en bytes de cada registro
- **B (Capacidad del Bloque)**: Tamaño en bytes de cada bloque de almacenamiento
- **r (Cantidad de Registros)**: Número total de registros en la estructura

#### Cálculos Básicos

El sistema de índices diferencia entre dos estructuras: la **estructura principal** (archivo de datos) y la **estructura de índices**.

##### Estructura Principal (Archivo de Datos)

**Factor de Bloque Principal (bfr - Blocking Factor):**
```
bfr = ⌊B / Rl⌋
```
Representa el número de registros que caben en un bloque del archivo de datos.

**Número de Bloques en Estructura Principal (b):**
```
b = ⌈r / bfr⌉
```
Calcula cuántos bloques se necesitan para almacenar todos los registros en el archivo de datos.

##### Estructura de Índices

**Constantes del Índice:**
```
Rli = 15 bytes
```
Longitud fija de cada registro de índice (clave + puntero).

**Factor de Bloque de Índices (bfri):**
```
bfri = ⌊B / Rli⌋
```
Número de entradas de índice que caben en un bloque de índices.

**Número de Bloques de Índices (bi):**

La fórmula varía según el tipo de índice:

- **Para Índice Primario:**
  ```
  bi = ⌈b / bfri⌉
  ```
  Se calcula en base a los bloques de la estructura principal (b), ya que cada bloque del archivo de datos tiene una entrada en el índice.

- **Para Índice Secundario:**
  ```
  bi = ⌈r / bfri⌉
  ```
  Se calcula en base al número de registros (r), ya que cada registro puede tener su propia entrada en el índice secundario.

**Ejemplo Completo:**
```
Parámetros:
  Rl = 100 bytes (longitud registro de datos)
  B = 512 bytes (capacidad del bloque)
  r = 1000 registros
  Rli = 15 bytes (longitud registro de índice)

Estructura Principal:
  bfr = ⌊512 / 100⌋ = 5 registros por bloque
  b = ⌈1000 / 5⌉ = 200 bloques en archivo de datos

Estructura de Índices:
  bfri = ⌊512 / 15⌋ = 34 entradas de índice por bloque

  Índice Primario:
    bi = ⌈200 / 34⌉ = 6 bloques de índice
    (una entrada por cada bloque del archivo de datos)

  Índice Secundario:
    bi = ⌈1000 / 34⌉ = 30 bloques de índice
    (una entrada por cada registro)
```

**Resumen de Variables:**
| Variable | Descripción | Fórmula | Aplica a |
|----------|-------------|---------|----------|
| **bfr** | Registros por bloque (datos) | ⌊B / Rl⌋ | Estructura principal |
| **b** | Bloques en archivo de datos | ⌈r / bfr⌉ | Estructura principal |
| **Rli** | Longitud registro de índice | 15 bytes (constante) | Estructura de índices |
| **bfri** | Registros índice por bloque | ⌊B / Rli⌋ | Estructura de índices |
| **bi** | Bloques de índices | ⌈b/bfri⌉ o ⌈r/bfri⌉ | Estructura de índices |

### Tipos de Índices

#### 1. Índice Primario

**Características:**
- Basado en la clave primaria del archivo de datos
- El archivo de datos debe estar ordenado por la clave primaria
- Contiene una entrada por cada bloque del archivo de datos
- La clave en el índice es el valor de la primera clave primaria de cada bloque

**Ventajas:**
- Acceso rápido a registros mediante clave primaria
- Menor espacio de almacenamiento (una entrada por bloque)
- Búsqueda eficiente con búsqueda binaria

**Desventajas:**
- Requiere que el archivo de datos esté ordenado
- Dificulta inserciones y eliminaciones

#### 2. Índice Secundario

**Características:**
- Basado en un campo que no es clave primaria
- El archivo de datos no necesita estar ordenado por este campo
- Puede contener múltiples entradas por bloque
- Permite búsquedas por campos alternativos

**Ventajas:**
- Flexibilidad en búsquedas por diferentes campos
- No requiere ordenamiento del archivo de datos
- Soporta múltiples índices sobre el mismo archivo

**Desventajas:**
- Mayor espacio de almacenamiento
- Mantenimiento más complejo

### Estructuras de Índices

#### Índice Simple (Un Nivel)

**Descripción:**
Estructura de un solo nivel donde todas las entradas del índice se almacenan en bloques secuenciales.

**Componentes:**
- **Clave**: Valor del campo indexado
- **Puntero**: Referencia al bloque de datos que contiene el registro

**Ejemplo de Estructura:**
```
Bloque 1:                    Bloque 2:
┌──────────────┐            ┌──────────────┐
│ Clave | Ptr  │            │ Clave | Ptr  │
├──────────────┤            ├──────────────┤
│  10   │ → B1 │            │  35   │ → B3 │
│  15   │ → B1 │            │  40   │ → B4 │
│  20   │ → B2 │            │  45   │ → B4 │
│  25   │ → B2 │            │  50   │ → B5 │
│  30   │ → B2 │            │  -    │      │
└──────────────┘            └──────────────┘
```

**Algoritmo de Búsqueda:**
1. Recorrer bloques del índice secuencial o binariamente
2. Buscar la clave dentro del bloque
3. Seguir el puntero al bloque de datos
4. Recuperar el registro

**Complejidad:**
- Búsqueda: O(log₂ b) donde b = número de bloques del índice
- Inserción: O(b) en el peor caso
- Espacio: Una entrada por registro o por bloque

#### Índice Multinivel (Próximamente)

**Descripción:**
Estructura jerárquica de múltiples niveles de índices, donde el nivel superior indexa el nivel inferior.

**Características:**
- Reduce el número de accesos a disco
- Primer nivel (índice base) apunta a bloques de datos
- Niveles superiores indexan niveles inferiores
- El nivel más alto cabe en memoria

**Estructura (Conceptual):**
```
Nivel 2 (Índice del Índice):
┌──────────────┐
│  Clave | Ptr │
│   10   │ → I1│
│   50   │ → I2│
└──────────────┘
       ↓
Nivel 1 (Índice Base):
┌──────────────┐  ┌──────────────┐
│  10   │ → B1 │  │  50   │ → B5 │
│  20   │ → B2 │  │  60   │ → B6 │
│  30   │ → B3 │  │  70   │ → B7 │
│  40   │ → B4 │  │  80   │ → B8 │
└──────────────┘  └──────────────┘
```

### Operaciones en Índices

#### Inserción

**Algoritmo de Inserción Ordenada:**
1. Buscar la posición correcta en el archivo de datos manteniendo el orden
2. Si la posición está ocupada, hacer corrimiento hacia la derecha
3. Insertar la clave en el archivo de datos
4. Actualizar el índice correspondiente:
   - **Índice Primario**: Actualizar con la última clave del bloque modificado
   - **Índice Secundario**: Agregar nueva entrada (clave, bloque)

**Complejidad:** O(n) en el peor caso por corrimiento

**Ejemplo - Índice Primario:**
```
Archivo de Datos (Bloque 1): [10, 20, 30, 40, 50]
Índice Primario: (50 → B1)  // Última clave del bloque

Insertar 25:
1. Encontrar posición: entre 20 y 30
2. Hacer corrimiento: [10, 20, 25, 30, 40] y 50 se mueve al Bloque 2
3. Actualizar índice primario: (40 → B1), (50 → B2)
```

**Implementación - Índice Primario:**
```typescript
// El índice primario guarda la ÚLTIMA clave de cada bloque
// Esto permite búsqueda binaria: buscar primer índice donde clave >= K
function actualizarIndicePrimario(bloqueModificado: number) {
  // Encontrar la última clave no nula del bloque
  let ultimaClave = null;
  for (let i = bloque.length - 1; i >= 0; i--) {
    if (bloque[i] !== null) {
      ultimaClave = bloque[i];
      break;
    }
  }
  // Actualizar entrada del índice con (ultimaClave → bloqueModificado)
}
```

#### Búsqueda

**Índice Primario - Búsqueda Binaria:**

El índice primario almacena la **última clave** de cada bloque, permitiendo búsqueda binaria eficiente.

**Algoritmo:**
1. Realizar búsqueda binaria en el índice primario
2. Encontrar el primer bloque donde `última_clave >= clave_buscada`
3. Acceder al bloque de datos correspondiente
4. Buscar la clave dentro del bloque

**Ejemplo:**
```
Índices Primarios:
  (25 → B1)  // B1 contiene claves [10, 15, 20, 25]
  (50 → B2)  // B2 contiene claves [30, 35, 40, 50]
  (75 → B3)  // B3 contiene claves [55, 60, 65, 75]

Buscar 35:
1. Búsqueda binaria en índice:
   - 35 > 25 → descartar B1
   - 35 <= 50 → ir a B2
2. Buscar 35 dentro de B2 → Encontrado
```

**Complejidad:** O(log₂ b) + O(bfr) = O(log₂ n)

**Índice Secundario - Búsqueda Lineal:**

El índice secundario tiene una entrada por cada registro.

**Algoritmo:**
1. Recorrer linealmente el índice secundario
2. Buscar la entrada con la clave
3. Seguir el puntero al bloque de datos
4. Recuperar el registro

**Complejidad:** O(r) en el peor caso

#### Eliminación

**Algoritmo de Eliminación con Reorganización:**
1. Buscar la clave en el archivo de datos
2. Eliminar la clave y hacer corrimiento hacia la izquierda
3. Reorganizar TODOS los índices:
   - **Índice Primario**: Reconstruir con la última clave de cada bloque usado
   - **Índice Secundario**: Reconstruir todas las entradas en orden

**Importante:** Los índices se reorganizan completamente después de cada eliminación para mantener consistencia.

**Ejemplo - Reorganización de Índice Primario:**
```
Antes de eliminar 30:
  Archivo: B1[10,20,30] B2[40,50,60]
  Índice:  (30→B1) (60→B2)

Después de eliminar 30:
  Archivo: B1[10,20,40] B2[50,60,--]
  Índice:  (40→B1) (60→B2)  // Reconstruido con nuevas últimas claves
```

**Implementación - Reorganización:**
```typescript
function reorganizarIndices() {
  // 1. Limpiar todos los índices
  limpiarIndices();
  
  if (indicePrimario) {
    // 2. Recorrer bloques con datos
    for (cada bloque con datos) {
      // 3. Encontrar última clave del bloque
      ultimaClave = encontrarUltimaClave(bloque);
      // 4. Agregar entrada (ultimaClave → bloque)
      agregarEntradaIndice(ultimaClave, bloque);
    }
  } else {
    // Índice secundario: una entrada por cada clave
    for (cada clave en archivo_datos) {
      agregarEntradaIndice(clave, bloque_que_contiene);
    }
  }
}
```

**Complejidad:** O(n) por reorganización completa

### Numeración de Registros

**Numeración Global Continua:**

Los registros y las entradas de índice se numeran de forma **global y continua** a través de todos los bloques (no se reinicia la numeración en cada bloque):

**Archivo de Datos:**
```
Bloque 1 (bfr=5):
  R1:  10
  R2:  20
  R3:  30
  R4:  40
  R5:  50

Bloque 2 (bfr=5):
  R6:  60   ← Continúa desde R5
  R7:  70
  R8:  80
  R9:  90
  R10: 100

Bloque 3 (bfr=5):
  R11: 110  ← Continúa desde R10
  R12: 120
  ...
```

**Estructura de Índices:**
```
Bloque Índice 1 (bfri=34):
  E1:  (10 → B1)
  E2:  (20 → B1)
  E3:  (30 → B1)
  ...
  E34: (340 → B10)

Bloque Índice 2 (bfri=34):
  E35:  (350 → B11)  ← Continúa desde E34
  E36:  (360 → B11)
  ...
  E68:  (680 → B20)

Bloque Índice 3 (bfri=34):
  E69:  (690 → B21)  ← Continúa desde E68
  ...
```

**Fórmulas:**
```
Número de Registro Global = (bloqueIdx × bfr) + registroIdx + 1
Número de Entrada Global  = (bloqueIdx × bfri) + entradaIdx + 1
```

**Ejemplos:**
- Archivo de Datos - Bloque 2, Registro 3: `(2 × 5) + 3 + 1 = R14`
- Índices - Bloque 1, Entrada 20: `(1 × 34) + 20 + 1 = E55`

**Implementación:**
```typescript
function getNumeroRegistroGlobal(bloqueIdx: number, regIdx: number): number {
  return bloqueIdx * estructura.value.bfr + regIdx + 1;
}

function getNumeroEntradaGlobal(bloqueIdx: number, entIdx: number): number {
  return bloqueIdx * estructura.value.bfri + entIdx + 1;
}
```

### Diferencias Clave entre Índice Primario y Secundario

#### Índice Primario

**Características:**
- Una entrada por **bloque** del archivo de datos
- Almacena la **última clave** de cada bloque
- Requiere archivo de datos **ordenado**
- Utiliza **búsqueda binaria** en el índice

**Razón de usar la última clave:**
```
Si buscamos una clave K:
1. Búsqueda binaria en índice
2. Encontramos primer bloque donde última_clave >= K
3. La clave K (si existe) está en ese bloque

Ejemplo:
  Índice: [(25→B1), (50→B2), (75→B3)]
  Buscar 35:
  - 35 > 25 ✗
  - 35 <= 50 ✓ → Ir a B2
  - B2 contiene [30,35,40,50] → Encontrado
```

**Ventajas:**
- Menor espacio (una entrada por bloque)
- Búsqueda O(log₂ b) muy eficiente
- Ideal para claves primarias

**Desventajas:**
- Requiere mantener orden en archivo de datos
- Reorganización costosa en eliminación

#### Índice Secundario

**Características:**
- Una entrada por **registro** del archivo de datos
- Almacena todas las claves
- No requiere archivo de datos ordenado
- Utiliza **búsqueda lineal** en el índice

**Ventajas:**
- Permite búsqueda por campos no primarios
- No requiere orden en archivo de datos
- Múltiples índices secundarios posibles

**Desventajas:**
- Mayor espacio (una entrada por registro)
- Búsqueda O(r) menos eficiente
- Más entradas a reorganizar en eliminación

### Detalles de Implementación

#### Estructura de Datos

```typescript
interface EntradaIndice {
  clave: number | null;           // Clave almacenada
  bloqueReferencia: number;       // Bloque al que apunta (1-indexed)
}

interface Estructura {
  archivoDatos: (number | null)[][];  // [bloque][registro]
  indiceSimple: EntradaIndice[][];    // [bloque_indice][entrada]
  bfr: number;      // Registros por bloque de datos
  bfri: number;     // Entradas por bloque de índice
  b: number;        // Bloques en archivo de datos
  bi: number;       // Bloques en índice
}
```

#### Flujo de Inserción

```
1. insertar(clave)
   ↓
2. encontrarPosicionInsercion(clave)
   ↓ (si posición ocupada)
3. hacerCorrimiento(bloque, registro)
   ↓
4. archivo_datos[bloque][registro] = clave
   ↓
5. if (indicePrimario)
      actualizarIndicePrimario(bloque)  // Última clave del bloque
   else
      insertarIndiceSecundario(clave, bloque)  // Nueva entrada
```

#### Flujo de Eliminación

```
1. eliminar(clave)
   ↓
2. Buscar clave en archivo_datos
   ↓
3. eliminarYCorrerIzquierda(bloque, registro)
   ↓
4. reorganizarIndices()  // Reconstrucción completa
   ↓
5. if (indicePrimario)
      Para cada bloque con datos:
        Agregar (ultimaClave → bloque)
   else
      Para cada registro:
        Agregar (clave → bloque)
```

#### Corrimiento de Elementos

**Inserción - Corrimiento a la Derecha:**
```
Estado: [10, 20, 30, 40, 50]
Insertar 25 en posición 2:

1. Guardar 50
2. [10, 20, _, 30, 40] ← Correr 30 y 40
3. [10, 20, 25, 30, 40] ← Insertar 25
4. 50 se mueve al siguiente bloque
```

**Eliminación - Corrimiento a la Izquierda:**
```
Estado: [10, 20, 30, 40, 50]
Eliminar 30 en posición 2:

1. [10, 20, _, 40, 50]
2. [10, 20, 40, 50, _] ← Correr todo a la izquierda
```

### Visualización

La interfaz muestra:

**Disposición:**
- **Columna Izquierda**: Estructura de Índices
- **Columna Derecha**: Estructura Principal (Archivo de Datos)
- Ambas estructuras se muestran verticalmente (de arriba hacia abajo)

**Renderizado Condicional:**

Para estructuras grandes, se aplica renderizado optimizado:
- Muestra **primer y último bloque** siempre
- Muestra **bloques con datos**
- Dentro de cada bloque: muestra **primer y último registro** + registros ocupados
- Indicadores `⋮` para elementos omitidos

**Panel de Configuración:**
- Tipo de índice (Primario/Secundario)
- Estructura (Simple/Multinivel)
- Parámetros: Rl, B, r
- Cálculos: bfr, b, bfri, bi

**Visualización de Índice Simple:**
- Bloques dispuestos horizontalmente
- Cada entrada muestra:
  - **Clave**: Valor indexado
  - **Puntero**: `→ B#` (referencia al bloque)
- Estados visuales:
  - Entradas vacías: Borde punteado
  - Entradas llenas: Gradiente azul claro
  - Última operación: Highlight animado

### Ventajas de los Índices

1. **Acceso Rápido**: Reducción significativa del tiempo de búsqueda
2. **Flexibilidad**: Permiten búsquedas por diferentes campos
3. **Eficiencia**: Menos accesos a disco comparado con búsqueda secuencial
4. **Escalabilidad**: Funcionan bien con grandes volúmenes de datos

### Métricas de Rendimiento

**Sin Índice (Búsqueda Secuencial):**
- Accesos promedio: r/2 bloques
- Accesos peor caso: r bloques

**Con Índice Simple:**
- Accesos promedio: log₂(b) + 1 bloques
- Donde b = bloques del índice

**Ejemplo:**
```
r = 1,000,000 registros
bfr = 100 registros/bloque
Bloques de datos = 10,000

Sin índice: ~5,000 accesos promedio
Con índice: log₂(100) + 1 ≈ 8 accesos

Mejora: 625x más rápido
```

### Comparación de Índices

| Aspecto | Primario | Secundario |
|---------|----------|------------|
| Campo base | Clave primaria | Campo no clave |
| Ordenamiento | Requerido | No requerido |
| Entradas | Una por bloque | Una por registro (típico) |
| Espacio | Menor | Mayor |
| Unicidad | Garantizada | Puede tener duplicados |
| Mantenimiento | Más complejo | Más simple |

---

*Esta documentación proporciona la base teórica para la implementación de búsquedas externas en el sistema de estructuras de datos.*