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
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
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
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/models', '**/models/index'],
              message: 'Do not import from barrel files. Import directly from the specific file (e.g., "../../models/types/nesting-constraints" instead of "../../models").',
            },
            {
              group: ['**/definitions', '**/definitions/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/core', '**/core/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/utils', '**/utils/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/providers', '**/providers/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/events', '**/events/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/mappers', '**/mappers/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/pipes', '**/pipes/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/fields', '**/fields/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['**/testing', '**/testing/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['../base', '../base/index'],
              message: 'Do not import from barrel files. Import directly from the specific file (e.g., "../base/field-def").',
            },
            {
              group: ['./types', './types/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./validation', './validation/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./logic', './logic/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./expressions', './expressions/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./schemas', './schemas/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./registry', './registry/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
            {
              group: ['./values', './values/index'],
              message: 'Do not import from barrel files. Import directly from the specific file.',
            },
          ],
        },
      ],
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
