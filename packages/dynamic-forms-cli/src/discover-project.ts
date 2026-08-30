/**
 * Work out what project we are being run against.
 *
 * Everything is discovered and everything can be overridden by a flag. The tool
 * is run by agents as often as by people, and an agent that has to be told where
 * the tsconfig lives will guess wrong or give up.
 *
 * Discovery walks UP from the working directory rather than down. Up is what
 * every other Node tool does, it handles being run from a subdirectory, and it
 * terminates. Searching down a monorepo finds twelve tsconfigs and has no
 * principled way to choose, which is worse than asking.
 */

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { ts } from 'ts-morph';

/** Preferred order when a directory holds several. */
const TSCONFIG_NAMES = ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.lib.json', 'tsconfig.base.json'];

const CORE_PACKAGE = '@ng-forge/dynamic-forms';

export interface DiscoveredProject {
  /** Nearest package.json, or undefined when there is none above the cwd. */
  packageJsonPath?: string;
  /** Chosen tsconfig, or undefined when none was found. */
  tsconfigPath?: string;
  /** Version of the installed core library, read from the resolved package. */
  libraryVersion?: string;
  /** ng-forge adapter packages this project depends on. */
  adapterPackages: string[];
}

export interface DiscoverOptions {
  /** Where to start. Defaults to the working directory. */
  cwd?: string;
  /** Explicit tsconfig, used as-is and never searched for. */
  tsconfig?: string;
}

/** Directories from `start` up to the filesystem root. */
function ancestors(start: string): string[] {
  const chain: string[] = [];
  let current = resolve(start);

  for (;;) {
    chain.push(current);
    const parent = dirname(current);
    if (parent === current) return chain;
    current = parent;
  }
}

async function firstExisting(dir: string, names: string[]): Promise<string | undefined> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return undefined;
  }

  const present = new Set(entries);
  for (const name of names) {
    if (present.has(name)) return join(dir, name);
  }
  return undefined;
}

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return undefined;
  }
}

/**
 * A tsconfig that compiles nothing itself and only points at others.
 *
 * Nx generates one per project, and `tsconfig.json` is the first name anyone
 * would try, so preferring it by name landed on a config whose program has zero
 * source files — and a program with no sources resolves no field types, which
 * reads as a project that does not use the library rather than as the wrong
 * config. This repository's own internal libraries are laid out exactly that
 * way.
 *
 * Read through TypeScript's parser rather than `JSON.parse`: a tsconfig is
 * JSONC, and the commented ones are precisely the hand-written ones worth
 * reading carefully.
 */
async function isSolutionStyle(path: string): Promise<boolean> {
  let text: string;
  try {
    text = await readFile(path, 'utf-8');
  } catch {
    return false;
  }

  const { config, error } = ts.parseConfigFileTextToJson(path, text);
  if (error || config === null || typeof config !== 'object') return false;

  const { files, include, references } = config as { files?: unknown; include?: unknown; references?: unknown };
  const empty = (value: unknown) => value === undefined || (Array.isArray(value) && value.length === 0);

  return Array.isArray(references) && references.length > 0 && empty(files) && empty(include);
}

/**
 * The tsconfig to build a program from, preferring one that has sources.
 *
 * Order still decides between candidates that all compile something; the
 * solution-style check only moves past the ones that cannot. When every
 * candidate in the directory is solution-style the first is returned anyway, so
 * the caller gets the same answer it used to and `--tsconfig` remains the way to
 * say something discovery cannot work out.
 */
async function findTsconfig(dir: string): Promise<string | undefined> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return undefined;
  }

  const present = new Set(entries);
  const candidates = TSCONFIG_NAMES.filter((name) => present.has(name)).map((name) => join(dir, name));

  for (const candidate of candidates) {
    if (!(await isSolutionStyle(candidate))) return candidate;
  }

  return candidates[0];
}

/**
 * The installed version, not the declared range.
 *
 * A manifest says `^1.2.0`; what matters is what resolved. Reading the installed
 * package's own manifest is the only thing that answers that, and it works in a
 * monorepo and when the library is a dev dependency.
 */
async function installedVersion(from: string, packageName: string): Promise<string | undefined> {
  for (const dir of ancestors(from)) {
    const manifest = await readJson(join(dir, 'node_modules', ...packageName.split('/'), 'package.json'));
    const version = manifest?.['version'];
    if (typeof version === 'string') return version;
  }
  return undefined;
}

/** Adapter packages named in a manifest's dependencies. */
function adaptersFrom(manifest: Record<string, unknown> | undefined): string[] {
  const deps = {
    ...((manifest?.['dependencies'] as Record<string, string>) ?? {}),
    ...((manifest?.['devDependencies'] as Record<string, string>) ?? {}),
  };

  return Object.keys(deps)
    .filter((name) => name.startsWith('@ng-forge/dynamic-forms-') && name !== '@ng-forge/dynamic-forms-cli')
    .sort();
}

export async function discoverProject(options: DiscoverOptions = {}): Promise<DiscoveredProject> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const chain = ancestors(cwd);

  let packageJsonPath: string | undefined;
  let tsconfigPath = options.tsconfig ? resolve(options.tsconfig) : undefined;

  for (const dir of chain) {
    packageJsonPath ??= await firstExisting(dir, ['package.json']);
    tsconfigPath ??= await findTsconfig(dir);

    // Stop at the first directory that has a manifest: that is the project, and
    // continuing would pick up an unrelated tsconfig from a parent.
    if (packageJsonPath && dirname(packageJsonPath) === dir) break;
  }

  return {
    packageJsonPath,
    tsconfigPath,
    libraryVersion: await installedVersion(cwd, CORE_PACKAGE),
    adapterPackages: adaptersFrom(packageJsonPath ? await readJson(packageJsonPath) : undefined),
  };
}

/**
 * Whether the CLI and the project's library agree on a release.
 *
 * They can disagree easily: the skill documents running the CLI through `npx`,
 * which fetches the latest published version unless pinned, while the project
 * may be several releases behind. Validating a 1.0 project against 1.2 rules
 * produces confident errors about rules that release does not have.
 */
export function versionMismatch(cliVersion: string, libraryVersion: string | undefined): string | undefined {
  if (!libraryVersion) return undefined;

  const major = (version: string) => version.split('.')[0];
  const minor = (version: string) => version.split('.').slice(0, 2).join('.');

  if (major(cliVersion) !== major(libraryVersion)) {
    return `This CLI is ${cliVersion} and the project has ${CORE_PACKAGE} ${libraryVersion}. Different majors validate different rules, so run npx @ng-forge/dynamic-forms-cli@${major(libraryVersion)} instead.`;
  }

  if (minor(cliVersion) !== minor(libraryVersion)) {
    return `This CLI is ${cliVersion} and the project has ${CORE_PACKAGE} ${libraryVersion}. Some rules changed between those releases; pin with npx @ng-forge/dynamic-forms-cli@${libraryVersion} if a result looks wrong.`;
  }

  return undefined;
}
