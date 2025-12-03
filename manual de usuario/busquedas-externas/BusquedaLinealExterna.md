# Manual de Usuario: Búsqueda Lineal Externa

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
