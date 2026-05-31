import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Manifest {
  version?: string;
  peerDependencies?: Record<string, string>;
  ngForgeSchematicDeps?: Record<string, string>;
}

function readOwnManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')) as Manifest;
  } catch {
    return {};
  }
}

const manifest = readOwnManifest();

const NG_FORGE = manifest.version ? `~${manifest.version}` : '~0.9.0';
const ANGULAR = manifest.peerDependencies?.['@angular/core'] ?? '~21.2.0';
const THIRD_PARTY = manifest.ngForgeSchematicDeps ?? {};

export const VERSIONS = {
  '@ng-forge/dynamic-forms': NG_FORGE,
  '@ng-forge/dynamic-forms-material': NG_FORGE,
  '@ng-forge/dynamic-forms-bootstrap': NG_FORGE,
  '@ng-forge/dynamic-forms-primeng': NG_FORGE,
  '@ng-forge/dynamic-forms-ionic': NG_FORGE,
  '@angular/animations': ANGULAR,
  '@angular/material': ANGULAR,
  '@angular/cdk': ANGULAR,
  bootstrap: THIRD_PARTY['bootstrap'] ?? '^5.3.0',
  primeng: THIRD_PARTY['primeng'] ?? '^21.0.0',
  '@primeng/themes': THIRD_PARTY['@primeng/themes'] ?? '^21.0.0',
  primeicons: THIRD_PARTY['primeicons'] ?? '^7.0.0',
  '@ionic/angular': THIRD_PARTY['@ionic/angular'] ?? '^8.8.0',
} satisfies Record<string, string>;

export type KnownPackage = keyof typeof VERSIONS;
