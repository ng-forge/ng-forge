import { Rule, SchematicContext, SchematicsException, Tree, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { NgAddOptions } from './schema';
import { AdapterRecipe, RECIPES } from './recipes';
import { addPackages } from './rules/add-packages';
import { addStyles } from './rules/add-styles';
import { addProviders } from './rules/add-providers';

export default function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    if (!options.adapter) {
      throw new SchematicsException('[ng-forge] No adapter selected. Pass --adapter=<material|bootstrap|primeng|ionic|none>.');
    }
    if (!(options.adapter in RECIPES)) {
      throw new SchematicsException(`[ng-forge] Unknown adapter "${options.adapter}".`);
    }

    const recipe = RECIPES[options.adapter];
    const projectName = await resolveProjectName(tree, options.project);
    const legacyStatusClasses = options.legacyStatusClasses !== false;

    ctx.logger.info(`[ng-forge] Setting up dynamic-forms with ${recipe.label}${projectName ? ` (project: ${projectName})` : ''}.`);

    return chain([
      addPackages(recipe, !options.skipProviders),
      options.skipStyles ? noopRule() : addStyles(recipe, projectName),
      options.skipProviders ? noopRule() : addProviders(recipe, legacyStatusClasses, projectName),
      summarize(recipe, options, projectName),
    ]);
  };
}

function noopRule(): Rule {
  return (tree) => tree;
}

async function resolveProjectName(tree: Tree, requested: string | undefined): Promise<string | undefined> {
  if (requested) {
    return requested;
  }
  try {
    const workspace = await getWorkspace(tree);
    const explicitDefault = workspace.extensions['defaultProject'];
    if (typeof explicitDefault === 'string' && workspace.projects.has(explicitDefault)) {
      return explicitDefault;
    }
    for (const [name, project] of workspace.projects) {
      if (project.extensions['projectType'] === 'application') {
        return name;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function summarize(recipe: AdapterRecipe, options: NgAddOptions, projectName: string | undefined): Rule {
  return (_tree: Tree, ctx: SchematicContext) => {
    const lines: string[] = [];
    lines.push('[ng-forge] Done.');
    lines.push(`  adapter: ${recipe.label}`);
    if (projectName) {
      lines.push(`  project: ${projectName}`);
    }
    lines.push(`  styles:    ${options.skipStyles ? 'skipped' : recipe.styles.length === 0 ? 'n/a' : 'imported'}`);
    lines.push(`  providers: ${options.skipProviders ? 'skipped' : 'wired'}`);
    if (recipe.packages.length > 0) {
      lines.push("  Run `npm install` if it didn't run automatically.");
    }
    lines.push('  Docs: https://ng-forge.com/dynamic-forms/getting-started');
    ctx.logger.info(lines.join('\n'));
  };
}
