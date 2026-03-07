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

  // Array Fields Tests
  {
    path: 'array-fields',
    loadChildren: () => import('./array-fields/array-fields.routes'),
  },

  // Comprehensive Field Tests
  {
    path: 'comprehensive-field-tests',
    loadChildren: () => import('./comprehensive-field-tests/comprehensive-field-tests.routes'),
  },

  // Error Handling Tests
  {
    path: 'error-handling',
    loadChildren: () => import('./error-handling/error-handling.routes'),
  },

  // Field Meta Tests - Tests for meta attribute passthrough
  {
    path: 'field-meta',
    loadChildren: () => import('./field-meta/field-meta.routes'),
  },

  // Group Fields Tests - Tests for nested group field value propagation
  {
    path: 'group-fields',
    loadChildren: () => import('./group-fields/group-fields.routes'),
  },

  // Material Components Tests
  {
    path: 'material-components',
    loadChildren: () => import('./material-components/material-components.routes'),
  },

  // Row Fields Tests - Tests for row container layout and conditional visibility
  {
    path: 'row-fields',
    loadChildren: () => import('./row-fields/row-fields.routes'),
  },

  // Submission Behavior Tests - Tests for form submission and button disabled states
  {
    path: 'submission-behavior',
    loadChildren: () => import('./submission-behavior/submission-behavior.routes'),
  },
] satisfies Route[];
