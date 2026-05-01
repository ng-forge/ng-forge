import type {
  AddonActionContext,
  AddonActionPreset,
  BaseAddon,
  DynamicText,
  DynamicValue,
  RegisteredActionRef,
} from '@ng-forge/dynamic-forms';

/**
 * Decorative icon addon for PrimeNG fields.
 *
 * Renders `<i class="pi pi-{icon}">`. The `icon` string is the bare PrimeIcons
 * suffix — e.g., `'search'` produces `<i class="pi pi-search">`.
 *
 * Add `ariaLabel` for icons that convey meaning (search, error, success);
 * leave it omitted for purely decorative icons (will be `aria-hidden="true"`).
 */
export interface PiIconAddon extends BaseAddon {
  readonly kind: 'pi-icon';
  /** PrimeIcons name without the `pi-` prefix (e.g., `'search'`, `'times'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/**
 * Common shape of every `pi-button` addon — properties that don't
 * participate in the content XOR axis.
 */
interface PiButtonBase extends BaseAddon {
  readonly kind: 'pi-button';
  /** PrimeNG button severity / colour variant — mirrors PrimeNG's `ButtonSeverity`. */
  readonly severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  /** Reactive loading state — renders the button's native `[loading]` spinner. */
  readonly loading?: DynamicValue<boolean>;

  // Click handler — at most one of `preset` / `actionRef` / `action`.
  // Type-level XOR on this axis confuses narrowing in the runtime
  // branching code (the branches naturally read `addon.actionRef !==
  // undefined` etc.); the runtime validator drops the addon with a clear
  // warning when more than one is configured. Worth tightening at the
  // type level later via destructuring helpers, but not at the cost of
  // ugly internal casts today.
  /** Built-in preset action (e.g., `'clear'`, `'toggle-password-visibility'`). JSON-safe. */
  readonly preset?: AddonActionPreset;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef?: RegisteredActionRef;
  /** Inline handler — code-only; dropped from JSON-derived configs. */
  readonly action?: (ctx: AddonActionContext) => void;
}

/**
 * Content axis — XOR enforced at type level so an icon-only button is
 * forced to declare `ariaLabel`. The three shapes:
 *
 * - `IconOnly`   — just `icon`; `ariaLabel` is REQUIRED
 * - `Labeled`    — `label` set; `icon` and `ariaLabel` optional
 * - `Decorative` — neither icon nor label (e.g., custom-rendered child)
 *
 * Combining keys is rejected by TypeScript — `icon: 'x'` without either
 * `label` or `ariaLabel` doesn't satisfy any branch.
 */
type PiButtonContentIconOnly = {
  readonly icon: string;
  readonly label?: never;
  /** REQUIRED: icon-only buttons must carry an accessible label. */
  readonly ariaLabel: DynamicText;
};
type PiButtonContentLabeled = {
  readonly icon?: string;
  readonly label: DynamicText;
  readonly ariaLabel?: DynamicText;
};
type PiButtonContentDecorative = {
  readonly icon?: never;
  readonly label?: never;
  readonly ariaLabel?: DynamicText;
};
type PiButtonContent = PiButtonContentIconOnly | PiButtonContentLabeled | PiButtonContentDecorative;

/**
 * Interactive button addon for PrimeNG fields.
 *
 * Renders `<p-button>` with optional icon, label, severity, and reactive
 * loading state.
 *
 * Type-level guarantees:
 *
 * - **Content axis (XOR):** `IconOnly` (icon + required ariaLabel) |
 *   `Labeled` (label, icon optional) | `Decorative` (neither). The IDE
 *   rejects icon-only configs that omit `ariaLabel`.
 * - **Click axis (runtime XOR):** at most one of `preset` / `actionRef`
 *   / `action`. The runtime validator drops the addon with a clear
 *   warning when more than one is configured.
 */
export type PiButtonAddon = PiButtonBase & PiButtonContent;

/** Union of all PrimeNG-shipped addon kinds. */
export type PrimeAddon = PiIconAddon | PiButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'pi-icon': PiIconAddon;
    'pi-button': PiButtonAddon;
  }
}
