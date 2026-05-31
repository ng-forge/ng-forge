import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for Material fields. */
export interface MatIconAddon extends BaseAddon {
  readonly kind: 'mat-icon';
  /** Material Icons name (ligature, e.g., `'search'`, `'close'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/**
 * Common shape of every `mat-button` addon — properties that don't
 * participate in either XOR axis.
 */
interface MatButtonBase extends BaseAddon {
  readonly kind: 'mat-button';
  /** Material button colour variant. */
  readonly color?: 'primary' | 'accent' | 'warn';
  /** Reactive loading state — when truthy the button is disabled. */
  readonly loading?: DynamicValue<boolean>;
}

/**
 * Click axis — XOR enforced at type level so configurations that combine
 * two click handlers (e.g., `preset` AND `actionRef`) are rejected by
 * TypeScript. Runtime XOR validation stays as defence-in-depth for
 * JSON-source configs that bypass the type checker.
 */
type MatButtonClickPreset = {
  /** Built-in preset action (e.g., `'clear'`, `'toggle-password-visibility'`). JSON-safe. */
  readonly preset: AddonActionPreset;
  readonly actionRef?: never;
  readonly action?: never;
};
/**
 * Value type for the `actionRef` slot. When no actions have been registered
 * via `provideAddonActions(...)`, `RegisteredActionRef` resolves to `never` —
 * which would make this variant uninhabitable and break `addon.actionRef`
 * narrowing in the renderer. Fall back to `string` so the variant stays
 * usable; once the user augments `DynamicFormActionRegistry`, autocomplete
 * tightens to the registered keys.
 */
type MatButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type MatButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef: MatButtonActionRef;
  readonly action?: never;
};
type MatButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. */
  readonly action: AddonActionHandler;
};
type MatButtonClickNone = {
  readonly preset?: never;
  readonly actionRef?: never;
  readonly action?: never;
};
type MatButtonClick = MatButtonClickPreset | MatButtonClickActionRef | MatButtonClickAction | MatButtonClickNone;

/**
 * Content axis — XOR enforced at type level so an icon-only button is
 * forced to declare `ariaLabel`. The three shapes:
 */
type MatButtonContentIconOnly = {
  readonly icon: string;
  readonly label?: never;
  /** REQUIRED: icon-only buttons must carry an accessible label. */
  readonly ariaLabel: DynamicText;
};
type MatButtonContentLabeled = {
  readonly icon?: string;
  readonly label: DynamicText;
  readonly ariaLabel?: DynamicText;
};
type MatButtonContentDecorative = {
  readonly icon?: never;
  readonly label?: never;
  readonly ariaLabel?: DynamicText;
};
type MatButtonContent = MatButtonContentIconOnly | MatButtonContentLabeled | MatButtonContentDecorative;

/** Interactive button addon for Material fields. */
export type MatButtonAddon = MatButtonBase & MatButtonContent & MatButtonClick;

/** Union of all Material-shipped addon kinds. */
export type MatAddon = MatIconAddon | MatButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'mat-icon': MatIconAddon;
    'mat-button': MatButtonAddon;
  }
}
