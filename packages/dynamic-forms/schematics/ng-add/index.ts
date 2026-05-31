import { Rule, SchematicContext, SchematicsException, Tree, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { NgAddOptions } from './schema';
import { AdapterRecipe, RECIPES } from './recipes';
import { addPackages, InstallState } from './rules/add-packages';
import { addStyles } from './rules/add-styles';
import { addProviders } from './rules/add-providers';

export default function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    if (!options.adapter) {
      throw new SchematicsException('No adapter selected. Pass --adapter=<material|bootstrap|primeng|ionic|none>.');
    }
    if (!(options.adapter in RECIPES)) {
      throw new SchematicsException(`Unknown adapter "${options.adapter}".`);
    }

    const recipe = RECIPES[options.adapter];
    const projectName = await resolveProjectName(tree, options.project);
    const legacyStatusClasses = options.legacyStatusClasses !== false;

    // Shared across rules: addPackages records how many deps it queued so the
    // final summary can show the install hint only when an install was actually
    // scheduled (e.g. not on an idempotent re-run).
    const installState: InstallState = { added: 0 };

    ctx.logger.info(`Setting up @ng-forge/dynamic-forms with ${recipe.label}${projectName ? ` (project: ${projectName})` : ''}.`);

    return chain([
      addPackages(recipe, !options.skipProviders, installState),
      options.skipStyles ? noopRule() : addStyles(recipe, projectName),
      options.skipProviders ? noopRule() : addProviders(recipe, legacyStatusClasses, projectName),
      summarize(recipe, options, projectName, installState),
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
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;
  try {
    workspace = await getWorkspace(tree);
  } catch {
    return undefined;
  }

  const explicitDefault = workspace.extensions['defaultProject'];
  if (typeof explicitDefault === 'string' && workspace.projects.has(explicitDefault)) {
    return explicitDefault;
  }

  const apps: string[] = [];
  for (const [name, project] of workspace.projects) {
    if (project.extensions['projectType'] === 'application') {
      apps.push(name);
    }
  }

  if (apps.length === 0) {
    return undefined;
  }
  if (apps.length === 1) {
    return apps[0];
  }
  // Multiple apps and no --project: silently picking one would wire
  // ng-forge into a random project. Fail loudly with the list so the user
  // can re-run with --project=<name>.
  throw new SchematicsException(
    `Multiple application projects found (${apps.join(', ')}). Pass --project=<name> to choose which one to set up.`,
  );
}

function summarize(recipe: AdapterRecipe, options: NgAddOptions, projectName: string | undefined, installState: InstallState): Rule {
  return (_tree: Tree, ctx: SchematicContext) => {
    const providersStatus = options.skipProviders ? 'skipped' : projectName ? 'wired' : 'skipped (no application project found)';
    const lines: string[] = [];
    lines.push('@ng-forge/dynamic-forms setup complete.');
    lines.push(`  adapter: ${recipe.label}`);
    if (projectName) {
      lines.push(`  project: ${projectName}`);
    }
    lines.push(`  styles:    ${options.skipStyles ? 'skipped' : recipe.styles.length === 0 ? 'n/a' : 'imported'}`);
    lines.push(`  providers: ${providersStatus}`);
    if (installState.added > 0) {
      lines.push("  Run `npm install` if it didn't run automatically.");
    }
    lines.push('  Docs: https://ng-forge.com/dynamic-forms/getting-started');
    ctx.logger.info(lines.join('\n'));
  };
}
