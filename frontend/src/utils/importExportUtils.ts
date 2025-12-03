// Utilidades comunes para validación de importación/exportación de estructuras
import * as funciones from "./funciones.ts";

export type StructureType = 'lineal' | 'binaria' | 'hash' | 'residuo-simple' | 'residuo-multiple' | 'residuo-digital' | 'lineal-externa' | 'binaria-externa' | 'hash-externa' | 'hash-modulo-externo' | 'hash-cuadrado-externo' | 'hash-plegamiento-externo' | 'hash-truncamiento-externo' | 'hash-cambio-base-externo' | 'dinamica';
export type HashFunction = 'mod' | 'cuadrado' | 'truncamiento' | 'plegamiento' | 'cambio-base';
export type CollisionStrategy = 'lineal' | 'cuadratica' | 'doble-hash' | 'arreglos' | 'listas-anidadas' | 'encadenamiento';

export interface BaseImportData {
  type: StructureType;
  version: string;
  timestamp: string;
  config: any;
  data: any;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida el formato básico de un archivo de importación para estructuras con capacidad
 */
export function validateBasicFormat(importData: any, expectedType: StructureType): ValidationResult {
  if (!importData || typeof importData !== 'object') {
    return { isValid: false, error: "El archivo no contiene datos válidos." };
  }

  if (importData.type !== expectedType) {
    return { isValid: false, error: `Este archivo no contiene una estructura ${expectedType} válida.` };
  }

  if (!importData.config || typeof importData.config !== 'object') {
    return { isValid: false, error: "El archivo no contiene una configuración válida." };
  }

  if (typeof importData.config.capacidad !== 'number' || typeof importData.config.digitosClave !== 'number') {
    return { isValid: false, error: "La configuración de capacidad o dígitos por clave no es válida." };
  }

  if (importData.config.capacidad <= 0 || importData.config.digitosClave <= 0) {
    return { isValid: false, error: "La capacidad y los dígitos por clave deben ser números positivos." };
  }

  return { isValid: true };
}

/**
 * Valida el formato básico de un archivo de importación para árboles (sin capacidad)
 */
export function validateBasicTreeFormat(importData: any, expectedType: StructureType): ValidationResult {
  if (!importData || typeof importData !== 'object') {
    return { isValid: false, error: "El archivo no contiene datos válidos." };
  }

  if (importData.type !== expectedType) {
    return { isValid: false, error: `Este archivo no contiene una estructura ${expectedType} válida.` };
  }

  if (!importData.config || typeof importData.config !== 'object') {
    return { isValid: false, error: "El archivo no contiene una configuración válida." };
  }

  // Para árboles solo validamos digitosClave, no capacidad
  if (typeof importData.config.digitosClave !== 'number' || importData.config.digitosClave <= 0) {
    return { isValid: false, error: "La cantidad de dígitos debe ser un número positivo." };
  }

  return { isValid: true };
}

/**
 * Valida que los elementos de un array cumplan con las restricciones de dígitos
 */
export function validateElementsDigits(elements: any[], digitosClave: number): ValidationResult {
  if (!Array.isArray(elements)) {
    return { isValid: false, error: "Los datos no tienen el formato de array válido." };
  }

  const validElements = elements.every((element: any) => {
    if (element === null) return true;
    if (typeof element !== 'number') return false;
    const res = funciones.validarInput(element, digitosClave);
    return !res.isError;
  });

  if (!validElements) {
    return { isValid: false, error: "Algunos elementos no cumplen con las restricciones de dígitos especificadas." };
  }

  return { isValid: true };
}

/**
 * Valida que el tamaño de los datos coincida con la capacidad especificada
 */
export function validateDataSize(data: any[], capacidad: number): ValidationResult {
  if (data.length !== capacidad) {
    return { isValid: false, error: "El tamaño de los datos no coincide con la capacidad especificada." };
  }

  return { isValid: true };
}

/**
 * Valida que los elementos estén ordenados (para búsqueda binaria)
 */
export function validateSortedOrder(elements: any[]): ValidationResult {
  const nonNullElements = elements.filter((el: any) => el !== null);
  const isOrdered = nonNullElements.every((element: number, index: number, arr: number[]) => {
    return index === 0 || arr[index - 1] <= element;
  });

  if (!isOrdered) {
    return { isValid: false, error: "Los datos no están ordenados. La búsqueda binaria requiere elementos ordenados." };
  }

  return { isValid: true };
}

/**
 * Valida configuración específica para tablas hash
 */
export function validateHashConfig(config: any): ValidationResult {
  // Validar capacidades permitidas para hash
  const permitidas = [10, 100, 1000];
  if (!permitidas.includes(config.capacidad)) {
    return { isValid: false, error: "Capacidad inválida. Solo se permite 10, 100 o 1000 en funciones hash." };
  }

  // Validar función hash
  const funcionesValidas: HashFunction[] = ['mod', 'cuadrado', 'truncamiento', 'plegamiento'];
  if (!funcionesValidas.includes(config.funcionHash)) {
    return { isValid: false, error: "Función hash inválida." };
  }

  // Validar estrategia de colisión
  const estrategiasValidas: CollisionStrategy[] = ['lineal', 'cuadratica', 'doble-hash', 'arreglos', 'listas-anidadas', 'encadenamiento'];
  if (!estrategiasValidas.includes(config.estrategiaColision)) {
    return { isValid: false, error: "Estrategia de colisión inválida." };
  }

  return { isValid: true };
}

/**
 * Valida datos específicos de tablas hash (estructura, buckets, layers)
 */
export function validateHashData(data: any, config: any): ValidationResult {
  if (!data.estructura || !Array.isArray(data.estructura)) {
    return { isValid: false, error: "La estructura principal no es válida." };
  }

  if (!data.buckets || !Array.isArray(data.buckets)) {
    return { isValid: false, error: "Los buckets de encadenamiento no son válidos." };
  }

  if (!data.arreglosLayers || !Array.isArray(data.arreglosLayers)) {
    return { isValid: false, error: "Las capas de arreglos anidados no son válidas." };
  }

  // Validar elementos de la estructura principal
  const estructuraValidation = validateElementsDigits(data.estructura, config.digitosClave);
  if (!estructuraValidation.isValid) {
    return estructuraValidation;
  }

  // Validar buckets para encadenamiento
  const validBuckets = data.buckets.every((bucket: any) => {
    if (!Array.isArray(bucket)) return false;
    return bucket.every((element: any) => {
      if (typeof element !== 'number') return false;
      const res = funciones.validarInput(element, config.digitosClave);
      return !res.isError;
    });
  });

  if (!validBuckets) {
    return { isValid: false, error: "Los buckets de encadenamiento contienen datos inválidos." };
  }

  // Validar arreglos layers
  const validLayers = data.arreglosLayers.every((layer: any) => {
    if (!Array.isArray(layer)) return false;
    return layer.every((element: any) => {
      if (element === null) return true;
      if (typeof element !== 'number') return false;
      const res = funciones.validarInput(element, config.digitosClave);
      return !res.isError;
    });
  });

  if (!validLayers) {
    return { isValid: false, error: "Las capas de arreglos anidados contienen datos inválidos." };
  }

  // Validar tamaños
  if (data.estructura.length !== config.capacidad || data.buckets.length !== config.capacidad) {
    return { isValid: false, error: "El tamaño de los datos no coincide con la capacidad especificada." };
  }

  return { isValid: true };
}

/**
 * Genera nombre de archivo para exportación
 */
export function generateExportFileName(type: StructureType, config?: any): string {
  const date = new Date().toISOString().split('T')[0];
  
  switch (type) {
    case 'lineal':
      return `estructura_lineal_${date}.json`;
    case 'binaria':
      return `estructura_binaria_${date}.json`;
    case 'hash':
      return `estructura_hash_${config?.funcionHash}_${config?.estrategiaColision}_${date}.json`;
    case 'residuo-simple':
      return `estructura_residuo_simple_${date}.json`;
    case 'residuo-multiple':
      return `estructura_residuo_multiple_${date}.json`;
    case 'residuo-digital':
      return `estructura_residuo_digital_${date}.json`;
    default:
      return `estructura_${type}_${date}.json`;
  }
}

/**
 * Crea objeto base para exportación
 */
export function createExportData(type: StructureType, config: any, data: any): BaseImportData {
  return {
    type,
    version: "1.0",
    timestamp: new Date().toISOString(),
    config,
    data
  };
}

/**
 * Ejecuta la descarga de un archivo JSON
 */
export function downloadJsonFile(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validación completa para importación lineal
 */
export function validateLinearImport(importData: any): ValidationResult {
  // Validaciones básicas
  const basicValidation = validateBasicFormat(importData, 'lineal');
  if (!basicValidation.isValid) return basicValidation;

  // Validar elementos
  const elementsValidation = validateElementsDigits(importData.data, importData.config.digitosClave);
  if (!elementsValidation.isValid) return elementsValidation;

  // Validar tamaño
  const sizeValidation = validateDataSize(importData.data, importData.config.capacidad);
  if (!sizeValidation.isValid) return sizeValidation;

  return { isValid: true };
}

/**
 * Validación completa para importación binaria
 */
export function validateBinaryImport(importData: any): ValidationResult {
  // Validaciones básicas (igual que lineal)
  const linearValidation = validateLinearImport(importData);
  if (!linearValidation.isValid) return linearValidation;

  // Cambiar el tipo esperado
  if (importData.type !== 'binaria') {
    return { isValid: false, error: "Este archivo no contiene una estructura binaria válida." };
  }

  // Validar orden
  const orderValidation = validateSortedOrder(importData.data);
  if (!orderValidation.isValid) return orderValidation;

  return { isValid: true };
}

/**
 * Validación completa para importación hash
 */
export function validateHashImport(importData: any): ValidationResult {
  // Validaciones básicas
  const basicValidation = validateBasicFormat(importData, 'hash');
  if (!basicValidation.isValid) return basicValidation;

  // Validar configuración específica de hash
  const hashConfigValidation = validateHashConfig(importData.config);
  if (!hashConfigValidation.isValid) return hashConfigValidation;

  // Validar datos específicos de hash
  const hashDataValidation = validateHashData(importData.data, importData.config);
  if (!hashDataValidation.isValid) return hashDataValidation;

  return { isValid: true };
}

/**
 * Valida estructura de árbol de residuos (simple)
 */
export function validateResidueTreeData(treeData: any, digitosClave: number): ValidationResult {
  if (!treeData || typeof treeData !== 'object') {
    return { isValid: false, error: "Los datos del árbol no son válidos." };
  }

  // Validar que tenga las propiedades esperadas de un nodo
  if (!treeData.hasOwnProperty('key')) {
    return { isValid: false, error: "La estructura del árbol no tiene el formato correcto." };
  }

  // Validar valor del nodo raíz si existe (puede ser null para conectores)
  if (treeData.key !== null) {
    // Para árboles de residuos, las claves son letras A-Z
    if (typeof treeData.key !== 'string' || !/^[A-Z]$/.test(treeData.key)) {
      return { isValid: false, error: "Las claves del árbol deben ser letras A-Z." };
    }
  }

  // Validar hijos recursivamente según el tipo de árbol
  if (treeData.children && Array.isArray(treeData.children)) {
    // Árbol múltiple con children array
    for (const child of treeData.children) {
      if (child !== null) {
        const childValidation = validateResidueTreeData(child, digitosClave);
        if (!childValidation.isValid) return childValidation;
      }
    }
  } else if (treeData.hasOwnProperty('left') || treeData.hasOwnProperty('right')) {
    // Árbol binario con left/right
    if (treeData.left !== null && treeData.left !== undefined) {
      const leftValidation = validateResidueTreeData(treeData.left, digitosClave);
      if (!leftValidation.isValid) return leftValidation;
    }
    if (treeData.right !== null && treeData.right !== undefined) {
      const rightValidation = validateResidueTreeData(treeData.right, digitosClave);
      if (!rightValidation.isValid) return rightValidation;
    }
  }

  return { isValid: true };
}

/**
 * Valida configuración específica para árboles de residuos
 */
export function validateResidueConfig(config: any, type: StructureType): ValidationResult {
  if (type === 'residuo-multiple') {
    if (typeof config.base !== 'number' || config.base <= 1) {
      return { isValid: false, error: "La base debe ser un número mayor a 1." };
    }
  }

  // Validación común para residuos: deben tener digitosClave
  if (typeof config.digitosClave !== 'number' || config.digitosClave <= 0) {
    return { isValid: false, error: "La cantidad de dígitos debe ser un número positivo." };
  }

  return { isValid: true };
}

/**
 * Validación completa para importación de residuo simple
 */
export function validateResidueSimpleImport(importData: any): ValidationResult {
  // Validaciones básicas para árboles (sin capacidad)
  const basicValidation = validateBasicTreeFormat(importData, 'residuo-simple');
  if (!basicValidation.isValid) return basicValidation;

  // Validar configuración específica
  const configValidation = validateResidueConfig(importData.config, 'residuo-simple');
  if (!configValidation.isValid) return configValidation;

  // Validar estructura del árbol
  const treeValidation = validateResidueTreeData(importData.data, importData.config.digitosClave);
  if (!treeValidation.isValid) return treeValidation;

  return { isValid: true };
}

/**
 * Validación completa para importación de residuo múltiple
 */
export function validateResidueMultipleImport(importData: any): ValidationResult {
  // Validaciones básicas para árboles (sin capacidad)
  const basicValidation = validateBasicTreeFormat(importData, 'residuo-multiple');
  if (!basicValidation.isValid) return basicValidation;

  // Validar configuración específica (incluye base)
  const configValidation = validateResidueConfig(importData.config, 'residuo-multiple');
  if (!configValidation.isValid) return configValidation;

  // Validar estructura del árbol
  const treeValidation = validateResidueTreeData(importData.data, importData.config.digitosClave);
  if (!treeValidation.isValid) return treeValidation;

  return { isValid: true };
}

/**
 * Validación completa para importación de residuo digital
 */
export function validateResidueDigitalImport(importData: any): ValidationResult {
  // Validaciones básicas para árboles (sin capacidad)
  const basicValidation = validateBasicTreeFormat(importData, 'residuo-digital');
  if (!basicValidation.isValid) return basicValidation;

  // Validar configuración específica
  const configValidation = validateResidueConfig(importData.config, 'residuo-digital');
  if (!configValidation.isValid) return configValidation;

  // Validar estructura del árbol digital
  const treeValidation = validateResidueTreeData(importData.data, importData.config.digitosClave);
  if (!treeValidation.isValid) return treeValidation;

  return { isValid: true };
}

// Función de validación para búsquedas externas lineales
export function validateExternalLinearImport(importData: any): ValidationResult {
  // Validación básica de estructura
  const basicValidation = validateBasicFormat(importData, 'lineal-externa');
  if (!basicValidation.isValid) return basicValidation;

  // Validar que tenga la estructura específica de búsqueda externa lineal
  if (!importData.data || typeof importData.data !== 'object') {
    return { isValid: false, error: 'Los datos de la estructura deben ser un objeto válido.' };
  }

  const estructura = importData.data;

  // Validar estructura de bloques (debe ser un array de arrays)
  if (!Array.isArray(estructura)) {
    return { isValid: false, error: 'La estructura debe ser un arreglo de bloques.' };
  }

  // Validar que cada bloque tenga la estructura correcta
  for (let i = 0; i < estructura.length; i++) {
    const bloque = estructura[i];
    if (!Array.isArray(bloque)) {
      return { isValid: false, error: `El bloque ${i + 1} debe ser un arreglo.` };
    }

    // Validar elementos del bloque (deben ser números válidos o null)
    for (let j = 0; j < bloque.length; j++) {
      const elemento = bloque[j];
      if (elemento !== null && (typeof elemento !== 'number' || !Number.isInteger(elemento) || elemento < 0)) {
        return { isValid: false, error: `El elemento en bloque ${i + 1}, posición ${j + 1} debe ser un número entero positivo o null.` };
      }
    }
  }

  return { isValid: true };
}

// Función de validación para búsquedas externas binarias
export function validateExternalBinaryImport(importData: any): ValidationResult {
  // Validación básica de estructura
  const basicValidation = validateBasicFormat(importData, 'binaria-externa');
  if (!basicValidation.isValid) return basicValidation;

  // Validar que tenga la estructura específica de búsqueda externa binaria
  if (!importData.data || typeof importData.data !== 'object') {
    return { isValid: false, error: 'Los datos de la estructura deben ser un objeto válido.' };
  }

  const estructura = importData.data;

  // Validar estructura de bloques (debe ser un array de arrays)
  if (!Array.isArray(estructura)) {
    return { isValid: false, error: 'La estructura debe ser un arreglo de bloques.' };
  }

  // Validar que cada bloque tenga la estructura correcta
  for (let i = 0; i < estructura.length; i++) {
    const bloque = estructura[i];
    if (!Array.isArray(bloque)) {
      return { isValid: false, error: `El bloque ${i + 1} debe ser un arreglo.` };
    }

    // Validar elementos del bloque (deben ser números válidos o null)
    for (let j = 0; j < bloque.length; j++) {
      const elemento = bloque[j];
      if (elemento !== null && (typeof elemento !== 'number' || !Number.isInteger(elemento) || elemento < 0)) {
        return { isValid: false, error: `El elemento en bloque ${i + 1}, posición ${j + 1} debe ser un número entero positivo o null.` };
      }
    }
  }

  return { isValid: true };
}

/**
 * Valida un archivo de importación para estructuras hash externas
 */
export function validateExternalHashImport(importData: any): ValidationResult {
  // Validación básica del formato
  if (!importData || typeof importData !== 'object') {
    return { isValid: false, error: "El archivo no contiene datos válidos." };
  }

  if (!importData.type || typeof importData.type !== 'string') {
    return { isValid: false, error: "El archivo no tiene un tipo válido." };
  }

  // Aceptar cualquier tipo de hash externa/externo
  if (!importData.type.includes('hash') || (!importData.type.includes('externa') && !importData.type.includes('externo'))) {
    return { isValid: false, error: "Este archivo no contiene una estructura hash externa válida." };
  }

  if (!importData.config || typeof importData.config !== 'object') {
    return { isValid: false, error: "El archivo no contiene una configuración válida." };
  }

  // Validar configuración específica de hash externa
  const config = importData.config;
  
  if (typeof config.capacidad !== 'number' || config.capacidad <= 0) {
    return { isValid: false, error: 'La capacidad debe ser un número positivo.' };
  }

  if (typeof config.digitosClave !== 'number' || config.digitosClave <= 0) {
    return { isValid: false, error: 'Los dígitos por clave deben ser un número positivo.' };
  }

  if (typeof config.elementosPorBloque !== 'number' || config.elementosPorBloque <= 0) {
    return { isValid: false, error: 'Los elementos por bloque deben ser un número positivo.' };
  }

  if (typeof config.numeroBloques !== 'number' || config.numeroBloques <= 0) {
    return { isValid: false, error: 'El número de bloques debe ser un número positivo.' };
  }

  if (!config.funcionHash || typeof config.funcionHash !== 'string') {
    return { isValid: false, error: 'Debe especificar una función hash válida.' };
  }

  if (!['modulo', 'cuadrado', 'truncamiento', 'plegamiento', 'cambio-base'].includes(config.funcionHash)) {
    return { isValid: false, error: 'La función hash debe ser módulo, cuadrado, truncamiento, plegamiento o cambio-base.' };
  }

  // Validar base si la función es cambio-base
  if (config.funcionHash === 'cambio-base') {
    if (typeof config.base !== 'number' || config.base < 2 || config.base > 9) {
      return { isValid: false, error: 'Para cambio de base, debe especificar una base entre 2 y 9.' };
    }
  }

  if (!config.resolucionColisiones || typeof config.resolucionColisiones !== 'string') {
    return { isValid: false, error: 'Debe especificar una estrategia de resolución de colisiones válida.' };
  }

  if (!['estructura-secundaria', 'area-colisiones'].includes(config.resolucionColisiones)) {
    return { isValid: false, error: 'La resolución de colisiones debe ser estructura-secundaria o area-colisiones.' };
  }

  // Validar estructura de datos
  if (!importData.data || typeof importData.data !== 'object') {
    return { isValid: false, error: 'Los datos de la estructura deben ser un objeto válido.' };
  }

  // El formato puede ser un objeto con propiedades o directamente un array (retrocompatibilidad)
  let estructura: any[];
  
  if (Array.isArray(importData.data)) {
    // Formato antiguo: data es directamente el array de bloques
    estructura = importData.data;
  } else if (importData.data.estructura && Array.isArray(importData.data.estructura)) {
    // Formato nuevo: data es un objeto con estructura, estructuraSecundaria, areaColisiones, elementosInsertados
    estructura = importData.data.estructura;
    
    // Validar estructuraSecundaria si existe
    if (importData.data.estructuraSecundaria !== undefined && !Array.isArray(importData.data.estructuraSecundaria)) {
      return { isValid: false, error: 'La estructura secundaria debe ser un arreglo de bloques.' };
    }
    
    // Validar areaColisiones si existe
    if (importData.data.areaColisiones !== undefined && !Array.isArray(importData.data.areaColisiones)) {
      return { isValid: false, error: 'El área de colisiones debe ser un arreglo de bloques.' };
    }
    
    // Validar elementosInsertados si existe
    if (importData.data.elementosInsertados !== undefined && typeof importData.data.elementosInsertados !== 'number') {
      return { isValid: false, error: 'El contador de elementos insertados debe ser un número.' };
    }
  } else {
    return { isValid: false, error: 'Los datos deben contener una estructura de bloques válida.' };
  }

  // Validar que cada bloque de la estructura principal sea un arreglo
  for (let i = 0; i < estructura.length; i++) {
    const bloque = estructura[i];
    if (!Array.isArray(bloque)) {
      return { isValid: false, error: `El bloque ${i + 1} debe ser un arreglo.` };
    }

    // Validar elementos del bloque
    for (let j = 0; j < bloque.length; j++) {
      const elemento = bloque[j];
      if (elemento !== null && (typeof elemento !== 'number' || !Number.isInteger(elemento) || elemento < 0)) {
        return { isValid: false, error: `El elemento en bloque ${i + 1}, posición ${j + 1} debe ser un número entero positivo o null.` };
      }
    }
  }

  return { isValid: true };
}

/**
 * Valida un archivo de importación para estructuras dinámicas (hash con expansión/reducción)
 */
export function validateDynamicImport(importData: any): ValidationResult {
  // Validación básica de estructura (sin validateBasicFormat porque dinamica no tiene capacidad ni digitosClave)
  if (!importData || typeof importData !== 'object') {
    return { isValid: false, error: "El archivo no contiene datos válidos." };
  }

  if (importData.type !== 'dinamica') {
    return { isValid: false, error: `Este archivo no contiene una estructura dinámica válida.` };
  }

  if (!importData.config || typeof importData.config !== 'object') {
    return { isValid: false, error: "El archivo no contiene una configuración válida." };
  }

  // Validar configuración específica de estructuras dinámicas
  const config = importData.config;

  if (typeof config.cubetas !== 'number' || config.cubetas <= 0) {
    return { isValid: false, error: 'El número de cubetas debe ser un número positivo.' };
  }

  if (typeof config.registrosPorCubeta !== 'number' || config.registrosPorCubeta <= 0) {
    return { isValid: false, error: 'Los registros por cubeta deben ser un número positivo.' };
  }

  if (typeof config.tamanioClave !== 'number' || config.tamanioClave <= 0) {
    return { isValid: false, error: 'El tamaño de clave debe ser un número positivo.' };
  }

  if (!config.tipoOperacion || (config.tipoOperacion !== 'total' && config.tipoOperacion !== 'parcial')) {
    return { isValid: false, error: 'El tipo de operación debe ser "total" o "parcial".' };
  }

  // Validar estructura de datos
  if (!importData.data || typeof importData.data !== 'object') {
    return { isValid: false, error: 'Los datos de la estructura deben ser un objeto válido.' };
  }

  const estructura = importData.data;

  // Validar propiedades de la estructura
  if (typeof estructura.cubetas !== 'number' || estructura.cubetas <= 0) {
    return { isValid: false, error: 'La estructura debe tener un número válido de cubetas.' };
  }

  if (typeof estructura.registrosPorCubeta !== 'number' || estructura.registrosPorCubeta <= 0) {
    return { isValid: false, error: 'La estructura debe tener un número válido de registros por cubeta.' };
  }

  if (typeof estructura.capacidadTotal !== 'number' || estructura.capacidadTotal <= 0) {
    return { isValid: false, error: 'La estructura debe tener una capacidad total válida.' };
  }

  // Validar tabla (array de arrays)
  if (!Array.isArray(estructura.tabla)) {
    return { isValid: false, error: 'La tabla debe ser un arreglo de cubetas.' };
  }

  for (let i = 0; i < estructura.tabla.length; i++) {
    const cubeta = estructura.tabla[i];
    if (!Array.isArray(cubeta)) {
      return { isValid: false, error: `La cubeta ${i + 1} debe ser un arreglo.` };
    }

    // Validar elementos de la cubeta
    for (let j = 0; j < cubeta.length; j++) {
      const elemento = cubeta[j];
      if (elemento !== null && (typeof elemento !== 'number' || !Number.isInteger(elemento) || elemento < 0)) {
        return { isValid: false, error: `El elemento en cubeta ${i + 1}, posición ${j + 1} debe ser un número entero positivo o null.` };
      }
    }
  }

  // Validar desbordamientos (array de arrays)
  if (!Array.isArray(estructura.desbordamientos)) {
    return { isValid: false, error: 'Los desbordamientos deben ser un arreglo.' };
  }

  for (let i = 0; i < estructura.desbordamientos.length; i++) {
    const desbordamiento = estructura.desbordamientos[i];
    if (!Array.isArray(desbordamiento)) {
      return { isValid: false, error: `El desbordamiento de la cubeta ${i + 1} debe ser un arreglo.` };
    }

    // Validar elementos desbordados
    for (let j = 0; j < desbordamiento.length; j++) {
      const elemento = desbordamiento[j];
      if (typeof elemento !== 'number' || !Number.isInteger(elemento) || elemento < 0) {
        return { isValid: false, error: `El elemento desbordado en cubeta ${i + 1}, posición ${j + 1} debe ser un número entero positivo.` };
      }
    }
  }

  // Validar contadores
  if (typeof estructura.expansiones !== 'number' || estructura.expansiones < 0) {
    return { isValid: false, error: 'El contador de expansiones debe ser un número no negativo.' };
  }

  if (typeof estructura.reducciones !== 'number' || estructura.reducciones < 0) {
    return { isValid: false, error: 'El contador de reducciones debe ser un número no negativo.' };
  }

  if (typeof estructura.expansionesParciales !== 'number' || estructura.expansionesParciales < 0) {
    return { isValid: false, error: 'El contador de expansiones parciales debe ser un número no negativo.' };
  }

  if (typeof estructura.reduccionesParciales !== 'number' || estructura.reduccionesParciales < 0) {
    return { isValid: false, error: 'El contador de reducciones parciales debe ser un número no negativo.' };
  }

  return { isValid: true };
}
