export default {
  extends: ['@commitlint/config-angular'],
  rules: {
    // Types allowed (Angular-style)
    'type-enum': [
      2,
      'always',
      [
        'build', // Changes to build system or dependencies
        'ci', // CI configuration changes
        'docs', // Documentation only changes
        'feat', // A new feature
        'fix', // A bug fix
        'perf', // Performance improvement
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'test', // Adding or correcting tests
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
        'style', // Code style changes (formatting, semicolons, etc.)
      ],
    ],
    // Scopes for ng-forge packages
    'scope-enum': [
      2,
      'always',
      [
        // Core packages
        'core',
        'forms',
        'dynamic-forms',
        // UI integrations
        'material',
        'bootstrap',
        'primeng',
        'ionic',
        // MCP server
        'mcp',
        // Apps
        'docs',
        'examples',
        // Infrastructure
        'release',
        'deps',
        'config',
        // Allow empty scope for general changes
        '',
      ],
    ],
    'scope-empty': [0], // Allow empty scope
    // Disable strict lowercase to allow proper nouns (function names, class names, etc.)
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
