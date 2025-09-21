# Búsquedas Internas, Hash y Estructuras Lineal/Binaria

Este documento resume la lógica implementada y las decisiones de diseño para ayudar a futuras consultas del agente y del equipo.

## Objetivos generales
- Reutilizar componentes y vistas cuando sea posible.
- Validar entradas del usuario (solo números/letras válidas) y comunicar claramente los resultados.
- Renderizado esparso (sparse) para grandes capacidades: mostrar extremos y posiciones ocupadas.

---

## Búsqueda Lineal (LinealView)
- Inserción y eliminación con mensajes que indican la posición afectada.
- Renderizado esparso mediante `displayIndices` para manejar listas grandes sin saturar la UI.
- Validaciones: conversión segura con `parseInt`, manejo de `NaN` y nulos.

### Posibles mejoras
- Animaciones de desplazamiento a la posición objetivo.
- Búsqueda incremental con resaltado.

---

## Búsqueda Binaria (BinariaView)
- Mantiene la lista ordenada y coloca `null` al final para evitar desorden visual.
- Mensajería consistente de inserción/borrado.
- Renderizado esparso similar a Lineal.

### Posibles mejoras
- Animar la división del rango medio.
- Modo step-by-step para docencia.

---

## Hash Unificado (HashMod)
- Una sola vista que soporta múltiples funciones hash a través de un indicador (query/prop):
  - Módulo, Truncamiento, Plegamiento.
- Estrategias de colisión (sondeo abierto):
  - Lineal, Cuadrática (intentos 1-based), Doble Hash (desplazamiento +2).
- Encadenamiento: buckets por índice, mostrados como chips.
- Arreglos/Listas anidadas: múltiples capas paralelas creadas bajo demanda para colisiones sucesivas. Limpieza de capas vacías.
- Mensajería de inserción/colisión detallada.
- Renderizado esparso que considera la estructura principal y todas las capas.

### Reglas específicas (truncamiento/plegamiento)
- Truncamiento y Plegamiento respetan la regla de ceros según la capacidad.
- Plegamiento re-trabajado para sumar partes y hacer `mod` de la capacidad.

### Utilidades
- `utils/funciones.ts`: funciones de hash y utilidades.
- `utils/colisiones.ts`: estrategias de sondeo.

### Posibles mejoras
- Exportar métricas (intentos, colisiones) para cada inserción.
- Permitir estrategia híbrida (encadenamiento + arreglos).

---

## Guías de estilo y UX
- Uso de colores sobrios (grises/azules) y acentos sutiles (amarillo para highlights).
- Badges y chips para información rápida.
- Inputs con validación inmediata y mensajes concisos.

---

## Rutas y Navegación
- Menú de navegación con secciones de Búsquedas Internas y Hash unificados.
- Rutas nombradas para permitir query params y props.

---

## Testing manual sugerido
- Insertar y borrar elementos extremos; verificar renderizado esparso.
- Probar todas las estrategias de colisión y capacidades grandes.
- Verificar orden y colocación de `null` en binaria.
