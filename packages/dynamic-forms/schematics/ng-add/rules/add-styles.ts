import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

import { AdapterRecipe } from '../recipes';

const FALLBACK_STYLES_PATHS = ['src/styles.scss', 'src/styles.css'];

export function addStyles(recipe: AdapterRecipe, projectName: string | undefined): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    if (recipe.styles.length === 0) {
      return tree;
    }

    const stylesPath = await resolveStylesPath(tree, projectName);
    if (!stylesPath) {
      ctx.logger.warn(
        '[ng-forge] Could not locate a global styles file from angular.json. Skipping style imports. ' +
          'Add the following imports manually:\n' +
          recipe.styles.map((p) => `  @import '${p}';`).join('\n'),
      );
      return tree;
    }

    const buffer = tree.read(stylesPath);
    const current = buffer ? buffer.toString('utf-8') : '';
    const additions: string[] = [];

    for (const style of recipe.styles) {
      if (current.includes(style)) {
        ctx.logger.info(`[ng-forge] ${style} already imported; skipping.`);
        continue;
      }
      additions.push(`@import '${style}';`);
    }

    if (additions.length === 0) {
      return tree;
    }

    const block = additions.join('\n');
    const updated = current.length > 0 ? `${block}\n${current}` : `${block}\n`;
    tree.overwrite(stylesPath, updated);
    ctx.logger.info(`[ng-forge] Added ${additions.length} style import(s) to ${stylesPath}.`);
    return tree;
  };
}

async function resolveStylesPath(tree: Tree, projectName: string | undefined): Promise<string | null> {
  try {
    const workspace = await getWorkspace(tree);
    const project = projectName ? workspace.projects.get(projectName) : firstApplicationProject(workspace);
    if (!project) {
      return firstFallback(tree);
    }
    const buildTarget = project.targets.get('build');
    const stylesOption = buildTarget?.options?.['styles'];
    if (Array.isArray(stylesOption)) {
      for (const entry of stylesOption) {
        if (typeof entry === 'string' && tree.exists(entry)) {
          return entry;
        }
        if (entry && typeof entry === 'object' && 'input' in entry && typeof entry.input === 'string' && tree.exists(entry.input)) {
          return entry.input;
        }
      }
    }
    return firstFallback(tree);
  } catch {
    return firstFallback(tree);
  }
}

function firstApplicationProject(workspace: Awaited<ReturnType<typeof getWorkspace>>) {
  for (const [, project] of workspace.projects) {
    if (project.extensions['projectType'] === 'application') {
      return project;
    }
  }
  return null;
}

function firstFallback(tree: Tree): string | null {
  for (const candidate of FALLBACK_STYLES_PATHS) {
    if (tree.exists(candidate)) {
      return candidate;
    }
  }
  return null;
}
