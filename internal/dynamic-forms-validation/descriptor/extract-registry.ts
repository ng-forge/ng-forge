/**
 * Resolve an adapter's field type registry from a consumer's TypeScript program.
 *
 * Reads the merged `FieldRegistryLeaves` and `FieldRegistryContainers`
 * interfaces, which adapters extend by module augmentation. Names and aliases
 * only; property shapes come later.
 *
 * Two failure modes are detected deliberately, because both otherwise produce a
 * descriptor that looks like a clean run against a library with almost no field
 * types:
 *
 * - the adapter is not in the program at all
 * - the adapter is in the program but contributes no registry keys
 *
 * The second is not hypothetical. TypeScript resolves a package to its realpath,
 * so a symlinked adapter whose realpath has no reachable `node_modules/@ng-forge`
 * silently fails to merge its `declare module` block, yielding only the core
 * types with no error anywhere.
 */

import { Node, Project, type Type, type Symbol as TsSymbol } from 'ts-morph';
import { join } from 'node:path';

/** A field type as declared in the registry, before its shape is read. */
export interface RegistryEntry {
  /** The spelling the validator normalises to. */
  canonical: string;
  /** Other accepted spellings, sorted. */
  aliases: string[];
  kind: 'leaf' | 'container';
  /** Resolved type, carried so a later pass can read its shape. */
  type: Type;
  /**
   * Node the type was resolved at.
   *
   * Carried rather than rederived: an intersection such as
   * `InputField<Props> & { addons }` has no single declaring symbol, so asking
   * the type for one yields nothing and the shape pass silently reads an empty
   * field. The probe declaration is a valid location for every entry.
   */
  at: Node;
}

export type RegistryFailure =
  | { kind: 'adapter-not-resolved'; adapterPackage: string; detail: string }
  | { kind: 'adapter-contributed-nothing'; adapterPackage: string; detail: string };

export type RegistryResult = { ok: true; entries: RegistryEntry[]; closure: string[] } | { ok: false; failure: RegistryFailure };

export interface ResolveRegistryOptions {
  /** The consumer's own tsconfig, so their paths and lib settings apply. */
  tsConfigFilePath: string;
  /** e.g. `@ng-forge/dynamic-forms-material`. */
  adapterPackage: string;
  /** Overridable for tests; the package declaring the registry interfaces. */
  corePackage?: string;
  /**
   * Path fragment identifying the adapter's files, for programs where the
   * package specifier does not appear in the path.
   *
   * A consumer resolves `@ng-forge/dynamic-forms-material` to
   * `node_modules/@ng-forge/dynamic-forms-material/...`, so the specifier is in
   * the path. In this repo, tsconfig path mappings resolve it to
   * `packages/dynamic-forms-material/src/...`, which contains no specifier at
   * all, and every membership test would silently fail.
   */
  adapterSourceRoot?: string;
  /** Same, for the core package. */
  coreSourceRoot?: string;
}

const CORE_PACKAGE = '@ng-forge/dynamic-forms';

/**
 * Canonical spelling when a field type declares several.
 *
 * Array actions declare `'add-array-item' | 'addArrayItem'`, and the runtime
 * normalises camelCase to kebab-case, so kebab is canonical and the rest are
 * aliases. This mirrors the library's own normalisation rather than inventing a
 * rule.
 *
 * Manually verified against the real Material package, not yet covered by a test:
 * all 25 names the Zod schemas accept are derived, with all six aliases attached
 * to the correct canonical name. The derivation additionally finds `container`,
 * which the schemas reject; that is a registry/schema divergence, not a
 * derivation error, and it is deliberately left visible.
 *
 * Phase 2 is the first automated oracle lock. Until it lands, treat the agreement
 * above as a one-off manual check rather than an enforced invariant.
 */
function pickCanonical(literals: string[]): string {
  const kebab = literals.filter((l) => l.includes('-'));
  if (kebab.length === 1) return kebab[0];
  // No dashes, or ambiguous: sort for determinism rather than guessing.
  return [...literals].sort()[0];
}

/** String literal arms of a type, ignoring non-literal arms. */
function stringLiterals(type: Type | undefined): string[] {
  if (!type) return [];
  const nonNullable = type.getNonNullableType();
  const arms = nonNullable.isUnion() ? nonNullable.getUnionTypes() : [nonNullable];
  return arms.filter((a) => a.isStringLiteral()).map((a) => String(a.getLiteralValue()));
}

/**
 * Build a probe inside the program and read the merged interface off it.
 *
 * Declaration merging only exists in the checker, so hunting for
 * `interface FieldRegistryLeaves` declarations finds the pieces and never the
 * whole. The side-effect import is what pulls the adapter's augmentation in.
 */
function readRegistry(project: Project, dir: string, adapterPackage: string, corePackage: string, registryName: string) {
  const file = project.createSourceFile(
    join(dir, `__ngforge_probe_${registryName}.ts`),
    `import '${adapterPackage}';\n` +
      `import type { ${registryName} } from '${corePackage}';\n` +
      `export declare const probe: ${registryName};\n`,
    { overwrite: true },
  );

  const decl = file.getVariableDeclaration('probe');
  return { file, decl, members: decl?.getType().getProperties() ?? [] };
}

/** True when a file belongs to a package, by specifier or by source root. */
function belongsTo(filePath: string, specifier: string, sourceRoot?: string): boolean {
  return filePath.includes(specifier) || (sourceRoot !== undefined && filePath.includes(sourceRoot));
}

/** True when a symbol has at least one declaration inside the adapter package. */
function declaredInAdapter(symbol: TsSymbol, adapterPackage: string, sourceRoot?: string): boolean {
  return symbol.getDeclarations().some((d) => belongsTo(d.getSourceFile().getFilePath(), adapterPackage, sourceRoot));
}

/**
 * The declaration that belongs to the adapter we were asked about.
 *
 * `declare module` merges globally, so with several adapters installed the
 * checker holds one `FieldRegistryLeaves` in which a key both adapters declare —
 * `input`, `select` — resolves to whichever declaration it picked. Reading the
 * merged symbol therefore describes an arbitrary adapter rather than the
 * requested one, and installing more than one adapter is normal: demos, an
 * in-progress migration, a shared library supporting several.
 *
 * The merged symbol keeps every declaration, so the right one can be selected by
 * where it was written. Preference order: the requested adapter, then core for
 * types the adapter does not override, then whatever exists.
 */
function declarationFor(
  symbol: TsSymbol,
  options: Required<Pick<ResolveRegistryOptions, 'adapterPackage'>> & ResolveRegistryOptions,
): Node | undefined {
  const declarations = symbol.getDeclarations();
  const core = options.corePackage ?? CORE_PACKAGE;

  return (
    declarations.find((d) => belongsTo(d.getSourceFile().getFilePath(), options.adapterPackage, options.adapterSourceRoot)) ??
    declarations.find((d) => belongsTo(d.getSourceFile().getFilePath(), core, options.coreSourceRoot)) ??
    declarations[0]
  );
}

/**
 * The type a declaration actually writes down.
 *
 * `declaration.getType()` answers with the *merged* property type, which is the
 * first declaration's, so asking a second adapter's declaration what it declares
 * returns the first adapter's type. Reading the type node instead returns what
 * that declaration wrote, which is the only way to tell two adapters apart.
 */
function declaredType(declaration: Node | undefined): Type | undefined {
  if (!declaration) return undefined;
  if (Node.isPropertySignature(declaration)) return declaration.getTypeNode()?.getType();
  return declaration.getType();
}

export function resolveRegistry(options: ResolveRegistryOptions): RegistryResult {
  const { tsConfigFilePath, adapterPackage } = options;
  const corePackage = options.corePackage ?? CORE_PACKAGE;

  const project = new Project({ tsConfigFilePath });
  const dir = join(tsConfigFilePath, '..');

  const leaves = readRegistry(project, dir, adapterPackage, corePackage, 'FieldRegistryLeaves');
  const containers = readRegistry(project, dir, adapterPackage, corePackage, 'FieldRegistryContainers');

  // Did the adapter resolve to anything at all? Asking the program which files
  // it loaded is more robust than matching a diagnostic code, which varies with
  // module resolution mode and skipLibCheck.
  const adapterInProgram = project
    .getProgram()
    .compilerObject.getSourceFiles()
    .some((f) => belongsTo(f.fileName, adapterPackage, options.adapterSourceRoot));

  if (!adapterInProgram) {
    return {
      ok: false,
      failure: {
        kind: 'adapter-not-resolved',
        adapterPackage,
        detail: `"${adapterPackage}" could not be resolved from ${tsConfigFilePath}. Is it installed?`,
      },
    };
  }

  const all = [
    ...leaves.members.map((m) => ({ symbol: m, kind: 'leaf' as const, at: leaves.decl })),
    ...containers.members.map((m) => ({ symbol: m, kind: 'container' as const, at: containers.decl })),
  ];

  // The silent-partial trap: the adapter resolved, but merged nothing.
  if (!all.some(({ symbol }) => declaredInAdapter(symbol, adapterPackage, options.adapterSourceRoot))) {
    return {
      ok: false,
      failure: {
        kind: 'adapter-contributed-nothing',
        adapterPackage,
        detail:
          `"${adapterPackage}" resolved but contributed no field types. Its module augmentation did not merge, ` +
          `which usually means the package resolves through a symlink whose real location cannot reach ` +
          `"${corePackage}". Only core types would be validated, so this is treated as a failure rather than an empty result.`,
      },
    };
  }

  // Group registry keys by the field type they point at, so both spellings of an
  // array action collapse into one entry with aliases.
  const byCanonical = new Map<string, RegistryEntry>();

  for (const { symbol, kind, at } of all) {
    if (!at) continue;

    // Resolve at the declaration belonging to the requested adapter, not at the
    // merged symbol, or every adapter would describe the same shape.
    const declaration = declarationFor(symbol, options);
    const resolveAt = declaration ?? at;
    const type = declaredType(declaration) ?? symbol.getTypeAtLocation(at);
    const declared = stringLiterals(type.getProperty('type')?.getTypeAtLocation(resolveAt));
    const spellings = declared.length > 0 ? declared : [symbol.getName()];
    const canonical = pickCanonical(spellings);

    const existing = byCanonical.get(canonical);
    const aliases = new Set(existing?.aliases ?? []);
    for (const spelling of [...spellings, symbol.getName()]) {
      if (spelling !== canonical) aliases.add(spelling);
    }

    byCanonical.set(canonical, {
      canonical,
      aliases: [...aliases].sort(),
      kind: existing?.kind ?? kind,
      type: existing?.type ?? type,
      at: existing?.at ?? resolveAt,
    });
  }

  // Files the registry actually depends on. Scoped type health gates on
  // diagnostics in here, not on the rest of a monorepo.
  const closure = new Set<string>();
  for (const { symbol } of all) {
    for (const d of symbol.getDeclarations()) closure.add(d.getSourceFile().getFilePath());
  }
  for (const path of [...closure]) {
    for (const ref of project.getSourceFile(path)?.getReferencedSourceFiles() ?? []) {
      closure.add(ref.getFilePath());
    }
  }

  return {
    ok: true,
    entries: [...byCanonical.values()].sort((a, b) => (a.canonical < b.canonical ? -1 : 1)),
    closure: [...closure].sort(),
  };
}
