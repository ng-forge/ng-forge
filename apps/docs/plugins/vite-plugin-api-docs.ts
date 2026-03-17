/**
 * Vite plugin that generates API reference JSON from TypeScript source files.
 *
 * Dev mode: lazily extracts on first request, serves via middleware, watches for changes.
 * Build mode: extracts all packages once, emits as static assets.
 */

import { resolve, join } from 'node:path';
import { statSync } from 'node:fs';
import type { Plugin, ViteDevServer } from 'vite';
import { Project, SyntaxKind, Node, Type, Symbol as MorphSymbol, ts } from 'ts-morph';

// ─── Types ───────────────────────────────────────────────────────────────────

type DeclarationKind = 'class' | 'interface' | 'type' | 'function' | 'const' | 'enum' | 'component' | 'directive' | 'injectable' | 'pipe';

interface ApiMember {
  name: string;
  kind: 'property' | 'method' | 'accessor';
  type: string;
  description: string;
  params?: ApiParam[];
  returnType?: string;
  isOptional?: boolean;
  isReadonly?: boolean;
  isStatic?: boolean;
  defaultValue?: string;
  deprecated?: string;
}

interface ApiParam {
  name: string;
  type: string;
  description: string;
  isOptional?: boolean;
  defaultValue?: string;
}

interface ApiTypeParam {
  name: string;
  constraint?: string;
  default?: string;
  description: string;
}

interface ApiDeclaration {
  name: string;
  kind: DeclarationKind;
  description: string;
  signature: string;
  members: ApiMember[];
  params?: ApiParam[];
  returnType?: string;
  typeParams?: ApiTypeParam[];
  deprecated?: string;
  see?: string[];
  examples?: string[];
  remarks?: string;
  sourceFile: string;
  sourceLine: number;
}

interface ApiPackage {
  name: string;
  slug: string;
  declarations: ApiDeclaration[];
}

interface PackageDef {
  name: string;
  slug: string;
  entryPoints: string[];
}

// ─── Package definitions ─────────────────────────────────────────────────────

const PACKAGES: PackageDef[] = [
  { name: '@ng-forge/dynamic-forms', slug: 'core', entryPoints: ['packages/dynamic-forms/src/index.ts'] },
  { name: '@ng-forge/dynamic-forms-material', slug: 'material', entryPoints: ['packages/dynamic-forms-material/src/index.ts'] },
  { name: '@ng-forge/dynamic-forms-bootstrap', slug: 'bootstrap', entryPoints: ['packages/dynamic-forms-bootstrap/src/index.ts'] },
  { name: '@ng-forge/dynamic-forms-primeng', slug: 'primeng', entryPoints: ['packages/dynamic-forms-primeng/src/index.ts'] },
  { name: '@ng-forge/dynamic-forms-ionic', slug: 'ionic', entryPoints: ['packages/dynamic-forms-ionic/src/index.ts'] },
];

const VALID_SLUGS = new Set(PACKAGES.map((p) => p.slug));

// ─── Extraction helpers ──────────────────────────────────────────────────────

function getJsDocs(node: Node) {
  return Node.isJSDocable(node) ? node.getJsDocs() : [];
}

function getJsDocDescription(node: Node): string {
  return getJsDocs(node)
    .map((d) => d.getDescription().trim())
    .filter(Boolean)
    .join('\n\n');
}

function getJsDocTag(node: Node, tagName: string): string[] {
  const results: string[] = [];
  for (const doc of getJsDocs(node)) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === tagName) {
        const comment = tag.getCommentText()?.trim() ?? '';
        if (comment) results.push(comment);
      }
    }
  }
  return results;
}

function getDeprecated(node: Node): string | undefined {
  const tags = getJsDocTag(node, 'deprecated');
  return tags.length ? tags[0] || 'Deprecated' : undefined;
}

function isInternal(node: Node): boolean {
  return getJsDocTag(node, 'internal').length > 0;
}

function formatType(type: Type): string {
  try {
    return type.getText(undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
  } catch {
    return 'unknown';
  }
}

function hasTypeParameters(node: Node): node is Node & { getTypeParameters(): import('ts-morph').TypeParameterDeclaration[] } {
  return 'getTypeParameters' in node && typeof (node as Record<string, unknown>).getTypeParameters === 'function';
}

function getTypeParams(node: Node): ApiTypeParam[] {
  if (!hasTypeParameters(node)) return [];
  const descriptions = new Map<string, string>();
  for (const doc of getJsDocs(node)) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'typeParam' || tag.getTagName() === 'template') {
        const match = (tag.getCommentText()?.trim() ?? '').match(/^(\w+)\s*[-–—]?\s*(.*)/s);
        if (match) descriptions.set(match[1], match[2]);
      }
    }
  }
  return node.getTypeParameters().map((tp) => ({
    name: tp.getName(),
    constraint: tp.getConstraint()?.getText(),
    default: tp.getDefault()?.getText(),
    description: descriptions.get(tp.getName()) ?? '',
  }));
}

function getSourceInfo(node: Node, root: string): { sourceFile: string; sourceLine: number } {
  return {
    sourceFile: node
      .getSourceFile()
      .getFilePath()
      .replace(root + '/', ''),
    sourceLine: node.getStartLineNumber(),
  };
}

function detectAngularKind(node: Node): DeclarationKind | null {
  if (!Node.isClassDeclaration(node)) return null;
  for (const dec of node.getDecorators()) {
    switch (dec.getName()) {
      case 'Component':
        return 'component';
      case 'Directive':
        return 'directive';
      case 'Injectable':
        return 'injectable';
      case 'Pipe':
        return 'pipe';
    }
  }
  return null;
}

function extractParams(node: Node): ApiParam[] {
  if (!Node.isFunctionDeclaration(node) && !Node.isMethodDeclaration(node) && !Node.isMethodSignature(node)) return [];
  const descriptions = new Map<string, string>();
  for (const doc of getJsDocs(node)) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'param' && Node.isJSDocParameterTag(tag)) {
        descriptions.set(tag.getName(), tag.getCommentText()?.trim() ?? '');
      }
    }
  }
  return node.getParameters().map((p) => ({
    name: p.getName(),
    type: formatType(p.getType()),
    description: descriptions.get(p.getName()) ?? '',
    isOptional: p.isOptional() || undefined,
    defaultValue: p.getInitializer()?.getText(),
  }));
}

function extractInterfaceMembers(node: Node): ApiMember[] {
  if (!Node.isInterfaceDeclaration(node)) return [];
  const members: ApiMember[] = [];
  for (const prop of node.getProperties()) {
    if (isInternal(prop)) continue;
    members.push({
      name: prop.getName(),
      kind: 'property',
      type: formatType(prop.getType()),
      description: getJsDocDescription(prop),
      isOptional: prop.hasQuestionToken() || undefined,
      isReadonly: prop.isReadonly() || undefined,
      deprecated: getDeprecated(prop),
    });
  }
  for (const method of node.getMethods()) {
    if (isInternal(method)) continue;
    members.push({
      name: method.getName(),
      kind: 'method',
      type: formatType(method.getReturnType()),
      description: getJsDocDescription(method),
      params: extractParams(method),
      returnType: formatType(method.getReturnType()),
      deprecated: getDeprecated(method),
    });
  }
  return members;
}

function extractClassMembers(node: Node): ApiMember[] {
  if (!Node.isClassDeclaration(node)) return [];
  const members: ApiMember[] = [];
  for (const prop of node.getProperties()) {
    if (isInternal(prop) || prop.hasModifier(SyntaxKind.PrivateKeyword) || prop.getName().startsWith('_')) continue;
    members.push({
      name: prop.getName(),
      kind: 'property',
      type: formatType(prop.getType()),
      description: getJsDocDescription(prop),
      isOptional: prop.hasQuestionToken() || undefined,
      isReadonly: prop.hasModifier(SyntaxKind.ReadonlyKeyword) || undefined,
      isStatic: prop.isStatic() || undefined,
      defaultValue: prop.getInitializer()?.getText(),
      deprecated: getDeprecated(prop),
    });
  }
  for (const method of node.getMethods()) {
    if (isInternal(method) || method.hasModifier(SyntaxKind.PrivateKeyword) || method.getName().startsWith('_')) continue;
    members.push({
      name: method.getName(),
      kind: 'method',
      type: formatType(method.getReturnType()),
      description: getJsDocDescription(method),
      params: extractParams(method),
      returnType: formatType(method.getReturnType()),
      isStatic: method.isStatic() || undefined,
      deprecated: getDeprecated(method),
    });
  }
  for (const acc of node.getGetAccessors()) {
    if (isInternal(acc) || acc.hasModifier(SyntaxKind.PrivateKeyword)) continue;
    members.push({
      name: acc.getName(),
      kind: 'accessor',
      type: formatType(acc.getReturnType()),
      description: getJsDocDescription(acc),
      isReadonly: !node.getSetAccessor(acc.getName()),
      isStatic: acc.isStatic() || undefined,
      deprecated: getDeprecated(acc),
    });
  }
  return members;
}

function getClassSignature(node: import('ts-morph').ClassDeclaration): string {
  const name = node.getName() ?? 'Anonymous';
  const tp = node.getTypeParameters();
  const tpStr = tp.length ? `<\n${tp.map((t) => `  ${t.getText()}`).join(',\n')}\n>` : '';
  const ext = node.getExtends()?.getText();
  const impl = node.getImplements().map((i) => i.getText());
  const lines = [`class ${name}${tpStr}`];
  if (ext) lines.push(`  extends ${ext}`);
  if (impl.length) lines.push(`  implements ${impl.join(', ')}`);
  return lines.length > 1 ? lines.join('\n') : lines[0];
}

function getInterfaceSignature(node: import('ts-morph').InterfaceDeclaration): string {
  const tp = node.getTypeParameters();
  const tpStr = tp.length ? `<\n${tp.map((t) => `  ${t.getText()}`).join(',\n')}\n>` : '';
  const ext = node.getExtends().map((e) => e.getText());
  const lines = [`interface ${node.getName()}${tpStr}`];
  if (ext.length) lines.push(`  extends ${ext.join(', ')}`);
  return lines.length > 1 ? lines.join('\n') : lines[0];
}

function getFunctionSignature(node: import('ts-morph').FunctionDeclaration): string {
  const name = node.getName() ?? 'anonymous';
  const tp = node.getTypeParameters();
  const tpStr = tp.length ? `<\n${tp.map((t) => `  ${t.getText()}`).join(',\n')}\n>` : '';
  const params = node.getParameters().map((p) => {
    const opt = p.isOptional() ? '?' : '';
    const init = p.getInitializer();
    return init
      ? `${p.getName()}${opt}: ${formatType(p.getType())} = ${init.getText()}`
      : `${p.getName()}${opt}: ${formatType(p.getType())}`;
  });
  const paramStr = params.length > 1 ? `(\n${params.map((p) => `  ${p}`).join(',\n')}\n)` : `(${params.join(', ')})`;
  return `function ${name}${tpStr}${paramStr}: ${formatType(node.getReturnType())}`;
}

function extractTypeAliasMembers(node: import('ts-morph').TypeAliasDeclaration): ApiMember[] {
  const type = node.getType();
  if (type.isObject() && !type.isArray()) {
    const props = type.getProperties();
    if (props.length > 0 && props.length <= 50) {
      return props
        .filter((p) => !p.getDeclarations().some((d) => isInternal(d)))
        .map((p) => ({
          name: p.getName(),
          kind: 'property' as const,
          type: formatType(p.getTypeAtLocation(node)),
          description: p.getDeclarations()[0] ? getJsDocDescription(p.getDeclarations()[0]) : '',
          isOptional: p.isOptional() || undefined,
        }));
    }
  }
  if (type.isUnion()) {
    const ut = type.getUnionTypes();
    if (ut.length <= 20 && ut.every((t) => t.isStringLiteral() || t.isNumberLiteral() || t.isBooleanLiteral())) {
      return ut.map((t) => ({ name: t.getText(), kind: 'property' as const, type: 'literal', description: '' }));
    }
  }
  return [];
}

function extractDeclaration(sym: MorphSymbol, root: string): ApiDeclaration | null {
  const resolved = sym.getAliasedSymbol() ?? sym;
  const decls = resolved.getDeclarations();
  if (!decls.length) return null;
  const node = decls[0];
  if (isInternal(node)) return null;

  const name = sym.getName();
  const { sourceFile: srcFile, sourceLine } = getSourceInfo(node, root);
  const common = {
    deprecated: getDeprecated(node),
    see: getJsDocTag(node, 'see'),
    examples: getJsDocTag(node, 'example'),
    remarks: getJsDocTag(node, 'remarks')[0],
    sourceFile: srcFile,
    sourceLine,
  };

  if (Node.isClassDeclaration(node)) {
    return {
      name,
      kind: detectAngularKind(node) ?? 'class',
      description: getJsDocDescription(node),
      signature: getClassSignature(node),
      members: extractClassMembers(node),
      typeParams: getTypeParams(node),
      ...common,
    };
  }
  if (Node.isInterfaceDeclaration(node)) {
    return {
      name,
      kind: 'interface',
      description: getJsDocDescription(node),
      signature: getInterfaceSignature(node),
      members: extractInterfaceMembers(node),
      typeParams: getTypeParams(node),
      ...common,
    };
  }
  if (Node.isTypeAliasDeclaration(node)) {
    return {
      name,
      kind: 'type',
      description: getJsDocDescription(node),
      signature: node.getText().replace(/^export\s+/, ''),
      members: extractTypeAliasMembers(node),
      typeParams: getTypeParams(node),
      ...common,
    };
  }
  if (Node.isFunctionDeclaration(node)) {
    return {
      name,
      kind: 'function',
      description: getJsDocDescription(node),
      signature: getFunctionSignature(node),
      members: [],
      params: extractParams(node),
      returnType: formatType(node.getReturnType()),
      typeParams: getTypeParams(node),
      ...common,
    };
  }
  if (Node.isVariableDeclaration(node)) {
    const stmt = node.getVariableStatement();
    const desc = stmt ? getJsDocDescription(stmt) : getJsDocDescription(node);
    const stmtCommon = {
      deprecated: stmt ? getDeprecated(stmt) : common.deprecated,
      see: stmt ? getJsDocTag(stmt, 'see') : common.see,
      examples: stmt ? getJsDocTag(stmt, 'example') : common.examples,
      remarks: stmt ? getJsDocTag(stmt, 'remarks')[0] : common.remarks,
      sourceFile: srcFile,
      sourceLine,
    };
    const type = node.getType();
    const callSigs = type.getCallSignatures();
    if (callSigs.length > 0) {
      const sig = callSigs[0];
      return {
        name,
        kind: 'function',
        description: desc,
        signature: `const ${name}: ${formatType(type)}`,
        members: [],
        params: sig.getParameters().map((p) => {
          const pd = p.getDeclarations()[0];
          return {
            name: p.getName(),
            type: formatType(p.getTypeAtLocation(node)),
            description: '',
            isOptional: pd && Node.isParameterDeclaration(pd) ? pd.isOptional() : undefined,
          };
        }),
        returnType: formatType(sig.getReturnType()),
        ...stmtCommon,
      };
    }
    return { name, kind: 'const', description: desc, signature: `const ${name}: ${formatType(type)}`, members: [], ...stmtCommon };
  }
  if (Node.isEnumDeclaration(node)) {
    return {
      name,
      kind: 'enum',
      description: getJsDocDescription(node),
      signature: node.getText().replace(/^export\s+/, ''),
      members: node.getMembers().map((m) => ({
        name: m.getName(),
        kind: 'property' as const,
        type: m.getValue()?.toString() ?? '',
        description: getJsDocDescription(m),
      })),
      ...common,
    };
  }
  return null;
}

// ─── Core extraction engine ──────────────────────────────────────────────────

const KIND_ORDER: Record<string, number> = {
  component: 0,
  directive: 1,
  injectable: 2,
  pipe: 3,
  class: 4,
  interface: 5,
  type: 6,
  function: 7,
  const: 8,
  enum: 9,
};

function processPackage(project: Project, pkgDef: PackageDef, root: string): ApiPackage {
  const declarations: ApiDeclaration[] = [];
  const seen = new Set<string>();

  for (const entryPath of pkgDef.entryPoints) {
    const sf = project.getSourceFile(join(root, entryPath));
    if (!sf) continue;
    for (const sym of sf.getExportSymbols()) {
      const name = sym.getName();
      if (seen.has(name)) continue;
      seen.add(name);
      try {
        const decl = extractDeclaration(sym, root);
        if (decl) declarations.push(decl);
      } catch {
        /* skip broken declarations */
      }
    }
  }

  declarations.sort((a, b) => {
    const d = (KIND_ORDER[a.kind] ?? 99) - (KIND_ORDER[b.kind] ?? 99);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });

  return { name: pkgDef.name, slug: pkgDef.slug, declarations };
}

function extractAll(root: string): Map<string, ApiPackage> {
  const project = new Project({ tsConfigFilePath: join(root, 'tsconfig.base.json'), skipAddingFilesFromTsConfig: true });
  for (const pkg of PACKAGES) {
    for (const entry of pkg.entryPoints) project.addSourceFileAtPath(join(root, entry));
  }
  project.resolveSourceFileDependencies();

  const results = new Map<string, ApiPackage>();
  for (const pkg of PACKAGES) {
    results.set(pkg.slug, processPackage(project, pkg, root));
  }
  return results;
}

function buildManifest(packages: Map<string, ApiPackage>): string {
  return JSON.stringify(
    PACKAGES.map((p) => ({ name: p.name, slug: p.slug, count: packages.get(p.slug)?.declarations.length ?? 0 })),
    null,
    2,
  );
}

// ─── Cache invalidation ──────────────────────────────────────────────────────

/** Get mtime of all entry point files as a combined fingerprint. */
function getSourceFingerprint(root: string): number {
  let maxMtime = 0;
  for (const pkg of PACKAGES) {
    for (const entry of pkg.entryPoints) {
      try {
        const mtime = statSync(join(root, entry)).mtimeMs;
        if (mtime > maxMtime) maxMtime = mtime;
      } catch {
        /* ignore missing */
      }
    }
  }
  return maxMtime;
}

// ─── Vite plugin ─────────────────────────────────────────────────────────────

export function apiDocsPlugin(): Plugin {
  const root = resolve(__dirname, '..', '..', '..');

  // In-memory cache
  let cache: Map<string, ApiPackage> | null = null;
  let cacheFingerprint = 0;

  function getPackages(): Map<string, ApiPackage> {
    const fp = getSourceFingerprint(root);
    if (cache && fp === cacheFingerprint) return cache;

    const start = performance.now();
    cache = extractAll(root);
    cacheFingerprint = fp;
    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`[api-docs] Extracted ${cache.size} packages in ${elapsed}ms`);
    return cache;
  }

  return {
    name: 'vite-plugin-api-docs',

    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        // Match /content/api/{slug}.json or /content/api/manifest.json
        const match = req.url?.match(/^\/content\/api\/(\w+)\.json$/);
        if (!match) return next();

        const slug = match[1];

        if (slug === 'manifest') {
          const packages = getPackages();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(buildManifest(packages));
          return;
        }

        if (!VALID_SLUGS.has(slug)) return next();

        const packages = getPackages();
        const pkg = packages.get(slug);
        if (!pkg) return next();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(JSON.stringify(pkg));
      });

      // Watch entry point files — invalidate cache on change
      for (const pkg of PACKAGES) {
        for (const entry of pkg.entryPoints) {
          server.watcher.add(resolve(root, entry));
        }
      }
      server.watcher.on('change', (filePath) => {
        const isEntryPoint = PACKAGES.some((pkg) => pkg.entryPoints.some((e) => resolve(root, e) === filePath));
        if (isEntryPoint) {
          console.log('[api-docs] Source changed, invalidating cache...');
          cache = null;
        }
      });
    },

    generateBundle() {
      const packages = getPackages();

      for (const [slug, pkg] of packages) {
        this.emitFile({
          type: 'asset',
          fileName: `content/api/${slug}.json`,
          source: JSON.stringify(pkg),
        });
      }

      this.emitFile({
        type: 'asset',
        fileName: 'content/api/manifest.json',
        source: buildManifest(packages),
      });
    },
  };
}
