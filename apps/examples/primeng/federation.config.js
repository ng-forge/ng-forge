const path = require('path');
const { withNativeFederation } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'primeng-examples',

  // Cache external npm packages for faster rebuilds
  cacheExternalArtifacts: true,

  exposes: {
    './routes': 'apps/examples/primeng/src/app/remote-entry.ts',
  },

  // Share Angular core (singleton for DI) + bundle @ng-forge per remote (not shared, just resolved)
  shared: {
    // Angular core and primitives
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/core/primitives/signals': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/core/primitives/di': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/core/primitives/event-dispatch': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/core/rxjs-interop': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // Angular common and secondary entry points
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // Angular forms and secondary entry points
    '@angular/forms': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/forms/signals': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // Angular platform-browser and secondary entry points
    '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // Angular router and animations
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/animations/browser': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // RxJS and operators
    rxjs: { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    'rxjs/operators': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    // @ng-forge packages: NOT shared (singleton: false), but resolved via packageInfo
    '@ng-forge/dynamic-forms': {
      singleton: false,
      strictVersion: false,
      requiredVersion: 'auto',
      packageInfo: {
        entryPoint: path.resolve(__dirname, '../../../dist/packages/dynamic-forms/fesm2022/ng-forge-dynamic-forms.mjs'),
        version: '0.0.1',
        esm: true,
      },
    },
    '@ng-forge/dynamic-forms-primeng': {
      singleton: false,
      strictVersion: false,
      requiredVersion: 'auto',
      packageInfo: {
        entryPoint: path.resolve(__dirname, '../../../dist/packages/dynamic-forms-primeng/fesm2022/ng-forge-dynamic-forms-primeng.mjs'),
        version: '0.0.1',
        esm: true,
      },
    },
  },

  sharedMappings: [],

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@angular/compiler',
    'zone.js',
    // Bundle UI libraries per remote (not shared with host)
    '@angular/cdk',
    'primeng',
    // Skip unused @ng-forge packages
    '@ng-forge/dynamic-forms-material',
    '@ng-forge/dynamic-forms-bootstrap',
    '@ng-forge/dynamic-forms-ionic',
    // Skip ng-doc
    '@ng-doc/generated',
    '@ng-doc/app',
    '@ng-doc/core',
    '@ng-doc/ui-kit',
  ],
});
