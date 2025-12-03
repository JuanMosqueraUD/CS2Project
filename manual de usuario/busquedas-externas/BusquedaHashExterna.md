# Manual de Usuario: Búsqueda Hash Externa (Módulo)

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
