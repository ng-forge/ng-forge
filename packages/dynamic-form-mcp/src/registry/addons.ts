/** Addon Registry Data */

import type { UiIntegration } from '@ng-forge/dynamic-forms-zod/mcp';
import type { PropertyInfo } from './index.js';

export interface AddonTypeInfo {
  /** Discriminant matching `addon.type` in form configs. */
  type: string;
  /** Source category — core ships from the library, adapter from a UI-integration package. */
  category: 'core' | 'adapter';
  /** Provider package; `'core'` means @ng-forge/dynamic-forms. */
  package: string;
  /** Adapter that ships this type, or `null` for core types. */
  adapter: UiIntegration | null;
  /** One-line description of what this type renders. */
  description: string;
  /**
   * Whether the type survives `JSON.stringify`/`parse`. JSON-safe types may
   * be referenced from server-driven configs; code-only types are dropped by
   * the lenient validator when the config came from JSON.
   */
  jsonSafe: boolean;
  /** Per-type config props (excludes universal `slot`, `className`, `hidden`, `disabled`). */
  props: Record<string, PropertyInfo>;
  /** Full inline example for documentation. */
  example: string;
  /** Minimal valid config (just required props). */
  minimalExample: string;
}

const UNIVERSAL_BASE_PROPS: Record<string, PropertyInfo> = {
  slot: {
    name: 'slot',
    type: "'prefix' | 'suffix' | string",
    description: 'Slot to render this addon in. `prefix` and `suffix` are universal; adapters may add more.',
    required: true,
  },
  className: {
    name: 'className',
    type: 'string',
    description: 'CSS class applied to the addon host element.',
    required: false,
  },
  hidden: {
    name: 'hidden',
    type: 'boolean | Signal<boolean> | Observable<boolean>',
    description: 'Reactive visibility — `true` removes the addon from layout. JSON-safe when boolean.',
    required: false,
  },
  disabled: {
    name: 'disabled',
    type: 'boolean | Signal<boolean> | Observable<boolean>',
    description: 'Reactive disabled state — primarily relevant for interactive types.',
    required: false,
  },
};

export const ADDON_TYPES: AddonTypeInfo[] = [
  // ─── Core-shipped universal types ────────────────────────────────────────
  {
    type: 'text',
    category: 'core',
    package: '@ng-forge/dynamic-forms',
    adapter: null,
    description: 'Renders inline text content (currency symbol, unit label, character counter, etc.).',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      text: {
        name: 'text',
        type: 'DynamicText',
        description: 'Text content. Supports plain strings, observables, signals, and i18n keys.',
        required: true,
      },
    },
    example: `{ slot: 'prefix', type: 'text', text: '$' }`,
    minimalExample: `{ slot: 'prefix', type: 'text', text: '$' }`,
  },
  {
    type: 'template',
    category: 'core',
    package: '@ng-forge/dynamic-forms',
    adapter: null,
    description:
      'Renders a named `<ng-template>` projected into <df-dynamic-form>. JSON-safe — backend ships the key, FE supplies the template.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      templateKey: {
        name: 'templateKey',
        type: 'string',
        description: 'Name of an `<ng-template dfTemplate="...">` projected into the host form.',
        required: true,
      },
    },
    example: `{ slot: 'suffix', type: 'template', templateKey: 'searchIcon' }`,
    minimalExample: `{ slot: 'suffix', type: 'template', templateKey: 'mySlot' }`,
  },
  {
    type: 'component',
    category: 'core',
    package: '@ng-forge/dynamic-forms',
    adapter: null,
    description:
      'Renders an arbitrary Angular component. The `component` loader is a function; this type is dropped from JSON-derived configs by the validator.',
    jsonSafe: false,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      component: {
        name: 'component',
        type: '() => Promise<Type<unknown> | { default: Type<unknown> }>',
        description: 'Lazy loader for the Angular component to render.',
        required: true,
      },
      inputs: {
        name: 'inputs',
        type: 'Record<string, unknown>',
        description: 'Inputs forwarded to the rendered component.',
        required: false,
      },
    },
    example: `{
  slot: 'prefix',
  type: 'component',
  component: () => import('./my-component').then(m => m.MyComponent),
  inputs: { foo: 'bar' },
}`,
    minimalExample: `{ slot: 'prefix', type: 'component', component: () => import('./x') }`,
  },

  // ─── PrimeNG-shipped types ───────────────────────────────────────────────
  {
    type: 'prime-icon',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-primeng',
    adapter: 'primeng',
    description: 'Renders `<i class="pi pi-{icon}">` — bare PrimeIcons name.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: {
        name: 'icon',
        type: 'string',
        description: 'PrimeIcons name without the `pi-` prefix (e.g., "search", "times").',
        required: true,
      },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'Accessible label for icons that convey meaning. Decorative icons omit this.',
        required: false,
      },
    },
    example: `{ slot: 'prefix', type: 'prime-icon', icon: 'search', ariaLabel: 'Search' }`,
    minimalExample: `{ slot: 'prefix', type: 'prime-icon', icon: 'search' }`,
  },
  {
    type: 'prime-button',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-primeng',
    adapter: 'primeng',
    description:
      'Renders `<p-button>` with optional icon, label, severity, reactive loading, and exactly one click handler (preset, actionRef, or action).',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: { name: 'icon', type: 'string', description: 'PrimeIcons name without the `pi-` prefix.', required: false },
      label: { name: 'label', type: 'DynamicText', description: 'Visible button label.', required: false },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'Required when icon-only (no `label`). Used as `aria-label`.',
        required: false,
      },
      severity: {
        name: 'severity',
        type: "'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast'",
        description: 'PrimeNG button colour variant.',
        required: false,
      },
      loading: {
        name: 'loading',
        type: 'boolean | Signal<boolean> | Observable<boolean>',
        description: 'Reactive loading state — renders the native PrimeNG spinner.',
        required: false,
      },
      preset: {
        name: 'preset',
        type: "'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility' | string",
        description: 'Built-in preset action. Mutually exclusive with `actionRef` and `action`. Adapters may extend the preset union.',
        required: false,
      },
      actionRef: {
        name: 'actionRef',
        type: 'string',
        description:
          'Typed string handle to a handler registered via `withAddonActions(...)`. Mutually exclusive with `preset` and `action`. JSON-safe.',
        required: false,
      },
      action: {
        name: 'action',
        type: '(ctx: AddonActionContext) => void',
        description:
          'Inline click handler (code-only — dropped from JSON-derived configs). Mutually exclusive with `preset` and `actionRef`.',
        required: false,
      },
    },
    example: `{ slot: 'suffix', type: 'prime-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }`,
    minimalExample: `{ slot: 'suffix', type: 'prime-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }`,
  },

  // ─── Material-shipped types ──────────────────────────────────────────────
  {
    type: 'mat-icon',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-material',
    adapter: 'material',
    description: 'Renders `<mat-icon>{icon}</mat-icon>` — Material Icons ligature name.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: {
        name: 'icon',
        type: 'string',
        description: 'Material Icons ligature (e.g., "search", "close", "visibility").',
        required: true,
      },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'Accessible label for icons that convey meaning. Decorative icons omit this.',
        required: false,
      },
    },
    example: `{ slot: 'prefix', type: 'mat-icon', icon: 'search', ariaLabel: 'Search' }`,
    minimalExample: `{ slot: 'prefix', type: 'mat-icon', icon: 'search' }`,
  },
  {
    type: 'mat-button',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-material',
    adapter: 'material',
    description:
      'Renders `<button mat-icon-button>` (icon-only) or `<button mat-button>` (labeled) with optional color, reactive loading, and exactly one click handler (preset, actionRef, or action).',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: { name: 'icon', type: 'string', description: 'Material Icons ligature.', required: false },
      label: { name: 'label', type: 'DynamicText', description: 'Visible button label.', required: false },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'REQUIRED when icon-only (no `label`). Used as `aria-label`.',
        required: false,
      },
      color: {
        name: 'color',
        type: "'primary' | 'accent' | 'warn'",
        description: 'Material button color variant.',
        required: false,
      },
      loading: {
        name: 'loading',
        type: 'boolean | Signal<boolean> | Observable<boolean>',
        description: 'Reactive loading state — disables the button when truthy.',
        required: false,
      },
      preset: {
        name: 'preset',
        type: "'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility' | string",
        description: 'Built-in preset action. Mutually exclusive with `actionRef` and `action`.',
        required: false,
      },
      actionRef: {
        name: 'actionRef',
        type: 'string',
        description: 'Typed handle to a handler registered via `withAddonActions(...)`. JSON-safe.',
        required: false,
      },
      action: {
        name: 'action',
        type: '(ctx: AddonActionContext) => void',
        description: 'Inline click handler (code-only — dropped from JSON-derived configs).',
        required: false,
      },
    },
    example: `{ slot: 'suffix', type: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' }`,
    minimalExample: `{ slot: 'suffix', type: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' }`,
  },

  // ─── Bootstrap-shipped types ─────────────────────────────────────────────
  {
    type: 'bs-icon',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-bootstrap',
    adapter: 'bootstrap',
    description: 'Renders `<i class="bi bi-{icon}">` — Bootstrap Icons name without the `bi-` prefix.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: {
        name: 'icon',
        type: 'string',
        description: 'Bootstrap Icons name without the `bi-` prefix (e.g., "search", "x", "eye").',
        required: true,
      },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'Accessible label for icons that convey meaning. Decorative icons omit this.',
        required: false,
      },
    },
    example: `{ slot: 'prefix', type: 'bs-icon', icon: 'search', ariaLabel: 'Search' }`,
    minimalExample: `{ slot: 'prefix', type: 'bs-icon', icon: 'search' }`,
  },
  {
    type: 'bs-button',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-bootstrap',
    adapter: 'bootstrap',
    description:
      'Renders `<button class="btn btn-outline-{severity}">` with optional icon, label, severity, and reactive loading (swaps to a spinner).',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: { name: 'icon', type: 'string', description: 'Bootstrap Icons name without the `bi-` prefix.', required: false },
      label: { name: 'label', type: 'DynamicText', description: 'Visible button label.', required: false },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'REQUIRED when icon-only (no `label`). Used as `aria-label`.',
        required: false,
      },
      severity: {
        name: 'severity',
        type: "'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'",
        description: 'Bootstrap button variant (mapped to `btn-outline-{severity}`).',
        required: false,
      },
      loading: {
        name: 'loading',
        type: 'boolean | Signal<boolean> | Observable<boolean>',
        description: 'Reactive loading state — swaps the button content for a spinner.',
        required: false,
      },
      preset: {
        name: 'preset',
        type: "'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility' | string",
        description: 'Built-in preset action. Mutually exclusive with `actionRef` and `action`.',
        required: false,
      },
      actionRef: {
        name: 'actionRef',
        type: 'string',
        description: 'Typed handle to a handler registered via `withAddonActions(...)`. JSON-safe.',
        required: false,
      },
      action: {
        name: 'action',
        type: '(ctx: AddonActionContext) => void',
        description: 'Inline click handler (code-only — dropped from JSON-derived configs).',
        required: false,
      },
    },
    example: `{ slot: 'suffix', type: 'bs-button', icon: 'x', ariaLabel: 'Clear', preset: 'clear' }`,
    minimalExample: `{ slot: 'suffix', type: 'bs-button', icon: 'x', ariaLabel: 'Clear', preset: 'clear' }`,
  },

  // ─── Ionic-shipped types ─────────────────────────────────────────────────
  {
    type: 'ion-icon',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-ionic',
    adapter: 'ionic',
    description: 'Renders `<ion-icon name="{icon}">` — Ionicons name.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: {
        name: 'icon',
        type: 'string',
        description: 'Ionicons name (e.g., "search-outline", "close-outline", "eye-outline").',
        required: true,
      },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'Accessible label for icons that convey meaning. Decorative icons omit this.',
        required: false,
      },
    },
    example: `{ slot: 'prefix', type: 'ion-icon', icon: 'search-outline', ariaLabel: 'Search' }`,
    minimalExample: `{ slot: 'prefix', type: 'ion-icon', icon: 'search-outline' }`,
  },
  {
    type: 'ion-button',
    category: 'adapter',
    package: '@ng-forge/dynamic-forms-ionic',
    adapter: 'ionic',
    description:
      'Renders `<ion-button>` with optional icon, label, color, fill, and reactive loading (renders an `<ion-spinner>`). `ion-button` addons render INSIDE `<ion-input>` as native `<ion-button slot="start|end">` via an attribute-selector component so Ionic\'s `::slotted(ion-button[slot=start|end])` shadow CSS sizes them natively.',
    jsonSafe: true,
    props: {
      ...UNIVERSAL_BASE_PROPS,
      icon: { name: 'icon', type: 'string', description: 'Ionicons name.', required: false },
      label: { name: 'label', type: 'DynamicText', description: 'Visible button label.', required: false },
      ariaLabel: {
        name: 'ariaLabel',
        type: 'DynamicText',
        description: 'REQUIRED when icon-only (no `label`). Used as `aria-label`.',
        required: false,
      },
      color: {
        name: 'color',
        type: "'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark'",
        description: 'Ionic button color.',
        required: false,
      },
      fill: {
        name: 'fill',
        type: "'clear' | 'outline' | 'solid' | 'default'",
        description: 'Ionic button fill style.',
        required: false,
      },
      loading: {
        name: 'loading',
        type: 'boolean | Signal<boolean> | Observable<boolean>',
        description: 'Reactive loading state — renders an `<ion-spinner>`.',
        required: false,
      },
      preset: {
        name: 'preset',
        type: "'clear' | 'reset' | 'paste' | 'copy' | 'toggle-password-visibility' | string",
        description: 'Built-in preset action. Mutually exclusive with `actionRef` and `action`.',
        required: false,
      },
      actionRef: {
        name: 'actionRef',
        type: 'string',
        description: 'Typed handle to a handler registered via `withAddonActions(...)`. JSON-safe.',
        required: false,
      },
      action: {
        name: 'action',
        type: '(ctx: AddonActionContext) => void',
        description: 'Inline click handler (code-only — dropped from JSON-derived configs).',
        required: false,
      },
    },
    example: `{ slot: 'suffix', type: 'ion-button', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' }`,
    minimalExample: `{ slot: 'suffix', type: 'ion-button', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' }`,
  },
];

/**
 * Per-field-type addon support metadata. Records which slots and types a
 * field type accepts at runtime — feeds the validator's allowed-list checks.
 */
export interface FieldAddonSupportInfo {
  /** Field type discriminant (matches `FieldDef.type`). */
  fieldType: string;
  /** Adapter shipping the field — null for core fields. */
  adapter: UiIntegration | null;
  /** Slots this field accepts. */
  slots: ('prefix' | 'suffix' | string)[];
  /** Whitelist of allowed types (omitted = any registered type). */
  allowedTypes?: string[];
}

// Every adapter registers its input under the bare discriminant `'input'`
// (see `MatField.Input` / `BsField.Input` / `PrimeField.Input` /
// `IonicField.Input` — all resolve to `'input'`). Disambiguation is by
// `adapter`. AI consumers shipping configs with `type: 'input'` for the
// active adapter pass the runtime validator; this registry tells them
// which adapter supports addons on that field type.
export const FIELD_ADDON_SUPPORT: FieldAddonSupportInfo[] = [
  {
    fieldType: 'input',
    adapter: 'primeng',
    slots: ['prefix', 'suffix'],
  },
  {
    fieldType: 'input',
    adapter: 'material',
    slots: ['prefix', 'suffix'],
  },
  {
    fieldType: 'input',
    adapter: 'bootstrap',
    slots: ['prefix', 'suffix'],
  },
  {
    fieldType: 'input',
    adapter: 'ionic',
    slots: ['prefix', 'suffix'],
  },
];
