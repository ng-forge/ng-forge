import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for PrimeNG fields. */
export interface PrimeIconAddon extends BaseAddon {
  readonly kind: 'prime-icon';
  /** PrimeIcons name without the `pi-` prefix (e.g., `'search'`, `'times'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/**
 * Common shape of every `prime-button` addon — properties that don't
 * participate in either XOR axis.
 */
interface PiButtonBase extends BaseAddon {
  readonly kind: 'prime-button';
  /** PrimeNG button severity / colour variant — mirrors PrimeNG's `ButtonSeverity`. */
  readonly severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  /** Reactive loading state — renders the button's native `[loading]` spinner. */
  readonly loading?: DynamicValue<boolean>;
}

/**
 * Click axis — XOR enforced at type level so configurations that combine
 * two click handlers (e.g., `preset` AND `actionRef`) are rejected by
 * TypeScript. The four shapes:
 */
type PiButtonClickPreset = {
  /** Built-in preset action (e.g., `'clear'`, `'toggle-password-visibility'`). JSON-safe. */
  readonly preset: AddonActionPreset;
  readonly actionRef?: never;
  readonly action?: never;
};
/**
 * Value type for the `actionRef` slot. When no actions have been registered
 * via `withAddonActions(...)`, `RegisteredActionRef` resolves to `never` —
 * which would make this variant uninhabitable and break `addon.actionRef`
 * narrowing in the renderer. Fall back to `string` so the variant stays
 * usable; once the user augments `DynamicFormActionRegistry`, autocomplete
 * tightens to the registered keys.
 */
type PiButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type PiButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `withAddonActions(...)`. JSON-safe. */
  readonly actionRef: PiButtonActionRef;
  readonly action?: never;
};
type PiButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. Matches the generic `AddonActionHandler` shape used by `withAddonActions(...)`. */
  readonly action: AddonActionHandler;
};
type PiButtonClickNone = {
  readonly preset?: never;
  readonly actionRef?: never;
  readonly action?: never;
};
type PiButtonClick = PiButtonClickPreset | PiButtonClickActionRef | PiButtonClickAction | PiButtonClickNone;

/**
 * Content axis — XOR enforced at type level so an icon-only button is
 * forced to declare `ariaLabel`. The three shapes:
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

/** Interactive button addon for PrimeNG fields. */
export type PrimeButtonAddon = PiButtonBase & PiButtonContent & PiButtonClick;

/** Union of all PrimeNG-shipped addon kinds. */
export type PrimeAddon = PrimeIconAddon | PrimeButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'prime-icon': PrimeIconAddon;
    'prime-button': PrimeButtonAddon;
  }
}
