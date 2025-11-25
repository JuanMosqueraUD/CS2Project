# Guía Completa de Pruebas - Hash Externo con Resolución de Colisiones

## ¿Qué se ha implementado?

Se han implementado **dos métodos de resolución de colisiones** para las búsquedas Hash Externas:

### 1. Estructura Secundaria
- Aparece **solo cuando es necesaria** (cuando un bloque se llena)
- Se muestra **al lado derecho** de la estructura principal
- **Misma configuración** que la estructura principal
- Colores **verdes** para diferenciación

### 2. Área de Colisiones
- **Siempre visible** dentro de cada bloque
- Cada bloque contiene **área principal + área de colisiones**
- Colores **amarillos/naranjas** para el área de colisiones
- Elementos marcados con prefijo **"C"** (C1, C2, etc.)

### 3. Control de Capacidad
- **Límite estricto** según la capacidad configurada inicialmente
- Contador visible: **(elementos_insertados/capacidad_total)**
- Impide inserciones cuando se alcanza el límite

## Cómo probar la implementación

### Configuración recomendada para pruebas
- **Capacidad**: 10 elementos
- **Dígitos por clave**: 2
- Esto creará: **4 bloques** con **3 elementos por bloque**

### Prueba 1: Método "Estructura Secundaria"

#### Paso 1: Configurar
1. Navegar a `/external/hash/modulo` o `/external/hash/cuadrado`
2. Configurar: Capacidad=10, Dígitos=2, Resolución="Estructura Secundaria"
3. Crear estructura

#### Paso 2: Llenar un bloque
**Para Hash Módulo** (elementos que van al Bloque 2):
```
Insertar: 05, 09, 13
```
Estos elementos irán al Bloque 2 (5%4=1, 9%4=1, 13%4=1)

#### Paso 3: Forzar colisión
```
Insertar: 17
```
- Bloque 2 se llena
- Aparece mensaje: "Colisión en bloque 2. Insertado 17 en estructura secundaria"
- **Aparece estructura secundaria** al lado derecho con colores verdes

#### Paso 4: Continuar insertando
```
Insertar: 21, 25
```
- Van a la estructura secundaria, Bloque 2

### Prueba 2: Método "Área de Colisiones"

#### Paso 1: Cambiar configuración
1. Cambiar Resolución a "Área de Colisiones"
2. Crear nueva estructura

#### Paso 2: Observar estructura inicial
- Cada bloque muestra:
  - **Área Principal** (arriba)
  - **Área de Colisiones** (abajo, colores amarillos)
- Ambas áreas siempre visibles

#### Paso 3: Llenar área principal
```
Insertar: 05, 09, 13
```
- Van al área principal del Bloque 2

#### Paso 4: Forzar colisión
```
Insertar: 17
```
- Área principal del Bloque 2 se llena
- Mensaje: "Colisión en bloque 2. Insertado 17 en área de colisiones"
- Elemento aparece en área de colisiones con etiqueta **"C1"**

#### Paso 5: Continuar en área de colisiones
```
Insertar: 21, 25
```
- Van al área de colisiones, etiquetas "C2", "C3"

### Prueba 3: Control de Capacidad

#### Configuración: Capacidad 10
```
Insertar elementos hasta llegar a 10/10
```

#### Intentar insertar el elemento 11:
- Mensaje: "Capacidad máxima alcanzada (10 elementos)"
- **No permite más inserciones** aunque haya espacio físico en bloques

### Prueba 4: Operaciones de Búsqueda y Eliminación

#### Buscar elementos en diferentes ubicaciones:
- **En área principal**: Mensaje normal
- **En área de colisiones**: "(Encontrado en área de colisiones)"
- **En estructura secundaria**: "(Encontrado en estructura secundaria)"

#### Eliminar elementos:
- Muestra de dónde se eliminó: "principal", "área de colisiones", "secundaria"
- Actualiza contador: "(9/10)" después de eliminar

### Prueba 5: Hash Cuadrado vs Hash Módulo

#### Comparar distribución:
**Hash Módulo** con claves: 04, 08, 12, 16, 20
- Todas van al mismo bloque (resto 0)
- Fuerza colisiones fácilmente

**Hash Cuadrado** con claves: 12, 13, 87, 88
- Distribución puede ser diferente
- Observar cómo se comportan las colisiones

### Prueba 6: Renderizado Condicional con Muchos Elementos

#### Configuración especial:
- **Capacidad**: 100 elementos
- **Elementos por bloque**: 10 (⌊√100⌋)
- Insertar muchos elementos para probar el renderizado optimizado

#### Observar:
- Solo se muestran **primer, último y elementos ocupados**
- Tanto en área principal como en área de colisiones
- Performance mantenida con estructuras grandes

## Resultados esperados

### ✅ Estructura Secundaria
- Aparece solo cuando es necesaria
- Dos estructuras lado a lado
- Colores diferenciados (azul/verde)
- Misma numeración de posiciones

### ✅ Área de Colisiones
- Siempre visible en cada bloque
- Áreas claramente separadas
- Colores diferenciados (azul/amarillo)
- Numeración con prefijo "C"

### ✅ Control de Capacidad
- Respeta límite configurado
- Contador siempre actualizado
- Previene inserciones excesivas

### ✅ Funcionalidad Completa
- Inserción con manejo de colisiones
- Búsqueda en todas las áreas
- Eliminación con ubicación específica
- Mensajes informativos apropiados

## Archivos implementados

- `frontend/src/views/external-searches/hash/HashModuloExterno.vue` - Completo
- `frontend/src/views/external-searches/hash/HashCuadradoExterno.vue` - Completo
- `docs/README_BUSQUEDAS_EXTERNAS.md` - Documentación actualizada

## Ventajas de la implementación

1. **Educativo**: Muestra claramente dos enfoques diferentes de resolución de colisiones
2. **Visual**: Fácil comprensión con colores y etiquetas diferenciadas
3. **Robusto**: Control estricto de capacidad y validación de errores
4. **Consistente**: Misma implementación en ambas funciones hash
5. **Escalable**: Renderizado optimizado para estructuras grandes

¡La implementación está completa y lista para uso! 🎉