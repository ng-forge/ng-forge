import type { Project } from '@stackblitz/sdk';
import type { AdapterName } from '@ng-forge/sandbox-harness';

type SupportedAdapter = Exclude<AdapterName, 'custom'>;

interface AdapterMeta {
  pkg: string;
  configImports: string;
  configProviders: string;
  extraDeps: Record<string, string>;
  globalStyles: string;
}

const ADAPTER_META: Record<SupportedAdapter, AdapterMeta> = {
  material: {
    pkg: '@ng-forge/dynamic-forms-material',
    configImports: [
      "import { provideAnimations } from '@angular/platform-browser/animations';",
      "import { provideDynamicForm } from '@ng-forge/dynamic-forms';",
      "import { withMaterialFields } from '@ng-forge/dynamic-forms-material';",
    ].join('\n'),
    configProviders: '    provideAnimations(),\n    provideDynamicForm(...withMaterialFields()),',
    extraDeps: {
      '@angular/material': '~21.2.0',
      '@angular/cdk': '~21.2.0',
    },
    globalStyles:
      '@use "@angular/material" as mat;\n@include mat.theme((color-scheme: light, typography: Roboto, density: 0));\nbody { font-family: Roboto, sans-serif; margin: 0; }',
  },
  bootstrap: {
    pkg: '@ng-forge/dynamic-forms-bootstrap',
    configImports: [
      "import { provideDynamicForm } from '@ng-forge/dynamic-forms';",
      "import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';",
    ].join('\n'),
    configProviders: '    provideDynamicForm(...withBootstrapFields()),',
    extraDeps: {
      bootstrap: '^5.3.0',
    },
    globalStyles: '@import "bootstrap/scss/bootstrap";\nbody { margin: 0; }',
  },
  primeng: {
    pkg: '@ng-forge/dynamic-forms-primeng',
    configImports: [
      "import { provideAnimations } from '@angular/platform-browser/animations';",
      "import { providePrimeNG } from 'primeng/config';",
      "import { provideDynamicForm } from '@ng-forge/dynamic-forms';",
      "import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';",
    ].join('\n'),
    configProviders: '    provideAnimations(),\n    providePrimeNG(),\n    provideDynamicForm(...withPrimeNGFields()),',
    extraDeps: {
      primeng: '^19.0.0',
    },
    globalStyles: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; }',
  },
  ionic: {
    pkg: '@ng-forge/dynamic-forms-ionic',
    configImports: [
      "import { provideAnimations } from '@angular/platform-browser/animations';",
      "import { provideIonicAngular } from '@ionic/angular/standalone';",
      "import { provideDynamicForm } from '@ng-forge/dynamic-forms';",
      "import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';",
    ].join('\n'),
    configProviders: "    provideAnimations(),\n    provideIonicAngular({ mode: 'md' }),\n    provideDynamicForm(...withIonicFields()),",
    extraDeps: {
      '@ionic/angular': '^8.0.0',
    },
    globalStyles: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; }',
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

  const appComponent = `import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DynamicForm, FormConfig, InferFormValue } from '@ng-forge/dynamic-forms';

const config = ${configJson} as const satisfies FormConfig;

type FormValue = InferFormValue<typeof config.fields>;

@Component({
  selector: 'app-root',
  imports: [DynamicForm, JsonPipe],
  template: \`
    <div class="container">
      <form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>
      @if (value()) {
        <h3>Form Data</h3>
        <pre>{{ value() | json }}</pre>
      }
    </div>
  \`,
  styles: \`.container { max-width: 600px; margin: 2rem auto; padding: 0 1rem; }\`,
})
export class AppComponent {
  readonly config = config;
  readonly value = signal<Partial<FormValue> | null>(null);

  onSubmit(value: Partial<FormValue>): void {
    this.value.set(value);
  }
}
`;

  const appConfig = `import { ApplicationConfig } from '@angular/core';
${meta.configImports}

export const appConfig: ApplicationConfig = {
  providers: [
${meta.configProviders}
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
    '@angular/animations': '~21.2.0',
    '@angular/common': '~21.2.0',
    '@angular/compiler': '~21.2.0',
    '@angular/core': '~21.2.0',
    '@angular/forms': '~21.2.0',
    '@angular/platform-browser': '~21.2.0',
    '@angular/platform-browser-dynamic': '~21.2.0',
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
        '@angular/cli': '~21.2.0',
        '@angular/compiler-cli': '~21.2.0',
        '@angular-devkit/build-angular': '~21.2.0',
        typescript: '~5.9.0',
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
                styles: ['src/styles.scss'],
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
      'src/styles.scss': meta.globalStyles,
      'src/index.html': indexHtml,
      'package.json': packageJson,
      'angular.json': angularJson,
      'tsconfig.json': tsconfig,
    },
  };
}
