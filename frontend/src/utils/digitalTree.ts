export type DTNode = {
  key: string | null; // single letter (uppercase) or null when logically deleted
  code: string;       // 5-bit code string, e.g., '10101' ('' when key is null)
  left: DTNode | null;
  right: DTNode | null;
};

export function letterToCode(ch: string): string | null {
  if (!ch || ch.length === 0) return null;
  const c = ch[0].toUpperCase();
  const code = c.charCodeAt(0) - 64; // A=1, B=2, ... Z=26
  if (code < 1 || code > 26) return null;
  return code.toString(2).padStart(5, '0');
}

export function makeNode(letter: string): DTNode {
  const code = letterToCode(letter)!;
  return { key: letter.toUpperCase(), code, left: null, right: null };
}

export function searchLetter(
  root: DTNode | null,
  letter: string
): { found: boolean; path: Array<'L' | 'R'>; node: DTNode | null; parent: DTNode | null } {
  const target = letter.toUpperCase();
  const path: Array<'L' | 'R'> = [];
  if (!root) return { found: false, path, node: null, parent: null };

  // DFS stack with path tracking
  type Frame = { node: DTNode; parent: DTNode | null; path: Array<'L' | 'R'> };
  const stack: Frame[] = [{ node: root, parent: null, path: [] }];
  while (stack.length) {
    const { node, parent, path } = stack.pop()!;
    if (node.key === target) {
      return { found: true, path, node, parent };
    }
    if (node.right) stack.push({ node: node.right, parent: node, path: [...path, 'R'] });
    if (node.left) stack.push({ node: node.left, parent: node, path: [...path, 'L'] });
  }
  return { found: false, path: [], node: null, parent: null };
}

export function insertNode(
  root: DTNode | null,
  letter: string
): { root: DTNode; path: Array<'L' | 'R'>; status: 'inserted' | 'duplicate' } {
  const code = letterToCode(letter);
  if (!code) throw new Error('Solo se permiten letras A-Z');
  const node = makeNode(letter);
  const path: Array<'L' | 'R'> = [];

  // No duplicates
  const already = searchLetter(root, letter);
  if (already.found) {
    return { root: root!, path: already.path, status: 'duplicate' };
  }

  if (root === null) {
    return { root: node, path, status: 'inserted' };
  }

  let current: DTNode = root;
  let bitIndex = 0;
  while (true) {
    // Reuse logically deleted node if encountered
    if (current.key === null) {
      current.key = node.key;
      current.code = node.code;
      break;
    }
    const bit = code[bitIndex] === '1' ? 'R' : 'L';
    if (bit === 'L') {
      if (current.left === null) {
        current.left = node;
        path.push('L');
        break;
      } else {
        current = current.left;
        path.push('L');
      }
    } else {
      if (current.right === null) {
        current.right = node;
        path.push('R');
        break;
      } else {
        current = current.right;
        path.push('R');
      }
    }
    bitIndex = (bitIndex + 1) % node.code.length; // ciclo sobre los 5 bits
  }

  return { root, path, status: 'inserted' };
}

export function deleteLetter(
  root: DTNode | null,
  letter: string
): { root: DTNode | null; deleted: boolean; path: Array<'L' | 'R'>; mode?: 'leaf' | 'one-child' | 'two-children' } {
  if (!root) return { root: null, deleted: false, path: [] };
  const found = searchLetter(root, letter);
  if (!found.found || !found.node) return { root, deleted: false, path: [] };

  const node = found.node;
  const parent = found.parent;
  const path = found.path;

  const left = node.left;
  const right = node.right;

  // Case 1: leaf
  if (!left && !right) {
    if (!parent) {
      return { root: null, deleted: true, path, mode: 'leaf' };
    }
    if (parent.left === node) parent.left = null;
    else if (parent.right === node) parent.right = null;
    return { root, deleted: true, path, mode: 'leaf' };
  }

  // Case 2: one child -> splice
  if (!!left !== !!right) {
    const child = left ?? right!;
    if (!parent) {
      return { root: child, deleted: true, path, mode: 'one-child' };
    }
    if (parent.left === node) parent.left = child;
    else if (parent.right === node) parent.right = child;
    return { root, deleted: true, path, mode: 'one-child' };
  }

  // Case 3: two children -> logical delete (keep structure)
  node.key = null;
  node.code = '';
  return { root, deleted: true, path, mode: 'two-children' };
}
