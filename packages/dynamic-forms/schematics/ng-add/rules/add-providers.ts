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

export function addProviders(recipe: AdapterRecipe, legacyStatusClasses: boolean, projectName: string | undefined): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    // No target project (workspace has no application, or the workspace file
    // couldn't be read). Don't guess a name — addRootProvider would throw and
    // abort the whole ng-add. Warn and skip, mirroring addStyles' behaviour.
    if (!projectName) {
      ctx.logger.warn(
        'No application project found; skipping provider wiring. ' +
          'Add provideDynamicForm(...) to your ApplicationConfig manually — see ' +
          'https://ng-forge.com/dynamic-forms/getting-started',
      );
      return tree;
    }
    const project = projectName;

    return chain([
      maybeAddRootProvider(
        project,
        'provideAnimations',
        ({ code, external }) => code`${external('provideAnimations', '@angular/platform-browser/animations')}()`,
      ),
      ...recipe.adapterProviders.flatMap((spec) => adapterProviderRules(project, spec)),
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

function adapterProviderRules(project: string, spec: AdapterProviderSpec): Rule[] {
  return [
    ...spec.defaultImports.map((imp) => addDefaultImportRule(imp.symbol, imp.from, project)),
    maybeAddRootProvider(project, spec.marker, spec.builder),
  ];
}

function addDefaultImportRule(symbol: string, module: string, project: string): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    let mainFilePath: string;
    try {
      mainFilePath = await getMainFilePath(tree, project);
    } catch {
      ctx.logger.warn(`Could not locate main.ts; skipping default import for ${symbol}.`);
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

    // insertImport throws (rather than no-op'ing) for an already-present
    // DEFAULT import, so guard idempotency ourselves before calling it.
    // Strip comments first so a commented-out import doesn't suppress the
    // real insertion.
    const existing = stripJsComments(tree.read(filePath)?.toString('utf-8') ?? '');
    const moduleSpecifier = new RegExp(`from\\s+['"]${escapeRegExp(module)}['"]`);
    if (moduleSpecifier.test(existing)) {
      ctx.logger.info(`import ${symbol} from '${module}' already present; skipping.`);
      return tree;
    }

    const source = getSourceFile(tree, filePath);
    const change = insertImport(source, filePath, symbol, module, true);
    applyChangesToFile(tree, filePath, [change]);
    return tree;
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips line and block comments from JS/TS source for token-presence
 * checks. Naive: doesn't account for `//` or `/*` characters that appear
 * inside string/template literals — those would be unusual and aren't a
 * realistic concern for the call-expression markers we're scanning for.
 */
function stripJsComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function maybeAddRootProvider(project: string, marker: string, callback: Parameters<typeof addRootProvider>[1]): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    const present = await isProviderPresent(tree, project, marker);
    if (present) {
      ctx.logger.info(`${marker}(...) already present in providers; skipping.`);
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
  // Strip comments so a commented-out reference (e.g. `// provideDynamicForm()`)
  // doesn't cause the schematic to skip real wiring.
  const source = stripJsComments(buffer.toString('utf-8'));
  return new RegExp(`\\b${marker}\\s*\\(`).test(source);
}
