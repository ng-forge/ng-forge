import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // The three runtime packages below are not imported from this
          // package's own sources. They are reached through the bundled
          // @ng-forge/dynamic-forms-validation code, so they must be declared
          // for `npx @ng-forge/dynamic-forms-cli` to resolve standalone even
          // though the dependency check cannot see the import.
          ignoredDependencies: [
            'vite',
            '@nx/vite',
            'vitest',
            'zod',
            'ts-morph',
            'zod-to-json-schema',
            '@ng-forge/dynamic-forms-validation', // Internal library, bundled by esbuild
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
