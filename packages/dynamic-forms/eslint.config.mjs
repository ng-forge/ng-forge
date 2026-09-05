import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/schematics/**/*',
            // Local-only agent-eval harness, never shipped in the package.
            '{projectRoot}/src/lib/core/web-mcp/eval/**/*',
          ],
          ignoredDependencies: [
            'vite',
            '@analogjs/vite-plugin-angular',
            '@nx/vite',
            '@vitest/browser-playwright',
            'vitest',
            '@angular-devkit/schematics',
            '@schematics/angular',
            '@nx/devkit',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
    },
  },
  {
    // This package owns `@ng-forge/dynamic-forms/internal`, so the base config's
    // deep-import guard does not apply to its own sources.
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
