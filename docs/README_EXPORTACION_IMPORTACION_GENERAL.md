# Documentación: Exportación e Importación de Estructuras - Sistema Completo

## Descripción General

El sistema de exportación e importación permite guardar y cargar todas las estructuras de datos implementadas en el proyecto CS2, manteniendo su configuración específica y datos almacenados. Incluye tanto búsquedas internas (lineal, binaria, hash) como árboles de residuos (simple, múltiple, digital), cada una con restricciones particulares que se validan durante la importación para asegurar la integridad de los datos.

## Características Principales

### ✅ Funcionalidades Implementadas
- **Exportación a JSON**: Guarda la estructura completa con metadatos
- **Importación desde JSON**: Carga estructuras con validación estricta
- **Validación de tipos**: Verifica que el archivo corresponda al tipo correcto
- **Validación de restricciones**: Cada estructura mantiene sus reglas específicas
- **Metadatos incluidos**: Versión, timestamp y configuración completa
- **Interfaz integrada**: Botones de exportar/importar en cada vista
- **Soporte completo**: Búsquedas internas y árboles de residuos

### 🔒 Restricciones por Tipo de Estructura

#### Búsquedas Internas

**Búsqueda Lineal**
- **Tipo**: `"lineal"`
- **Capacidad**: Cualquier número entero positivo
- **Restricciones**:
  - Elementos deben tener el mismo número de dígitos especificado
  - No se permite cambiar la capacidad o número de dígitos al importar
  - Se mantiene el orden de inserción

**Búsqueda Binaria**
- **Tipo**: `"binaria"`
- **Capacidad**: Cualquier número entero positivo
- **Restricciones**:
  - Elementos deben tener el mismo número de dígitos especificado
  - **Los datos deben estar ordenados** (validación crítica)
  - No se permite cambiar la capacidad o número de dígitos al importar
  - Se valida que los elementos no-null estén en orden ascendente

**Tablas Hash**
- **Tipo**: `"hash"`
- **Capacidades permitidas**: Solo 10, 100 o 1000
- **Restricciones**:
  - **Función hash debe coincidir**: mod, cuadrado, truncamiento, plegamiento
  - **Estrategia de colisión debe coincidir**: lineal, cuadrática, doble-hash, arreglos, encadenamiento
  - **Capacidad debe coincidir** con la configuración original
  - Elementos deben tener el mismo número de dígitos especificado
  - Se importan buckets de encadenamiento y capas de arreglos anidados

#### Árboles de Residuos

**Árbol de Residuos Simple**
- **Tipo**: `"residuo-simple"`
- **Restricciones**:
  - Trabaja exclusivamente con letras A-Z
  - dígitos por clave fijo en 1 (un carácter)
  - Estructura de árbol binario con nodos que pueden tener clave null (conectores)
  - Se preserva la estructura completa del árbol

**Árbol de Residuos Múltiple**
- **Tipo**: `"residuo-multiple"`
- **Restricciones**:
  - Trabaja exclusivamente con letras A-Z
  - **Base (m) debe coincidir** con la configuración original
  - dígitos por clave fijo en 1 (un carácter)
  - Base debe ser un número entre 1 y 3
  - Se preserva la estructura completa del árbol multi-direccional

**Árbol Digital**
- **Tipo**: `"residuo-digital"`
- **Restricciones**:
  - Trabaja exclusivamente con letras A-Z
  - dígitos por clave fijo en 1 (un carácter)
  - Estructura de árbol binario con navegación por código binario
  - Se preserva la estructura completa del árbol

## Formatos de Exportación

### Búsquedas Internas

#### Estructura Lineal
```json
{
  "type": "lineal",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "capacidad": 10,
    "digitosClave": 3
  },
  "data": [123, 456, null, 789, null, null, null, null, null, null]
}
```

#### Estructura Binaria
```json
{
  "type": "binaria",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "capacidad": 10,
    "digitosClave": 3
  },
  "data": [123, 456, 789, null, null, null, null, null, null, null]
}
```

#### Estructura Hash
```json
{
  "type": "hash",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "capacidad": 10,
    "digitosClave": 3,
    "funcionHash": "mod",
    "estrategiaColision": "lineal"
  },
  "data": {
    "estructura": [123, null, 456, null, null, null, null, null, null, 789],
    "buckets": [[], [], [], [], [], [], [], [], [], [111, 222]],
    "arreglosLayers": [
      [null, null, null, null, null, null, null, null, null, 333]
    ]
  }
}
```

### Árboles de Residuos

#### Árbol de Residuos Simple
```json
{
  "type": "residuo-simple",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "digitosClave": 1
  },
  "data": {
    "key": "B",
    "left": {
      "key": "A",
      "left": null,
      "right": null
    },
    "right": {
      "key": null,
      "left": {
        "key": "C",
        "left": null,
        "right": null
      },
      "right": null
    }
  }
}
```

#### Árbol de Residuos Múltiple
```json
{
  "type": "residuo-multiple",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "base": 2,
    "digitosClave": 1
  },
  "data": {
    "key": "A",
    "children": [
      {
        "key": "B",
        "children": [null, null]
      },
      null
    ]
  }
}
```

#### Árbol Digital
```json
{
  "type": "residuo-digital",
  "version": "1.0",
  "timestamp": "2025-09-28T12:00:00.000Z",
  "config": {
    "digitosClave": 1
  },
  "data": {
    "key": "B",
    "left": {
      "key": "A",
      "left": null,
      "right": null
    },
    "right": {
      "key": "C",
      "left": null,
      "right": null
    }
  }
}
```

## Proceso de Exportación

### Pasos Automáticos
1. **Validación previa**: Verifica que hay una estructura creada
2. **Creación del objeto de exportación**: Incluye type, version, timestamp, config y data
3. **Generación del nombre del archivo**: Incluye tipo, configuración y fecha
4. **Descarga automática**: El navegador descarga el archivo JSON

### Nombres de Archivo Generados
- **Búsquedas internas**:
  - Lineal: `estructura_lineal_2025-09-28.json`
  - Binaria: `estructura_binaria_2025-09-28.json`
  - Hash: `estructura_hash_mod_lineal_2025-09-28.json`
- **Árboles de residuos**:
  - Simple: `estructura_residuo_simple_2025-09-28.json`
  - Múltiple: `estructura_residuo_multiple_2025-09-28.json`
  - Digital: `estructura_residuo_digital_2025-09-28.json`

## Proceso de Importación

### Validaciones Realizadas

#### 1. Validaciones de Formato
- ✅ Archivo debe ser JSON válido
- ✅ Debe tener propiedad `type` correcta
- ✅ Debe tener estructura `config` completa
- ✅ Debe tener estructura `data` válida

#### 2. Validaciones de Configuración
- ✅ Capacidad dentro de rangos permitidos
- ✅ Número de dígitos positivo
- ✅ Para hash: función hash y estrategia válidas

#### 3. Validaciones de Datos
- ✅ Elementos respetan el número de dígitos especificado
- ✅ Tamaño de datos coincide con capacidad
- ✅ Para binaria: datos están ordenados
- ✅ Para hash: buckets y layers tienen formato correcto

#### 4. Validaciones Específicas por Tipo

**Búsqueda Binaria:**
```javascript
// Validar que elementos no-null están ordenados
const nonNullElements = importData.data.filter(el => el !== null);
const isOrdered = nonNullElements.every((element, index, arr) => {
  return index === 0 || arr[index - 1] <= element;
});
```

**Tablas Hash:**
```javascript
// Validar buckets de encadenamiento
const validBuckets = importData.data.buckets.every(bucket => {
  return Array.isArray(bucket) && bucket.every(element => 
    typeof element === 'number' && validarInput(element, digitosClave).isError === false
  );
});
```

**Árboles de Residuos:**
```javascript
// Validar estructura recursiva de árbol
function validateTreeStructure(node, digitosClave) {
  if (!node || typeof node !== 'object') return { isValid: false };
  
  // Validar que tenga las propiedades esperadas
  if (!node.hasOwnProperty('key')) return { isValid: false };
  
  // Validar clave si existe (puede ser null para conectores)
  if (node.key !== null) {
    if (typeof node.key !== 'string' || !/^[A-Z]$/.test(node.key)) {
      return { isValid: false, error: "Las claves deben ser letras A-Z" };
    }
  }
  
  // Validar hijos según el tipo de árbol
  if (node.children && Array.isArray(node.children)) {
    // Árbol múltiple: validar children array
    for (const child of node.children) {
      if (child !== null) {
        const childValidation = validateTreeStructure(child, digitosClave);
        if (!childValidation.isValid) return childValidation;
      }
    }
  } else if (node.left !== undefined || node.right !== undefined) {
    // Árbol binario: validar left/right
    if (node.left && !validateTreeStructure(node.left, digitosClave).isValid) return { isValid: false };
    if (node.right && !validateTreeStructure(node.right, digitosClave).isValid) return { isValid: false };
  }
  
  return { isValid: true };
}
```

## Interfaz de Usuario

### Ubicación de Controles
- **Durante creación**: Opción "O importar estructura existente" con botón de importar
- **Con estructura creada**: Botones "📤 Exportar Estructura" y "📥 Importar Estructura"

### Mensajes de Retroalimentación
- ✅ Exportación exitosa: "Estructura exportada exitosamente."
- ✅ Importación exitosa: "Estructura importada exitosamente. Capacidad: X, Dígitos: Y"
- ❌ Errores específicos por validación fallada

### Warnings Especiales
Para tablas hash se muestra:
> ⚠️ Al importar se mantendrán la función hash, estrategia de colisión y capacidad del archivo.

## Casos de Uso

### 1. Backup de Estructuras
```
Estudiante crea estructura lineal con capacidad 100
Inserta varios elementos para pruebas
Exporta antes de hacer cambios experimentales
```

### 2. Compartir Configuraciones
```
Profesor crea tabla hash con configuración específica
Exporta la estructura con datos de ejemplo
Estudiantes importan para trabajar con la misma configuración
```

### 3. Comparación de Estrategias
```
Crear tabla hash con estrategia lineal, llenar con datos
Exportar estructura
Crear nueva con estrategia cuadrática
Importar mismos datos (validación fallará - correcto por diseño)
```

### 4. Casos de Prueba Específicos
```
Para búsqueda binaria:
- Exportar estructura ordenada
- Modificar manualmente JSON desordenando elementos
- Intentar importar → Error: "Los datos no están ordenados"

Para árboles de residuos:
- Exportar árbol con estructura completa
- Modificar manualmente JSON cambiando 'key' de letra a número
- Intentar importar → Error: "Las claves deben ser letras A-Z"

Para árbol múltiple:
- Exportar árbol con base m=2
- Modificar manualmente JSON cambiando 'base' a 4
- Intentar importar → Error: "La base debe ser un número entre 1 y 3"
```

## Manejo de Errores

### Errores Comunes y Soluciones

#### "Este archivo no contiene una estructura [tipo] válida"
- **Causa**: Archivo de tipo incorrecto (ej: importar hash en vista lineal)
- **Solución**: Usar el archivo en la vista correcta

#### "Algunos elementos no cumplen con las restricciones de dígitos"
- **Causa**: Elementos tienen diferente número de dígitos
- **Solución**: Verificar configuración de digitosClave

#### "Los datos no están ordenados" (solo binaria)
- **Causa**: Elementos no-null no están en orden ascendente
- **Solución**: Ordenar datos antes de exportar desde estructura binaria

#### "El tamaño de los datos no coincide con la capacidad"
- **Causa**: Array de datos tiene longitud diferente a capacidad
- **Solución**: Verificar integridad del archivo JSON

### Validación de Integridad
El sistema valida exhaustivamente para prevenir:
- 🚫 Mezclar tipos de estructuras
- 🚫 Cambiar configuraciones incompatibles
- 🚫 Datos corruptos o inconsistentes
- 🚫 Pérdida de restricciones específicas

## Consideraciones Técnicas

### Limitaciones Actuales
- No se valida la posición exacta de elementos en hash (colisiones pueden resolverse diferente)
- Archivos grandes (capacidad 1000) pueden tardar en procesar
- Solo formato JSON soportado

### Futuras Mejoras Sugeridas
- Validación de coherencia hash más estricta
- Soporte para archivos CSV
- Compresión para estructuras grandes
- Historial de versiones de archivos

## Ejemplos de Implementación

### Exportar Estructura
```typescript
function exportarEstructura() {
  if (!estructuraCreada.value) {
    errorMessage.value = "Primero debes crear una estructura para exportar.";
    return;
  }

  const exportData = {
    type: "lineal", // o "binaria" o "hash"
    version: "1.0",
    timestamp: new Date().toISOString(),
    config: { capacidad: capacidad.value, digitosClave: digitosClave.value },
    data: estructura.value
  };

  // Crear y descargar archivo
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  // ... resto de la implementación
}
```

### Validar Importación
```typescript
// Validaciones específicas por tipo
if (importData.type !== "lineal") {
  errorMessage.value = "Este archivo no contiene una estructura lineal válida.";
  return;
}

// Validar elementos
const validElements = importData.data.every((element: any) => {
  if (element === null) return true;
  const res = funciones.validarInput(element, importData.config.digitosClave);
  return !res.isError;
});
```

---

## Conclusión

El sistema de exportación/importación proporciona una funcionalidad robusta para persistir estructuras de datos manteniendo sus restricciones específicas. La validación estricta asegura que las estructuras importadas mantengan su integridad y funcionalidad original, siendo especialmente crítico para estructuras con requisitos específicos como el ordenamiento en búsqueda binaria o la coherencia de función hash en tablas hash.