// Utilidades comunes para validación de importación/exportación de estructuras
import * as funciones from "./funciones.ts";

export type StructureType = 'lineal' | 'binaria' | 'hash' | 'residuo-simple' | 'residuo-multiple' | 'residuo-digital';
export type HashFunction = 'mod' | 'cuadrado' | 'truncamiento' | 'plegamiento';
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