import { Route } from '@angular/router';

export default [
  // Advanced Validation Tests - Refactored into folder structure
  {
    path: 'test/advanced-validation',
    loadChildren: () => import('./advanced-validation/advanced-validation.routes'),
  },

  // Array Fields Tests - Refactored into folder structure
  {
    path: 'test/array-fields',
    loadChildren: () => import('./array-fields/array-fields.routes'),
  },

  // Async Validation Tests - Refactored into folder structure
  {
    path: 'test/async-validation',
    loadChildren: () => import('./async-validation/async-validation.routes'),
  },

  // Comprehensive Field Tests - Refactored into folder structure
  {
    path: 'test/comprehensive-field-tests',
    loadChildren: () => import('./comprehensive-field-tests/comprehensive-field-tests.routes'),
  },

  // Cross-Field Validation Tests - Refactored into folder structure
  {
    path: 'test/cross-field-validation',
    loadChildren: () => import('./cross-field-validation/cross-field-validation.routes'),
  },

  // Cross-Page Validation Tests - Refactored into folder structure
  {
    path: 'test/cross-page-validation',
    loadChildren: () => import('./cross-page-validation/cross-page-validation.routes'),
  },

  // Demo Scenarios Tests - Refactored into folder structure
  {
    path: 'test/demo-scenarios-test',
    loadChildren: () => import('./demo-scenarios/demo-scenarios.routes'),
  },

  // Error Handling Tests - Refactored into folder structure
  {
    path: 'test/error-handling',
    loadChildren: () => import('./error-handling/error-handling.routes'),
  },

  // Essential Tests - Refactored into folder structure
  {
    path: 'test/essential-tests',
    loadChildren: () => import('./essential-tests/essential-tests.routes'),
  },

  // Expression-Based Logic Tests - Refactored into folder structure
  {
    path: 'test/expression-based-logic',
    loadChildren: () => import('./expression-based-logic/expression-based-logic.routes'),
  },

  // Form Reset/Clear Tests - Refactored into folder structure
  {
    path: 'test/form-reset-clear',
    loadChildren: () => import('./form-reset-clear/form-reset-clear.routes'),
  },

  // Material Components Tests - Refactored into folder structure
  {
    path: 'test/material-components',
    loadChildren: () => import('./material-components/material-components.routes'),
  },

  // Multi-Page Navigation Tests - Refactored into folder structure
  {
    path: 'test/multi-page-navigation',
    loadChildren: () => import('./multi-page-navigation/multi-page-navigation.routes'),
  },

  // Navigation Edge Cases Tests - Refactored into folder structure
  {
    path: 'test/navigation-edge-cases',
    loadChildren: () => import('./navigation-edge-cases/navigation-edge-cases.routes'),
  },

  // Scenario List Tests - Refactored into folder structure
  {
    path: 'test/scenario-list',
    loadChildren: () => import('./scenario-list/scenario-list.routes'),
  },

  // User Journey Flows Tests - Refactored into folder structure
  {
    path: 'test/user-journey-flows',
    loadChildren: () => import('./user-journey-flows/user-journey-flows.routes'),
  },

  // User Workflows Tests - Refactored into folder structure
  {
    path: 'test/user-workflows',
    loadChildren: () => import('./user-workflows/user-workflows.routes'),
  },
] satisfies Route[];
