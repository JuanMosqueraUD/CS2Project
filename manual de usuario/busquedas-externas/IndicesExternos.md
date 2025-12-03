# Manual de Usuario: Índices Externos

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
