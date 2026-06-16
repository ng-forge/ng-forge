#!/usr/bin/env node
/**
 * MCP publish-correctness smoke test.
 *
 * Catches the class of bug where the bundled CLI imports a bare npm specifier
 * that is NOT declared in the published `dependencies` (so a clean `npx` /
 * `npm install` of the package crashes at runtime with ERR_MODULE_NOT_FOUND).
 *
 * It is network-free and deterministic: it reads the GENERATED dist manifest
 * and parses every emitted .js file with a real ES parser (acorn), collecting
 * the specifiers of top-level static imports/exports and dynamic import()s, then
 * asserts each external one is declared (or is a Node builtin). Parsing the AST
 * (rather than scanning text) means import-looking lines inside template-literal
 * documentation strings are ignored automatically — they are not AST import nodes.
 *
 * Run after building: `nx build dynamic-form-mcp` then `node scripts/mcp-smoke-test.mjs`.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { builtinModules } from 'node:module';
import { parse } from 'acorn';

const DIST = 'dist/packages/dynamic-form-mcp';
const PKG = join(DIST, 'package.json');

if (!existsSync(PKG)) {
  console.error(`[mcp-smoke] ${PKG} not found. Build first: nx build dynamic-form-mcp`);
  process.exit(2);
}

const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.optionalDependencies ?? {}),
]);
const builtins = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

function walkJs(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walkJs(p, acc);
    else if (p.endsWith('.js')) acc.push(p);
  }
  return acc;
}

// Resolve a specifier to its package name (scoped + subpath aware).
function pkgName(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}

// Collect every import/export/dynamic-import specifier from an AST. Top-level
// static import/export-from declarations PLUS dynamic import() anywhere in the tree.
function collectSpecifiers(src) {
  const ast = parse(src, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true });
  const specs = [];
  for (const node of ast.body) {
    if (
      (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') &&
      node.source &&
      typeof node.source.value === 'string'
    ) {
      specs.push(node.source.value);
    }
  }
  // Recursive scan for dynamic import('literal').
  const stack = [ast];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'ImportExpression' && node.source && node.source.type === 'Literal' && typeof node.source.value === 'string') {
      specs.push(node.source.value);
    }
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) if (c && typeof c.type === 'string') stack.push(c);
      } else if (child && typeof child.type === 'string') {
        stack.push(child);
      }
    }
  }
  return specs;
}

const offenders = new Map(); // package name -> files
const files = walkJs(DIST);
for (const file of files) {
  let specs;
  try {
    specs = collectSpecifiers(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`[mcp-smoke] failed to parse ${file}: ${err.message}`);
    process.exit(2);
  }
  for (const spec of specs) {
    if (!spec || spec.startsWith('.') || spec.startsWith('node:')) continue;
    if (builtins.has(spec)) continue;
    const name = pkgName(spec);
    if (builtins.has(name) || declared.has(name)) continue;
    if (!offenders.has(name)) offenders.set(name, new Set());
    offenders.get(name).add(file.replace(`${DIST}/`, ''));
  }
}

if (offenders.size > 0) {
  console.error('[mcp-smoke] FAIL: bundled CLI imports undeclared external dependencies:');
  for (const [name, where] of offenders) {
    console.error(`  - "${name}" imported in: ${[...where].join(', ')}`);
  }
  console.error('\nAdd them to packages/dynamic-form-mcp/package.json "dependencies" (or bundle them).');
  process.exit(1);
}

console.log(`[mcp-smoke] OK: all external imports across ${files.length} emitted file(s) are declared in the published manifest.`);
