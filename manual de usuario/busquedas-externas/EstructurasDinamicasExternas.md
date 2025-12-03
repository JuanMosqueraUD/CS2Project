# Manual de Usuario: Estructuras Dinámicas

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
