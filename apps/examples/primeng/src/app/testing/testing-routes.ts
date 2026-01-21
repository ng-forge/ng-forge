import { Route } from '@angular/router';

export default [
  // Test Index - Landing page for all test suites
  {
    path: '',
    loadComponent: () => import('./test-index.component').then((m) => m.TestIndexComponent),
  },

  // Accessibility Tests - WCAG AA compliance tests
  {
    path: 'accessibility',
    loadChildren: () => import('./accessibility/accessibility.routes'),
  },

  // Advanced Validation Tests - Refactored into folder structure
  {
    path: 'advanced-validation',
    loadChildren: () => import('./advanced-validation/advanced-validation.routes'),
  },

  // Array Fields Tests - Tests for array field manipulation (add/remove items)
  {
    path: 'array-fields',
    loadChildren: () => import('./array-fields/array-fields.routes'),
  },

  // Async Validation Tests - Refactored into folder structure
  {
    path: 'async-validation',
    loadChildren: () => import('./async-validation/async-validation.routes'),
  },

  // Comprehensive Field Tests - Refactored into folder structure
  {
    path: 'comprehensive-field-tests',
    loadChildren: () => import('./comprehensive-field-tests/comprehensive-field-tests.routes'),
  },

  // Cross-Field Validation Tests - Refactored into folder structure
  {
    path: 'cross-field-validation',
    loadChildren: () => import('./cross-field-validation/cross-field-validation.routes'),
  },

  // Cross-Page Validation Tests - Refactored into folder structure
  {
    path: 'cross-page-validation',
    loadChildren: () => import('./cross-page-validation/cross-page-validation.routes'),
  },

  // Demo Scenarios Tests - Refactored into folder structure
  {
    path: 'demo-scenarios',
    loadChildren: () => import('./demo-scenarios/demo-scenarios.routes'),
  },

  // Error Handling Tests - Refactored into folder structure
  {
    path: 'error-handling',
    loadChildren: () => import('./error-handling/error-handling.routes'),
  },

  // Essential Tests - Refactored into folder structure
  {
    path: 'essential-tests',
    loadChildren: () => import('./essential-tests/essential-tests.routes'),
  },

  // Expression-Based Logic Tests - Refactored into folder structure
  {
    path: 'expression-based-logic',
    loadChildren: () => import('./expression-based-logic/expression-based-logic.routes'),
  },

  // Form Reset/Clear Tests - Refactored into folder structure
  {
    path: 'form-reset-clear',
    loadChildren: () => import('./form-reset-clear/form-reset-clear.routes'),
  },

  // Group Fields Tests - Tests for nested group field value propagation
  {
    path: 'group-fields',
    loadChildren: () => import('./group-fields/group-fields.routes'),
  },

  // PrimeNG Components Tests - PrimeNG-specific component tests
  // TODO: Create primeng-components test folder with PrimeNG-specific tests

  // Multi-Page Navigation Tests - Refactored into folder structure
  {
    path: 'multi-page-navigation',
    loadChildren: () => import('./multi-page-navigation/multi-page-navigation.routes'),
  },

  // Schema System Tests - Reusable schema configurations for validation and logic
  {
    path: 'schema-system',
    loadChildren: () => import('./schema-system/schema-system.routes'),
  },

  // Submission Behavior Tests - Tests for form submission and button disabled states
  {
    path: 'submission-behavior',
    loadChildren: () => import('./submission-behavior/submission-behavior.routes'),
  },

  // User Journey Flows Tests - Refactored into folder structure
  {
    path: 'user-journey-flows',
    loadChildren: () => import('./user-journey-flows/user-journey-flows.routes'),
  },

  // User Workflows Tests - Refactored into folder structure
  {
    path: 'user-workflows',
    loadChildren: () => import('./user-workflows/user-workflows.routes'),
  },

  // Zod Schema Validation Tests - Form-level validation using Zod with Standard Schema
  {
    path: 'zod-schema-validation',
    loadChildren: () => import('./zod-schema-validation/zod-schema-validation.routes'),
  },
] satisfies Route[];
