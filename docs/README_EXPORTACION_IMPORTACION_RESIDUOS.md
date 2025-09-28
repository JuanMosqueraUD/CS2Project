# Exportación e Importación de Árboles de Residuos Múltiples

Este documento describe las funcionalidades de exportación e importación implementadas para los árboles de residuos múltiples, permitiendo persistir y recuperar configuraciones completas de árboles.

## Funcionalidades Implementadas

### ✅ Exportación de Configuración

La función `exportTreeConfig()` permite guardar el estado completo de un árbol de residuos múltiples en un archivo JSON.

**Características:**
- **Formato**: Archivo JSON con extensión `.json`
- **Nombre automático**: `residuo-multiple-m{valor_m}-{fecha}.json`
- **Contenido completo**: Configuración, estructura del árbol y metadata

#### Estructura del archivo exportado:
```json
{
  "version": "1.0",
  "m": 2,
  "timestamp": "2025-09-28T15:30:45.123Z",
  "tree": "{\"key\":null,\"code\":null,\"children\":[...]}",
  "letters": ["A", "B", "C"]
}
```

**Campos del archivo:**
- `version`: Versión del formato de exportación (para compatibilidad futura)
- `m`: Valor de m utilizado en la configuración del árbol
- `timestamp`: Fecha y hora de exportación en formato ISO
- `tree`: Estructura completa del árbol serializada como JSON string
- `letters`: Array ordenado alfabéticamente de todas las letras insertadas

### ✅ Importación de Configuración

La función `importTreeConfig(event)` permite cargar una configuración previamente exportada.

**Características:**
- **Validación**: Verifica formato y campos requeridos
- **Restauración completa**: Recrea el árbol con todas las letras insertadas
- **Manejo de errores**: Mensajes informativos en caso de problemas

#### Proceso de importación:
1. Selección del archivo JSON mediante input file
2. Validación del formato y estructura
3. Restauración del valor de m
4. Reconstrucción del árbol completo
5. Actualización de la interfaz

### 🎯 Casos de Uso

#### Exportación
```typescript
// La función se ejecuta automáticamente al hacer clic en "Exportar"
function exportTreeConfig() {
  if (!treeCreated.value || !root.value) {
    message.value = 'No hay árbol para exportar';
    return;
  }
  
  const config = {
    version: '1.0',
    m: m.value,
    timestamp: new Date().toISOString(),
    tree: JSON.stringify(root.value),
    letters: getAllInsertedLetters()
  };
  
  // Descarga automática del archivo
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  // ... lógica de descarga
}
```

#### Importación
```typescript
// Manejo del evento de selección de archivo
async function importTreeConfig(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  try {
    const config = JSON.parse(await file.text());
    
    // Validación de campos requeridos
    if (!config.version || !config.m || !config.tree) {
      throw new Error('Formato de archivo inválido');
    }
    
    // Restauración del estado
    m.value = config.m;
    root.value = JSON.parse(config.tree);
    treeCreated.value = true;
    showConfigPanel.value = false;
    
  } catch (error) {
    message.value = `Error al importar: ${error}`;
  }
}
```

## Interfaz de Usuario

### Botones de Herramientas
Se agregaron botones en la sección de herramientas para acceder a las funciones:

```vue
<!-- Sección de herramientas (visible solo cuando el árbol está creado) -->
<div class="tools-section">
  <div class="tools-buttons">
    <button @click="exportTreeConfig" class="tool-btn outline">
      📥 Exportar Configuración
    </button>
    <label class="import-btn tool-btn outline">
      📤 Importar Configuración
      <input type="file" accept=".json" @change="importTreeConfig" />
    </label>
  </div>
</div>
```

### Estados de la Interfaz
- **Exportación**: Habilitada solo cuando existe un árbol creado
- **Importación**: Disponible en cualquier momento
- **Retroalimentación**: Mensajes informativos sobre el resultado de las operaciones

## Beneficios

### 📚 Educativos
- **Compartir ejercicios**: Los instructores pueden crear configuraciones y compartirlas
- **Estudiar casos**: Los estudiantes pueden guardar y recuperar árboles específicos
- **Comparar estructuras**: Facilita el análisis de diferentes configuraciones de m

### 🔧 Técnicos
- **Persistencia**: Los datos no se pierden al cerrar la aplicación
- **Reproducibilidad**: Permite recrear exactamente el mismo estado del árbol
- **Versionado**: Sistema de versiones para compatibilidad futura

### 👥 Colaborativos
- **Intercambio**: Facilita compartir configuraciones entre usuarios
- **Respaldo**: Permite crear copias de seguridad de trabajos importantes
- **Portabilidad**: Los archivos JSON son legibles y editables

## Validaciones y Manejo de Errores

### Exportación
- ✅ Verificación de existencia del árbol
- ✅ Validación del estado de creación
- ✅ Generación automática de nombres únicos

### Importación
- ✅ Validación de formato JSON
- ✅ Verificación de campos requeridos (`version`, `m`, `tree`)
- ✅ Manejo de archivos corruptos o inválidos
- ✅ Restauración segura del estado

### Mensajes de Error Típicos
- `"No hay árbol para exportar"` - Intento de exportar sin árbol creado
- `"Formato de archivo inválido"` - JSON mal formado o campos faltantes
- `"Error al importar: [detalle]"` - Problemas específicos durante la importación

## Extensibilidad Futura

La estructura implementada permite fáciles extensiones:

### Próximas Funcionalidades Sugeridas
- **Compresión**: Reducir tamaño de archivos exportados
- **Encriptación**: Proteger configuraciones sensibles
- **Formatos múltiples**: Soporte para XML, CSV, etc.
- **Sincronización**: Integración con servicios en la nube
- **Historia**: Mantener versiones múltiples de un mismo árbol

### Compatibilidad de Versiones
El campo `version` en los archivos exportados permite:
- Migrar datos entre versiones de la aplicación
- Mantener compatibilidad hacia atrás
- Implementar conversores automáticos

## Consideraciones Técnicas

### Rendimiento
- ✅ Serialización eficiente con `JSON.stringify()`
- ✅ Carga asíncrona con `async/await`
- ✅ Validación rápida de archivos

### Seguridad
- ✅ Validación de tipo de archivo (`.json`)
- ✅ Parsing seguro con manejo de excepciones
- ✅ Sanitización de datos de entrada

### Usabilidad
- ✅ Descarga automática de archivos
- ✅ Nombres descriptivos generados automáticamente
- ✅ Feedback inmediato al usuario

---

## Conclusión

La implementación de exportación e importación transforma el árbol de residuos múltiples de una herramienta de demostración temporal a una aplicación educativa completa y persistente. Estas funcionalidades facilitan el trabajo académico, la colaboración entre usuarios y el estudio profundo de las estructuras de datos de residuos múltiples.

La arquitectura flexible permite futuras extensiones mientras mantiene la simplicidad de uso actual.