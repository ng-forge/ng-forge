import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import type { Adapter } from './schema';

const here = path.dirname(fileURLToPath(import.meta.url));
const collectionPath = path.resolve(here, '../../../../dist/packages/dynamic-forms/schematics/collection.json');
const NG_SCHEMATICS = '@schematics/angular';
const APP_NAME = 'test-app';
const APP_DIR = `/projects/${APP_NAME}`;

async function makeAppTree(): Promise<{ runner: SchematicTestRunner; tree: UnitTestTree }> {
  const runner = new SchematicTestRunner('@ng-forge/dynamic-forms', collectionPath);
  let tree = await runner.runExternalSchematic(NG_SCHEMATICS, 'workspace', {
    name: 'test-ws',
    newProjectRoot: 'projects',
    version: '21.0.0',
  });
  tree = await runner.runExternalSchematic(
    NG_SCHEMATICS,
    'application',
    { name: APP_NAME, standalone: true, style: 'scss', routing: false, inlineTemplate: false, inlineStyle: false },
    tree,
  );
  return { runner, tree };
}

interface AdapterExpectations {
  packages: string[];
  styleNeedles: string[];
  providerNeedles: string[];
}

const EXPECTATIONS: Record<Exclude<Adapter, 'none'>, AdapterExpectations> = {
  material: {
    packages: ['@ng-forge/dynamic-forms', '@angular/animations', '@ng-forge/dynamic-forms-material', '@angular/material', '@angular/cdk'],
    styleNeedles: ['@angular/material/prebuilt-themes/azure-blue.css'],
    providerNeedles: ['provideAnimations', 'provideDynamicForm', 'withMaterialFields', 'withLegacyStatusClasses'],
  },
  bootstrap: {
    packages: ['@ng-forge/dynamic-forms', '@ng-forge/dynamic-forms-bootstrap', 'bootstrap'],
    styleNeedles: ['bootstrap/dist/css/bootstrap.min.css'],
    providerNeedles: ['provideAnimations', 'provideDynamicForm', 'withBootstrapFields', 'withLegacyStatusClasses'],
  },
  primeng: {
    packages: ['@ng-forge/dynamic-forms', '@ng-forge/dynamic-forms-primeng', 'primeng', '@primeng/themes', 'primeicons'],
    styleNeedles: ['primeicons/primeicons.css'],
    providerNeedles: ['provideAnimations', 'providePrimeNG', 'Aura', 'provideDynamicForm', 'withPrimeNGFields', 'withLegacyStatusClasses'],
  },
  ionic: {
    packages: ['@ng-forge/dynamic-forms', '@ng-forge/dynamic-forms-ionic', '@ionic/angular'],
    styleNeedles: ['@ionic/angular/css/core.css', '@ionic/angular/css/normalize.css'],
    providerNeedles: ['provideAnimations', 'provideIonicAngular', 'provideDynamicForm', 'withIonicFields', 'withLegacyStatusClasses'],
  },
};

describe('ng-add', () => {
  for (const adapter of Object.keys(EXPECTATIONS) as Array<keyof typeof EXPECTATIONS>) {
    describe(adapter, () => {
      let result: UnitTestTree;
      let runner: SchematicTestRunner;

      beforeAll(async () => {
        const { runner: r, tree: appTree } = await makeAppTree();
        runner = r;
        result = await runner.runSchematic('ng-add', { adapter }, appTree);
      });

      it('adds expected packages to package.json', () => {
        const pkg = JSON.parse(result.readContent('/package.json'));
        for (const name of EXPECTATIONS[adapter].packages) {
          expect(pkg.dependencies?.[name], `expected ${name} in dependencies`).toBeDefined();
        }
      });

      it('adds expected style imports', () => {
        const styles = result.readContent(`${APP_DIR}/src/styles.scss`);
        for (const needle of EXPECTATIONS[adapter].styleNeedles) {
          expect(styles).toContain(needle);
        }
      });

      it('wires expected providers in app.config.ts', () => {
        const config = result.readContent(`${APP_DIR}/src/app/app.config.ts`);
        for (const needle of EXPECTATIONS[adapter].providerNeedles) {
          expect(config).toContain(needle);
        }
      });
    });
  }

  describe('none', () => {
    let result: UnitTestTree;

    beforeAll(async () => {
      const { runner, tree } = await makeAppTree();
      result = await runner.runSchematic('ng-add', { adapter: 'none' }, tree);
    });

    it('adds core + animations but no adapter package', () => {
      const pkg = JSON.parse(result.readContent('/package.json'));
      expect(pkg.dependencies?.['@ng-forge/dynamic-forms']).toBeDefined();
      expect(pkg.dependencies?.['@angular/animations']).toBeDefined();
      expect(pkg.dependencies?.['@ng-forge/dynamic-forms-material']).toBeUndefined();
    });

    it('does not write adapter style imports', () => {
      const styles = result.readContent(`${APP_DIR}/src/styles.scss`);
      expect(styles).not.toContain('@angular/material');
      expect(styles).not.toContain('bootstrap/dist');
    });

    it('wires provideDynamicForm with no adapter', () => {
      const config = result.readContent(`${APP_DIR}/src/app/app.config.ts`);
      expect(config).toContain('provideDynamicForm');
      expect(config).not.toContain('withMaterialFields');
      expect(config).not.toContain('withBootstrapFields');
    });
  });

  describe('flag interactions', () => {
    it('--skipStyles leaves styles.scss untouched', async () => {
      const { runner, tree } = await makeAppTree();
      const before = tree.readContent(`${APP_DIR}/src/styles.scss`);
      const result = await runner.runSchematic('ng-add', { adapter: 'material', skipStyles: true }, tree);
      const after = result.readContent(`${APP_DIR}/src/styles.scss`);
      expect(after).toBe(before);
    });

    it('--skipProviders leaves app.config.ts untouched and skips @angular/animations', async () => {
      const { runner, tree } = await makeAppTree();
      const before = tree.readContent(`${APP_DIR}/src/app/app.config.ts`);
      const result = await runner.runSchematic('ng-add', { adapter: 'material', skipProviders: true }, tree);
      const after = result.readContent(`${APP_DIR}/src/app/app.config.ts`);
      expect(after).toBe(before);

      // animations is a provider-side dep; skipping providers must skip it too
      const pkg = JSON.parse(result.readContent('/package.json'));
      expect(pkg.dependencies?.['@angular/animations']).toBeUndefined();
      expect(pkg.dependencies?.['@angular/material']).toBeDefined();
    });

    it('--legacyStatusClasses=false omits withLegacyStatusClasses()', async () => {
      const { runner, tree } = await makeAppTree();
      const result = await runner.runSchematic('ng-add', { adapter: 'material', legacyStatusClasses: false }, tree);
      const config = result.readContent(`${APP_DIR}/src/app/app.config.ts`);
      expect(config).toContain('withMaterialFields');
      expect(config).not.toContain('withLegacyStatusClasses');
    });
  });

  describe('idempotency', () => {
    it('re-running ng-add does not duplicate entries', async () => {
      const { runner, tree } = await makeAppTree();
      const once = await runner.runSchematic('ng-add', { adapter: 'material' }, tree);
      const twice = await runner.runSchematic('ng-add', { adapter: 'material' }, once);

      const styles = twice.readContent(`${APP_DIR}/src/styles.scss`);
      expect(styles.match(/azure-blue\.css/g)?.length).toBe(1);

      const config = twice.readContent(`${APP_DIR}/src/app/app.config.ts`);
      expect(config.match(/withMaterialFields\s*\(/g)?.length).toBe(1);
      expect(config.match(/provideDynamicForm\s*\(/g)?.length).toBe(1);
      expect(config.match(/provideAnimations\s*\(/g)?.length).toBe(1);
      expect(config.match(/withLegacyStatusClasses\s*\(/g)?.length).toBe(1);

      const pkg = JSON.parse(twice.readContent('/package.json'));
      const deps = pkg.dependencies as Record<string, string>;
      expect(Object.keys(deps).filter((k) => k === '@angular/material')).toHaveLength(1);
    });

    it('re-running primeng does not duplicate the default Aura import', async () => {
      const { runner, tree } = await makeAppTree();
      const once = await runner.runSchematic('ng-add', { adapter: 'primeng' }, tree);
      const twice = await runner.runSchematic('ng-add', { adapter: 'primeng' }, once);

      const config = twice.readContent(`${APP_DIR}/src/app/app.config.ts`);
      expect(config.match(/import Aura from '@primeng\/themes\/aura'/g)?.length).toBe(1);
      expect(config.match(/providePrimeNG\s*\(/g)?.length).toBe(1);
    });
  });

  describe('SCSS @use ordering', () => {
    it('inserts @import after leading @use/@forward, not above them', async () => {
      const { runner, tree } = await makeAppTree();
      tree.overwrite(`${APP_DIR}/src/styles.scss`, "@use 'sass:math';\n@forward 'tokens';\n\nbody { margin: 0; }\n");
      const result = await runner.runSchematic('ng-add', { adapter: 'material' }, tree);
      const styles = result.readContent(`${APP_DIR}/src/styles.scss`);

      const useIdx = styles.indexOf('@use');
      const forwardIdx = styles.indexOf('@forward');
      const importIdx = styles.indexOf("@import '@angular/material");
      expect(importIdx).toBeGreaterThan(useIdx);
      expect(importIdx).toBeGreaterThan(forwardIdx);
      // and still above the first real rule
      expect(importIdx).toBeLessThan(styles.indexOf('body {'));
    });

    it('walks past a multi-line block comment with unprefixed interior lines', async () => {
      const { runner, tree } = await makeAppTree();
      tree.overwrite(
        `${APP_DIR}/src/styles.scss`,
        [
          '/*',
          'This is a block comment',
          'spanning multiple lines',
          'with no leading * on interior lines.',
          '*/',
          "@use 'sass:math';",
          '',
          'body { margin: 0; }',
          '',
        ].join('\n'),
      );
      const result = await runner.runSchematic('ng-add', { adapter: 'material' }, tree);
      const styles = result.readContent(`${APP_DIR}/src/styles.scss`);

      const useIdx = styles.indexOf('@use');
      const importIdx = styles.indexOf("@import '@angular/material");
      expect(importIdx).toBeGreaterThan(useIdx); // after @use
      expect(importIdx).toBeLessThan(styles.indexOf('body {')); // before first real rule
    });
  });

  describe('marker detection ignores comments', () => {
    it('does not skip wiring when provideDynamicForm appears only in a comment', async () => {
      const { runner, tree } = await makeAppTree();
      const configPath = `${APP_DIR}/src/app/app.config.ts`;
      const original = tree.readContent(configPath);
      tree.overwrite(configPath, '// provideDynamicForm() — TODO wire this up\n' + original);

      const result = await runner.runSchematic('ng-add', { adapter: 'material' }, tree);
      const config = result.readContent(configPath);
      // The real provideDynamicForm(...) call was added (commented marker did not block it).
      expect(config.match(/^[^/]*provideDynamicForm\s*\(/m)).not.toBeNull();
      expect(config).toContain('withMaterialFields');
    });

    it('does not skip a default import when its module appears only in a comment', async () => {
      const { runner, tree } = await makeAppTree();
      const configPath = `${APP_DIR}/src/app/app.config.ts`;
      const original = tree.readContent(configPath);
      tree.overwrite(configPath, "// import Aura from '@primeng/themes/aura';\n" + original);

      const result = await runner.runSchematic('ng-add', { adapter: 'primeng' }, tree);
      const config = result.readContent(configPath);
      // The real default import was added (commented one did not block it).
      expect(config.match(/^[^/]*import Aura from '@primeng\/themes\/aura'/m)).not.toBeNull();
    });
  });

  describe('no application project', () => {
    it('completes without throwing and skips provider wiring', async () => {
      const runner = new SchematicTestRunner('@ng-forge/dynamic-forms', collectionPath);
      // Bare workspace — no application project at all.
      const wsTree = await runner.runExternalSchematic(NG_SCHEMATICS, 'workspace', {
        name: 'empty-ws',
        newProjectRoot: 'projects',
        version: '21.0.0',
      });

      const result = await runner.runSchematic('ng-add', { adapter: 'material' }, wsTree);

      // Core package is still added (so the dep is tracked)...
      const pkg = JSON.parse(result.readContent('/package.json'));
      expect(pkg.dependencies?.['@ng-forge/dynamic-forms']).toBeDefined();
      // ...but there is no app.config.ts to wire.
      expect(result.exists('/projects/test-app/src/app/app.config.ts')).toBe(false);
    });
  });

  describe('multiple application projects', () => {
    async function makeMultiAppTree(): Promise<{ runner: SchematicTestRunner; tree: UnitTestTree }> {
      const runner = new SchematicTestRunner('@ng-forge/dynamic-forms', collectionPath);
      let tree = await runner.runExternalSchematic(NG_SCHEMATICS, 'workspace', {
        name: 'multi-ws',
        newProjectRoot: 'projects',
        version: '21.0.0',
      });
      for (const name of ['app-one', 'app-two']) {
        tree = await runner.runExternalSchematic(
          NG_SCHEMATICS,
          'application',
          { name, standalone: true, style: 'scss', routing: false, inlineTemplate: false, inlineStyle: false },
          tree,
        );
      }
      return { runner, tree };
    }

    it('throws with the app list when --project is omitted', async () => {
      const { runner, tree } = await makeMultiAppTree();
      await expect(runner.runSchematic('ng-add', { adapter: 'material' }, tree)).rejects.toThrow(
        /Multiple application projects found.*app-one.*app-two.*--project=/s,
      );
    });

    it('wires the selected project when --project is passed', async () => {
      const { runner, tree } = await makeMultiAppTree();
      const result = await runner.runSchematic('ng-add', { adapter: 'material', project: 'app-two' }, tree);
      // Wired into app-two only.
      const twoConfig = result.readContent('/projects/app-two/src/app/app.config.ts');
      expect(twoConfig).toContain('withMaterialFields');
      const oneConfig = result.readContent('/projects/app-one/src/app/app.config.ts');
      expect(oneConfig).not.toContain('withMaterialFields');
    });
  });
});
