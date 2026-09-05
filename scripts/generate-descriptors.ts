#!/usr/bin/env node
/**
 * Generate the committed type descriptors: one shared core, one per adapter.
 *
 * Built from workspace source rather than from emitted `.d.ts`. The tsconfig
 * path mappings put core and every adapter in one program, so the
 * `FieldRegistryLeaves` augmentation merges with no fixture, no build step and
 * no node_modules layout to get wrong. Consumers resolve from `.d.ts` instead,
 * which phase 1a proved works; that path belongs to the consumer-facing command,
 * not to generating our own artifacts.
 *
 * Usage:
 *   node scripts/generate-descriptors.ts            write the artifacts
 *   node scripts/generate-descriptors.ts --check    fail if they are stale
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDescriptor } from '../internal/dynamic-forms-validation/descriptor/build-descriptor.ts';
import { splitDescriptor } from '../internal/dynamic-forms-validation/descriptor/split.ts';
import { serializeDescriptor } from '../internal/dynamic-forms-validation/descriptor/serialize.ts';
import { UI_ADAPTERS } from '../packages/dynamic-form-mcp/src/registry/ui-adapters.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'internal', 'dynamic-forms-validation', 'descriptor', 'generated');
const CORE_PACKAGE = '@ng-forge/dynamic-forms';
const CORE_SOURCE_ROOT = 'packages/dynamic-forms/';

const rel = (path: string) => path.replace(`${ROOT}/`, '');

/**
 * The published version of one workspace package.
 *
 * Each adapter is read from its own manifest rather than from core's. They are
 * released together today, so the two agree, but a descriptor that says
 * `@ng-forge/dynamic-forms-material` and carries core's version would be wrong
 * the first time that stops being true.
 */
async function packageVersion(packageDir: string): Promise<string> {
  const pkg = JSON.parse(await readFile(join(ROOT, 'packages', packageDir, 'package.json'), 'utf-8'));
  return pkg.version;
}

/**
 * Build every adapter, then the shared core once.
 *
 * The core half is asserted identical across adapters rather than taken from the
 * first one. It is only shareable if every adapter agrees on it, and silently
 * publishing one adapter's view as everyone's is exactly the confusion the split
 * is meant to remove.
 */
export async function buildOutputs(): Promise<Array<[string, string]>> {
  const generator = { name: '@ng-forge/dynamic-forms-validation', version: await packageVersion('dynamic-forms') };
  const outputs: Array<[string, string]> = [];
  const cores = new Map<string, string>();

  for (const adapter of UI_ADAPTERS) {
    const sourceRoot = `packages/dynamic-forms-${adapter.library}/`;
    const result = buildDescriptor({
      tsConfigFilePath: join(ROOT, `packages/dynamic-forms-${adapter.library}`, 'tsconfig.lib.json'),
      adapterPackage: adapter.package,
      adapterSourceRoot: sourceRoot,
      corePackage: CORE_PACKAGE,
      coreSourceRoot: CORE_SOURCE_ROOT,
      adapterId: adapter.library,
      adapterVersion: await packageVersion(`dynamic-forms-${adapter.library}`),
      generator,
      // Ours to know: an unmapped narrowable type here is a regression in an
      // artifact we ship, not something to degrade past.
      strictNarrowing: true,
    });

    if (!result.ok) {
      throw new Error(`[descriptors] ${adapter.library}: ${result.failure.detail}`);
    }

    const { core, adapter: adapterHalf } = splitDescriptor(result.descriptor);
    cores.set(adapter.library, serializeDescriptor(core as never));
    outputs.push([join(OUT_DIR, `${adapter.library}.json`), serializeDescriptor(adapterHalf as never)]);
  }

  const [first, ...rest] = [...cores.entries()];
  const disagreeing = rest.filter(([, text]) => text !== first[1]).map(([id]) => id);
  if (disagreeing.length > 0) {
    throw new Error(
      `[descriptors] the shared core differs between ${first[0]} and ${disagreeing.join(', ')}. ` +
        `It can only be shared if every adapter agrees on it, so this is a bug in extraction rather than something to publish.`,
    );
  }

  outputs.unshift([join(OUT_DIR, 'core.json'), first[1]]);
  return outputs;
}

async function main(): Promise<void> {
  const outputs = await buildOutputs();

  if (process.argv.includes('--check')) {
    const stale: string[] = [];

    for (const [path, contents] of outputs) {
      const onDisk = await readFile(path, 'utf-8').catch(() => null);
      if (onDisk !== contents) stale.push(rel(path));
    }

    if (stale.length > 0) {
      console.error('[descriptors-check] FAIL: generated descriptors are stale:');
      for (const path of stale) console.error(`  - ${path}`);
      console.error('\nRegenerate with: nx run dynamic-forms-validation:descriptors-update');
      process.exitCode = 1;
      return;
    }

    console.log(`[descriptors-check] OK: ${outputs.length} descriptor(s) match the types they are derived from.`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  for (const [path, contents] of outputs) {
    await writeFile(path, contents, 'utf-8');
    console.log(`generated ${rel(path)} (${(contents.length / 1024).toFixed(1)} KB)`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
