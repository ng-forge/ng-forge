const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withAngularNative } = require('@ng-native/metro/config.cjs');

const repoRoot = path.resolve(__dirname, '../../..');

// ng-forge comes from the monorepo, not npm:
// - core from its build output (`nx build dynamic-forms`), linked like any partial-compiled library;
// - the adapter from source, so its component CSS is compiled to native styles. A release build
//   strips component CSS from linked libraries, which would leave the fields unstyled.
const ngForge = {
  '@ng-forge/dynamic-forms': path.join(repoRoot, 'dist/packages/dynamic-forms'),
  '@ng-forge/dynamic-forms-native': path.join(repoRoot, 'packages/dynamic-forms-native'),
};

const config = withAngularNative(getDefaultConfig(__dirname));

config.watchFolders = [...(config.watchFolders ?? []), ...Object.values(ngForge)];

/** `@ng-forge/dynamic-forms/integration` to the file its package's `exports` names. */
function resolveNgForge(moduleName) {
  const pkg = Object.keys(ngForge).find((name) => moduleName === name || moduleName.startsWith(name + '/'));
  if (!pkg) return null;
  const root = ngForge[pkg];
  const { exports } = require(path.join(root, 'package.json'));
  const target = exports['.' + moduleName.slice(pkg.length)];
  const file = typeof target === 'string' ? target : target?.default;
  return file ? { type: 'sourceFile', filePath: path.join(root, file) } : null;
}

const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) =>
  resolveNgForge(moduleName) ?? (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);
// Everything else, including what ng-forge itself imports, resolves from this app's node_modules
// only. The monorepo root has its own Angular, and two copies of @angular/core break DI.
config.resolver.nodeModulesPaths = [path.join(__dirname, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
