// Implementación de búsqueda externa binaria

import type {
  BlockStructure,
  SearchResult,
  InsertResult
} from './blockUtils';

import {
  createBlockStructure,
  findTargetBlock,
  binarySearchInBlock,
  findInsertPosition,
  insertInBlock,
  shiftBlocks,
  getLastElement
} from './blockUtils';

/**
 * Busca un elemento en la estructura de búsqueda externa binaria
 */
export function searchExternalBinary(structure: BlockStructure, element: number): SearchResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Buscar el bloque apropiado comparando con el último elemento
  let targetBlockIndex = -1;
  
  for (let i = 0; i < structure.blocks.length; i++) {
    const block = structure.blocks[i];
    path.push({ blockId: i, action: 'check_block' });
    blocksAccessed++;
    
    // Si el bloque está vacío, no puede estar aquí
    if (block.size === 0) {
      if (i === 0) {
        targetBlockIndex = 0; // Primer bloque vacío
        break;
      }
      continue;
    }
    
    const lastElement = getLastElement(block);
    
    // Si el elemento es menor o igual al último elemento del bloque
    if (element <= lastElement) {
      targetBlockIndex = i;
      break;
    }
    
    // Si es el último bloque, debe estar aquí (si está en algún lugar)
    if (i === structure.blocks.length - 1) {
      targetBlockIndex = i;
      break;
    }
  }
  
  // Si no encontramos un bloque apropiado
  if (targetBlockIndex === -1) {
    return {
      found: false,
      blockIndex: -1,
      elementIndex: -1,
      blocksAccessed,
      path
    };
  }
  
  // Buscar dentro del bloque usando búsqueda binaria
  const targetBlock = structure.blocks[targetBlockIndex];
  path.push({ blockId: targetBlockIndex, action: 'search_in_block' });
  blocksAccessed++;
  
  const searchResult = binarySearchInBlock(targetBlock, element);
  
  return {
    found: searchResult.found,
    blockIndex: targetBlockIndex,
    elementIndex: searchResult.index,
    blocksAccessed,
    path
  };
}

/**
 * Inserta un elemento en la estructura de búsqueda externa binaria
 */
export function insertExternalBinary(structure: BlockStructure, element: number): InsertResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Verificar si el elemento ya existe
  const searchResult = searchExternalBinary(structure, element);
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
  
  // Encontrar el bloque apropiado para la inserción
  const targetBlockIndex = findTargetBlock(structure, element);
  const targetBlock = structure.blocks[targetBlockIndex];
  
  path.push({ blockId: targetBlockIndex, action: 'select_block' });
  blocksAccessed++;
  
  // Encontrar la posición correcta dentro del bloque
  const insertPosition = findInsertPosition(targetBlock, element);
  
  // Si el bloque tiene espacio, insertar directamente
  if (targetBlock.size < targetBlock.capacity) {
    if (insertInBlock(targetBlock, element, insertPosition)) {
      path.push({ blockId: targetBlockIndex, action: 'insert_direct' });
      blocksAccessed++;
      structure.currentSize++;
      
      return {
        success: true,
        blockIndex: targetBlockIndex,
        elementIndex: insertPosition,
        blocksAccessed,
        shifted: false,
        path,
        message: `Elemento ${element} insertado en bloque ${targetBlockIndex} posición ${insertPosition}`
      };
    }
  }
  
  // Si el bloque está lleno, realizar corrimiento
  const shiftResult = shiftBlocks(structure, targetBlockIndex, element);
  
  // Combinar los paths y actualizar el contador de bloques accedidos
  shiftResult.path = [...path, ...shiftResult.path];
  shiftResult.blocksAccessed += blocksAccessed;
  
  return shiftResult;
}

/**
 * Elimina un elemento de la estructura de búsqueda externa binaria
 */
export function removeExternalBinary(structure: BlockStructure, element: number): InsertResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Buscar el elemento
  const searchResult = searchExternalBinary(structure, element);
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
  
  // Desplazar elementos hacia la izquierda
  for (let i = searchResult.elementIndex; i < targetBlock.size - 1; i++) {
    targetBlock.elements[i] = targetBlock.elements[i + 1];
  }
  
  targetBlock.size--;
  structure.currentSize--;
  
  path.push({ blockId: searchResult.blockIndex, action: 'remove_element' });
  blocksAccessed++;
  
  // Opcional: Reorganizar bloques para mantener eficiencia
  // (Por simplicidad, no implementamos reorganización automática)
  
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
 * Crea una nueva estructura de búsqueda externa binaria
 */
export function createExternalBinaryStructure(capacity: number): BlockStructure {
  return createBlockStructure(capacity);
}

/**
 * Obtiene estadísticas de la estructura
 */
export function getExternalBinaryStats(structure: BlockStructure) {
  const nonEmptyBlocks = structure.blocks.filter(block => block.size > 0).length;
  const totalElements = structure.currentSize;
  const utilizationRate = (totalElements / structure.totalCapacity) * 100;
  
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
    blockUtilizations
  };
}

/**
 * Valida la consistencia de la estructura (para debugging)
 */
export function validateExternalBinaryStructure(structure: BlockStructure): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verificar que los elementos estén ordenados dentro de cada bloque
  structure.blocks.forEach((block, blockIndex) => {
    for (let i = 1; i < block.size; i++) {
      if (block.elements[i] < block.elements[i - 1]) {
        errors.push(`Bloque ${blockIndex}: elementos no están ordenados en posiciones ${i-1} y ${i}`);
      }
    }
  });
  
  // Verificar que los bloques estén ordenados globalmente
  for (let i = 1; i < structure.blocks.length; i++) {
    const prevBlock = structure.blocks[i - 1];
    const currentBlock = structure.blocks[i];
    
    if (prevBlock.size > 0 && currentBlock.size > 0) {
      const lastPrev = getLastElement(prevBlock);
      const firstCurrent = currentBlock.elements[0];
      
      if (lastPrev > firstCurrent) {
        errors.push(`Orden global incorrecto entre bloques ${i-1} y ${i}`);
      }
    }
  }
  
  // Verificar conteo de elementos
  const actualCount = structure.blocks.reduce((sum, block) => sum + block.size, 0);
  if (actualCount !== structure.currentSize) {
    errors.push(`Conteo de elementos inconsistente: esperado ${structure.currentSize}, actual ${actualCount}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}