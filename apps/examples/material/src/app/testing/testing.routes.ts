import { Route } from '@angular/router';

export const testingRoutes: Route[] = [
  // Advanced Validation Tests - Refactored into folder structure
  {
    path: 'test/advanced-validation',
    loadChildren: () => import('./advanced-validation/advanced-validation.routes').then((m) => m.ADVANCED_VALIDATION_ROUTES),
  },

  // Age-Based Logic Test - Single scenario (not refactored)
  {
    path: 'test/age-based-logic-test',
    loadComponent: () => import('./age-based-logic-test-test.component').then((m) => m.AgeBasedLogicTestTestComponent),
  },

  // Array Fields Tests - Refactored into folder structure
  {
    path: 'test/array-fields',
    loadChildren: () => import('./array-fields/array-fields.routes').then((m) => m.ARRAY_FIELDS_ROUTES),
  },

  // Async Validation Tests - Refactored into folder structure
  {
    path: 'test/async-validation',
    loadChildren: () => import('./async-validation/async-validation.routes').then((m) => m.ASYNC_VALIDATION_ROUTES),
  },

  // Comprehensive Field Tests - Refactored into folder structure
  {
    path: 'test/comprehensive-field-tests',
    loadChildren: () =>
      import('./comprehensive-field-tests/comprehensive-field-tests.routes').then((m) => m.COMPREHENSIVE_FIELD_TESTS_ROUTES),
  },

  // Conditional Fields Test - Single scenario (not refactored)
  {
    path: 'test/conditional-fields-test',
    loadComponent: () => import('./conditional-fields-test-test.component').then((m) => m.ConditionalFieldsTestTestComponent),
  },

  // Cross-Field Validation Tests - Refactored into folder structure
  {
    path: 'test/cross-field-validation',
    loadChildren: () => import('./cross-field-validation/cross-field-validation.routes').then((m) => m.CROSS_FIELD_VALIDATION_ROUTES),
  },

  // Cross-Page Validation Tests - Refactored into folder structure
  {
    path: 'test/cross-page-validation',
    loadChildren: () => import('./cross-page-validation/cross-page-validation.routes').then((m) => m.CROSS_PAGE_VALIDATION_ROUTES),
  },

  // Debug Test - Single scenario (not refactored)
  {
    path: 'test/debug-test',
    loadComponent: () => import('./debug-test-test.component').then((m) => m.DebugTestTestComponent),
  },

  // Demo Scenarios Tests - Refactored into folder structure
  {
    path: 'test/demo-scenarios-test',
    loadChildren: () => import('./demo-scenarios/demo-scenarios.routes').then((m) => m.DEMO_SCENARIOS_ROUTES),
  },

  // Error Handling Tests - Refactored into folder structure
  {
    path: 'test/error-handling',
    loadChildren: () => import('./error-handling/error-handling.routes').then((m) => m.ERROR_HANDLING_ROUTES),
  },

  // Essential Tests - Refactored into folder structure
  {
    path: 'test/essential-tests',
    loadChildren: () => import('./essential-tests/essential-tests.routes').then((m) => m.ESSENTIAL_TESTS_ROUTES),
  },

  // Expression-Based Logic Tests - Refactored into folder structure
  {
    path: 'test/expression-based-logic',
    loadChildren: () => import('./expression-based-logic/expression-based-logic.routes').then((m) => m.EXPRESSION_BASED_LOGIC_ROUTES),
  },

  // Form Reset/Clear Tests - Refactored into folder structure
  {
    path: 'test/form-reset-clear',
    loadChildren: () => import('./form-reset-clear/form-reset-clear.routes').then((m) => m.FORM_RESET_CLEAR_ROUTES),
  },

  // Material Components Tests - Refactored into folder structure
  {
    path: 'test/material-components',
    loadChildren: () => import('./material-components/material-components.routes').then((m) => m.MATERIAL_COMPONENTS_ROUTES),
  },

  // Multi-Page Navigation Tests - Refactored into folder structure
  {
    path: 'test/multi-page-navigation',
    loadChildren: () => import('./multi-page-navigation/multi-page-navigation.routes').then((m) => m.MULTI_PAGE_NAVIGATION_ROUTES),
  },

  // Navigation Edge Cases Tests - Refactored into folder structure
  {
    path: 'test/navigation-edge-cases',
    loadChildren: () => import('./navigation-edge-cases/navigation-edge-cases.routes').then((m) => m.NAVIGATION_EDGE_CASES_ROUTES),
  },

  // Scenario List Tests - Refactored into folder structure
  {
    path: 'test/scenario-list',
    loadChildren: () => import('./scenario-list/scenario-list.routes').then((m) => m.SCENARIO_LIST_ROUTES),
  },

  // User Journey Flows Tests - Refactored into folder structure
  {
    path: 'test/user-journey-flows',
    loadChildren: () => import('./user-journey-flows/user-journey-flows.routes').then((m) => m.USER_JOURNEY_FLOWS_ROUTES),
  },

  // User Workflows Tests - Refactored into folder structure
  {
    path: 'test/user-workflows',
    loadChildren: () => import('./user-workflows/user-workflows.routes').then((m) => m.USER_WORKFLOWS_ROUTES),
  },
];
