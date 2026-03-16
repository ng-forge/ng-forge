import { Route } from '@angular/router';

/**
 * Content routes for the /:adapter/ scope.
 * Each maps to DocPageComponent which loads markdown based on the route path.
 * Order matters: more specific routes first, catch-all last.
 */

const docPage = () => import('../pages/doc-page/doc-page.component').then((m) => m.DocPageComponent);

export const CONTENT_ROUTES: Route[] = [
  // Getting Started
  { path: 'getting-started', loadComponent: docPage },

  // Configuration
  { path: 'configuration', loadComponent: docPage },

  // Schema Fields
  { path: 'schema-fields/field-types/text-inputs', loadComponent: docPage },
  { path: 'schema-fields/field-types/selection', loadComponent: docPage },
  { path: 'schema-fields/field-types/buttons', loadComponent: docPage },
  { path: 'schema-fields/field-types/utility', loadComponent: docPage },
  { path: 'schema-fields/field-types/advanced-controls', loadComponent: docPage },
  { path: 'schema-fields/field-types', redirectTo: 'schema-fields/field-types/text-inputs', pathMatch: 'full' },
  { path: 'schema-fields', redirectTo: 'schema-fields/field-types/text-inputs', pathMatch: 'full' },

  // Validation
  { path: 'validation/basics', loadComponent: docPage },
  { path: 'validation/advanced', loadComponent: docPage },
  { path: 'validation/custom-validators', loadComponent: docPage },
  { path: 'validation/reference', loadComponent: docPage },
  { path: 'validation', redirectTo: 'validation/basics', pathMatch: 'full' },

  // Schema Validation
  { path: 'schema-validation/overview', loadComponent: docPage },
  { path: 'schema-validation/angular-schema', loadComponent: docPage },
  { path: 'schema-validation/zod', loadComponent: docPage },
  { path: 'schema-validation', redirectTo: 'schema-validation/overview', pathMatch: 'full' },

  // Dynamic Behavior
  { path: 'dynamic-behavior/conditional-logic', loadComponent: docPage },
  { path: 'dynamic-behavior/value-derivation', loadComponent: docPage },
  { path: 'dynamic-behavior/i18n', loadComponent: docPage },
  { path: 'dynamic-behavior/submission', loadComponent: docPage },
  { path: 'dynamic-behavior', redirectTo: 'dynamic-behavior/conditional-logic', pathMatch: 'full' },

  // Prebuilt
  { path: 'prebuilt/form-groups', loadComponent: docPage },
  { path: 'prebuilt/form-pages', loadComponent: docPage },
  { path: 'prebuilt/form-rows', loadComponent: docPage },
  { path: 'prebuilt/form-arrays/simplified', loadComponent: docPage },
  { path: 'prebuilt/form-arrays/complete', loadComponent: docPage },
  { path: 'prebuilt/form-arrays', redirectTo: 'prebuilt/form-arrays/simplified', pathMatch: 'full' },
  { path: 'prebuilt/hidden-fields', loadComponent: docPage },
  { path: 'prebuilt/text-components', loadComponent: docPage },
  { path: 'prebuilt', redirectTo: 'prebuilt/form-groups', pathMatch: 'full' },

  // Examples
  {
    path: 'examples',
    loadComponent: () => import('../pages/examples-index/examples-index.component').then((m) => m.ExamplesIndexComponent),
  },

  // Advanced
  { path: 'advanced/custom-fields', loadComponent: docPage },
  { path: 'advanced/expression-parser', loadComponent: docPage },
  { path: 'advanced/type-safety', loadComponent: docPage },
  { path: 'advanced/events', loadComponent: docPage },
  { path: 'advanced/value-exclusion', loadComponent: docPage },
  { path: 'advanced', redirectTo: 'advanced/custom-fields', pathMatch: 'full' },

  // Building an Adapter (custom adapter only)
  { path: 'building-an-adapter', loadComponent: docPage },

  // AI Integration
  { path: 'ai-integration', loadComponent: docPage },
];
