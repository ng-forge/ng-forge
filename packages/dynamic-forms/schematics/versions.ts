import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Manifest {
  version?: string;
  peerDependencies?: Record<string, string>;
}

/**
 * Reads the published @ng-forge/dynamic-forms manifest that ships next to the
 * compiled schematic (dist/packages/dynamic-forms/package.json, one dir up
 * from this file). Reading at runtime — rather than baking values in at build
 * time — keeps versions correct regardless of release ordering: the published
 * tarball's package.json is the source of truth by definition.
 */
function readOwnManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')) as Manifest;
  } catch {
    return {};
  }
}

const manifest = readOwnManifest();

// All @ng-forge/* packages release in lockstep, so they share the core
// version. Fall back to a sane default only if the manifest can't be read.
const NG_FORGE = manifest.version ? `~${manifest.version}` : '~0.9.0';

// @angular/material, @angular/cdk and @angular/animations track the Angular
// major.minor we peer-depend on. animations is additionally pinned to the
// exact installed @angular/core at install time (see add-packages); this is
// the fallback range.
const ANGULAR = manifest.peerDependencies?.['@angular/core'] ?? '~21.2.0';

// Third-party UI libs aren't tight peers of our adapters (their declared peer
// ranges are intentionally loose, e.g. "primeng>=17"). These curated defaults
// install a recent version compatible with the wired provider setup (Aura
// preset, Ionic standalone, etc.).
export const VERSIONS = {
  '@ng-forge/dynamic-forms': NG_FORGE,
  '@ng-forge/dynamic-forms-material': NG_FORGE,
  '@ng-forge/dynamic-forms-bootstrap': NG_FORGE,
  '@ng-forge/dynamic-forms-primeng': NG_FORGE,
  '@ng-forge/dynamic-forms-ionic': NG_FORGE,
  '@angular/animations': ANGULAR,
  '@angular/material': ANGULAR,
  '@angular/cdk': ANGULAR,
  bootstrap: '^5.3.0',
  primeng: '^21.0.0',
  '@primeng/themes': '^21.0.0',
  primeicons: '^7.0.0',
  '@ionic/angular': '^8.8.0',
} satisfies Record<string, string>;

export type KnownPackage = keyof typeof VERSIONS;
