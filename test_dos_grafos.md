# Pruebas de Funcionalidad - OperacionesDosGrafos.vue

## Casos de Prueba

### 1. Crear Grafos
**Pasos:**
1. Navegar al módulo "Operaciones entre 2 Grafos"
2. Ingresar cantidad de nodos G1: 4
3. Ingresar cantidad de nodos G2: 5
4. Hacer clic en "Crear Grafos"

**Resultado Esperado:**
- ✅ G1 debe mostrar 4 nodos (1,2,3,4) en color azul
- ✅ G2 debe mostrar 5 nodos (1,2,3,4,5) en color verde
- ✅ Ambos grafos se muestran lado a lado
- ✅ Los contadores muestran correctamente el número de nodos

### 2. Agregar Arista a G1
**Pasos:**
1. Selector debe estar en "G1"
2. Ingresar en campo de arista: "12"
3. Hacer clic en "Agregar Arista"

**Resultado Esperado:**
- ✅ Aparece una línea conectando nodos 1 y 2 en G1 (color azul)
- ✅ G2 NO debe cambiar
- ✅ Notación de conjunto: G1 debe mostrar A₁ = {(1, 2)}
- ✅ Contador de aristas G1 debe incrementar a 1

### 3. Agregar Arista a G2
**Pasos:**
1. Cambiar selector a "G2"
2. Ingresar en campo de arista: "23"
3. Hacer clic en "Agregar Arista"

**Resultado Esperado:**
- ✅ Aparece línea entre nodos 2 y 3 en G2 (color verde)
- ✅ G1 debe mantener su arista (1-2)
- ✅ Notación de conjunto: G2 debe mostrar A₂ = {(2, 3)}
- ✅ Contador de aristas G2 debe incrementar a 1

### 4. Agregar Múltiples Aristas
**Pasos:**
1. En G1, agregar aristas: "13", "24", "34"
2. En G2, agregar aristas: "14", "25", "35"

**Resultado Esperado:**
- ✅ G1 debe mostrar 4 aristas en total (1-2, 1-3, 2-4, 3-4)
- ✅ G2 debe mostrar 4 aristas en total (2-3, 1-4, 2-5, 3-5)
- ✅ Los colores se mantienen diferenciados
- ✅ Notación actualizada correctamente

### 5. Insertar Nodo
**Pasos:**
1. Con selector en G1, hacer clic "Agregar Nodo"
2. Con selector en G2, hacer clic "Agregar Nodo"

**Resultado Esperado:**
- ✅ G1 ahora debe tener 5 nodos (1,2,3,4,5)
- ✅ G2 ahora debe tener 6 nodos (1,2,3,4,5,6)
- ✅ Las aristas existentes se mantienen

### 6. Eliminar Nodo
**Pasos:**
1. Con selector en G1, ingresar "2" en campo eliminar nodo
2. Hacer clic "Eliminar"

**Resultado Esperado:**
- ✅ Nodo 2 desaparece de G1
- ✅ Las aristas conectadas a nodo 2 se eliminan (1-2 y 2-4)
- ✅ G1 ahora tiene 4 nodos y 2 aristas
- ✅ G2 no cambia

### 7. Eliminar Arista
**Pasos:**
1. Con selector en G2, ingresar "23" en campo eliminar arista
2. Hacer clic "Borrar"

**Resultado Esperado:**
- ✅ Línea entre nodos 2 y 3 desaparece de G2
- ✅ G2 tiene 6 nodos y 3 aristas
- ✅ G1 no cambia

### 8. Guardar y Cargar Grafos
**Pasos:**
1. Hacer clic "Guardar Grafos"
2. Descargar archivo JSON
3. Resetear grafos
4. Importar el JSON descargado

**Resultado Esperado:**
- ✅ Se descarga un archivo `grafos_[timestamp].json`
- ✅ Tras importar, ambos grafos se restauran exactamente como estaban
- ✅ Notación de conjuntos se restaura correctamente

### 9. Resetear Grafos
**Pasos:**
1. Hacer clic "Resetear Grafos"
2. Confirmar en el diálogo

**Resultado Esperado:**
- ✅ Se regresa a la pantalla de creación
- ✅ Campos de cantidad de nodos se resetean
- ✅ Se puede crear nuevos grafos

## Verificaciones Críticas

### Visualización Gráfica
- [ ] G1 siempre en color AZUL (#3b82f6)
- [ ] G2 siempre en color VERDE (#10b981)
- [ ] Colores NO se intercambian
- [ ] Cada grafo muestra sus propios nodos y aristas

### Notación de Conjuntos
- [ ] V₁ muestra nodos de G1
- [ ] A₁ muestra aristas de G1
- [ ] V₂ muestra nodos de G2
- [ ] A₂ muestra aristas de G2
- [ ] Formato correcto con paréntesis: (nodo1, nodo2)

### Independencia de Grafos
- [ ] Operaciones en G1 NO afectan G2
- [ ] Operaciones en G2 NO afectan G1
- [ ] Aristas de G1 NO aparecen en G2 y viceversa
- [ ] Nodos de diferentes cantidades se mantienen

### IDs y Referencias
- [ ] No hay conflictos de IDs entre grafos
- [ ] Cada arista tiene un ID único
- [ ] Nodos mantienen sus IDs originales

