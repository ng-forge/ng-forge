import { CodeBlockCallback } from '@schematics/angular/utility/standalone';

import { Adapter } from './schema';
import { VERSIONS, KnownPackage } from '../versions';

export interface PackageSpec {
  name: KnownPackage | string;
  version: string;
}

export interface DefaultImportSpec {
  symbol: string;
  from: string;
}

export interface AdapterProviderSpec {
  /** Symbol name used to detect existing providers and skip insertion. */
  marker: string;
  /** Default imports the provider expression depends on (e.g. `import Aura from '@primeng/themes/aura'`). */
  defaultImports: DefaultImportSpec[];
  /** Builds the provider expression using addRootProvider's CodeBlock helper. */
  builder: CodeBlockCallback;
}

export interface AdapterRecipe {
  label: string;
  packages: PackageSpec[];
  styles: string[];
  adapterProviders: AdapterProviderSpec[];
  withFields: { from: string; symbol: string } | null;
}

const v = (name: KnownPackage): PackageSpec => ({ name, version: VERSIONS[name] });

export const RECIPES: Record<Adapter, AdapterRecipe> = {
  material: {
    label: 'Angular Material',
    packages: [v('@ng-forge/dynamic-forms-material'), v('@angular/material'), v('@angular/cdk')],
    styles: ['@angular/material/prebuilt-themes/azure-blue.css'],
    adapterProviders: [],
    withFields: { from: '@ng-forge/dynamic-forms-material', symbol: 'withMaterialFields' },
  },
  bootstrap: {
    label: 'Bootstrap',
    packages: [v('@ng-forge/dynamic-forms-bootstrap'), v('bootstrap')],
    styles: ['bootstrap/dist/css/bootstrap.min.css'],
    adapterProviders: [],
    withFields: { from: '@ng-forge/dynamic-forms-bootstrap', symbol: 'withBootstrapFields' },
  },
  primeng: {
    label: 'PrimeNG',
    packages: [v('@ng-forge/dynamic-forms-primeng'), v('primeng'), v('@primeng/themes'), v('primeicons')],
    styles: ['primeicons/primeicons.css'],
    adapterProviders: [
      {
        marker: 'providePrimeNG',
        defaultImports: [{ symbol: 'Aura', from: '@primeng/themes/aura' }],
        builder: ({ code, external }) => code`${external('providePrimeNG', 'primeng/config')}({ theme: { preset: Aura } })`,
      },
    ],
    withFields: { from: '@ng-forge/dynamic-forms-primeng', symbol: 'withPrimeNGFields' },
  },
  ionic: {
    label: 'Ionic',
    packages: [v('@ng-forge/dynamic-forms-ionic'), v('@ionic/angular')],
    styles: [
      '@ionic/angular/css/core.css',
      '@ionic/angular/css/normalize.css',
      '@ionic/angular/css/structure.css',
      '@ionic/angular/css/typography.css',
    ],
    adapterProviders: [
      {
        marker: 'provideIonicAngular',
        defaultImports: [],
        builder: ({ code, external }) => code`${external('provideIonicAngular', '@ionic/angular/standalone')}({ mode: 'md' })`,
      },
    ],
    withFields: { from: '@ng-forge/dynamic-forms-ionic', symbol: 'withIonicFields' },
  },
  none: {
    label: 'Core only',
    packages: [],
    styles: [],
    adapterProviders: [],
    withFields: null,
  },
};
