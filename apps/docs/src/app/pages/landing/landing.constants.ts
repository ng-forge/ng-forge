// ============================================
// INTERFACES
// ============================================

export interface Feature {
  icon: string;
  title: string;
  description: string;
  highlightCode?: string; // Optional inline code to highlight
}

export interface FieldType {
  code: string;
  label: string;
  snippet: string;
}

export interface Integration {
  name: string;
  route: string;
  icon: string;
  title: string;
}

export interface PackageManager {
  id: string;
  label: string;
  command: string;
}

export interface UiLibrary {
  id: string;
  label: string;
  package: string;
}

export interface FireflyPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
}

export interface Spark {
  x: number;
  y: number;
  opacity: number;
}

// ============================================
// FIREFLY CONFIGURATION
// ============================================

export const FIREFLY_CONFIG = {
  count: 12,
  gridCols: 4,
  mouseRadius: 150,
  returnForce: 0.003,
  friction: 0.99,
  scatterForce: 0.6,
  repulsionRadius: 100,
  repulsionForce: 0.08,
  randomDrift: 0.05,
  sparkDistance: 80,
  sparkProbability: 0.02,
  sparkFadeRate: 0.05,
  maxSparks: 20,
} as const;

// ============================================
// SCROLL SNAP CONFIGURATION
// ============================================

export const SCROLL_SNAP_CONFIG = {
  debounceMs: 80,
  snapDuration: 500,
  navOffset: 80,
  heroThreshold: 150,
  viewportThresholdRatio: 0.6,
  tallSectionRatio: 0.9,
  navScrollThreshold: 50,
} as const;

// ============================================
// INTERSECTION OBSERVER CONFIGURATION
// ============================================

export const INTERSECTION_CONFIG = {
  threshold: 0.1,
  initDelayMs: 100,
} as const;

// ============================================
// SECTION IDS
// ============================================

export const SECTION_IDS = ['features', 'showcase', 'validation', 'field-types', 'json-config', 'integrations'] as const;

// ============================================
// FEATURES
// ============================================

export const FEATURES: Feature[] = [
  {
    icon: 'signal',
    title: 'Signal Forms Native',
    description: "Built directly on Angular Signal Forms. Not a wrapper — real integration with Angular's reactive future.",
  },
  {
    icon: 'target',
    title: 'Actually Type-Safe',
    description: ' — your IDE knows everything. No more guessing.',
    highlightCode: 'as const satisfies',
  },
  {
    icon: 'layers',
    title: 'Any UI Library',
    description: 'One import swap. Same logic everywhere.',
  },
  {
    icon: 'package',
    title: 'Ship Less',
    description: 'Lazy-loaded field components. Load only what you render.',
  },
  {
    icon: 'zap',
    title: 'Zoneless Ready',
    description: 'No Zone.js required. OnPush everywhere. Built for where Angular is going.',
  },
  {
    icon: 'plug',
    title: 'Escape Hatches',
    description: 'Need custom controls? Same patterns as built-ins. Full power when you need it.',
  },
];

// ============================================
// FIELD TYPES
// ============================================

export const FIELD_TYPES: FieldType[] = [
  {
    code: 'input',
    label: 'Text, email, password, number',
    snippet: `{
  key: 'email',
  type: 'input',
  label: 'Email',
  props: { type: 'email' }
}`,
  },
  {
    code: 'textarea',
    label: 'Multi-line text',
    snippet: `{
  key: 'bio',
  type: 'textarea',
  label: 'Bio',
  props: { rows: 4 }
}`,
  },
  {
    code: 'select',
    label: 'Dropdown selection',
    snippet: `{
  key: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
  ]
}`,
  },
  {
    code: 'radio',
    label: 'Single choice',
    snippet: `{
  key: 'plan',
  type: 'radio',
  label: 'Plan',
  options: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
  ]
}`,
  },
  {
    code: 'checkbox',
    label: 'Boolean toggle',
    snippet: `{
  key: 'agree',
  type: 'checkbox',
  label: 'I agree to the terms'
}`,
  },
  {
    code: 'multi-checkbox',
    label: 'Multiple selections',
    snippet: `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  options: [
    { label: 'Sports', value: 'sports' },
    { label: 'Music', value: 'music' },
  ]
}`,
  },
  {
    code: 'toggle',
    label: 'Switch control',
    snippet: `{
  key: 'notifications',
  type: 'toggle',
  label: 'Enable notifications'
}`,
  },
  {
    code: 'slider',
    label: 'Range input',
    snippet: `{
  key: 'volume',
  type: 'slider',
  label: 'Volume',
  props: { min: 0, max: 100 }
}`,
  },
  {
    code: 'datepicker',
    label: 'Date selection',
    snippet: `{
  key: 'birthday',
  type: 'datepicker',
  label: 'Birthday'
}`,
  },
  {
    code: 'submit',
    label: 'Form submission',
    snippet: `{
  key: 'submit',
  type: 'submit',
  label: 'Save'
}`,
  },
  {
    code: 'row',
    label: 'Horizontal layout',
    snippet: `{
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', label: 'First' },
    { key: 'lastName', type: 'input', label: 'Last' },
  ]
}`,
  },
  {
    code: 'group',
    label: 'Nested objects',
    snippet: `{
  key: 'address',
  type: 'group',
  fields: [...]
}`,
  },
  {
    code: 'page',
    label: 'Multi-step wizards',
    snippet: `{
  type: 'page',
  key: 'step1',
  label: 'Info',
  fields: [...]
}`,
  },
  {
    code: 'array',
    label: 'Repeatable fields',
    snippet: `{
  key: 'items',
  type: 'array',
  fields: [...]
}`,
  },
  {
    code: 'text',
    label: 'Static content',
    snippet: `{
  type: 'text',
  label: 'Section Title',
  props: { elementType: 'h3' }
}`,
  },
];

// ============================================
// INTEGRATIONS
// ============================================

export const INTEGRATIONS: Integration[] = [
  {
    name: 'Material',
    route: '/ui-libs-integrations/material',
    icon: 'assets/icons/material.svg',
    title: 'Angular Material integration documentation',
  },
  {
    name: 'PrimeNG',
    route: '/ui-libs-integrations/primeng',
    icon: 'assets/icons/primeng.webp',
    title: 'PrimeNG integration documentation',
  },
  {
    name: 'Ionic',
    route: '/ui-libs-integrations/ionic',
    icon: 'assets/icons/ionic.svg',
    title: 'Ionic Framework integration documentation',
  },
  {
    name: 'Bootstrap',
    route: '/ui-libs-integrations/bootstrap',
    icon: 'assets/icons/bootstrap.svg',
    title: 'Bootstrap integration documentation',
  },
];

// ============================================
// PACKAGE MANAGERS
// ============================================

export const PACKAGE_MANAGERS: PackageManager[] = [
  { id: 'npm', label: 'npm', command: 'npm install' },
  { id: 'pnpm', label: 'pnpm', command: 'pnpm add' },
  { id: 'yarn', label: 'yarn', command: 'yarn add' },
];

// ============================================
// UI LIBRARIES
// ============================================

export const UI_LIBRARIES: UiLibrary[] = [
  { id: 'material', label: 'Material', package: '@ng-forge/material' },
  { id: 'primeng', label: 'PrimeNG', package: '@ng-forge/primeng' },
  { id: 'ionic', label: 'Ionic', package: '@ng-forge/ionic' },
  { id: 'bootstrap', label: 'Bootstrap', package: '@ng-forge/bootstrap' },
];

// ============================================
// CODE SNIPPETS
// ============================================

export const CODE_SNIPPETS = {
  heroConfig: `import { DynamicForm, type FormConfig, type InferFormValue } from '@ng-forge/dynamic-forms';

@Component({
  imports: [DynamicForm],
  template: \`<form [dynamic-form]="config" (submit)="onSubmit($event)"></form>\`
})
export class ContactComponent {
  config = {
    fields: [
      { key: 'title', type: 'text', label: 'Get in Touch', props: { elementType: 'h2' } },
      { key: 'name', type: 'input', label: 'Your Name', required: true },
      { key: 'email', type: 'input', label: 'Email',
        required: true, email: true, props: { type: 'email' } },
      { key: 'message', type: 'textarea', label: 'Message',
        required: true, minLength: 10, props: { rows: 3 } },
      { key: 'submit', type: 'submit', label: 'Send Message' },
    ]
  } as const satisfies FormConfig;

  onSubmit(value: InferFormValue<typeof this.config.fields>) {
    // value is fully typed: { name: string, email: string, message: string }
    console.log(value);
  }
}`,

  conditionalLogic: `{
  key: 'company',
  type: 'input',
  label: 'Company Name',
  logic: [
    {
      type: 'required',
      when: {
        field: 'accountType',
        equals: 'business',
      },
    },
  ],
}`,

  multiStepWizard: `{
  fields: [
    {
      type: 'page',
      key: 'info',
      label: 'Your Info',
      fields: [...],
    },
    {
      type: 'page',
      key: 'payment',
      label: 'Payment',
      fields: [...],
    },
  ],
}`,

  validation: `{ key: 'email', type: 'input', required: true, email: true },
{ key: 'age', type: 'input', min: 18, max: 120 },
{ key: 'username', type: 'input', minLength: 3, maxLength: 20 },
{ key: 'website', type: 'input', pattern: /^https?:\\/\\/.+/ }`,

  validationShowcase: `{
  key: 'email',
  type: 'input',
  label: 'Email',
  required: true,
  email: true,
},
{
  key: 'password',
  type: 'input',
  label: 'Password',
  required: true,
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$/,
  validationMessages: {
    pattern: 'Need uppercase, lowercase & number',
  },
},
{
  key: 'age',
  type: 'input',
  label: 'Age',
  min: 18,
  max: 120,
},
{
  key: 'username',
  type: 'input',
  label: 'Username',
  minLength: 3,
  maxLength: 15,
  pattern: /^[a-z0-9_]+$/,
}`,

  jsonConfig: `{
  "fields": [
    {
      "key": "name",
      "type": "input",
      "label": "Full Name",
      "required": true
    },
    {
      "key": "feedback",
      "type": "textarea",
      "label": "Your Feedback"
    },
    {
      "key": "rating",
      "type": "select",
      "label": "Rating",
      "options": ["Excellent", "Good", "Average", "Poor"]
    }
  ]
}`,

  jsonFetch: `@Component({
  template: \`<form [dynamic-form]="config()" />\`
})
export class SurveyComponent {
  private http = inject(HttpClient);

  config = toSignal(
    this.http.get<FormConfig>('/api/forms/survey')
  );
}`,
} as const;
