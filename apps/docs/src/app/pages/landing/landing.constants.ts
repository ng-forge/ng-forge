// ============================================
// INTERFACES
// ============================================

export interface Integration {
  name: string;
  route: string;
  icon: string;
  title: string;
  package: string;
  importLine: string;
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

// ============================================
// SECTION IDS
// ============================================

export const SECTION_IDS = ['demo', 'capabilities', 'type-safe', 'adapters', 'generate', 'install'] as const;

// ============================================
// HERO ROLE CYCLE ("A {role} forms engine for Angular.")
// ============================================

export const HERO_ROLES = ['type-safe', 'signal-native', 'declarative', 'composable'] as const;

// ============================================
// INTEGRATIONS
// ============================================

export const INTEGRATIONS: Integration[] = [
  {
    name: 'Material',
    route: '/material',
    icon: 'assets/icons/material.svg',
    title: 'Angular Material integration documentation',
    package: '@ng-forge/dynamic-forms-material',
    importLine: "import { withMaterialFields } from '@ng-forge/dynamic-forms-material';",
  },
  {
    name: 'PrimeNG',
    route: '/primeng',
    icon: 'assets/icons/primeng.webp',
    title: 'PrimeNG integration documentation',
    package: '@ng-forge/dynamic-forms-primeng',
    importLine: "import { withPrimeNgFields } from '@ng-forge/dynamic-forms-primeng';",
  },
  {
    name: 'Ionic',
    route: '/ionic',
    icon: 'assets/icons/ionic.svg',
    title: 'Ionic Framework integration documentation',
    package: '@ng-forge/dynamic-forms-ionic',
    importLine: "import { withIonicFields } from '@ng-forge/dynamic-forms-ionic';",
  },
  {
    name: 'Bootstrap',
    route: '/bootstrap',
    icon: 'assets/icons/bootstrap.svg',
    title: 'Bootstrap integration documentation',
    package: '@ng-forge/dynamic-forms-bootstrap',
    importLine: "import { withBootstrapFields } from '@ng-forge/dynamic-forms-bootstrap';",
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
  { id: 'material', label: 'Material', package: '@ng-forge/dynamic-forms-material' },
  { id: 'primeng', label: 'PrimeNG', package: '@ng-forge/dynamic-forms-primeng' },
  { id: 'ionic', label: 'Ionic', package: '@ng-forge/dynamic-forms-ionic' },
  { id: 'bootstrap', label: 'Bootstrap', package: '@ng-forge/dynamic-forms-bootstrap' },
];

// ============================================
// CODE SNIPPETS
// ============================================

export const CODE_SNIPPETS = {
  // Compact (desktop): one field per line. The wide panel fits these lines.
  heroConfig: `import type { FormConfig } from '@ng-forge/dynamic-forms';

const config = {
  fields: [
    { key: 'name', type: 'input', label: 'Your Name', required: true },
    { key: 'email', type: 'input', label: 'Email', email: true },
    { key: 'message', type: 'textarea', label: 'Message' },
    { key: 'submit', type: 'submit', label: 'Send Message' },
  ],
} as const satisfies FormConfig;`,

  // Expanded (mobile): one property per line so nothing overflows a phone.
  heroConfigStacked: `import type { FormConfig }
  from '@ng-forge/dynamic-forms';

const config = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Your Name',
      required: true,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      email: true,
    },
    {
      key: 'message',
      type: 'textarea',
      label: 'Message',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
    },
  ],
} as const satisfies FormConfig;`,

  conditionalLogic: `{
  key: 'company',
  type: 'input',
  logic: [{
    type: 'required',
    condition: {
      type: 'fieldValue',
      fieldPath: 'accountType',
      operator: 'equals',
      value: 'business',
    },
  }],
}`,

  multiStepWizard: `{
  fields: [
    {
      type: 'page',
      key: 'info',
      fields: [...],
    },
    {
      type: 'page',
      key: 'review',
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

  jsonFetch: `export class SurveyComponent {
  private http = inject(HttpClient);

  // Fetch the config at runtime
  config = toSignal(
    this.http.get<FormConfig>(
      '/api/forms/survey',
    ),
  );
}`,

  arrayField: `{
  key: 'contacts',
  type: 'array',
  label: 'Contacts',
  fields: [
    {
      key: 'name',
      type: 'input',
      required: true,
    },
  ],
}`,

  httpDerivation: `{
  key: 'shippingCost',
  type: 'input',
  logic: [{
    type: 'derivation',
    source: 'http',
    http: { url: '/api/shipping' },
    responseExpression: 'response.cost',
    dependsOn: ['zip'],
  }],
}`,

  typeSafety: `const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      required: true,
      email: true,
    },
    {
      key: 'age',
      type: 'input',
      props: { type: 'number' },
    },
  ],
} as const satisfies FormConfig;

// Inferred, no hand-written types:
type Value = InferFormValue<typeof config.fields>;`,

  openapiCommand: `# Turn an OpenAPI document into
# typed, ready-to-render FormConfigs
npx @ng-forge/openapi-generator \\
  --spec ./openapi.yaml \\
  --output ./src/forms`,

  mcpConfig: `{
  "ng-forge": {
    "command": "npx",
    "args": [
      "-y",
      "@ng-forge/dynamic-form-mcp"
    ]
  }
}`,

  // Flagship "it's all just data": an async HTTP validator declared as plain,
  // serializable data. No callbacks, no functions — a backend can author and send it.
  serializableLogic: `{
  key: 'username',
  type: 'input',
  label: 'Username',
  validators: [{
    type: 'http',
    http: { url: '/api/check-username' },
    responseMapping: {
      validWhen: 'response.available',
      errorKind: 'taken',
    },
  }],
}`,
} as const;

// ============================================
// CAPABILITIES ("the hard parts, declarative")
// ============================================

export interface Capability {
  icon: string;
  title: string;
  description: string;
  snippetKey: keyof typeof CODE_SNIPPETS;
}

// Order pairs similarly-sized snippets per row (the two compact ones, then the
// two taller ones) so cards line up cleanly in the 2-column grid.
export const CAPABILITIES: Capability[] = [
  {
    icon: 'git-branch',
    title: 'Conditional fields',
    description: 'Show, hide, or require a field based on other field values, resolved as they change.',
    snippetKey: 'conditionalLogic',
  },
  {
    icon: 'api',
    title: 'Server-driven values',
    description: 'Derive a value from an HTTP call, debounced and cancelled for you.',
    snippetKey: 'httpDerivation',
  },
  {
    icon: 'workflow',
    title: 'Multi-step wizards',
    description: 'Pages with per-step validation, navigation, and progress. Built in.',
    snippetKey: 'multiStepWizard',
  },
  {
    icon: 'layers',
    title: 'Repeatable arrays',
    description: 'Add, remove, and reorder rows and nested groups straight from the config.',
    snippetKey: 'arrayField',
  },
];

// ============================================
// PRODUCTION QUALITIES (the unglamorous parts, handled)
// ============================================

export interface UseCase {
  icon: string;
  title: string;
  description: string;
}

export const USE_CASES: UseCase[] = [
  {
    icon: 'users',
    title: 'Accessible',
    description: 'ARIA state, focus, and labels are wired up on accessible adapter components, and tested against axe for WCAG AA.',
  },
  {
    icon: 'book',
    title: 'Internationalized',
    description:
      'Labels, placeholders, and errors take an Observable or Signal, so Transloco, ngx-translate, or any i18n source plugs straight in.',
  },
  {
    icon: 'plug',
    title: 'Extensible',
    description: 'Prefix and suffix addons, field wrappers, or a fully custom component when you outgrow the built-ins, all type-safe.',
  },
  {
    icon: 'zap',
    title: 'Fast',
    description:
      'Signal-native and zoneless-ready. Field components and the derivation engine load lazily, so a form pays only for what it renders.',
  },
];
