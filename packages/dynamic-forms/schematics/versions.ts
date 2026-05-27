export const NG_FORGE_VERSION = '~0.9.0';

export const VERSIONS = {
  '@ng-forge/dynamic-forms': NG_FORGE_VERSION,
  '@ng-forge/dynamic-forms-material': NG_FORGE_VERSION,
  '@ng-forge/dynamic-forms-bootstrap': NG_FORGE_VERSION,
  '@ng-forge/dynamic-forms-primeng': NG_FORGE_VERSION,
  '@ng-forge/dynamic-forms-ionic': NG_FORGE_VERSION,
  '@angular/material': '~21.2.0',
  '@angular/cdk': '~21.2.0',
  bootstrap: '^5.3.0',
  primeng: '^21.0.0',
  '@primeng/themes': '^21.0.0',
  primeicons: '^7.0.0',
  '@ionic/angular': '^8.8.0',
} as const;

export type KnownPackage = keyof typeof VERSIONS;
