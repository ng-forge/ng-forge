/** Sidebar navigation structure — defines ordering, labels, and grouping. */

export interface NavItem {
  label: string;
  path: string;
  /** If present, this item is a category with children. */
  children?: NavItem[];
  /** CSS class for special decoration (e.g. 'sidebar-link--ai'). */
  cssClass?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Getting Started', path: 'getting-started' },
  { label: 'Configuration', path: 'configuration' },
  {
    label: 'Schema Fields',
    path: 'schema-fields',
    children: [
      {
        label: 'Field Types',
        path: 'schema-fields/field-types',
        children: [
          { label: 'Text Inputs', path: 'schema-fields/field-types/text-inputs' },
          { label: 'Selection', path: 'schema-fields/field-types/selection' },
          { label: 'Buttons', path: 'schema-fields/field-types/buttons' },
          { label: 'Utility', path: 'schema-fields/field-types/utility' },
          { label: 'Advanced Controls', path: 'schema-fields/field-types/advanced-controls' },
        ],
      },
    ],
  },
  {
    label: 'Validation',
    path: 'validation',
    children: [
      { label: 'Basics', path: 'validation/basics' },
      { label: 'Advanced', path: 'validation/advanced' },
      { label: 'Custom Validators', path: 'validation/custom-validators' },
      { label: 'Reference', path: 'validation/reference' },
    ],
  },
  {
    label: 'Schema Validation',
    path: 'schema-validation',
    children: [
      { label: 'Overview', path: 'schema-validation/overview' },
      { label: 'Angular Schema', path: 'schema-validation/angular-schema' },
      { label: 'Zod', path: 'schema-validation/zod' },
    ],
  },
  {
    label: 'Dynamic Behavior',
    path: 'dynamic-behavior',
    children: [
      { label: 'Conditional Logic', path: 'dynamic-behavior/conditional-logic' },
      { label: 'Value Derivation', path: 'dynamic-behavior/value-derivation' },
      { label: 'i18n', path: 'dynamic-behavior/i18n' },
      { label: 'Submission', path: 'dynamic-behavior/submission' },
    ],
  },
  {
    label: 'Prebuilt',
    path: 'prebuilt',
    children: [
      { label: 'Form Groups', path: 'prebuilt/form-groups' },
      { label: 'Form Pages', path: 'prebuilt/form-pages' },
      { label: 'Form Rows', path: 'prebuilt/form-rows' },
      {
        label: 'Form Arrays',
        path: 'prebuilt/form-arrays',
        children: [
          { label: 'Simplified', path: 'prebuilt/form-arrays/simplified' },
          { label: 'Complete', path: 'prebuilt/form-arrays/complete' },
        ],
      },
      { label: 'Hidden Fields', path: 'prebuilt/hidden-fields' },
      { label: 'Text Components', path: 'prebuilt/text-components' },
    ],
  },
  {
    label: 'Examples',
    path: 'examples',
  },
  {
    label: 'Advanced',
    path: 'advanced',
    children: [
      { label: 'Custom Fields', path: 'advanced/custom-fields' },
      { label: 'Expression Parser', path: 'advanced/expression-parser' },
      { label: 'Type Safety', path: 'advanced/type-safety' },
      { label: 'Events', path: 'advanced/events' },
      { label: 'Value Exclusion', path: 'advanced/value-exclusion' },
    ],
  },
  {
    label: 'Building an Adapter',
    path: 'building-an-adapter',
    /** Only visible when adapter === 'custom' */
    cssClass: 'sidebar-link--custom-only',
  },
  {
    label: 'AI Integration',
    path: 'ai-integration',
    cssClass: 'sidebar-link--ai',
  },
];
