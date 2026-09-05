import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^@examples/.*', '^@ng-forge/utils$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    // Guard the unsupported `/internal` deep-import. It ships at runtime for single
    // compiled identity, but it is not part of the public API. Adapter-tier code must
    // import from `/integration`. The `dynamic-forms` package owns `/internal` and turns
    // this rule off in its own `eslint.config.mjs` -- a path-based `ignores` here would
    // only work when eslint runs with the workspace root as its base path, so it silently
    // stopped applying whenever eslint resolved the per-project config instead.
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@ng-forge/dynamic-forms/internal', '@ng-forge/dynamic-forms/internal/*'],
              message:
                "'@ng-forge/dynamic-forms/internal' is not part of the public API and may change without notice. Import adapter-tier primitives from '@ng-forge/dynamic-forms/integration' instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {},
  },
];
