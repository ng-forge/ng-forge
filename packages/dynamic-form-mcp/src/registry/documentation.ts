/**
 * Documentation Registry Data
 *
 * Maps documentation topics to their online URLs at ng-forge.com.
 * Replaces the previously bundled docs.json with links to the live documentation site.
 */

const BASE_URL = 'https://ng-forge.com/dynamic-forms';

export interface DocPage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export const DOCUMENTATION: DocPage[] = [
  // Getting Started
  { id: 'installation', title: 'Installation', category: 'getting-started', url: `${BASE_URL}/installation` },

  // UI Library Integrations
  {
    id: 'ui-libs-material',
    title: 'Angular Material Integration',
    category: 'ui-integrations',
    url: `${BASE_URL}/ui-libs-integrations/material`,
  },
  { id: 'ui-libs-primeng', title: 'PrimeNG Integration', category: 'ui-integrations', url: `${BASE_URL}/ui-libs-integrations/primeng` },
  { id: 'ui-libs-ionic', title: 'Ionic Integration', category: 'ui-integrations', url: `${BASE_URL}/ui-libs-integrations/ionic` },
  {
    id: 'ui-libs-bootstrap',
    title: 'Bootstrap Integration',
    category: 'ui-integrations',
    url: `${BASE_URL}/ui-libs-integrations/bootstrap`,
  },

  // Field Types
  { id: 'field-types', title: 'Field Types', category: 'field-types', url: `${BASE_URL}/field-types` },

  // Validation
  { id: 'validation-basics', title: 'Validation Basics', category: 'validation', url: `${BASE_URL}/validation/basics` },
  { id: 'validation-advanced', title: 'Conditional Validators', category: 'validation', url: `${BASE_URL}/validation/advanced` },
  {
    id: 'validation-custom',
    title: 'Custom & Expression Validators',
    category: 'validation',
    url: `${BASE_URL}/validation/custom-validators`,
  },
  { id: 'validation-reference', title: 'Validation Reference', category: 'validation', url: `${BASE_URL}/validation/reference` },

  // Dynamic Behavior
  { id: 'conditional-logic', title: 'Conditional Logic', category: 'dynamic-behavior', url: `${BASE_URL}/dynamic-behavior/overview` },
  { id: 'value-derivation', title: 'Value Derivation', category: 'dynamic-behavior', url: `${BASE_URL}/dynamic-behavior/derivation` },
  {
    id: 'property-derivation',
    title: 'Property Derivation',
    category: 'dynamic-behavior',
    url: `${BASE_URL}/dynamic-behavior/derivation/property`,
  },
  { id: 'i18n', title: 'Internationalization', category: 'dynamic-behavior', url: `${BASE_URL}/dynamic-behavior/i18n` },
  { id: 'submission', title: 'Form Submission', category: 'dynamic-behavior', url: `${BASE_URL}/dynamic-behavior/submission` },

  // Schema Validation
  {
    id: 'schema-overview',
    title: 'Schema Validation Overview',
    category: 'schema-validation',
    url: `${BASE_URL}/schema-validation/overview`,
  },
  {
    id: 'schema-angular',
    title: 'Angular Native Schema',
    category: 'schema-validation',
    url: `${BASE_URL}/schema-validation/angular-schema`,
  },
  {
    id: 'schema-zod',
    title: 'Standard Schema (Zod, Valibot, ArkType)',
    category: 'schema-validation',
    url: `${BASE_URL}/schema-validation/zod`,
  },

  // Layout Components
  { id: 'form-pages', title: 'Page Containers', category: 'layout', url: `${BASE_URL}/prebuilt/form-pages` },
  { id: 'form-groups', title: 'Field Grouping', category: 'layout', url: `${BASE_URL}/prebuilt/form-groups` },
  { id: 'form-rows', title: 'Row Layout', category: 'layout', url: `${BASE_URL}/prebuilt/form-rows` },
  { id: 'form-arrays-simplified', title: 'Simplified Array API', category: 'layout', url: `${BASE_URL}/prebuilt/form-arrays/simplified` },
  { id: 'form-arrays-complete', title: 'Complete Array API', category: 'layout', url: `${BASE_URL}/prebuilt/form-arrays/complete` },
  { id: 'text-components', title: 'Text & Label Components', category: 'layout', url: `${BASE_URL}/prebuilt/text-components` },
  { id: 'hidden-fields', title: 'Hidden Fields', category: 'layout', url: `${BASE_URL}/prebuilt/hidden-fields` },

  // Advanced
  { id: 'type-safety', title: 'Type Safety', category: 'advanced', url: `${BASE_URL}/advanced/basics` },
  { id: 'events', title: 'Form & Field Events', category: 'advanced', url: `${BASE_URL}/advanced/events` },
  { id: 'expression-parser', title: 'Expression Syntax', category: 'advanced', url: `${BASE_URL}/advanced/expression-parser` },
  {
    id: 'custom-integrations',
    title: 'Custom UI Library Integrations',
    category: 'advanced',
    url: `${BASE_URL}/advanced/custom-integrations`,
  },
  { id: 'value-exclusion', title: 'Value Exclusion', category: 'advanced', url: `${BASE_URL}/advanced/value-exclusion` },

  // AI Integration
  { id: 'ai-integration', title: 'AI Integration (MCP)', category: 'ai', url: `${BASE_URL}/ai-integration` },

  // API Reference
  { id: 'api-reference', title: 'API Reference', category: 'api', url: `${BASE_URL}/api` },

  // Examples
  { id: 'examples', title: 'Examples Overview', category: 'examples', url: `${BASE_URL}/examples` },
  { id: 'example-login', title: 'Login Form', category: 'examples', url: `${BASE_URL}/examples/login-form` },
  { id: 'example-contact', title: 'Contact Form', category: 'examples', url: `${BASE_URL}/examples/contact-form` },
  { id: 'example-registration', title: 'User Registration', category: 'examples', url: `${BASE_URL}/examples/user-registration` },
  { id: 'example-paginated', title: 'Multi-Page Wizard', category: 'examples', url: `${BASE_URL}/examples/paginated-form` },
  { id: 'example-derivation', title: 'Value Derivation', category: 'examples', url: `${BASE_URL}/examples/value-derivation` },
  {
    id: 'example-dynamic-fields',
    title: 'Dynamic Contact Fields',
    category: 'examples',
    url: `${BASE_URL}/examples/contact-dynamic-fields`,
  },
  { id: 'example-business', title: 'Business Account Form', category: 'examples', url: `${BASE_URL}/examples/business-account-form` },
  {
    id: 'example-shipping',
    title: 'Shipping & Billing Address',
    category: 'examples',
    url: `${BASE_URL}/examples/shipping-billing-address`,
  },
  { id: 'example-conditional', title: 'Age Conditional Form', category: 'examples', url: `${BASE_URL}/examples/age-conditional-form` },
  { id: 'example-enterprise', title: 'Enterprise Features', category: 'examples', url: `${BASE_URL}/examples/enterprise-features` },
  {
    id: 'example-simplified-array',
    title: 'Simplified Array Form',
    category: 'examples',
    url: `${BASE_URL}/examples/simplified-array-form`,
  },
  { id: 'example-array', title: 'Complete Array Form', category: 'examples', url: `${BASE_URL}/examples/array-form` },
];
