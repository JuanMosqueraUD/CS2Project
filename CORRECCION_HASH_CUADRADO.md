# Corrección de Errores - Hash Cuadrado Externo

## Problema identificado
Al intentar insertar claves en Hash Cuadrado Externo con configuración de 10 registros y 4 dígitos de longitud, se producían errores de TypeScript:
- `Cannot read properties of undefined`
- Acceso a índices de array inválidos
- Función HashCuadrado retornando NaN

## Causa raíz
1. **Función HashCuadrado defectuosa**: Con capacidades pequeñas (como 4 bloques), la función podía generar cadenas vacías al extraer dígitos del medio, resultando en `parseInt("")` = `NaN`
2. **Falta de validación de índices**: No se validaba que los índices calculados por hash estuvieran dentro del rango válido de la estructura
3. **Acceso a arrays sin verificación**: Se accedía directamente a `estructura.value[bloqueHash]` sin verificar que el índice fuera válido

## Configuración problemática específica
- **Capacidad**: 10 elementos
- **Elementos por bloque**: ⌊√10⌋ = 3
- **Número de bloques**: ⌈10/3⌉ = 4
- **Longitud de clave**: 4 dígitos

Con esta configuración, HashCuadrado(clave, 4) podía generar:
- `digitos = 4.toString().length - 1 = 0`
- Extracción de 0 dígitos del medio = cadena vacía
- `parseInt("")` = `NaN`
- `NaN % 4` = `NaN`

## Correcciones implementadas

### 1. Función HashCuadrado corregida (`funciones.ts`)
```typescript
export function HashCuadrado(clave: number, capacidad: number): number {
  const cuadrado = clave * clave;
  const cuadradoStr = cuadrado.toString().padStart(capacidad.toString().length * 2, '0');
  const digitos = Math.max(1, capacidad.toString().length - 1); // ← MÍNIMO 1
  const totalLen = cuadradoStr.length;
  const start = Math.floor((totalLen - digitos) / 2);
  const medio = cuadradoStr.substring(start, start + digitos);
  
  // ← VALIDACIÓN DE CADENA VACÍA
  if (!medio || medio.length === 0) {
    const fallback = cuadradoStr.slice(-digitos);
    const valor = parseInt(fallback) || 0;
    return valor % capacidad;
  }
  
  const valor = parseInt(medio);
  // ← VALIDACIÓN DE NaN
  if (isNaN(valor)) {
    return clave % capacidad;
  }
  
  return valor % capacidad;
}
```

### 2. Funciones hash de bloque con validación
**HashCuadradoExterno.vue y HashModuloExterno.vue:**
```typescript
const hashCuadradoBloque = (clave: number): number => {
  const hash = funciones.HashCuadrado(clave, numeroBloques.value);
  // ← VALIDACIÓN DE RANGO
  if (isNaN(hash) || hash < 0 || hash >= numeroBloques.value) {
    return clave % numeroBloques.value; // Fallback seguro
  }
  return hash;
};
```

### 3. Validación de índices en todas las operaciones
**Inserción:**
```typescript
const bloqueHash = hashCuadradoBloque(elemento);
// ← VERIFICACIÓN DE ÍNDICE VÁLIDO
if (bloqueHash < 0 || bloqueHash >= estructura.value.length) {
  errorMessage.value = `Error: Índice de bloque inválido (${bloqueHash}).`;
  return false;
}
```

**Búsqueda:**
```typescript
const bloqueHash = hashCuadradoBloque(elemento);
// ← VERIFICACIÓN DE ÍNDICE VÁLIDO
if (bloqueHash < 0 || bloqueHash >= estructura.value.length) {
  return { encontrado: false, bloque: bloqueHash, posicion: -1, esSecundario: false };
}
```

### 4. Verificación de existencia de bloques
**En función insertar:**
```typescript
// ← VERIFICACIÓN DE EXISTENCIA ANTES DE .every()
const bloquePrincipalLleno = estructura.value[bloqueHash] ? 
  estructura.value[bloqueHash].every(e => e !== null) : false;
```

## Archivos modificados
1. `/frontend/src/utils/funciones.ts` - Función HashCuadrado corregida
2. `/frontend/src/views/external-searches/hash/HashCuadradoExterno.vue` - Validaciones agregadas
3. `/frontend/src/views/external-searches/hash/HashModuloExterno.vue` - Validaciones agregadas (consistencia)

## Pruebas recomendadas
Después de estos cambios, prueba la configuración problemática:
1. Capacidad: 10
2. Dígitos por clave: 4
3. Insertar claves como: 1000, 1234, 5678, 9999

El sistema ahora debería:
- Calcular hash correctamente sin generar NaN
- Validar todos los índices antes de acceder a arrays
- Mostrar mensajes de error apropiados si hay problemas
- Usar fallbacks seguros cuando sea necesario

## Beneficios de la corrección
- ✅ Elimina errores de runtime por accesos a índices inválidos
- ✅ Función hash más robusta con fallbacks
- ✅ Validación consistente en ambas implementaciones (módulo y cuadrado)
- ✅ Mensajes de error informativos para debugging
- ✅ Mantiene funcionalidad completa de estructura secundaria