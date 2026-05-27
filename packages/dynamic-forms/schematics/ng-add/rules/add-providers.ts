import { Rule, SchematicContext, Tree, chain, noop } from '@angular-devkit/schematics';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { addRootProvider } from '@schematics/angular/utility/standalone/rules';
import { findAppConfig } from '@schematics/angular/utility/standalone/app_config';
import {
  applyChangesToFile,
  findBootstrapApplicationCall,
  getMainFilePath,
  getSourceFile,
} from '@schematics/angular/utility/standalone/util';

import { AdapterProviderSpec, AdapterRecipe } from '../recipes';

const DEFAULT_PROJECT = 'default';

export function addProviders(recipe: AdapterRecipe, legacyStatusClasses: boolean, projectName: string | undefined): Rule {
  return () => {
    const project = projectName ?? DEFAULT_PROJECT;

    return chain([
      maybeAddRootProvider(
        project,
        'provideAnimations',
        ({ code, external }) => code`${external('provideAnimations', '@angular/platform-browser/animations')}()`,
      ),
      ...recipe.adapterProviders.flatMap((spec) => adapterProviderRules(project, spec, projectName)),
      maybeAddRootProvider(project, 'provideDynamicForm', ({ code, external }) => {
        const provide = external('provideDynamicForm', '@ng-forge/dynamic-forms');
        if (recipe.withFields === null) {
          return code`${provide}()`;
        }
        const withFields = external(recipe.withFields.symbol, recipe.withFields.from);
        if (legacyStatusClasses) {
          const withLegacy = external('withLegacyStatusClasses', '@ng-forge/dynamic-forms');
          return code`${provide}(...${withFields}(), ${withLegacy}())`;
        }
        return code`${provide}(...${withFields}())`;
      }),
    ]);
  };
}

function adapterProviderRules(project: string, spec: AdapterProviderSpec, projectName: string | undefined): Rule[] {
  return [
    ...spec.defaultImports.map((imp) => addDefaultImportRule(imp.symbol, imp.from, projectName)),
    maybeAddRootProvider(project, spec.marker, spec.builder),
  ];
}

function addDefaultImportRule(symbol: string, module: string, projectName: string | undefined): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    let mainFilePath: string;
    try {
      mainFilePath = await getMainFilePath(tree, projectName ?? DEFAULT_PROJECT);
    } catch {
      ctx.logger.warn(`[ng-forge] Could not locate main.ts; skipping default import for ${symbol}.`);
      return tree;
    }

    let filePath = mainFilePath;
    try {
      const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
      const appConfig = findAppConfig(bootstrapCall, tree, mainFilePath);
      if (appConfig) {
        filePath = appConfig.filePath;
      }
    } catch {
      // fall back to main.ts
    }

    const source = getSourceFile(tree, filePath);
    const change = insertImport(source, filePath, symbol, module, true);
    applyChangesToFile(tree, filePath, [change]);
    return tree;
  };
}

function maybeAddRootProvider(project: string, marker: string, callback: Parameters<typeof addRootProvider>[1]): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    const present = await isProviderPresent(tree, project, marker);
    if (present) {
      ctx.logger.info(`[ng-forge] ${marker}(...) already present in providers; skipping.`);
      return noop();
    }
    return addRootProvider(project, callback);
  };
}

async function isProviderPresent(tree: Tree, project: string, marker: string): Promise<boolean> {
  let mainFilePath: string;
  try {
    mainFilePath = await getMainFilePath(tree, project);
  } catch {
    return false;
  }

  let filePath = mainFilePath;
  try {
    const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
    const appConfig = findAppConfig(bootstrapCall, tree, mainFilePath);
    if (appConfig) {
      filePath = appConfig.filePath;
    }
  } catch {
    return false;
  }

  const buffer = tree.read(filePath);
  if (!buffer) {
    return false;
  }
  const source = buffer.toString('utf-8');
  return new RegExp(`\\b${marker}\\s*\\(`).test(source);
}
