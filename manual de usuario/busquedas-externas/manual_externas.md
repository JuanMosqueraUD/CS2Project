# Manual de Usuario - Busquedas Externas

Esta seccion del documento agrupa las vistas relacionadas con Busquedas externas del proyecto. Cada sección sigue la misma plantilla: descripción, creación, gestión de aristas/nodos, importación/guardado, ejecución de algoritmos (si aplica), interpretación de resultados, reinicio y resumen de botones con los textos exactos de la interfaz.

---
# Búsqueda Lineal Externa

## Introducción

La herramienta de **Búsqueda Lineal Externa** te permite trabajar con grandes conjuntos de datos que están organizados en bloques de memoria. Esta técnica es útil cuando manejas información que no cabe toda en la memoria principal y necesitas buscar elementos de forma ordenada y eficiente.

## ¿Qué es la Búsqueda Lineal Externa?

Imagina que tienes una biblioteca muy grande donde los libros están ordenados alfabéticamente en diferentes estantes (bloques). Para encontrar un libro específico, revisas cada estante en orden hasta encontrar el que buscas. La búsqueda lineal externa funciona de manera similar: divide los datos en bloques ordenados y los busca secuencialmente.

Esta técnica mantiene tus datos **ordenados** en cada bloque, lo que facilita su búsqueda y gestión.

---

## Paso 1: Configurar la Capacidad

### Configuración Inicial

1. **Ingresar la capacidad total**: Escribe cuántos elementos en total puede almacenar tu estructura
   - Ejemplo: `100` significa que puedes guardar hasta 100 elementos

2. **Hacer clic en "Crear"**: El sistema calculará automáticamente:
   - **Capacidad del bloque**: Cuántos elementos caben en cada bloque
   - **Número de bloques**: Cuántos bloques se necesitan para tu capacidad total

### Información Calculada

Después de crear la estructura, verás:

- **Capacidad total**: El valor que ingresaste
- **Capacidad por bloque**: Cuántos elementos caben en cada bloque (calculado automáticamente)
- **Número de bloques**: Cuántos bloques se crearán para almacenar todos los datos

**Ejemplo:**
```
Si ingresas capacidad = 100
El sistema podría calcular:
- Capacidad por bloque = 10
- Número de bloques = 10
```

---

## Paso 2: Insertar Elementos

Una vez configurada la estructura, puedes comenzar a agregar elementos.

### Cómo Insertar Elementos

1. **Ingresar el elemento**: Escribe el número que deseas agregar
   - Solo acepta números enteros positivos
   - Ejemplo: `25`, `150`, `7`

2. **Hacer clic en "Insertar"**: El elemento se agregará automáticamente en:
   - Su posición correcta dentro del bloque correspondiente
   - Manteniendo el orden de menor a mayor

### Características de la Inserción

**Ordenamiento automático:**
- Los elementos se insertan en orden creciente
- Si insertas: 50, 20, 80, 30
- Se almacenarán como: 20, 30, 50, 80

**Distribución por bloques:**
- El sistema decide automáticamente en qué bloque guardar cada elemento
- Cada bloque mantiene su propio orden interno
- Cuando un bloque se llena, el siguiente elemento va al siguiente bloque

### Visualización de Bloques

Verás una representación visual de tus bloques:

**Cada bloque muestra:**
- **Número del bloque**: `Bloque 0`, `Bloque 1`, etc.
- **Elementos almacenados**: Los números dentro del bloque en orden
- **Capacidad usada**: Cuántos elementos hay vs. cuántos caben

**Ejemplo visual:**
```
Bloque 0: [5, 12, 23, 45] (4/10)
Bloque 1: [67, 89, 91] (3/10)
Bloque 2: [102, 150] (2/10)
```

---

## Paso 3: Buscar Elementos

Puedes buscar si un elemento específico existe en tu estructura.

### Cómo Realizar una Búsqueda

1. **Ingresar el elemento a buscar**: Escribe el número que deseas encontrar
   - Ejemplo: `45`

2. **Hacer clic en "Buscar"**: El sistema realizará la búsqueda

### Proceso de Búsqueda

El sistema seguirá estos pasos automáticamente:

1. **Revisa bloque por bloque**: Empieza desde el primer bloque
2. **Busca dentro de cada bloque**: Examina los elementos en orden
3. **Se detiene al encontrar**: Cuando encuentra el elemento o determina que no existe

### Resultados de la Búsqueda

**Si encuentra el elemento:**
- Mensaje: "Elemento encontrado"
- Muestra: En qué bloque está
- Muestra: En qué posición dentro del bloque
- Ejemplo: "Encontrado en Bloque 1, posición 2"

**Si no encuentra el elemento:**
- Mensaje: "Elemento no encontrado"
- Indica que el elemento no existe en ningún bloque

### Visualización del Proceso

La búsqueda te mostrará:
- **Bloques revisados**: Cuántos bloques examinó
- **Accesos realizados**: Cuántas veces tuvo que leer datos
- **Bloque final**: Dónde encontró el elemento o dónde terminó la búsqueda

---

## Paso 4: Guardar y Abrir Estructuras

### Guardar tu Trabajo

Cuando hayas creado tu estructura con sus elementos, puedes guardarla para usarla después.

**Pasos para guardar:**

1. **Hacer clic en "Guardar"**
2. **Elegir ubicación**: Selecciona dónde guardar el archivo
3. **Nombrar el archivo**: Dale un nombre descriptivo
   - Ejemplo: `busqueda_lineal_100elementos.json`
4. **Confirmar**: El archivo se guardará en formato JSON

**Qué se guarda:**
- Configuración completa (capacidad, bloques)
- Todos los elementos insertados
- Distribución en bloques

### Abrir una Estructura Guardada

Si quieres continuar trabajando con una estructura anterior:

**Opción 1: Abrir al inicio**
- Haz clic en **"Abrir"** antes de crear una nueva estructura
- Selecciona el archivo JSON guardado previamente
- La estructura se cargará con todos sus elementos

**Opción 2: Abrir después de crear**
- También puedes abrir una estructura después de haber creado una nueva
- Los datos actuales serán reemplazados por los del archivo

**Qué se restaura:**
- Configuración original (capacidad, número de bloques)
- Todos los elementos en sus posiciones
- Visualización completa de bloques

---

## Consejos y Mejores Prácticas

### Planificación de Capacidad

**Elige una capacidad adecuada:**
- Considera cuántos elementos necesitarás almacenar
- Deja espacio extra para crecimiento futuro
- Ejemplo: Si necesitas 80 elementos, considera usar capacidad de 100

### Inserción Eficiente

**Orden de inserción:**
- No importa en qué orden insertes los elementos
- El sistema siempre los mantendrá ordenados
- Insertar en cualquier orden: 90, 10, 50, 30
- Resultado: 10, 30, 50, 90

**Evita duplicados:**
- Verifica que un elemento no exista antes de insertarlo
- Usa la función de búsqueda para confirmarlo

### Búsqueda Efectiva

**Búsqueda lineal es mejor cuando:**
- Tienes conjuntos pequeños o medianos de datos
- Los datos están naturalmente ordenados
- No necesitas búsquedas extremadamente rápidas

**Limitaciones:**
- La búsqueda puede ser lenta con muchos bloques
- Debe revisar cada bloque secuencialmente hasta encontrar el elemento

### Gestión de Archivos

**Nombres descriptivos:**
- Usa nombres que indiquen el contenido
- Ejemplos:
  - `lineal_ordenado_mayo2024.json`
  - `elementos_100_ordenados.json`

**Respaldos regulares:**
- Guarda versiones de tu trabajo periódicamente
- Mantén copias de seguridad importantes

---

## Ejemplo Completo Paso a Paso

### Caso Práctico: Sistema de Inventario

**Objetivo:** Crear una estructura para buscar códigos de productos ordenados.

**Paso 1: Configurar**
```
Capacidad total: 50
→ Resultado: 5 bloques de 10 elementos cada uno
```

**Paso 2: Insertar productos**
```
Insertamos códigos: 105, 203, 178, 145, 290
→ Sistema los ordena: 105, 145, 178, 203, 290
→ Distribución:
   Bloque 0: [105, 145, 178, 203, 290]
```

**Paso 3: Buscar un producto**
```
Buscar: 178
→ Proceso:
   1. Revisa Bloque 0
   2. Encuentra 178 en posición 3
→ Resultado: "Encontrado en Bloque 0, posición 3"
```

**Paso 4: Guardar**
```
Guardar como: inventario_productos_mayo.json
→ Archivo guardado con 5 elementos en 1 bloque
```

---

## Solución de Problemas Comunes

### No puedo insertar más elementos

**Problema:** El mensaje dice que la estructura está llena.

**Solución:**
- Has alcanzado la capacidad máxima
- Opciones:
  1. Crear una nueva estructura con mayor capacidad
  2. Eliminar elementos innecesarios (si la herramienta lo permite)
  3. Guardar la estructura actual y crear una nueva

### La búsqueda es muy lenta

**Problema:** Tarda mucho en encontrar elementos.

**Solución:**
- La búsqueda lineal revisa bloque por bloque
- Es normal con muchos bloques
- Considera:
  1. Usar búsqueda binaria externa si necesitas mayor velocidad
  2. Reducir el número total de elementos
  3. Verificar que los datos estén correctamente ordenados

### No se visualizan los bloques

**Problema:** Los bloques no aparecen después de crear la estructura.

**Solución:**
- Verifica que ingresaste una capacidad válida (número positivo)
- Asegúrate de hacer clic en "Crear"
- Actualiza la página si es necesario

### Error al abrir archivo guardado

**Problema:** El archivo no se carga correctamente.

**Solución:**
- Verifica que el archivo sea un JSON válido
- Asegúrate de seleccionar un archivo guardado por esta herramienta
- El archivo no debe haber sido modificado manualmente

---

## Resumen de Funciones

| Función | Descripción | Cuándo usarla |
|---------|-------------|---------------|
| **Crear** | Configura la capacidad y bloques | Al inicio, antes de insertar elementos |
| **Insertar** | Agrega elementos ordenadamente | Para poblar la estructura con datos |
| **Buscar** | Encuentra elementos específicos | Para verificar si un elemento existe |
| **Guardar** | Exporta la estructura a archivo | Para preservar tu trabajo |
| **Abrir** | Importa estructura guardada | Para continuar trabajo previo |

---

## Conceptos Clave

**Bloque:**
- Unidad de almacenamiento que contiene varios elementos
- Tiene capacidad limitada
- Mantiene sus elementos ordenados

**Ordenamiento:**
- Los elementos se mantienen de menor a mayor
- Facilita la búsqueda y gestión
- Se realiza automáticamente al insertar

**Búsqueda secuencial:**
- Revisa elementos uno por uno
- Examina bloques en orden
- Se detiene al encontrar el elemento o llegar al final

**Capacidad:**
- Límite máximo de elementos que puede almacenar
- Se divide entre los bloques disponibles
- Define el tamaño de tu estructura

---

Esta herramienta de búsqueda lineal externa te proporciona una forma sencilla y ordenada de gestionar conjuntos de datos, manteniéndolos organizados en bloques para facilitar su búsqueda y manipulación. Recuerda que el orden automático y la división en bloques son las características clave que hacen eficiente esta técnica para trabajar con datos externos.

---

# Búsqueda Binaria Externa

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

---
# Búsqueda Hash Externa

## Introducción

La herramienta de **Búsqueda Hash Externa** te permite trabajar con grandes conjuntos de datos utilizando una función hash para organizar y encontrar elementos muy rápidamente. 
---

## Paso 1: Configurar la Estructura Hash

### Configuración Inicial

Antes de usar la estructura, debes configurar varios parámetros importantes:

1. **Capacidad total**: Cuántos elementos puedes almacenar en total
   - Ejemplo: `100`

2. **Dígitos de la clave**: Cuántos dígitos tiene cada número que insertarás
   - Ejemplo: `3` (para números de 3 dígitos como 123, 456, 789)
   - Todos los elementos deben tener esta cantidad de dígitos

3. **Método de resolución de colisiones**: Cómo manejar cuando dos elementos quieren la misma posición
   - **Estructura secundaria**: Cada posición puede tener múltiples elementos en una lista
   - **Área de colisiones**: Los elementos que colisionan van a un área especial

4. **Hacer clic en "Crear"**: La estructura se inicializará

### Información Calculada

Después de crear, verás:

- **Número de cubetas**: Cuántas posiciones principales hay
- **Capacidad por cubeta**: Cuántos elementos caben en cada posición
- **Capacidad área de colisiones** (si aplica): Espacio para elementos que colisionan

**Ejemplo:**
```
Capacidad: 100
Dígitos de clave: 3
Resolución: Estructura secundaria
→ Resultado:
   - 10 cubetas
   - 10 elementos por cubeta
```

---

## Paso 2: Entender los Métodos de Resolución de Colisiones


### Opción 1: Estructura Secundaria

**Cómo funciona:**
- Cada posición (cubeta) puede contener múltiples elementos
- Los elementos que colisionan se almacenan juntos en una lista
- Cada cubeta tiene su propia capacidad


### Opción 2: Área de Colisiones

**Cómo funciona:**
- Cada cubeta principal tiene espacio para un solo elemento
- Si hay colisión, el elemento extra va a un área especial de colisiones
- El área de colisiones es un espacio adicional separado

---

## Paso 3: Insertar Elementos

### Cómo Insertar Elementos

1. **Ingresar el elemento**: Escribe el número que deseas agregar
   - **Importante**: Debe tener exactamente el número de dígitos configurado
   - Si configuraste 3 dígitos, solo acepta números de 3 dígitos (100-999)
   - Ejemplo válido: `234`, `567`, `890`
   - Ejemplo inválido: `23` (solo 2 dígitos), `1234` (4 dígitos)

2. **Hacer clic en "Insertar"**: El sistema:
   - Calcula la posición usando función módulo
   - Verifica si hay espacio disponible
   - Coloca el elemento en la posición correcta o en área de colisiones

### Proceso de Inserción

**Paso a paso:**

1. **Cálculo de hash**: Sistema aplica el hash seleccionado al número
   ```
   Ejemplo: 234 % 10 = 4
   → El elemento debería ir a la cubeta 4
   ```

2. **Verificación de espacio**:
   - Si la cubeta tiene espacio → Inserta ahí
   - Si la cubeta está llena → Maneja la colisión según configuración

3. **Manejo de colisiones**:
   - **Estructura secundaria**: Agrega a la lista de la cubeta (si hay espacio)
   - **Área de colisiones**: Mueve a área especial de colisiones




---

## Paso 4: Buscar Elementos

La búsqueda hash es extremadamente rápida porque calcula directamente dónde debe estar el elemento.

### Cómo Realizar una Búsqueda

1. **Ingresar el elemento a buscar**: Escribe el número
   - Debe tener el número correcto de dígitos
   - Ejemplo: `234`

2. **Hacer clic en "Buscar"**: El sistema realiza la búsqueda

### Proceso de Búsqueda

**Búsqueda directa:**

1. **Calcular hash**: Sistema aplica función hash seleccionada previamente
   ```
   Ejemplo: 234 % 10 = 4
   → Busca directamente en cubeta 4
   ```

2. **Revisar cubeta**:
   - **Estructura secundaria**: Revisa todos los elementos en la lista de esa cubeta
   - **Área de colisiones**: Primero revisa cubeta, luego área de colisiones si es necesario

3. **Resultado inmediato**:
   - Encuentra el elemento o determina que no existe
   - Muy pocas comparaciones necesarias

### Resultados de la Búsqueda

**Si encuentra el elemento:**
- Mensaje: "Elemento encontrado"
- Ubicación: Qué cubeta lo contiene
- Si está en área de colisiones, lo indica

**Si no encuentra el elemento:**
- Mensaje: "Elemento no encontrado"
- Sistema verificó solo la cubeta correspondiente
- Muy rápido incluso cuando no existe



## Paso 5: Guardar y Abrir Estructuras

### Guardar tu Trabajo

Cuando hayas creado tu estructura hash con sus elementos, puedes guardarla.

**Pasos para guardar:**

1. **Hacer clic en "Guardar"**

**Qué se guarda:**
- Configuración completa (capacidad, dígitos, método de colisiones)
- Todas las cubetas con sus elementos
- Área de colisiones (si aplica)
- Función hash utilizada

### Abrir una Estructura Guardada

Para continuar con un trabajo anterior:

**Opción 1: Abrir al inicio**
- Haz clic en **"Abrir"** antes de crear
- Selecciona el archivo JSON
- La estructura se cargará completamente

**Opción 2: Abrir después de crear**
- Puedes abrir después de crear una estructura
- Los datos actuales serán reemplazados

**Qué se restaura:**
- Configuración original
- Todos los elementos en sus posiciones
- Método de resolución de colisiones
- Estado completo de cubetas y colisiones
---
# Estructuras Dinámicas

## Introducción

La herramienta de **Estructuras Dinámicas** te permite trabajar con tablas hash que pueden crecer y reducirse automáticamente según la cantidad de datos.
---

## Paso 1: Entender la Estructura Dinámica

### Componentes Principales

**Cubetas:**
- Contenedores numerados que almacenan los elementos
- Se organizan usando función hash módulo
- Ejemplo: Con 8 cubetas, están numeradas de 0 a 7

**Registros por Cubeta:**
- Cuántos elementos caben en cada cubeta
- Define la capacidad base antes de usar desbordamiento
- Ejemplo: 2 registros por cubeta

**Desbordamientos:**
- Área adicional cuando una cubeta se llena
- Los elementos extra se almacenan temporalmente aquí
- Se resuelven con la próxima expansión

### Conceptos 

**Expansión:**
- Cuando la ocupación supera 75%, la estructura crece
- Agrega más cubetas para dar más espacio
- Redistribuye elementos según nueva función hash

**Reducción:**
- Cuando la densidad es baja (≤ 0.8 registros/cubeta), la estructura se reduce
- Elimina cubetas innecesarias
- Redistribuye elementos en menos cubetas

## Paso 2: Configurar la Estructura Dinámica

### Configuración Inicial

Para crear una estructura dinámica, configura:

1. **Cantidad de cubetas**: Cuántas cubetas iniciales tendrá
   - Ejemplo: `8` cubetas
   - La estructura puede crecer o reducirse después

2. **Registros por cubeta**: Capacidad de cada cubeta
   - Ejemplo: `2` registros por cubeta
   - Determina cuándo usar desbordamiento

3. **Tamaño de la clave**: Cuántos dígitos tiene cada elemento
   - Ejemplo: `2` (para números de 2 dígitos: 10-99)
   - Todos los elementos deben tener esta cantidad de dígitos

4. **Tipo de expansión/reducción**: Cómo crece o se reduce
   - **Total**: Duplica o divide a la mitad de una vez (8 → 16 o 16 → 8)
   - **Parcial**: Agrega o quita cubetas gradualmente (2 parciales = 1 total)

5. **Hacer clic en "Crear Estructura"**: La estructura se inicializa

### Información Calculada

Después de crear, verás:

- **Capacidad total**: Cubetas × Registros por cubeta
- **Umbral de expansión**: 75% de ocupación
- **Umbral de reducción**: Densidad ≤ 0.8 registros/cubeta
- **Función hash**: Módulo sobre el número actual de cubetas

---

## Paso 3: Insertar Elementos

### Cómo Insertar Elementos

1. **Ingresar el elemento**: Escribe el número
   - Debe tener el número correcto de dígitos
   - Ejemplo: Si configuraste 2 dígitos, usa 10-99

2. **Hacer clic en "Insertar"** (o presiona Enter): El sistema:
   - Calcula la cubeta con hash módulo
   - Inserta en la cubeta correspondiente
   - Usa desbordamiento si la cubeta está llena
   - Expande si se alcanza el umbral

### Proceso de Inserción Normal

**Cuando hay espacio en la cubeta:**
 **Insertar en cubeta**: Coloca el elemento en el primer espacio libre


### Inserción con Desbordamiento

**Cuando la cubeta está llena:**

1. **Intentar insertar**: Sistema detecta cubeta llena

2. **Usar desbordamiento**: Elemento va a área de desbordamiento

3. **Marcar para expansión**: Si se alcanza 75% de ocupación

### Expansión Automática

**Expansión Total:**
- Duplica el número de cubetas (8 → 16)
- Redistribuye todos los elementos

**Expansión Parcial:**
- Agrega cubetas gradualmente
- 2 expansiones parciales = 1 total
- Menos cambios drásticos
- Mejor para inserciones distribuidas


## Paso 4: Buscar Elementos

### Cómo Realizar una Búsqueda

1. **Ingresar el elemento a buscar**: Escribe el número

2. **Hacer clic en "Buscar"**: El sistema realiza la búsqueda

### Proceso de Búsqueda

**Búsqueda directa:**

1. **Calcular hash**: `elemento % cubetas`
2. **Ir a la cubeta**: Directamente a la cubeta calculada
3. **Buscar en cubeta**: Revisar registros
4. **Buscar en desbordamiento**: Si no está en cubeta principal

### Resultados de la Búsqueda

**Si encuentra el elemento:**
- Mensaje: "Elemento encontrado en Cubeta X"

**Si no encuentra el elemento:**
- Mensaje: "Elemento no encontrado"
- Sistema verificó cubeta y desbordamiento


## Paso 5: Eliminar Elementos

### Cómo Eliminar Elementos

1. **Ingresar el elemento a eliminar**: Escribe el número

2. **Hacer clic en "Eliminar"**: El sistema:
   - Busca el elemento
   - Lo elimina de cubeta o desbordamiento
   - Verifica si debe reducir la estructura

### Reducción Automática

**Reducción Total:**
- Divide a la mitad el número de cubetas (16 → 8)
- Cuando densidad ≤ 0.8 registros/cubeta
- Redistribuye todos los elementos

**Reducción Parcial:**
- Elimina cubetas gradualmente
- 2 reducciones parciales = 1 total
- Menos redistribución

## Paso 6: Visualizar la Estructura

### Componentes de la Visualización

**Información de estado:**
- Cubetas actuales
- Registros por cubeta
- Capacidad total
- Registros ocupados
- Porcentaje de ocupación
- Densidad

**Cubetas:**
- Numeradas desde 0
- Muestra registros dentro de capacidad
- Registros vacíos se muestran como "-"
- Elementos insertados recientemente resaltados

**Desbordamientos:**
- Se muestran debajo de cada cubeta
- Solo si la cubeta tiene desbordamientos
- Numerados como D0, D1, D2...

## Paso 7: Guardar y Abrir Estructuras

### Guardar tu Trabajo

**Pasos para guardar:**

1. **Hacer clic en "Guardar Estructura"**
2. **Elegir ubicación**
3. **Nombrar archivo**:
   - Ejemplo: `dinamica_8cubetas.json`
4. **Confirmar**

**Qué se guarda:**
- Configuración completa
- Todas las cubetas con sus elementos
- Desbordamientos
- Contadores de expansiones/reducciones
- Estado actual completo

### Abrir una Estructura Guardada

**Opción 1: Abrir al inicio**
- Haz clic en **"Abrir Estructura"** antes de crear
- Selecciona archivo JSON
- La estructura se carga completamente

**Opción 2: Abrir después de crear**
- Usa el botón **"Abrir Estructura"** en operaciones
- Reemplaza estructura actual

**Qué se restaura:**
- Configuración original
- Todos los elementos en sus posiciones
- Desbordamientos
- Contadores
- Visualización completa

---
# Índices Externos

## Introducción

La herramienta de **Índices Externos** te permite crear estructuras de índice para acceder eficientemente a archivos de datos grandes. Los índices actúan como una guía que te dice dónde encontrar información sin tener que revisar todo el archivo.

---

## Paso 1: Tipos de Índices

### Índice Primario vs. Secundario

**Índice Primario:**
- El archivo de datos está ordenado por la clave principal
- Necesita una entrada por cada bloque 

**Índice Secundario:**
- El archivo de datos no está ordenado por el campo indexado
- Necesita una entrada por cada registro

### Estructura Simple vs. Multinivel

**Simple:**
- Un solo nivel de índice que apunta directamente al archivo de datos
- Menos accesos pero requiere más espacio

**Multinivel:**
- Varios niveles de índices (índice del índice)
- Usa menos espacio en memoria
- Útil cuando el índice simple es muy grande

---

## Paso 2: Configurar Índices

### Parámetros de Configuración

1. **Tipo de índice**: Primario o Secundario

2. **Estructura**: Simple o Multinivel

3. **Cantidad de registros (r)**: Total de registros en el archivo

4. **Longitud registro dato (bytes)**: Tamaño de cada registro en el archivo principal

5. **Longitud registro índice (bytes)**: Tamaño de cada entrada en el índice

6. **Capacidad del bloque (B - bytes)**: Tamaño de cada bloque

7. **Hacer clic en "Crear Estructura"**

### Cálculos Automáticos

El sistema calculará:

**Para el archivo de datos:**
- **bfr**: Registros por bloque = ⌊B / Longitud registro dato⌋
- **b**: Bloques necesarios = ⌈r / bfr⌉

**Para el índice:**
- **bfri**: Entradas de índice por bloque = ⌊B / Longitud registro índice⌋
- **bi**: Bloques de índice
  - Primario: ⌈b / bfri⌉
  - Secundario: ⌈r / bfri⌉

**Para multinivel (si aplica):**
- Número de niveles necesarios
- Bloques por cada nivel

---

## Paso 3: Entender los Índices

### Índice Primario

- El archivo está ordenado por la clave
- El índice guarda solo el primer registro de cada bloque
- Para buscar: encuentra el bloque correcto en el índice, luego busca dentro del bloque
- Más eficiente en espacio porque no necesita una entrada por cada registro

### Índice Secundario

- El archivo no está ordenado por el campo del índice
- El índice necesita una entrada por cada registro
- Para buscar: encuentra todos los bloques que contienen el valor buscado
- Permite buscar por campos que no son la clave principal

### Índice Multinivel

- Cuando el índice simple es muy grande, se crea un índice del índice
- Reduce el espacio en memoria principal
- Requiere más accesos pero cada acceso es a estructuras más pequeñas
- El nivel superior se mantiene en memoria para mayor velocidad

---

## Paso 4: Visualizar la Estructura

### Vista Simple

Muestra dos columnas lado a lado:
- **Izquierda**: Estructura de Índices (bloques de índice con sus entradas)
- **Derecha**: Estructura Principal (bloques del archivo de datos)

Cada entrada del índice apunta a un bloque o registro en el archivo principal.

### Vista Multinivel

Muestra múltiples columnas:
- **Niveles superiores** a la izquierda (nivel más alto primero)
- **Nivel 1** apunta a la estructura principal
- **Estructura principal** a la derecha

Solo se muestran el primer, medio y último bloque de cada estructura para claridad.

---

## Paso 5: Guardar y Abrir

### Guardar

1. Hacer clic en "Guardar"
2. Elegir ubicación y nombre
3. Se guarda la configuración completa y estructura

### Abrir

**Opción 1: Antes de crear**
- Usar botón "Abrir Estructura" en la pantalla inicial
- Seleccionar archivo JSON

**Opción 2: Después de crear**
- Usar botón "Abrir Estructura" en las operaciones
- Reemplaza la estructura actual

---

## Paso 6: Resetear Estructura

Si necesitas empezar de nuevo:
1. Hacer clic en "Resetear"
2. Confirmar en el modal
3. Se borra toda la configuración y datos
