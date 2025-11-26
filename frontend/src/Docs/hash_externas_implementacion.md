# Hash Externas - Módulo y Cuadrado

## Archivos Creados

### 1. HashModuloExterno.vue
**Ubicación**: `/frontend/src/views/external-searches/hash/HashModuloExterno.vue`

**Características implementadas**:
- ✅ Estructura de bloques usando fórmula ⌊√n⌋ 
- ✅ Función hash módulo para determinar bloque destino
- ✅ Búsqueda lineal dentro de cada bloque
- ✅ Numeración 1-indexed de bloques y elementos globales
- ✅ Renderizado condicional (elementos ocupados + primer/último para bloques >20)
- ✅ Opciones de resolución de colisiones (estructura-secundaria, area-colisiones)
- ✅ Validación de entrada en tiempo real
- ✅ Interfaz consistente con otras búsquedas externas

### 2. HashCuadradoExterno.vue
**Ubicación**: `/frontend/src/views/external-searches/hash/HashCuadradoExterno.vue`

**Características implementadas**:
- ✅ Estructura de bloques usando fórmula ⌊√n⌋
- ✅ Función hash cuadrado para determinar bloque destino
- ✅ Búsqueda lineal dentro de cada bloque
- ✅ Numeración 1-indexed de bloques y elementos globales
- ✅ Renderizado condicional (elementos ocupados + primer/último para bloques >20)
- ✅ Opciones de resolución de colisiones (estructura-secundaria, area-colisiones)
- ✅ Validación de entrada en tiempo real
- ✅ Interfaz consistente con otras búsquedas externas

## Algoritmos Implementados

### Algoritmo de Inserción
1. **Calcular hash**: Aplica función hash (módulo o cuadrado) sobre número de bloques
2. **Encontrar bloque**: El resultado del hash determina el bloque destino
3. **Inserción lineal**: Busca primera posición disponible en el bloque
4. **Manejo de colisiones**: Si bloque lleno, maneja según estrategia seleccionada

### Algoritmo de Búsqueda  
1. **Calcular hash**: Aplica función hash para encontrar bloque
2. **Búsqueda lineal**: Busca elemento secuencialmente dentro del bloque
3. **Resultado**: Retorna posición global si encuentra el elemento

### Algoritmo de Eliminación
1. **Buscar elemento**: Usa algoritmo de búsqueda
2. **Eliminar**: Si existe, coloca `null` en la posición
3. **Sin compactación**: Mantiene estructura del bloque

## Parámetros de Configuración

### Entrada Requerida
- **Capacidad**: Mínimo 10 elementos
- **Dígitos por clave**: Cantidad de dígitos permitidos
- **Resolución de colisiones**: Estructura secundaria o área de colisiones

### Cálculos Automáticos
- **Elementos por bloque**: ⌊√capacidad⌋
- **Número de bloques**: ⌈capacidad / elementos_por_bloque⌉
- **Índices globales**: (bloque × elementos_por_bloque) + posición + 1

## Funciones Hash Utilizadas

### Hash Módulo
```javascript
hashModuloBloque(clave) {
  return HashModulo(clave, numeroBloques)
}
```

### Hash Cuadrado
```javascript
hashCuadradoBloque(clave) {
  return HashCuadrado(clave, numeroBloques)
}
```

## Estado de Implementación

### ✅ Completado
- Estructura básica de bloques
- Funciones hash módulo y cuadrado
- Algoritmos de inserción, búsqueda y eliminación
- Interfaz de usuario consistente
- Validación de entrada
- Renderizado condicional
- Opciones de resolución de colisiones (UI)

### 🚧 Pendiente para Futuras Iteraciones
- **Estructura Secundaria**: Implementación del manejo de colisiones
- **Área de Colisiones**: Implementación del manejo de colisiones
- **Exportación/Importación**: Funciones temporalmente deshabilitadas
- **Hash Truncamiento**: Vista adicional
- **Hash Plegamiento**: Vista adicional

## Características Técnicas

### Renderizado Optimizado
- Bloques ≤20 elementos: Muestra todos
- Bloques >20 elementos: Solo primer/último + ocupados

### Numeración Consistente
- Bloques: 1, 2, 3, ..., n
- Elementos: Posición global 1 a capacidad_total

### Manejo de Errores
- Validación de capacidad mínima
- Verificación de elementos duplicados
- Detección de bloques llenos
- Mensajes informativos para usuario

### Interfaz Usuario
- Selección de estrategia de colisiones
- Vista previa de configuración
- Controles de importación/exportación preparados
- Resaltado sutil de bloques encontrados

## Próximos Pasos

1. **Implementar resolución de colisiones**:
   - Estructura secundaria con hash secundario
   - Área de colisiones con espacio adicional

2. **Agregar funciones hash adicionales**:
   - Hash por truncamiento
   - Hash por plegamiento

3. **Habilitar exportación/importación**:
   - Corregir rutas de módulos
   - Probar funciones de validación

4. **Optimizar rendimiento**:
   - Métricas de accesos a bloques
   - Estadísticas de colisiones