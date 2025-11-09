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

Las funciones hash externas determinan el bloque donde insertar/buscar un elemento. Se implementan 5 funciones hash:

1. **Hash Módulo**: `hash(clave) = clave % número_de_bloques`
2. **Hash Cuadrado**: Eleva la clave al cuadrado y extrae dígitos del centro
3. **Hash Plegamiento**: Divide la clave en grupos, los suma y aplica módulo
4. **Hash Truncamiento**: Selecciona dígitos en posiciones pares
5. **Hash Cambio de Base**: Convierte la clave a base 2-9 y extrae dígitos

Estrategias de resolución de colisiones:
- **Estructura Secundaria**: Bloques secundarios paralelos
- **Área de Colisiones**: Área adicional dentro de cada bloque

#### Estructuras Dinámicas

Tablas hash que se expanden/reducen automáticamente según la densidad de ocupación:
- **Expansión**: Cuando ocupación ≥ 75%
- **Reducción**: Cuando densidad ≤ 0.8 registros/cubeta
- **Reconstrucción de cubeta**: Al eliminar, los elementos se compactan automáticamente
- **Validación de claves**: Tamaño obligatorio de dígitos

> 📖 **Documentación detallada**: Ver [`docs/README_BUSQUEDAS_EXTERNAS.md`](docs/README_BUSQUEDAS_EXTERNAS.md)

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
