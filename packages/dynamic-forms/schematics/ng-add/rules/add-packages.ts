import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { NodeDependencyType, addPackageJsonDependency, getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

import { AdapterRecipe, PackageSpec } from '../recipes';
import { VERSIONS } from '../../versions';

const CORE_PACKAGE: PackageSpec = {
  name: '@ng-forge/dynamic-forms',
  version: VERSIONS['@ng-forge/dynamic-forms'],
};

// provideAnimations() (wired unless providers are skipped) imports from
// @angular/platform-browser/animations, which needs @angular/animations —
// not present in a fresh Angular app.
const ANIMATIONS_PACKAGE: PackageSpec = {
  name: '@angular/animations',
  version: VERSIONS['@angular/animations'],
};

export function addPackages(recipe: AdapterRecipe, includeAnimations: boolean): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const all = [CORE_PACKAGE, ...(includeAnimations ? [ANIMATIONS_PACKAGE] : []), ...recipe.packages];
    // @angular/animations ships from the core monorepo and pins @angular/core
    // to its EXACT patch version. So it must match the installed core exactly,
    // otherwise npm resolves the range to a newer patch and the peer check
    // fails (e.g. animations@21.2.15 vs core@21.2.14). Material/CDK are a
    // separate train (peer `^21.0.0`) and keep their declared range.
    const angularVersion = getInstalledAngularVersion(tree);
    let added = 0;

    for (const pkg of all) {
      const existing = getPackageJsonDependency(tree, pkg.name);
      if (existing) {
        ctx.logger.info(`[ng-forge] ${pkg.name} already declared (${existing.version}); leaving as-is.`);
        continue;
      }
      const version = pkg.name === '@angular/animations' && angularVersion ? angularVersion : pkg.version;
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: pkg.name,
        version,
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

/**
 * Exact installed @angular/core version (e.g. "21.2.14"), so @angular/*
 * packages we add lockstep with it. Prefers the resolved version in
 * node_modules; falls back to the spec in package.json; null if neither.
 */
function getInstalledAngularVersion(tree: Tree): string | null {
  const corePkgPath = '/node_modules/@angular/core/package.json';
  if (tree.exists(corePkgPath)) {
    try {
      const json = JSON.parse(tree.read(corePkgPath)!.toString('utf-8')) as { version?: unknown };
      if (typeof json.version === 'string' && json.version.length > 0) {
        return json.version;
      }
    } catch {
      // fall through to package.json spec
    }
  }
  return getPackageJsonDependency(tree, '@angular/core')?.version ?? null;
}
