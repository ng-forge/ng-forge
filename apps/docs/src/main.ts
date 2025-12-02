import { initFederation } from '@angular-architects/native-federation';

// Remote URLs - defined at build time via --define
declare const MATERIAL_EXAMPLES_URL: string;
declare const BOOTSTRAP_EXAMPLES_URL: string;
declare const IONIC_EXAMPLES_URL: string;
declare const PRIMENG_EXAMPLES_URL: string;

// Log import map for debugging
function logImportMap(importMap: { scopes: Record<string, Record<string, string>> }): void {
  console.log('[Federation] Import map scopes:', Object.keys(importMap.scopes));
  const sampleScope = Object.entries(importMap.scopes)[0];
  if (sampleScope) {
    console.log(`[Federation] Sample scope ${sampleScope[0]}:`, Object.keys(sampleScope[1]).length, 'mappings');
  }
}

// Manifest with remote entry points
const manifest = {
  'material-examples': `${MATERIAL_EXAMPLES_URL}/remoteEntry.json`,
  'bootstrap-examples': `${BOOTSTRAP_EXAMPLES_URL}/remoteEntry.json`,
  'ionic-examples': `${IONIC_EXAMPLES_URL}/remoteEntry.json`,
  'primeng-examples': `${PRIMENG_EXAMPLES_URL}/remoteEntry.json`,
};

// Initialize Native Federation, then bootstrap
initFederation(manifest)
  .then((importMap) => {
    logImportMap(importMap as { scopes: Record<string, Record<string, string>> });
    return import('./bootstrap');
  })
  .catch((err) => console.error('Federation init failed:', err));
