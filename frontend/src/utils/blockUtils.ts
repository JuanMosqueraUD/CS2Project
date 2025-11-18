// Tipos y utilidades para búsquedas externas con bloques

export interface Block {
  id: number;
  elements: number[];
  capacity: number;
  size: number;
}

export interface BlockStructure {
  blocks: Block[];
  totalCapacity: number;
  elementsPerBlock: number;
  totalBlocks: number;
  currentSize: number;
}

export interface SearchResult {
  found: boolean;
  blockIndex: number;
  elementIndex: number;
  blocksAccessed: number;
  path: { blockId: number; action: string }[];
}

export interface InsertResult {
  success: boolean;
  blockIndex: number;
  elementIndex: number;
  blocksAccessed: number;
  shifted: boolean;
  path: { blockId: number; action: string }[];
  message: string;
}

/**
 * Calcula el número de elementos por bloque usando la fórmula ⌊√n⌋
 */
export function calculateElementsPerBlock(totalCapacity: number): number {
  return Math.floor(Math.sqrt(totalCapacity));
}

/**
 * Calcula el número total de bloques necesarios
 */
export function calculateTotalBlocks(totalCapacity: number, elementsPerBlock: number): number {
  return Math.ceil(totalCapacity / elementsPerBlock);
}

/**
 * Crea una estructura de bloques vacía
 */
export function createBlockStructure(totalCapacity: number): BlockStructure {
  const elementsPerBlock = calculateElementsPerBlock(totalCapacity);
  const totalBlocks = calculateTotalBlocks(totalCapacity, elementsPerBlock);
  
  const blocks: Block[] = [];
  for (let i = 0; i < totalBlocks; i++) {
    blocks.push({
      id: i,
      elements: [],
      capacity: elementsPerBlock,
      size: 0
    });
  }
  
  return {
    blocks,
    totalCapacity,
    elementsPerBlock,
    totalBlocks,
    currentSize: 0
  };
}

/**
 * Obtiene el último elemento de un bloque (o -1 si está vacío)
 */
export function getLastElement(block: Block): number {
  return block.size > 0 ? block.elements[block.size - 1] : -1;
}

/**
 * Encuentra el bloque apropiado para un elemento (para estructuras ordenadas)
 */
export function findTargetBlock(structure: BlockStructure, element: number): number {
  for (let i = 0; i < structure.blocks.length; i++) {
    const block = structure.blocks[i];
    
    // Si el bloque está vacío, este es el lugar correcto
    if (block.size === 0) {
      return i;
    }
    
    const lastElement = getLastElement(block);
    
    // Si el elemento es menor o igual al último elemento del bloque
    if (element <= lastElement) {
      return i;
    }
    
    // Si es el último bloque, debe ir aquí
    if (i === structure.blocks.length - 1) {
      return i;
    }
  }
  
  return 0; // Fallback
}

/**
 * Busca un elemento dentro de un bloque específico (búsqueda lineal)
 */
export function linearSearchInBlock(block: Block, element: number): { found: boolean; index: number } {
  for (let i = 0; i < block.size; i++) {
    if (block.elements[i] === element) {
      return { found: true, index: i };
    }
  }
  return { found: false, index: -1 };
}

/**
 * Busca un elemento dentro de un bloque específico (búsqueda binaria)
 */
export function binarySearchInBlock(block: Block, element: number): { found: boolean; index: number } {
  let left = 0;
  let right = block.size - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (block.elements[mid] === element) {
      return { found: true, index: mid };
    } else if (block.elements[mid] < element) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return { found: false, index: -1 };
}

/**
 * Encuentra la posición correcta para insertar un elemento en un bloque ordenado
 */
export function findInsertPosition(block: Block, element: number): number {
  for (let i = 0; i < block.size; i++) {
    if (block.elements[i] > element) {
      return i;
    }
  }
  return block.size; // Al final del bloque
}

/**
 * Inserta un elemento en una posición específica del bloque
 */
export function insertInBlock(block: Block, element: number, position: number): boolean {
  if (block.size >= block.capacity) {
    return false; // Bloque lleno
  }
  
  // Desplazar elementos hacia la derecha
  for (let i = block.size; i > position; i--) {
    block.elements[i] = block.elements[i - 1];
  }
  
  block.elements[position] = element;
  block.size++;
  
  return true;
}

/**
 * Realiza corrimiento de bloques cuando un bloque está lleno
 */
export function shiftBlocks(structure: BlockStructure, startBlockIndex: number, element: number): InsertResult {
  const path: { blockId: number; action: string }[] = [];
  let blocksAccessed = 0;
  
  // Encontrar el primer bloque con espacio disponible
  let targetBlockIndex = startBlockIndex;
  while (targetBlockIndex < structure.blocks.length && 
         structure.blocks[targetBlockIndex].size >= structure.blocks[targetBlockIndex].capacity) {
    path.push({ blockId: targetBlockIndex, action: 'check_capacity' });
    blocksAccessed++;
    targetBlockIndex++;
  }
  
  // Si no hay espacio en ningún bloque
  if (targetBlockIndex >= structure.blocks.length) {
    return {
      success: false,
      blockIndex: -1,
      elementIndex: -1,
      blocksAccessed,
      shifted: false,
      path,
      message: 'No hay espacio disponible en la estructura'
    };
  }
  
  // Realizar corrimiento desde el bloque objetivo hacia atrás
  for (let i = targetBlockIndex; i > startBlockIndex; i--) {
    const currentBlock = structure.blocks[i];
    const previousBlock = structure.blocks[i - 1];
    
    // Mover el último elemento del bloque anterior al actual
    const lastElement = previousBlock.elements[previousBlock.size - 1];
    currentBlock.elements[currentBlock.size] = lastElement;
    currentBlock.size++;
    previousBlock.size--;
    
    path.push({ blockId: i, action: 'receive_element' });
    path.push({ blockId: i - 1, action: 'send_element' });
    blocksAccessed += 2;
  }
  
  // Insertar el nuevo elemento en la posición correcta del bloque inicial
  const targetBlock = structure.blocks[startBlockIndex];
  const insertPosition = findInsertPosition(targetBlock, element);
  
  if (insertInBlock(targetBlock, element, insertPosition)) {
    path.push({ blockId: startBlockIndex, action: 'insert_element' });
    blocksAccessed++;
    structure.currentSize++;
    
    return {
      success: true,
      blockIndex: startBlockIndex,
      elementIndex: insertPosition,
      blocksAccessed,
      shifted: true,
      path,
      message: `Elemento ${element} insertado en bloque ${startBlockIndex} con corrimiento`
    };
  }
  
  return {
    success: false,
    blockIndex: -1,
    elementIndex: -1,
    blocksAccessed,
    shifted: false,
    path,
    message: 'Error durante la inserción'
  };
}

/**
 * Función hash simple para búsquedas externas hash
 */
export function hashFunction(element: number, totalBlocks: number): number {
  return element % totalBlocks;
}

/**
 * Convierte la estructura de bloques a un formato para exportar
 */
export function exportBlockStructure(structure: BlockStructure) {
  return {
    type: 'external_search',
    timestamp: new Date().toISOString(),
    config: {
      totalCapacity: structure.totalCapacity,
      elementsPerBlock: structure.elementsPerBlock,
      totalBlocks: structure.totalBlocks,
      currentSize: structure.currentSize
    },
    data: {
      blocks: structure.blocks.map(block => ({
        id: block.id,
        elements: [...block.elements.slice(0, block.size)],
        size: block.size,
        capacity: block.capacity
      }))
    }
  };
}

/**
 * Importa una estructura de bloques desde un formato exportado
 */
export function importBlockStructure(importData: any): BlockStructure | null {
  try {
    if (importData.type !== 'external_search') {
      return null;
    }
    
    const structure = createBlockStructure(importData.config.totalCapacity);
    structure.currentSize = importData.config.currentSize;
    
    // Restaurar los bloques
    for (let i = 0; i < importData.data.blocks.length; i++) {
      const blockData = importData.data.blocks[i];
      const block = structure.blocks[i];
      
      block.elements = [...blockData.elements];
      block.size = blockData.size;
      
      // Rellenar con elementos vacíos hasta la capacidad
      while (block.elements.length < block.capacity) {
        block.elements.push(0);
      }
    }
    
    return structure;
  } catch (error) {
    console.error('Error importing block structure:', error);
    return null;
  }
}