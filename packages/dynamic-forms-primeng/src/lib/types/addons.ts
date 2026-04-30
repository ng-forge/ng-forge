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
 * Interactive button addon for PrimeNG fields.
 *
 * Renders `<p-button>` with optional icon, label, severity, and reactive
 * loading state. Exactly one of `preset`, `actionRef`, or `action` may be
 * specified — if all three are omitted the button is decorative (no click
 * handler).
 */
export interface PiButtonAddon extends BaseAddon {
  readonly kind: 'pi-button';
  /** PrimeIcons name without the `pi-` prefix. */
  readonly icon?: string;
  /** Visible button label; can be omitted for icon-only buttons. */
  readonly label?: DynamicText;
  /** Required at type level when icon-only (no `label`); used as `aria-label`. */
  readonly ariaLabel?: DynamicText;
  /** PrimeNG button severity / colour variant. */
  readonly severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  /** Reactive loading state — renders the button's native `[loading]` spinner. */
  readonly loading?: DynamicValue<boolean>;

  // Click handler (XOR — exactly one):
  /** Built-in preset action (e.g., `'clear'`, `'toggle-password-visibility'`). JSON-safe. */
  readonly preset?: AddonActionPreset;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef?: RegisteredActionRef;
  /** Inline handler — code-only; dropped from JSON-derived configs. */
  readonly action?: (ctx: AddonActionContext) => void;
}

/** Union of all PrimeNG-shipped addon kinds. */
export type PrimeAddon = PiIconAddon | PiButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'pi-icon': PiIconAddon;
    'pi-button': PiButtonAddon;
  }
}
