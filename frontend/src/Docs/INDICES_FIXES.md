# Correcciones en IndicesView

## Cálculo de Apuntadores Dinámicos

### Problema Original
Los apuntadores en la estructura de índices no calculaban correctamente el bloque o registro destino. Usaban `bloqueIdx + 1` lo cual solo consideraba el índice del bloque de índices, no la posición global del registro dentro de toda la estructura.

### Solución Implementada
Los apuntadores ahora usan `getNumeroEntradaGlobal(bloqueIdx, entIdx)` que calcula:
```
numeroGlobal = bloqueIdx * bfri + entIdx + 1
```

Esto asegura que:
- En **índices primarios**: cada entrada apunta al bloque correcto de la estructura principal
- En **índices secundarios**: cada entrada apunta al registro correcto de la estructura principal
- En **multinivel**: cada nivel apunta correctamente al bloque correspondiente del nivel inferior

## Renderizado del Último Bloque

### Problema Original
El último bloque de índices renderizaba todos sus registros (primero y último), incluso cuando algunos apuntaban a bloques/registros inexistentes en la estructura destino.

### Solución Implementada
Se creó la función `getRegistrosARenderizarConLimite()` que:
- Recibe el bloque de índices, su índice y el límite de la estructura destino
- Calcula qué registros del bloque apuntan a destinos válidos
- Solo renderiza registros cuyos apuntadores no excedan el límite

Límites por tipo:
- **Índice Primario**: limita a `estructura.b` (número de bloques en estructura principal)
- **Índice Secundario**: limita a `config.r` (número de registros totales)
- **Multinivel**: cada nivel calcula su límite según el tamaño del nivel inferior

## Numeración Global Continua

### Problema Original
Los registros en estructuras de índices se numeraban reiniciando en cada bloque, mostrando múltiples "E1", "E2", etc.

### Solución Implementada
Todos los registros de índices ahora usan numeración global continua:
```
numeroGlobal = bloqueIdx * bfri + entIdx + 1
```

Esto resulta en una numeración como: E1, E2, E3... E13 (bloque 1), E14, E15... E26 (bloque 2), etc.

Esta numeración se aplica a:
- Estructura simple de índices
- Todos los niveles en estructura multinivel
- Tanto índices primarios como secundarios

## Aplicación en Multinivel

### Cálculo de Límites por Nivel
La función `getLimiteDestinoMultinivel()` determina el límite para cada nivel:
- **Nivel 1** (más bajo): límite = bloques en estructura principal (primario) o registros totales (secundario)
- **Niveles superiores**: límite = número de bloques del nivel inferior × bfri

Cada nivel de índices usa este límite para renderizar solo los registros que apuntan a destinos válidos en el nivel inferior.
