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
    importLine: "import { withPrimeNGFields } from '@ng-forge/dynamic-forms-primeng';",
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
      required: true,
      props: { type: 'number' },
    },
  ],
} as const satisfies FormConfig;

// Inferred, no hand-written types:
type Value = InferFormValue<typeof config.fields>;`,

  openapiCommand: `# Turn an OpenAPI document into
# typed, ready-to-render FormConfigs
npx ng-forge-generator \\
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
    description: "A field can hide itself or turn required based on another field's value, re-checked as the form changes.",
    snippetKey: 'conditionalLogic',
  },
  {
    icon: 'api',
    title: 'Server-driven values',
    description: "Pull a field's value from an HTTP endpoint; the requests debounce and cancel as inputs change.",
    snippetKey: 'httpDerivation',
  },
  {
    icon: 'workflow',
    title: 'Multi-step wizards',
    description: 'Split a long form into pages that validate one step at a time, with next and previous navigation.',
    snippetKey: 'multiStepWizard',
  },
  {
    icon: 'layers',
    title: 'Repeatable arrays',
    description: 'Repeatable rows, nested groups included, that users can add and remove from the config.',
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
    description: 'Built on adapter components that are accessible already, with ARIA and focus handled on top.',
  },
  {
    icon: 'book',
    title: 'Internationalized',
    description:
      'Any text in a form can be an Observable or a Signal, so Transloco, ngx-translate, or your own translation source works unchanged.',
  },
  {
    icon: 'plug',
    title: 'Extensible',
    description:
      'Reach for a prefix or suffix addon, wrap a field in your own markup, or drop to a fully custom component when the built-ins run out.',
  },
  {
    icon: 'zap',
    title: 'Fast',
    description:
      'Signal-native and zoneless-ready. Field components and the derivation engine load on demand, so a form only ships what it renders.',
  },
];
