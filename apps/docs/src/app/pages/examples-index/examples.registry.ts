export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  path: string;
}

export const EXAMPLES_REGISTRY: ExampleItem[] = [
  {
    id: 'login-form',
    title: 'Login Form',
    description: 'Simple authentication form with email validation and password masking',
    tags: ['Basic', 'Validation'],
    path: '/examples/login-form',
  },
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'Basic contact form with name, email, and message fields',
    tags: ['Basic'],
    path: '/examples/contact-form',
  },
  {
    id: 'user-registration',
    title: 'User Registration',
    description: 'Multi-field registration form with validation',
    tags: ['Validation', 'Basic'],
    path: '/examples/user-registration',
  },
  {
    id: 'paginated-form',
    title: 'Multi-Step Form',
    description: 'Wizard-style form with multiple pages and navigation',
    tags: ['Layout', 'Pages'],
    path: '/examples/paginated-form',
  },
  {
    id: 'value-derivation',
    title: 'Value Derivation',
    description: 'Calculated fields with automatic value computation',
    tags: ['Dynamic', 'Derivation'],
    path: '/examples/value-derivation',
  },
  {
    id: 'contact-dynamic-fields',
    title: 'Dynamic Contact Fields',
    description: 'Contact form with fields that appear based on contact method',
    tags: ['Conditional', 'Dynamic'],
    path: '/examples/contact-dynamic-fields',
  },
  {
    id: 'business-account-form',
    title: 'Business Account Form',
    description: 'Account type selection with conditional business fields',
    tags: ['Conditional', 'Dynamic'],
    path: '/examples/business-account-form',
  },
  {
    id: 'shipping-billing-address',
    title: 'Shipping Same-as-Billing',
    description: 'Address form with checkbox to toggle shipping fields',
    tags: ['Conditional', 'Layout'],
    path: '/examples/shipping-billing-address',
  },
  {
    id: 'age-conditional-form',
    title: 'Age-Based Form',
    description: 'Numeric comparisons showing different fields based on age',
    tags: ['Conditional', 'Validation'],
    path: '/examples/age-conditional-form',
  },
  {
    id: 'enterprise-features',
    title: 'Enterprise Features Form',
    description: 'Complex AND/OR logic for feature gating by account type',
    tags: ['Conditional', 'Advanced'],
    path: '/examples/enterprise-features',
  },
];

export const ALL_TAGS = [...new Set(EXAMPLES_REGISTRY.flatMap((e) => e.tags))].sort();
