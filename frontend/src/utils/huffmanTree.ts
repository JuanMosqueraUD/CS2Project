// Utilidades para árbol de Huffman
export interface HuffmanNode {
  char: string | null;  // null for internal nodes
  frequency: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  isLeaf: boolean;
}

export interface CharFrequency {
  char: string;
  frequency: number;
  code?: string; // binary code assigned by huffman
}

export interface HuffmanResult {
  tree: HuffmanNode | null;
  frequencies: CharFrequency[];
  codes: Map<string, string>;
  originalText: string;
}

export function countFrequencies(text: string): CharFrequency[] {
  if (!text || text.length === 0) return [];
  
  const frequencyMap = new Map<string, number>();
  const orderMap = new Map<string, number>(); // to track order of appearance
  let orderIndex = 0;
  
  for (const char of text) {
    if (!orderMap.has(char)) {
      orderMap.set(char, orderIndex++);
    }
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
  }
  
  const frequencies: CharFrequency[] = [];
  for (const [char, freq] of frequencyMap) {
    frequencies.push({ char, frequency: freq });
  }
  
  // Sort by frequency (ascending), then by order of appearance for ties
  frequencies.sort((a, b) => {
    if (a.frequency !== b.frequency) {
      return a.frequency - b.frequency; // lower frequency first
    }
    return (orderMap.get(a.char) || 0) - (orderMap.get(b.char) || 0);
  });
  
  return frequencies;
}

export function createLeafNode(char: string, frequency: number): HuffmanNode {
  return {
    char,
    frequency,
    left: null,
    right: null,
    isLeaf: true
  };
}

export function createInternalNode(left: HuffmanNode, right: HuffmanNode): HuffmanNode {
  return {
    char: null,
    frequency: left.frequency + right.frequency,
    left,
    right,
    isLeaf: false
  };
}

export function buildHuffmanTree(frequencies: CharFrequency[]): HuffmanNode | null {
  if (frequencies.length === 0) return null;
  if (frequencies.length === 1) {
    // Special case: single character - create a minimal tree
    const leaf = createLeafNode(frequencies[0].char, frequencies[0].frequency);
    return createInternalNode(leaf, createLeafNode('', 0)); // dummy right node
  }
  
  // Convert frequencies to leaf nodes
  const nodes: HuffmanNode[] = frequencies.map(f => createLeafNode(f.char, f.frequency));
  
  // Build tree by combining nodes with lowest frequencies
  while (nodes.length > 1) {
    // Sort by frequency (ascending), keeping original order for ties
    nodes.sort((a, b) => a.frequency - b.frequency);
    
    // Take two nodes with lowest frequencies
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    
    // Create new internal node
    const merged = createInternalNode(left, right);
    
    // Add back to list
    nodes.push(merged);
  }
  
  return nodes[0];
}

export function generateCodes(root: HuffmanNode | null): Map<string, string> {
  const codes = new Map<string, string>();
  if (!root) return codes;
  
  // Handle single character case
  if (root.isLeaf) {
    codes.set(root.char!, '0');
    return codes;
  }
  
  function traverse(node: HuffmanNode, code: string) {
    if (node.isLeaf && node.char !== null && node.char !== '') {
      codes.set(node.char, code);
    } else {
      if (node.left) traverse(node.left, code + '0');
      if (node.right) traverse(node.right, code + '1');
    }
  }
  
  traverse(root, '');
  return codes;
}

export function encodeText(text: string, codes: Map<string, string>): string {
  let encoded = '';
  for (const char of text) {
    const code = codes.get(char);
    if (code !== undefined) {
      encoded += code;
    }
  }
  return encoded;
}

export function decodeText(encoded: string, root: HuffmanNode | null): string {
  if (!root || !encoded) return '';
  
  // Handle single character tree
  if (root.isLeaf) {
    return root.char!.repeat(encoded.length);
  }
  
  let decoded = '';
  let currentNode = root;
  
  for (const bit of encoded) {
    if (bit === '0') {
      currentNode = currentNode.left!;
    } else if (bit === '1') {
      currentNode = currentNode.right!;
    }
    
    if (currentNode.isLeaf && currentNode.char !== null && currentNode.char !== '') {
      decoded += currentNode.char;
      currentNode = root; // reset to root
    }
  }
  
  return decoded;
}

export function createHuffmanFromText(text: string): HuffmanResult {
  const frequencies = countFrequencies(text);
  const tree = buildHuffmanTree(frequencies);
  const codes = generateCodes(tree);
  
  // Update frequencies with codes
  frequencies.forEach(f => {
    f.code = codes.get(f.char) || '';
  });
  
  return {
    tree,
    frequencies,
    codes,
    originalText: text
  };
}

// Utility to get tree depth for visualization
export function getTreeDepth(node: HuffmanNode | null): number {
  if (!node) return 0;
  if (node.isLeaf) return 1;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

// Utility to count total nodes for visualization
export function countNodes(node: HuffmanNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}