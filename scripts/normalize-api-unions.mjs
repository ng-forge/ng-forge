// Canonicalize api-extractor report files by sorting union-type members.
//
// TypeScript emits union members in an order set by internal type-interning,
// which is not stable across parallel builds. That makes api-extractor golden
// diffs flaky (a union can reorder with no real API change). Sorting members
// makes the reports order-insensitive: api-check normalizes both sides before
// comparing, and api-update writes goldens in canonical (sorted) form.
//
// Only union member ORDER changes; everything else (formatting, comments,
// release-tag markers) is preserved by splicing back into the original text.
import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';

const FENCE_RE = /```ts\n([\s\S]*?)\n```/;

function hasUnionAncestor(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isUnionTypeNode(p)) return true;
  }
  return false;
}

// Reconstruct a node's text with every nested union's members sorted, keeping
// all other characters byte-identical to the source.
function normalizeNode(node, sf) {
  if (ts.isUnionTypeNode(node)) {
    return node.types
      .map((t) => normalizeNode(t, sf).trim())
      .sort()
      .join(' | ');
  }
  const children = [];
  node.forEachChild((c) => children.push(c));
  if (children.length === 0) return node.getText(sf);

  const base = node.getStart(sf);
  let text = node.getText(sf);
  const repls = children
    .map((c) => ({ start: c.getStart(sf) - base, end: c.getEnd() - base, text: normalizeNode(c, sf) }))
    .filter((r) => r.start >= 0 && r.end <= text.length)
    .sort((a, b) => b.start - a.start);
  for (const r of repls) text = text.slice(0, r.start) + r.text + text.slice(r.end);
  return text;
}

function normalizeCode(code) {
  const sf = ts.createSourceFile('api.d.ts', code, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  const unions = [];
  const visit = (node) => {
    if (ts.isUnionTypeNode(node) && !hasUnionAncestor(node)) unions.push(node);
    node.forEachChild(visit);
  };
  sf.forEachChild(visit);

  const repls = unions
    .map((n) => ({ start: n.getStart(sf), end: n.getEnd(), text: normalizeNode(n, sf) }))
    .sort((a, b) => b.start - a.start);
  let out = code;
  for (const r of repls) out = out.slice(0, r.start) + r.text + out.slice(r.end);
  return out;
}

export function normalizeApiReport(content) {
  const m = content.match(FENCE_RE);
  if (!m) return content;
  const normalized = normalizeCode(m[1]);
  return content.slice(0, m.index) + '```ts\n' + normalized + '\n```' + content.slice(m.index + m[0].length);
}

// CLI: normalize the given report files in place.
const files = process.argv.slice(2);
if (files.length) {
  for (const f of files) {
    const before = readFileSync(f, 'utf8');
    const after = normalizeApiReport(before);
    if (after !== before) {
      writeFileSync(f, after);
      console.log('normalized', f);
    }
  }
}
