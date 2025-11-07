import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/index.html', '**/app.html'],
  },
  {
    files: ['**/*.ts'],
    rules: {},
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
