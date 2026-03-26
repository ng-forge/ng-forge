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

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Serializes a value to JS object notation (unquoted keys, single-quoted strings). */
export function toJsObjectNotation(value: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const nextSpaces = '  '.repeat(indent + 1);

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof RegExp) return value.toString();

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => `${nextSpaces}${toJsObjectNotation(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${spaces}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const props = entries.map(([key, val]) => {
      const formattedValue = toJsObjectNotation(val, indent + 1);
      return `${nextSpaces}${key}: ${formattedValue}`;
    });
    return `{\n${props.join(',\n')}\n${spaces}}`;
  }

  return String(value);
}

/** Opens a StackBlitz project with the given config. SDK is lazy-loaded on first call. */
export async function openInStackBlitz(adapter: AdapterName, configJson: string, title: string): Promise<void> {
  const project = createStackBlitzProject(adapter, configJson, title);
  const sdk = await import('@stackblitz/sdk');
  sdk.default.openProject(project, { openFile: 'src/app/app.component.ts' });
}

function createStackBlitzProject(adapter: AdapterName, configJson: string, title: string): Project {
  const resolved: SupportedAdapter = adapter === 'custom' ? 'material' : adapter;
  const meta = ADAPTER_META[resolved];
  const safeTitle = escapeHtml(title);

  const appComponent = `import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, InferFormValue } from '@ng-forge/dynamic-forms';

const config = ${configJson} as const satisfies FormConfig;

@Component({
  selector: 'app-root',
  imports: [DynamicForm, JsonPipe],
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
  readonly config = config;
  formValue: InferFormValue<typeof config.fields> = {};
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
  <title>${safeTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;

  const deps: Record<string, string> = {
    '@angular/animations': '^21.0.0',
    '@angular/common': '^21.0.0',
    '@angular/compiler': '^21.0.0',
    '@angular/core': '^21.0.0',
    '@angular/forms': '^21.0.0',
    '@angular/platform-browser': '^21.0.0',
    '@angular/platform-browser-dynamic': '^21.0.0',
    '@ng-forge/dynamic-forms': 'latest',
    [meta.pkg]: 'latest',
    ...meta.extraDeps,
    rxjs: '^7.8.0',
    'zone.js': '^0.15.0',
    tslib: '^2.6.0',
  };

  const packageJson = JSON.stringify(
    {
      name: 'ng-forge-stackblitz-example',
      version: '0.0.0',
      private: true,
      scripts: {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build',
      },
      dependencies: deps,
      devDependencies: {
        '@angular/cli': '^21.0.0',
        '@angular/compiler-cli': '^21.0.0',
        '@angular-devkit/build-angular': '^21.0.0',
        typescript: '~5.8.0',
      },
    },
    null,
    2,
  );

  const angularJson = JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        app: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:application',
              options: {
                outputPath: 'dist/app',
                index: 'src/index.html',
                browser: 'src/main.ts',
                tsConfig: 'tsconfig.json',
              },
            },
            serve: {
              builder: '@angular-devkit/build-angular:dev-server',
              configurations: {
                development: { buildTarget: 'app:build' },
              },
              defaultConfiguration: 'development',
            },
          },
        },
      },
    },
    null,
    2,
  );

  const tsconfig = JSON.stringify(
    {
      compileOnSave: false,
      compilerOptions: {
        outDir: './dist/out-tsc',
        strict: true,
        esModuleInterop: true,
        sourceMap: true,
        moduleResolution: 'bundler',
        target: 'ES2022',
        module: 'ES2022',
        lib: ['ES2022', 'dom'],
      },
      angularCompilerOptions: {
        strictTemplates: true,
      },
    },
    null,
    2,
  );

  return {
    title: `ng-forge – ${title}`,
    description: `Dynamic form example using @ng-forge/dynamic-forms with ${resolved} adapter`,
    template: 'node',
    files: {
      'src/main.ts': main,
      'src/app/app.component.ts': appComponent,
      'src/app/app.config.ts': appConfig,
      'src/index.html': indexHtml,
      'package.json': packageJson,
      'angular.json': angularJson,
      'tsconfig.json': tsconfig,
    },
  };
}
