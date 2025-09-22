import { letterToCode } from './digitalTree';

export type RMNode = {
  key: string | null;     // leaf letter or null if connector
  code: string | null;    // 5-bit for leaf; null for connector
  children: (RMNode | null)[]; // connectors have children; leaves have []
  labelBits?: string;     // for connectors: the bits this connector represents at its level
};

export function makeRMConnector(arity: number, labelBits?: string): RMNode {
  return { key: null, code: null, children: new Array(arity).fill(null), labelBits };
}

export function makeRMLeaf(letter: string): RMNode {
  const code = letterToCode(letter);
  if (!code) throw new Error('Solo se permiten letras A-Z');
  return { key: letter.toUpperCase(), code, children: [] };
}

export function groupBits(code: string, m: number): string[] {
  const groups: string[] = [];
  for (let i = 0; i < code.length; i += m) {
    groups.push(code.slice(i, i + m));
  }
  return groups;
}

function binToIndex(bits: string): number {
  return parseInt(bits, 2);
}

export function searchRM(root: RMNode | null, letter: string, m: number): { found: boolean; path: number[] } {
  if (!root) return { found: false, path: [] };
  const code = letterToCode(letter);
  if (!code) return { found: false, path: [] };
  const groups = groupBits(code, m);
  const path: number[] = [];
  let node: RMNode | null = root;
  for (let i = 0; i < groups.length && node; i++) {
    if (node.key !== null) return { found: node.key === letter.toUpperCase(), path };
    const idx = binToIndex(groups[i]);
    path.push(idx);
    node = node.children[idx] ?? null;
  }
  if (node && node.key !== null) return { found: node.key === letter.toUpperCase(), path };
  return { found: false, path };
}

export function buildRMTemplate(m: number): RMNode {
  if (m < 1 || m > 3) throw new Error('m debe estar entre 1 y 3');
  // chunk sizes per level, last chunk can be < m
  const chunks: number[] = [];
  let remaining = 5;
  while (remaining > 0) {
    const c = Math.min(m, remaining);
    chunks.push(c);
    remaining -= c;
  }
  const root = makeRMConnector(2 ** chunks[0]);
  // recursively populate children
  function buildLevel(node: RMNode, level: number) {
    const size = chunks[level];
    const arity = 2 ** size;
    for (let i = 0; i < arity; i++) {
      const bits = i.toString(2).padStart(size, '0');
      if (level === chunks.length - 1) {
        // final level connector
        node.children[i] = makeRMConnector(0, bits); // children length 0; acts as terminal connector
      } else {
        const child = makeRMConnector(2 ** chunks[level + 1], bits);
        node.children[i] = child;
        buildLevel(child, level + 1);
      }
    }
  }
  buildLevel(root, 0);
  return root;
}

export function insertRM(
  root: RMNode | null,
  letter: string,
  m: number
): { root: RMNode; path: number[]; status: 'inserted' | 'duplicate' } {
  if (m < 1 || m > 3) throw new Error('m debe estar entre 1 y 3');
  const code = letterToCode(letter);
  if (!code) throw new Error('Solo se permiten letras A-Z');
  const groups = groupBits(code, m);
  const path: number[] = [];

  if (!root) {
    root = buildRMTemplate(m);
  }

  const s = searchRM(root, letter, m);
  if (s.found) return { root, path: s.path, status: 'duplicate' };

  // traverse to final connector corresponding to last group
  let node: RMNode = root;
  for (let i = 0; i < groups.length; i++) {
    const idx = binToIndex(groups[i]);
    path.push(idx);
    const child = node.children[idx];
    if (!child) throw new Error('Plantilla incompleta para m; espera a que se genere el trie');
    node = child;
  }
  // node is terminal connector for last group: convert to leaf (store letter)
  node.key = letter.toUpperCase();
  node.code = code;
  node.children = [];
  return { root, path, status: 'inserted' };
}