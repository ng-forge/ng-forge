import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodeDependencyType, addPackageJsonDependency, getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

import { AdapterRecipe, PackageSpec } from '../recipes';
import { VERSIONS } from '../../versions';

const CORE_PACKAGE: PackageSpec = {
  name: '@ng-forge/dynamic-forms',
  version: VERSIONS['@ng-forge/dynamic-forms'],
};

export function addPackages(recipe: AdapterRecipe): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const all = [CORE_PACKAGE, ...recipe.packages];
    let added = 0;

    for (const pkg of all) {
      const existing = getPackageJsonDependency(tree, pkg.name);
      if (existing) {
        ctx.logger.info(`[ng-forge] ${pkg.name} already declared (${existing.version}); leaving as-is.`);
        continue;
      }
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: pkg.name,
        version: pkg.version,
        overwrite: false,
      });
      added++;
    }

    if (added > 0) {
      ctx.addTask(new NodePackageInstallTask());
    }

    return tree;
  };
}
