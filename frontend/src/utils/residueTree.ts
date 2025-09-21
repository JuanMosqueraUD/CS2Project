import { letterToCode } from './digitalTree';

export type RSNode = {
  key: string | null;     // leaf letter (uppercase) or null if connector
  code: string | null;    // 5-bit code for leaves; null for connectors
  left: RSNode | null;
  right: RSNode | null;
};

export function makeConnector(): RSNode {
  return { key: null, code: null, left: null, right: null };
}

export function makeLeaf(letter: string): RSNode {
  const code = letterToCode(letter);
  if (!code) throw new Error('Solo se permiten letras A-Z');
  return { key: letter.toUpperCase(), code, left: null, right: null };
}

function isLeaf(n: RSNode | null): n is RSNode {
  return !!n && n.key !== null;
}

function isConnector(n: RSNode | null): n is RSNode {
  return !!n && n.key === null;
}

export function searchRS(
  root: RSNode | null,
  letter: string
): { found: boolean; path: Array<'L' | 'R'> } {
  const code = letterToCode(letter);
  if (!code || !root) return { found: false, path: [] };
  let node: RSNode | null = root;
  const path: Array<'L' | 'R'> = [];
  for (let i = 0; i < code.length && node; i++) {
    if (isLeaf(node)) {
      return { found: node.key === letter.toUpperCase(), path };
    }
    const step: 'L' | 'R' = code[i] === '1' ? 'R' : 'L';
    path.push(step);
  const conn: RSNode = node; // connector expected or null
    node = step === 'L' ? conn.left : conn.right;
  }
  if (isLeaf(node)) {
    return { found: node.key === letter.toUpperCase(), path };
  }
  return { found: false, path };
}

export function insertRS(
  root: RSNode | null,
  letter: string
): { root: RSNode; path: Array<'L' | 'R'>; status: 'inserted' | 'duplicate' } {
  const leaf = makeLeaf(letter);
  const path: Array<'L' | 'R'> = [];

  // initialize root connector
  if (!root) {
    const r = makeConnector();
    // attach directly under root according to first bit
    const step: 'L' | 'R' = leaf.code![0] === '1' ? 'R' : 'L';
    path.push(step);
    if (step === 'L') r.left = leaf; else r.right = leaf;
    return { root: r, path, status: 'inserted' };
  }

  // Check duplicate
  const s = searchRS(root, letter);
  if (s.found) return { root, path: s.path, status: 'duplicate' };

  function reinsertInto(connector: RSNode, leafNode: RSNode, bitIndex: number) {
    let current = connector;
    for (let i = bitIndex; i < leafNode.code!.length; i++) {
      const step: 'L' | 'R' = leafNode.code![i] === '1' ? 'R' : 'L';
      const next = step === 'L' ? current.left : current.right;
      if (!next) {
        if (step === 'L') current.left = leafNode; else current.right = leafNode;
        return;
      }
      if (isConnector(next)) {
        current = next;
      } else {
        // collision deeper: convert and continue
        const existing = next;
        const newConn = makeConnector();
        if (step === 'L') current.left = newConn; else current.right = newConn;
        current = newConn;
        // reinsert the existing leaf even deeper
        // next bit after i
        reinsertInto(current, existing, i + 1);
        // and then place leafNode in the loop
      }
    }
    // If loop ends exactly at length, place leaf on a default side (should not happen for distinct codes)
    // but we guard to place on left if empty else right.
    if (!current.left) current.left = leafNode;
    else if (!current.right) current.right = leafNode;
    else {
      // extremely unlikely for 5-bit distinct letters
      current.left = current.left; // no-op
    }
  }

  // Traverse from root
  let current = root;
  for (let i = 0; i < leaf.code!.length; i++) {
    if (isLeaf(current)) {
      // should not happen since root starts as connector, but guard: convert to connector
      const existing = current;
      // promote: replace root (but we cannot replace in-place reference), so create new root
      const newRoot = makeConnector();
      // place existing under newRoot by first bit of existing code
      const step0: 'L' | 'R' = existing.code![0] === '1' ? 'R' : 'L';
      if (step0 === 'L') newRoot.left = existing; else newRoot.right = existing;
      root = newRoot;
      current = root;
    }
    const step: 'L' | 'R' = leaf.code![i] === '1' ? 'R' : 'L';
    path.push(step);
    let child = step === 'L' ? current.left : current.right;
    if (!child) {
      if (step === 'L') current.left = leaf; else current.right = leaf;
      return { root, path, status: 'inserted' };
    }
    if (isConnector(child)) {
      current = child;
      continue;
    }
    // child is leaf -> collision: convert to connector and reinsert existing
    const conn = makeConnector();
    if (step === 'L') current.left = conn; else current.right = conn;
    // reinsert existing leaf starting at next bit (i+1)
    reinsertInto(conn, child, i + 1);
    // now continue insertion of the new leaf into this connector at next bit
    current = conn;
  }

  // If exited loop without placing leaf, attach to nearest free side
  if (!current.left) current.left = leaf;
  else if (!current.right) current.right = leaf;
  return { root, path, status: 'inserted' };
}