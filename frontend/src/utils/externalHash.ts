// Implementación de búsqueda externa hash

import type {
  BlockStructure,
  SearchResult,
  InsertResult
} from './blockUtils';

import {
  createBlockStructure,
  linearSearchInBlock,
  hashFunction
} from './blockUtils';

/**
 * Busca un elemento en la estructura de búsqueda externa hash
 */
export function searchExternalHash(structure: BlockStructure, element: number): SearchResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Calcular el bloque usando función hash
  let targetBlockIndex = hashFunction(element, structure.totalBlocks);
  let originalBlockIndex = targetBlockIndex;
  let probeCount = 0;
  
  // Sondeo lineal en caso de que el bloque no contenga el elemento
  do {
    const targetBlock = structure.blocks[targetBlockIndex];
    path.push({ blockId: targetBlockIndex, action: 'hash_probe' });
    blocksAccessed++;
    
    // Buscar dentro del bloque usando búsqueda lineal
    const searchResult = linearSearchInBlock(targetBlock, element);
    
    if (searchResult.found) {
      path.push({ blockId: targetBlockIndex, action: 'found_in_block' });
      return {
        found: true,
        blockIndex: targetBlockIndex,
        elementIndex: searchResult.index,
        blocksAccessed,
        path
      };
    }
    
    // Si el bloque está vacío o no contiene el elemento, verificar si debemos seguir buscando
    // En hash externo, solo buscamos en el bloque hash correspondiente y sus sondeos
    if (targetBlock.size === 0) {
      // Bloque vacío significa que el elemento no existe
      break;
    }
    
    // Sondeo lineal: probar el siguiente bloque
    targetBlockIndex = (targetBlockIndex + 1) % structure.totalBlocks;
    probeCount++;
    
    // Evitar bucle infinito: si hemos sondeado todos los bloques
    if (probeCount >= structure.totalBlocks) {
      break;
    }
    
  } while (targetBlockIndex !== originalBlockIndex);
  
  return {
    found: false,
    blockIndex: -1,
    elementIndex: -1,
    blocksAccessed,
    path
  };
}

/**
 * Inserta un elemento en la estructura de búsqueda externa hash
 */
export function insertExternalHash(structure: BlockStructure, element: number): InsertResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Verificar si el elemento ya existe
  const searchResult = searchExternalHash(structure, element);
  if (searchResult.found) {
    return {
      success: false,
      blockIndex: searchResult.blockIndex,
      elementIndex: searchResult.elementIndex,
      blocksAccessed: searchResult.blocksAccessed,
      shifted: false,
      path: searchResult.path,
      message: `El elemento ${element} ya existe en el bloque ${searchResult.blockIndex}`
    };
  }
  
  // Verificar si hay espacio en la estructura
  if (structure.currentSize >= structure.totalCapacity) {
    return {
      success: false,
      blockIndex: -1,
      elementIndex: -1,
      blocksAccessed,
      shifted: false,
      path,
      message: 'La estructura está llena'
    };
  }
  
  // Calcular el bloque usando función hash
  let targetBlockIndex = hashFunction(element, structure.totalBlocks);
  let originalBlockIndex = targetBlockIndex;
  let probeCount = 0;
  
  // Sondeo lineal para encontrar un bloque con espacio
  do {
    const targetBlock = structure.blocks[targetBlockIndex];
    path.push({ blockId: targetBlockIndex, action: 'hash_probe_insert' });
    blocksAccessed++;
    
    // Si el bloque tiene espacio, insertar aquí
    if (targetBlock.size < targetBlock.capacity) {
      // En hash, los elementos no necesitan estar ordenados dentro del bloque
      targetBlock.elements[targetBlock.size] = element;
      targetBlock.size++;
      structure.currentSize++;
      
      path.push({ blockId: targetBlockIndex, action: 'insert_in_block' });
      
      return {
        success: true,
        blockIndex: targetBlockIndex,
        elementIndex: targetBlock.size - 1,
        blocksAccessed,
        shifted: false,
        path,
        message: `Elemento ${element} insertado en bloque ${targetBlockIndex} (hash ${hashFunction(element, structure.totalBlocks)})`
      };
    }
    
    // Sondeo lineal: probar el siguiente bloque
    targetBlockIndex = (targetBlockIndex + 1) % structure.totalBlocks;
    probeCount++;
    
    // Evitar bucle infinito: si hemos sondeado todos los bloques
    if (probeCount >= structure.totalBlocks) {
      break;
    }
    
  } while (targetBlockIndex !== originalBlockIndex);
  
  return {
    success: false,
    blockIndex: -1,
    elementIndex: -1,
    blocksAccessed,
    shifted: false,
    path,
    message: 'No hay espacio disponible en ningún bloque'
  };
}

/**
 * Elimina un elemento de la estructura de búsqueda externa hash
 */
export function removeExternalHash(structure: BlockStructure, element: number): InsertResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Buscar el elemento
  const searchResult = searchExternalHash(structure, element);
  path.push(...searchResult.path);
  blocksAccessed += searchResult.blocksAccessed;
  
  if (!searchResult.found) {
    return {
      success: false,
      blockIndex: -1,
      elementIndex: -1,
      blocksAccessed,
      shifted: false,
      path,
      message: `El elemento ${element} no existe en la estructura`
    };
  }
  
  // Eliminar el elemento del bloque
  const targetBlock = structure.blocks[searchResult.blockIndex];
  
  // En hash, simplemente movemos el último elemento a la posición del eliminado
  if (searchResult.elementIndex < targetBlock.size - 1) {
    targetBlock.elements[searchResult.elementIndex] = targetBlock.elements[targetBlock.size - 1];
  }
  
  targetBlock.size--;
  structure.currentSize--;
  
  path.push({ blockId: searchResult.blockIndex, action: 'remove_element' });
  blocksAccessed++;
  
  return {
    success: true,
    blockIndex: searchResult.blockIndex,
    elementIndex: searchResult.elementIndex,
    blocksAccessed,
    shifted: false,
    path,
    message: `Elemento ${element} eliminado del bloque ${searchResult.blockIndex}`
  };
}

/**
 * Crea una nueva estructura de búsqueda externa hash
 */
export function createExternalHashStructure(capacity: number): BlockStructure {
  return createBlockStructure(capacity);
}

/**
 * Obtiene estadísticas de la estructura hash
 */
export function getExternalHashStats(structure: BlockStructure) {
  const nonEmptyBlocks = structure.blocks.filter(block => block.size > 0).length;
  const totalElements = structure.currentSize;
  const utilizationRate = (totalElements / structure.totalCapacity) * 100;
  
  // Calcular colisiones y distribución
  const distribution = new Array(structure.totalBlocks).fill(0);
  let totalCollisions = 0;
  
  structure.blocks.forEach((block, index) => {
    distribution[index] = block.size;
    
    // Contar elementos que no están en su posición hash ideal
    for (let i = 0; i < block.size; i++) {
      const element = block.elements[i];
      const idealBlock = hashFunction(element, structure.totalBlocks);
      if (idealBlock !== index) {
        totalCollisions++;
      }
    }
  });
  
  const blockUtilizations = structure.blocks.map(block => ({
    blockId: block.id,
    utilization: (block.size / block.capacity) * 100,
    elements: block.size,
    capacity: block.capacity
  }));
  
  return {
    totalCapacity: structure.totalCapacity,
    currentSize: totalElements,
    utilizationRate: utilizationRate.toFixed(2),
    totalBlocks: structure.totalBlocks,
    nonEmptyBlocks,
    elementsPerBlock: structure.elementsPerBlock,
    blockUtilizations,
    totalCollisions,
    collisionRate: totalElements > 0 ? ((totalCollisions / totalElements) * 100).toFixed(2) : '0.00',
    distribution
  };
}

/**
 * Función hash personalizada para la estructura
 */
export function customHashFunction(element: number, totalBlocks: number, hashType: 'modulo' | 'multiplication' | 'folding' = 'modulo'): number {
  switch (hashType) {
    case 'modulo':
      return element % totalBlocks;
    
    case 'multiplication':
      const A = 0.6180339887; // (√5 - 1) / 2, constante de oro
      return Math.floor(totalBlocks * ((element * A) % 1));
    
    case 'folding':
      // Dividir el número en partes y sumarlas
      const str = element.toString();
      let sum = 0;
      for (let i = 0; i < str.length; i += 2) {
        const part = str.slice(i, i + 2);
        sum += parseInt(part);
      }
      return sum % totalBlocks;
    
    default:
      return element % totalBlocks;
  }
}