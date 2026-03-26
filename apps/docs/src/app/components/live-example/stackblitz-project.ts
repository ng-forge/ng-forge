import type { Project } from '@stackblitz/sdk';
import type { AdapterName } from '@ng-forge/sandbox-harness';

type SupportedAdapter = Exclude<AdapterName, 'custom'>;

interface AdapterMeta {
  pkg: string;
  providerImport: string;
  providerCall: string;
  extraDeps: Record<string, string>;
}

const ADAPTER_META: Record<SupportedAdapter, AdapterMeta> = {
  material: {
    pkg: '@ng-forge/dynamic-forms-material',
    providerImport: "import { withMaterialFields } from '@ng-forge/dynamic-forms-material';",
    providerCall: 'withMaterialFields()',
    extraDeps: {
      '@angular/material': '^21.0.0',
      '@angular/cdk': '^21.0.0',
    },
  },
  bootstrap: {
    pkg: '@ng-forge/dynamic-forms-bootstrap',
    providerImport: "import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';",
    providerCall: 'withBootstrapFields()',
    extraDeps: {},
  },
  primeng: {
    pkg: '@ng-forge/dynamic-forms-primeng',
    providerImport: "import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';",
    providerCall: 'withPrimeNGFields()',
    extraDeps: {
      primeng: '^19.0.0',
    },
  },
  ionic: {
    pkg: '@ng-forge/dynamic-forms-ionic',
    providerImport: "import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';",
    providerCall: 'withIonicFields()',
    extraDeps: {
      '@ionic/angular': '^8.0.0',
    },
  },
};

export function createStackBlitzProject(adapter: AdapterName, configJson: string, title: string): Project {
  const resolved: SupportedAdapter = adapter === 'custom' ? 'material' : adapter;
  const meta = ADAPTER_META[resolved];

  const appComponent = `import { Component } from '@angular/core';
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-root',
  imports: [DynamicForm],
  template: \`
    <div class="container">
      <form [dynamic-form]="config" [(value)]="formValue"></form>
      <h3>Form Data</h3>
      <pre>{{ formValue | json }}</pre>
    </div>
  \`,
  styles: \`.container { max-width: 600px; margin: 2rem auto; padding: 0 1rem; }\`,
})
export class AppComponent {
  formValue: Record<string, unknown> = {};

  config: FormConfig = ${configJson};
}
`;

  const appConfig = `import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
${meta.providerImport}

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(${meta.providerCall}),
  ],
};
`;

  const main = `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);
`;

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;

  return {
    title: `ng-forge – ${title}`,
    description: `Dynamic form example using @ng-forge/dynamic-forms with ${resolved} adapter`,
    template: 'angular-cli',
    files: {
      'src/main.ts': main,
      'src/app/app.component.ts': appComponent,
      'src/app/app.config.ts': appConfig,
      'src/index.html': indexHtml,
    },
    dependencies: {
      '@angular/core': '^21.0.0',
      '@angular/common': '^21.0.0',
      '@angular/compiler': '^21.0.0',
      '@angular/forms': '^21.0.0',
      '@angular/platform-browser': '^21.0.0',
      '@angular/platform-browser-dynamic': '^21.0.0',
      '@ng-forge/dynamic-forms': 'latest',
      [meta.pkg]: 'latest',
      ...meta.extraDeps,
      rxjs: '^7.8.0',
      'zone.js': '^0.15.0',
      tslib: '^2.6.0',
    },
  };
}
