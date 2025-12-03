# Manual de Usuario: Búsqueda Binaria Externa

## Introducción

La herramienta de **Búsqueda Binaria Externa** te permite trabajar con grandes conjuntos de datos organizados en bloques, utilizando una técnica de búsqueda más rápida que la búsqueda lineal. Esta técnica es especialmente útil cuando manejas muchos elementos y necesitas encontrarlos rápidamente.

---

## Paso 1: Configurar la Capacidad

### Configuración Inicial

1. **Ingresar la capacidad total**: Escribe cuántos elementos en total puede almacenar tu estructura
   - Ejemplo: `200` significa que puedes guardar hasta 200 elementos

2. **Hacer clic en "Crear"**: El sistema calculará automáticamente:
   - **Capacidad del bloque**: Cuántos elementos caben en cada bloque
   - **Número de bloques**: Cuántos bloques se necesitan

### Información Calculada

Después de crear la estructura, verás:

- **Capacidad total**: El valor que ingresaste
- **Capacidad por bloque**: Elementos por bloque (calculado automáticamente)
- **Número de bloques**: Total de bloques creados

**Ejemplo:**
```
Si ingresas capacidad = 200
El sistema podría calcular:
- Capacidad por bloque = 10
- Número de bloques = 20
```

---

## Paso 2: Insertar Elementos

Una vez configurada la estructura, puedes comenzar a agregar elementos que se mantendrán ordenados automáticamente.

### Cómo Insertar Elementos

1. **Ingresar el elemento**: Escribe el número que deseas agregar
   - Solo acepta números enteros positivos
   - Ejemplo: `45`, `178`, `23`

2. **Hacer clic en "Insertar"**: El elemento se agregará:
   - En su posición correcta para mantener el orden
   - Dentro del bloque correspondiente

### Características de la Inserción

**Ordenamiento global:**
- Todos los elementos se mantienen ordenados en toda la estructura
- No solo dentro de cada bloque, sino entre bloques
- Si insertas: 100, 50, 150, 25
- Se almacenarán como: 25, 50, 100, 150

**Distribución por bloques:**
- Los elementos se distribuyen en bloques manteniendo el orden global
- Los bloques anteriores contienen elementos menores
- Los bloques posteriores contienen elementos mayores

**Ejemplo de distribución ordenada:**
```
Bloque 0: [5, 12, 23, 35, 41]     ← Elementos más pequeños
Bloque 1: [56, 67, 78, 89, 95]    ← Elementos medianos
Bloque 2: [102, 145, 167, 189]    ← Elementos más grandes
```

### Visualización de Bloques

Verás una representación visual de tus bloques ordenados:

**Cada bloque muestra:**
- **Número del bloque**: `Bloque 0`, `Bloque 1`, etc.
- **Elementos en orden**: Los números dentro del bloque
- **Capacidad usada**: Cuántos elementos tiene vs. cuántos caben

---

## Paso 3: Buscar Elementos


### Cómo Realizar una Búsqueda

1. **Ingresar el elemento a buscar**: Escribe el número que deseas encontrar
   - Ejemplo: `89`

2. **Hacer clic en "Buscar"**: El sistema realizará la búsqueda binaria

### Proceso de Búsqueda Binaria

El sistema sigue este proceso optimizado:

1. **Determina el bloque correcto**:
   - Examina los rangos de cada bloque
   - Identifica en qué bloque debería estar el elemento

2. **Búsqueda binaria dentro del bloque**:
   - Compara con el elemento del medio
   - Descarta la mitad que no contiene el elemento
   - Repite hasta encontrarlo o determinar que no existe


### Resultados de la Búsqueda

**Si encuentra el elemento:**
- Mensaje: "Elemento encontrado"
- Indica: Bloque donde está
- Indica: Posición dentro del bloque
- Ejemplo: "Encontrado en Bloque 5, posición 3"

**Si no encuentra el elemento:**
- Mensaje: "Elemento no encontrado"

---

## Paso 5: Guardar y Abrir Estructuras

### Guardar tu Trabajo

Cuando hayas creado tu estructura con sus elementos ordenados, puedes guardarla.

**Pasos para guardar:**

1. **Hacer clic en "Guardar"**
   - Ejemplo: `busqueda_binaria_200elementos.json`

**Qué se guarda:**
- Configuración completa (capacidad, bloques)
- Todos los elementos en orden
- Distribución en bloques

### Abrir una Estructura Guardada

Para continuar con un trabajo anterior:

**Opción 1: Abrir al inicio**
- Haz clic en **"Abrir"** antes de crear una nueva estructura
- Selecciona el archivo JSON guardado
- La estructura se cargará completamente

**Opción 2: Abrir después de crear**
- Puedes abrir después de crear una estructura
- Los datos actuales serán reemplazados

**Qué se restaura:**
- Configuración original
- Todos los elementos en sus posiciones
- Orden global mantenido
- Visualización completa