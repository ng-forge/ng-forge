/**
 * Generate API reference JSON from TypeScript source files using ts-morph.
 *
 * Parses the public exports of each @ng-forge package and outputs structured
 * JSON to apps/docs/public/content/api/{package-slug}.json.
 *
 * Usage: npx tsx apps/docs/scripts/generate-api-docs.ts
 */

import { Project, SyntaxKind, Node, Type, Symbol as MorphSymbol, ts } from 'ts-morph';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..', '..');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'content', 'api');

// ─── Types ───────────────────────────────────────────────────────────────────

export type DeclarationKind =
  | 'class'
  | 'interface'
  | 'type'
  | 'function'
  | 'const'
  | 'enum'
  | 'component'
  | 'directive'
  | 'injectable'
  | 'pipe';

export interface ApiMember {
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
  tags?: Record<string, string>;
}

export interface ApiParam {
  name: string;
  type: string;
  description: string;
  isOptional?: boolean;
  defaultValue?: string;
}

export interface ApiTypeParam {
  name: string;
  constraint?: string;
  default?: string;
  description: string;
}

export interface ApiDeclaration {
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

export interface ApiPackage {
  name: string;
  slug: string;
  declarations: ApiDeclaration[];
}

// ─── Package definitions ─────────────────────────────────────────────────────

interface PackageDef {
  name: string;
  slug: string;
  entryPoints: string[];
}

const PACKAGES: PackageDef[] = [
  {
    name: '@ng-forge/dynamic-forms',
    slug: 'core',
    entryPoints: ['packages/dynamic-forms/src/index.ts'],
  },
  {
    name: '@ng-forge/dynamic-forms-material',
    slug: 'material',
    entryPoints: ['packages/dynamic-forms-material/src/index.ts'],
  },
  {
    name: '@ng-forge/dynamic-forms-bootstrap',
    slug: 'bootstrap',
    entryPoints: ['packages/dynamic-forms-bootstrap/src/index.ts'],
  },
  {
    name: '@ng-forge/dynamic-forms-primeng',
    slug: 'primeng',
    entryPoints: ['packages/dynamic-forms-primeng/src/index.ts'],
  },
  {
    name: '@ng-forge/dynamic-forms-ionic',
    slug: 'ionic',
    entryPoints: ['packages/dynamic-forms-ionic/src/index.ts'],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getJsDocDescription(node: Node): string {
  const jsDocs = getJsDocs(node);
  if (!jsDocs.length) return '';
  return jsDocs
    .map((doc) => doc.getDescription().trim())
    .filter(Boolean)
    .join('\n\n');
}

function getJsDocs(node: Node): ReturnType<typeof Node.prototype.getChildrenOfKind<SyntaxKind.JSDoc>> {
  if (Node.isJSDocable(node)) {
    return node.getJsDocs();
  }
  return [];
}

function getJsDocTag(node: Node, tagName: string): string[] {
  const jsDocs = getJsDocs(node);
  const results: string[] = [];
  for (const doc of jsDocs) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === tagName) {
        const comment = tag.getCommentText()?.trim() ?? '';
        if (comment) results.push(comment);
      }
    }
  }
  return results;
}

function getJsDocSingleTag(node: Node, tagName: string): string | undefined {
  const tags = getJsDocTag(node, tagName);
  return tags[0];
}

function getDeprecated(node: Node): string | undefined {
  const tags = getJsDocTag(node, 'deprecated');
  return tags.length ? tags[0] || 'Deprecated' : undefined;
}

function getSee(node: Node): string[] {
  return getJsDocTag(node, 'see');
}

function getExamples(node: Node): string[] {
  return getJsDocTag(node, 'example');
}

function getRemarks(node: Node): string | undefined {
  return getJsDocSingleTag(node, 'remarks');
}

function hasTypeParameters(node: Node): node is Node & { getTypeParameters(): import('ts-morph').TypeParameterDeclaration[] } {
  return 'getTypeParameters' in node && typeof (node as Record<string, unknown>).getTypeParameters === 'function';
}

function getTypeParams(node: Node): ApiTypeParam[] {
  if (!hasTypeParameters(node)) return [];
  const jsDocs = getJsDocs(node);
  const typeParamDescriptions = new Map<string, string>();
  for (const doc of jsDocs) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'typeParam' || tag.getTagName() === 'template') {
        const text = tag.getCommentText()?.trim() ?? '';
        // Format: "TName - description" or "TName description"
        const match = text.match(/^(\w+)\s*[-–—]?\s*(.*)/s);
        if (match) {
          typeParamDescriptions.set(match[1], match[2]);
        }
      }
    }
  }

  return node.getTypeParameters().map((tp) => ({
    name: tp.getName(),
    constraint: tp.getConstraint()?.getText(),
    default: tp.getDefault()?.getText(),
    description: typeParamDescriptions.get(tp.getName()) ?? '',
  }));
}

function formatType(type: Type): string {
  try {
    return type.getText(undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope);
  } catch {
    return 'unknown';
  }
}

function getSourceInfo(node: Node): { sourceFile: string; sourceLine: number } {
  const sf = node.getSourceFile();
  const filePath = sf.getFilePath();
  // Make relative to workspace root
  const relative = filePath.replace(ROOT + '/', '');
  return { sourceFile: relative, sourceLine: node.getStartLineNumber() };
}

function isInternal(node: Node): boolean {
  return getJsDocTag(node, 'internal').length > 0;
}

function detectAngularKind(node: Node): DeclarationKind | null {
  if (!Node.isClassDeclaration(node)) return null;
  for (const decorator of node.getDecorators()) {
    const name = decorator.getName();
    switch (name) {
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

// ─── Member extraction ───────────────────────────────────────────────────────

function extractParams(node: Node): ApiParam[] {
  if (!Node.isFunctionDeclaration(node) && !Node.isMethodDeclaration(node) && !Node.isMethodSignature(node)) {
    return [];
  }

  const jsDocs = getJsDocs(node);
  const paramDescriptions = new Map<string, string>();
  for (const doc of jsDocs) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'param') {
        const text = tag.getCommentText()?.trim() ?? '';
        // Tag name is embedded in the JSDoc tag
        if (Node.isJSDocParameterTag(tag)) {
          paramDescriptions.set(tag.getName(), text);
        }
      }
    }
  }

  return node.getParameters().map((param) => ({
    name: param.getName(),
    type: formatType(param.getType()),
    description: paramDescriptions.get(param.getName()) ?? '',
    isOptional: param.isOptional() || undefined,
    defaultValue: param.getInitializer()?.getText(),
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
    if (isInternal(prop)) continue;
    if (prop.hasModifier(SyntaxKind.PrivateKeyword)) continue;
    if (prop.getName().startsWith('_')) continue; // skip private-by-convention

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
    if (isInternal(method)) continue;
    if (method.hasModifier(SyntaxKind.PrivateKeyword)) continue;
    if (method.getName().startsWith('_')) continue;

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

  for (const accessor of node.getGetAccessors()) {
    if (isInternal(accessor)) continue;
    if (accessor.hasModifier(SyntaxKind.PrivateKeyword)) continue;

    members.push({
      name: accessor.getName(),
      kind: 'accessor',
      type: formatType(accessor.getReturnType()),
      description: getJsDocDescription(accessor),
      isReadonly: !node.getSetAccessor(accessor.getName()),
      isStatic: accessor.isStatic() || undefined,
      deprecated: getDeprecated(accessor),
    });
  }

  return members;
}

// ─── Declaration extraction ──────────────────────────────────────────────────

function extractDeclaration(exportSymbol: MorphSymbol): ApiDeclaration | null {
  // Follow re-export aliases to get the actual declaration
  const resolvedSymbol = exportSymbol.getAliasedSymbol() ?? exportSymbol;
  const declarations = resolvedSymbol.getDeclarations();
  if (!declarations.length) return null;

  const node = declarations[0];
  if (isInternal(node)) return null;

  const name = exportSymbol.getName();
  const { sourceFile: srcFile, sourceLine } = getSourceInfo(node);

  // Class declaration
  if (Node.isClassDeclaration(node)) {
    const angularKind = detectAngularKind(node);
    const kind = angularKind ?? 'class';
    return {
      name,
      kind,
      description: getJsDocDescription(node),
      signature: getClassSignature(node),
      members: extractClassMembers(node),
      typeParams: getTypeParams(node),
      deprecated: getDeprecated(node),
      see: getSee(node),
      examples: getExamples(node),
      remarks: getRemarks(node),
      sourceFile: srcFile,
      sourceLine,
    };
  }

  // Interface declaration
  if (Node.isInterfaceDeclaration(node)) {
    return {
      name,
      kind: 'interface',
      description: getJsDocDescription(node),
      signature: getInterfaceSignature(node),
      members: extractInterfaceMembers(node),
      typeParams: getTypeParams(node),
      deprecated: getDeprecated(node),
      see: getSee(node),
      examples: getExamples(node),
      remarks: getRemarks(node),
      sourceFile: srcFile,
      sourceLine,
    };
  }

  // Type alias
  if (Node.isTypeAliasDeclaration(node)) {
    return {
      name,
      kind: 'type',
      description: getJsDocDescription(node),
      signature: node.getText().replace(/^export\s+/, ''),
      members: extractTypeAliasMembers(node),
      typeParams: getTypeParams(node),
      deprecated: getDeprecated(node),
      see: getSee(node),
      examples: getExamples(node),
      remarks: getRemarks(node),
      sourceFile: srcFile,
      sourceLine,
    };
  }

  // Function declaration
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
      deprecated: getDeprecated(node),
      see: getSee(node),
      examples: getExamples(node),
      remarks: getRemarks(node),
      sourceFile: srcFile,
      sourceLine,
    };
  }

  // Variable declaration (const)
  if (Node.isVariableDeclaration(node)) {
    const statement = node.getVariableStatement();
    const desc = statement ? getJsDocDescription(statement) : getJsDocDescription(node);
    const deprecated = statement ? getDeprecated(statement) : getDeprecated(node);
    const see = statement ? getSee(statement) : getSee(node);
    const examples = statement ? getExamples(statement) : getExamples(node);
    const remarks = statement ? getRemarks(statement) : getRemarks(node);

    // Check if it's a function-valued const
    const type = node.getType();
    const callSignatures = type.getCallSignatures();
    if (callSignatures.length > 0) {
      const sig = callSignatures[0];
      const params: ApiParam[] = sig.getParameters().map((p) => {
        const paramDecl = p.getDeclarations()[0];
        return {
          name: p.getName(),
          type: formatType(p.getTypeAtLocation(node)),
          description: '',
          isOptional: paramDecl && Node.isParameterDeclaration(paramDecl) ? paramDecl.isOptional() : undefined,
        };
      });
      return {
        name,
        kind: 'function',
        description: desc,
        signature: `const ${name}: ${formatType(type)}`,
        members: [],
        params,
        returnType: formatType(sig.getReturnType()),
        deprecated,
        see,
        examples,
        remarks,
        sourceFile: srcFile,
        sourceLine,
      };
    }

    return {
      name,
      kind: 'const',
      description: desc,
      signature: `const ${name}: ${formatType(type)}`,
      members: [],
      deprecated,
      see,
      examples,
      remarks,
      sourceFile: srcFile,
      sourceLine,
    };
  }

  // Enum declaration
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
      deprecated: getDeprecated(node),
      see: getSee(node),
      examples: getExamples(node),
      remarks: getRemarks(node),
      sourceFile: srcFile,
      sourceLine,
    };
  }

  return null;
}

// ─── Signature helpers ───────────────────────────────────────────────────────

function getClassSignature(node: import('ts-morph').ClassDeclaration): string {
  const name = node.getName() ?? 'Anonymous';
  const typeParams = node.getTypeParameters();
  const typeParamStr = typeParams.length ? `<${typeParams.map((tp) => tp.getText()).join(', ')}>` : '';
  const extendClause = node.getExtends()?.getText();
  const implementClauses = node.getImplements().map((i) => i.getText());

  let sig = `class ${name}${typeParamStr}`;
  if (extendClause) sig += ` extends ${extendClause}`;
  if (implementClauses.length) sig += ` implements ${implementClauses.join(', ')}`;
  return sig;
}

function getInterfaceSignature(node: import('ts-morph').InterfaceDeclaration): string {
  const name = node.getName();
  const typeParams = node.getTypeParameters();
  const typeParamStr = typeParams.length ? `<${typeParams.map((tp) => tp.getText()).join(', ')}>` : '';
  const extendClauses = node.getExtends().map((e) => e.getText());

  let sig = `interface ${name}${typeParamStr}`;
  if (extendClauses.length) sig += ` extends ${extendClauses.join(', ')}`;
  return sig;
}

function getFunctionSignature(node: import('ts-morph').FunctionDeclaration): string {
  const name = node.getName() ?? 'anonymous';
  const typeParams = node.getTypeParameters();
  const typeParamStr = typeParams.length ? `<${typeParams.map((tp) => tp.getText()).join(', ')}>` : '';
  const params = node.getParameters().map((p) => {
    const optional = p.isOptional() ? '?' : '';
    const initializer = p.getInitializer();
    if (initializer) {
      return `${p.getName()}${optional}: ${formatType(p.getType())} = ${initializer.getText()}`;
    }
    return `${p.getName()}${optional}: ${formatType(p.getType())}`;
  });
  const returnType = formatType(node.getReturnType());
  return `function ${name}${typeParamStr}(${params.join(', ')}): ${returnType}`;
}

function extractTypeAliasMembers(node: import('ts-morph').TypeAliasDeclaration): ApiMember[] {
  const type = node.getType();

  // For object-like type aliases, extract properties
  if (type.isObject() && !type.isArray()) {
    const properties = type.getProperties();
    if (properties.length > 0 && properties.length <= 50) {
      return properties
        .filter((p) => {
          const decls = p.getDeclarations();
          return decls.length === 0 || !decls.some((d) => isInternal(d));
        })
        .map((p) => {
          const decl = p.getDeclarations()[0];
          return {
            name: p.getName(),
            kind: 'property' as const,
            type: formatType(p.getTypeAtLocation(node)),
            description: decl ? getJsDocDescription(decl) : '',
            isOptional: p.isOptional() || undefined,
          };
        });
    }
  }

  // For union types, list the union members as "properties" for display
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    if (unionTypes.length <= 20 && unionTypes.every((t) => t.isStringLiteral() || t.isNumberLiteral() || t.isBooleanLiteral())) {
      return unionTypes.map((t) => ({
        name: t.getText(),
        kind: 'property' as const,
        type: 'literal',
        description: '',
      }));
    }
  }

  return [];
}

// ─── Main ────────────────────────────────────────────────────────────────────

function processPackage(project: Project, pkgDef: PackageDef): ApiPackage {
  const declarations: ApiDeclaration[] = [];
  const seen = new Set<string>();

  for (const entryPath of pkgDef.entryPoints) {
    const fullPath = join(ROOT, entryPath);
    const sourceFile = project.getSourceFile(fullPath);
    if (!sourceFile) {
      console.warn(`  ⚠ Source file not found: ${entryPath}`);
      continue;
    }

    const exportSymbols = sourceFile.getExportSymbols();
    for (const sym of exportSymbols) {
      const name = sym.getName();
      if (seen.has(name)) continue;
      seen.add(name);

      try {
        const decl = extractDeclaration(sym);
        if (decl) {
          declarations.push(decl);
        }
      } catch (err) {
        console.warn(`  ⚠ Failed to extract ${name}: ${err}`);
      }
    }
  }

  // Sort: classes/components first, then interfaces, types, functions, consts
  const kindOrder: Record<string, number> = {
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
  declarations.sort((a, b) => {
    const orderDiff = (kindOrder[a.kind] ?? 99) - (kindOrder[b.kind] ?? 99);
    return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name);
  });

  return { name: pkgDef.name, slug: pkgDef.slug, declarations };
}

function main(): void {
  console.log('Generating API documentation...\n');

  const project = new Project({
    tsConfigFilePath: join(ROOT, 'tsconfig.base.json'),
    skipAddingFilesFromTsConfig: true,
  });

  // Add all entry point files
  for (const pkg of PACKAGES) {
    for (const entry of pkg.entryPoints) {
      project.addSourceFileAtPath(join(ROOT, entry));
    }
  }

  // Resolve all dependencies
  project.resolveSourceFileDependencies();

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const allPackages: ApiPackage[] = [];

  for (const pkg of PACKAGES) {
    console.log(`Processing ${pkg.name}...`);
    const apiPkg = processPackage(project, pkg);
    allPackages.push(apiPkg);

    const outputPath = join(OUTPUT_DIR, `${pkg.slug}.json`);
    writeFileSync(outputPath, JSON.stringify(apiPkg, null, 2));
    console.log(`  → ${apiPkg.declarations.length} declarations → ${pkg.slug}.json`);
  }

  // Write a manifest with all package slugs
  const manifest = allPackages.map((p) => ({
    name: p.name,
    slug: p.slug,
    count: p.declarations.length,
  }));
  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nDone! Generated API docs for ${allPackages.length} packages.`);
}

main();
