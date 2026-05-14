/**
 * Addon Registry Data
 *
 * Canonical source of addon kind metadata for the MCP server. Addons render
 * inside a field's slot (typically `prefix` / `suffix`) — icons, buttons,
 * inline text, custom templates, custom components.
 *
 * Manually authored for MVP; auto-extraction from `AddonKindDefinition.schema`
 * fragments is a follow-up.
 */

import type { PropertyInfo } from './index.js';

export interface AddonKindInfo {
  /** Discriminant matching `addon.kind` in form configs. */
  kind: string;
  /** Source category — core ships from the library, adapter from a UI-integration package. */
  category: 'core' | 'adapter';
  /** Provider package; `'core'` means @ng-forge/dynamic-forms. */
  package: string;
  /** Adapter that ships this kind, or `null` for core kinds. */
  adapter: 'material' | 'primeng' | 'bootstrap' | 'ionic' | null;
  /** One-line description of what this kind renders. */
  description: string;
  /**
   * Whether the kind survives `JSON.stringify`/`parse`. JSON-safe kinds may
   * be referenced from server-driven configs; code-only kinds are dropped by
   * the lenient validator when the config came from JSON.
   */
  jsonSafe: boolean;
  /** Per-kind config props (excludes universal `slot`, `className`, `hidden`, `disabled`). */
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
    description: 'Reactive disabled state — primarily relevant for interactive kinds.',
    required: false,
  },
};

export const ADDON_KINDS: AddonKindInfo[] = [
  // ─── Core-shipped universal kinds ────────────────────────────────────────
  {
    kind: 'text',
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
    example: `{ slot: 'prefix', kind: 'text', text: '$' }`,
    minimalExample: `{ slot: 'prefix', kind: 'text', text: '$' }`,
  },
  {
    kind: 'template',
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
    example: `{ slot: 'suffix', kind: 'template', templateKey: 'searchIcon' }`,
    minimalExample: `{ slot: 'suffix', kind: 'template', templateKey: 'mySlot' }`,
  },
  {
    kind: 'component',
    category: 'core',
    package: '@ng-forge/dynamic-forms',
    adapter: null,
    description:
      'Renders an arbitrary Angular component. The `component` loader is a function; this kind is dropped from JSON-derived configs by the validator.',
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
  kind: 'component',
  component: () => import('./my-component').then(m => m.MyComponent),
  inputs: { foo: 'bar' },
}`,
    minimalExample: `{ slot: 'prefix', kind: 'component', component: () => import('./x') }`,
  },

  // ─── PrimeNG-shipped kinds ───────────────────────────────────────────────
  {
    kind: 'pi-icon',
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
    example: `{ slot: 'prefix', kind: 'pi-icon', icon: 'search', ariaLabel: 'Search' }`,
    minimalExample: `{ slot: 'prefix', kind: 'pi-icon', icon: 'search' }`,
  },
  {
    kind: 'pi-button',
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
        type: "'clear' | 'reset' | 'submit' | 'paste' | 'copy' | 'toggle-password-visibility' | string",
        description: 'Built-in preset action. Mutually exclusive with `actionRef` and `action`. Adapters may extend the preset union.',
        required: false,
      },
      actionRef: {
        name: 'actionRef',
        type: 'string',
        description:
          'Typed string handle to a handler registered via `provideAddonActions(...)`. Mutually exclusive with `preset` and `action`. JSON-safe.',
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
    example: `{
  slot: 'suffix',
  kind: 'pi-button',
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
  hidden: computed(() => formValue().search?.length === 0),
}`,
    minimalExample: `{ slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' }`,
  },
];

/**
 * Per-field-type addon support metadata. Records which slots and kinds a
 * field type accepts at runtime — feeds the validator's allowed-list checks.
 */
export interface FieldAddonSupportInfo {
  /** Field type discriminant (matches `FieldDef.type`). */
  fieldType: string;
  /** Adapter shipping the field — null for core fields. */
  adapter: 'material' | 'primeng' | 'bootstrap' | 'ionic' | null;
  /** Slots this field accepts. */
  slots: ('prefix' | 'suffix' | string)[];
  /** Whitelist of allowed kinds (omitted = any registered kind). */
  allowedKinds?: string[];
}

export const FIELD_ADDON_SUPPORT: FieldAddonSupportInfo[] = [
  {
    fieldType: 'prime-input',
    adapter: 'primeng',
    slots: ['prefix', 'suffix'],
  },
];
