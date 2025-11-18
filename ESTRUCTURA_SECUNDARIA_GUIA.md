# Estructura Secundaria en Hash Externo - Guía de Pruebas

## ¿Qué se implementó?

Se ha implementado la **solución de colisiones por estructura secundaria** para las búsquedas Hash Externas (Módulo y Cuadrado). Esta mejora permite manejar colisiones cuando un bloque se llena completamente.

## Características implementadas

### 1. Estructura Secundaria
- **Se activa automáticamente** cuando un bloque de la estructura principal se llena
- **Misma configuración** que la estructura principal (mismo número de bloques y elementos por bloque)
- **Visualización lado a lado** con la estructura principal
- **Solo aparece cuando es necesaria** (no se muestra hasta que ocurre la primera colisión por bloque lleno)

### 2. Funcionalidad Completa
- **Inserción**: Intenta primero en estructura principal, luego en secundaria si es necesario
- **Búsqueda**: Busca en ambas estructuras (principal y secundaria si está activa)
- **Eliminación**: Elimina de la estructura correcta y muestra dónde se encontró el elemento

### 3. Visualización Mejorada
- **Estructura Principal**: Lado izquierdo, colores azules
- **Estructura Secundaria**: Lado derecho, colores verdes
- **Mensajes informativos**: Indican cuándo se usa la estructura secundaria
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Cómo probar la implementación

### Paso 1: Acceder a las vistas
- Navega a `/external/hash/modulo` para Hash Módulo Externo
- O navega a `/external/hash/cuadrado` para Hash Cuadrado Externo

### Paso 2: Configurar una estructura de prueba
- **Capacidad**: 16 (recomendado para pruebas rápidas)
- **Dígitos por clave**: 2
- **Resolución de colisiones**: Estructura Secundaria (ya viene seleccionado)

Esto creará:
- 4 bloques con 4 elementos cada uno
- Estructura principal visible inicialmente

### Paso 3: Probar colisiones en Hash Módulo
Inserta elementos que vayan al mismo bloque para forzar colisiones:

**Bloque 1** (elementos con resto 0 al dividir por 4):
```
4, 8, 12, 16, 20
```

**Bloque 2** (elementos con resto 1 al dividir por 4):
```
5, 9, 13, 17, 21
```

### Paso 4: Observar el comportamiento
1. **Primeras 4 inserciones**: Van a la estructura principal
2. **Quinta inserción**: El bloque se llena, aparece mensaje "Colisión en bloque X. Insertado Y en estructura secundaria"
3. **Estructura secundaria aparece**: Se muestra al lado derecho con colores verdes
4. **Siguientes inserciones**: Van a la estructura secundaria del mismo bloque

### Paso 5: Probar búsqueda y eliminación
- **Buscar elementos**: Los encuentra en ambas estructuras, indica en cuál está
- **Eliminar elementos**: Especifica de qué estructura se eliminó

## Ejemplo de prueba paso a paso

### Configuración
- Capacidad: 16
- Dígitos por clave: 2
- Hash Módulo

### Secuencia de inserción
```
1. Insertar 05 → Bloque 2, Estructura Principal
2. Insertar 09 → Bloque 2, Estructura Principal  
3. Insertar 13 → Bloque 2, Estructura Principal
4. Insertar 17 → Bloque 2, Estructura Principal
5. Insertar 21 → ¡COLISIÓN! → Bloque 2, Estructura Secundaria (aparece)
6. Insertar 25 → Bloque 2, Estructura Secundaria
```

### Resultado esperado
- **Estructura Principal Bloque 2**: [5, 9, 13, 17]
- **Estructura Secundaria Bloque 2**: [21, 25, _, _]
- **Visualización**: Dos estructuras lado a lado

## Beneficios de esta implementación

1. **Educativo**: Muestra claramente cómo se resuelven las colisiones
2. **Visual**: Fácil de entender con las dos estructuras lado a lado
3. **Consistente**: Mantiene la misma lógica hash para ambas estructuras
4. **Escalable**: Permite manejar más elementos de forma organizada

## Archivos modificados

- `frontend/src/views/external-searches/hash/HashModuloExterno.vue`
- `frontend/src/views/external-searches/hash/HashCuadradoExterno.vue`
- `docs/README_BUSQUEDAS_EXTERNAS.md`

## Documentación actualizada

La documentación en `docs/README_BUSQUEDAS_EXTERNAS.md` ahora incluye:
- Explicación completa de la estructura secundaria
- Ejemplos prácticos de resolución de colisiones
- Métricas de rendimiento
- Complejidad temporal
- Ventajas del método implementado