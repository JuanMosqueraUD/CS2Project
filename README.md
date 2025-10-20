# Computer Science 2 - Final Project

Proyecto final de Ciencias de la Computación 2 que implementa diversas estructuras de datos y algoritmos de búsqueda.

## Estructuras Implementadas

### Búsquedas Internas
- **Búsqueda Lineal**: Búsqueda secuencial en estructuras no ordenadas
- **Búsqueda Binaria**: Búsqueda eficiente en estructuras ordenadas
- **Tablas Hash**: Con múltiples funciones hash y estrategias de resolución de colisiones

### Búsquedas Externas

Las búsquedas externas organizan los datos en bloques utilizando la fórmula **⌊√n⌋** para determinar:
- **Elementos por bloque**: ⌊√capacidad⌋
- **Número de bloques**: ⌈capacidad / elementos_por_bloque⌉

#### Búsqueda Lineal Externa
Organiza elementos en bloques secuenciales. Búsqueda lineal dentro de cada bloque.

#### Búsqueda Binaria Externa
Organiza elementos ordenados en bloques. Primero busca el bloque correcto, luego búsqueda binaria dentro del bloque.

#### Hash Externas

Las funciones hash externas determinan el bloque donde insertar/buscar un elemento. Se ofrecen dos estrategias de resolución de colisiones:

1. **Estructura Secundaria**: Bloques secundarios para elementos que no caben en el bloque principal
2. **Área de Colisiones**: Área adicional dentro de cada bloque para manejar colisiones

##### 1. Hash Módulo Externa

**Descripción**: Utiliza el operador módulo para determinar el bloque.

**Fórmula**:
```
hash(clave) = clave % número_de_bloques
```

**Ejemplo**:
- Capacidad: 100 elementos
- Elementos por bloque: ⌊√100⌋ = 10
- Número de bloques: 10
- Clave 1234 → 1234 % 10 = 4 → Bloque 4

##### 2. Hash Cuadrado Externa

**Descripción**: Eleva la clave al cuadrado y extrae dígitos del centro.

**Proceso**:
1. Elevar la clave al cuadrado
2. Convertir a cadena
3. Extraer dígitos centrales según la cantidad necesaria
4. Aplicar módulo para asegurar rango válido

**Ejemplo**:
- Clave: 123
- Cuadrado: 123² = 15129
- Cadena: "15129" (5 dígitos)
- Si necesitamos 2 dígitos: extraer centro → "12"
- Resultado: 12 % número_de_bloques

##### 3. Hash Plegamiento Externa

**Descripción**: Divide la clave en grupos de dígitos, los suma y aplica módulo.

**Proceso**:
1. Determinar tamaño de grupos: `Math.floor(Math.log10(número_de_bloques))`
2. Dividir la clave en grupos de ese tamaño
3. Sumar todos los grupos
4. Aplicar módulo

**Ejemplo con 100 bloques (2 dígitos por grupo)**:
- Clave: 12345678
- Grupos: [12, 34, 56, 78]
- Suma: 12 + 34 + 56 + 78 = 180
- Resultado: 180 % 100 = 80 → Bloque 80

**Ejemplo con 4 bloques (1 dígito por grupo)**:
- Clave: 1111
- Grupos: [1, 1, 1, 1]
- Suma: 1 + 1 + 1 + 1 = 4
- Resultado: 4 % 4 = 0 → Bloque 0

##### 4. Hash Truncamiento Externa

**Descripción**: Selecciona dígitos en posiciones pares (contadas desde 1).

**Proceso**:
1. Convertir clave a cadena
2. Extraer dígitos en posiciones pares: posición 2, 4, 6, 8...
3. (En índice 0-based: índices 1, 3, 5, 7...)
4. Concatenar y aplicar módulo

**Ejemplo**:
- Clave: 123456
- Posiciones (1-based): 1:1, 2:2, 3:3, 4:4, 5:5, 6:6
- Extraer pares: 2, 4, 6
- Resultado: 246 % número_de_bloques

##### 5. Hash Cambio de Base Externa ⭐ NUEVO

**Descripción**: Convierte la clave a una base numérica diferente (2-9) y extrae los dígitos menos significativos.

**Proceso**:
1. Seleccionar una base entre 2 y 9
2. Para cada dígito de la clave, multiplicar por base^posición
3. Sumar todos los resultados
4. Extraer los dígitos menos significativos según el número de bloques
5. Aplicar módulo para garantizar el rango

**Fórmula**:
```
Para clave = d₁d₂d₃...dₙ en base b:
valor = d₁ × b^(n-1) + d₂ × b^(n-2) + ... + dₙ × b^0
```

**Ejemplos**:

**Ejemplo 1: Base 9 con clave 1234**
- d₁=1, d₂=2, d₃=3, d₄=4
- Conversión: 1×9³ + 2×9² + 3×9¹ + 4×9⁰
  - 1 × 729 = 729
  - 2 × 81 = 162
  - 3 × 9 = 27
  - 4 × 1 = 4
- Suma: 729 + 162 + 27 + 4 = 922
- Si hay 10 bloques (1 dígito): extraer último = 2 → Bloque 2
- Si hay 100 bloques (2 dígitos): extraer últimos 2 = 22 → Bloque 22

**Ejemplo 2: Base 7 con clave 555**
- Conversión: 5×7² + 5×7¹ + 5×7⁰
  - 5 × 49 = 245
  - 5 × 7 = 35
  - 5 × 1 = 5
- Suma: 245 + 35 + 5 = 285
- Con 10 bloques: 285 % 10 = 5 → Bloque 5

**Ejemplo 3: Base 2 con clave 1010**
- Conversión: 1×2³ + 0×2² + 1×2¹ + 0×2⁰
  - 1 × 8 = 8
  - 0 × 4 = 0
  - 1 × 2 = 2
  - 0 × 1 = 0
- Suma: 8 + 0 + 2 + 0 = 10
- Con 16 bloques: 10 % 16 = 10 → Bloque 10

**Ventajas**:
- Distribución diferente según la base elegida
- Más opciones de ajuste fino para distribución de datos
- Útil cuando se conoce el patrón de las claves

### Árboles de Residuos
- **Residuo Simple**: Árbol binario de residuos
- **Residuo Múltiple**: Árbol n-ario basado en residuos con base configurable
- **Residuo Digital**: Árbol digital de residuos
- **Residuo Huffman**: Árbol de Huffman con códigos optimizados

## Funcionalidades

### Operaciones Básicas
- **Insertar**: Agregar elementos a la estructura
- **Buscar**: Localizar elementos en la estructura
- **Eliminar**: Remover elementos de la estructura

### Exportación e Importación
Todas las estructuras soportan:
- **Exportar**: Guardar la estructura completa en formato JSON
- **Importar**: Cargar estructura desde archivo JSON con validación estricta

La validación de importación asegura que:
- El tipo de estructura coincida exactamente
- La configuración (capacidad, dígitos, función hash, etc.) sea válida
- Los datos tengan el formato correcto
- Para hash externas: la función hash y base (si aplica) coincidan

## Tecnologías Utilizadas
- **Vue 3**: Framework de JavaScript para la interfaz
- **TypeScript**: Tipado estático para mayor seguridad
- **Vite**: Herramienta de construcción rápida
- **Pico CSS**: Framework CSS minimalista

## Instalación y Uso

```bash
# Instalar dependencias
cd frontend
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build
```

## Autor
Proyecto desarrollado como parte del curso de Ciencias de la Computación 2
