import { Route } from '@angular/router';

export default [
  // Test Index - Landing page for all test suites
  {
    path: '',
    loadComponent: () => import('./test-index.component').then((m) => m.TestIndexComponent),
  },

  // Advanced Validation Tests
  {
    path: 'advanced-validation',
    loadChildren: () => import('./advanced-validation/advanced-validation.routes'),
  },

  // Angular Schema Validation Tests
  {
    path: 'angular-schema-validation',
    loadChildren: () => import('./angular-schema-validation/angular-schema-validation.routes'),
  },

  // Async Validation Tests
  {
    path: 'async-validation',
    loadChildren: () => import('./async-validation/async-validation.routes'),
  },

  // Config Change Tests
  {
    path: 'config-change',
    loadChildren: () => import('./config-change/config-change.routes'),
  },

  // Container Conditional Visibility Tests
  {
    path: 'container-conditional-visibility',
    loadChildren: () => import('./container-conditional-visibility/container-conditional-visibility.routes'),
  },

  // Container Nesting Tests
  {
    path: 'container-nesting',
    loadChildren: () => import('./container-nesting/container-nesting.routes'),
  },

  // Cross-Field Validation Tests
  {
    path: 'cross-field-validation',
    loadChildren: () => import('./cross-field-validation/cross-field-validation.routes'),
  },

  // Cross-Page Validation Tests
  {
    path: 'cross-page-validation',
    loadChildren: () => import('./cross-page-validation/cross-page-validation.routes'),
  },

  // Demo Scenarios Tests
  {
    path: 'demo-scenarios',
    loadChildren: () => import('./demo-scenarios/demo-scenarios.routes'),
  },

  // Derivation Logic Tests
  {
    path: 'derivation-logic',
    loadChildren: () => import('./derivation-logic/derivation-logic.routes'),
  },

  // Essential Tests
  {
    path: 'essential-tests',
    loadChildren: () => import('./essential-tests/essential-tests.routes'),
  },

  // Expression-Based Logic Tests
  {
    path: 'expression-based-logic',
    loadChildren: () => import('./expression-based-logic/expression-based-logic.routes'),
  },

  // External Data Tests
  {
    path: 'external-data',
    loadChildren: () => import('./external-data/external-data.routes'),
  },

  // Form Reset/Clear Tests
  {
    path: 'form-reset-clear',
    loadChildren: () => import('./form-reset-clear/form-reset-clear.routes'),
  },

  // Multi-Page Navigation Tests
  {
    path: 'multi-page-navigation',
    loadChildren: () => import('./multi-page-navigation/multi-page-navigation.routes'),
  },

  // Performance Tests
  {
    path: 'performance',
    loadChildren: () => import('./performance/performance.routes'),
  },

  // Property Derivation Logic Tests
  {
    path: 'property-derivation-logic',
    loadChildren: () => import('./property-derivation-logic/property-derivation-logic.routes'),
  },

  // Schema System Tests
  {
    path: 'schema-system',
    loadChildren: () => import('./schema-system/schema-system.routes'),
  },

  // User Journey Flows Tests
  {
    path: 'user-journey-flows',
    loadChildren: () => import('./user-journey-flows/user-journey-flows.routes'),
  },

  // User Workflows Tests
  {
    path: 'user-workflows',
    loadChildren: () => import('./user-workflows/user-workflows.routes'),
  },

  // Zod Schema Validation Tests
  {
    path: 'zod-schema-validation',
    loadChildren: () => import('./zod-schema-validation/zod-schema-validation.routes'),
  },
] satisfies Route[];
