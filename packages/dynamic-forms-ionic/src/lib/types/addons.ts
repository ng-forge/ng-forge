import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for Ion fields. */
export interface IonIconAddon extends BaseAddon {
  readonly kind: 'ion-icon';
  /** Ionons name (e.g., `'search-outline'`, `'close-outline'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/** Ionic-supported button colour palette. */
type IonButtonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

/** Ionic-supported button fill variants. */
type IonButtonFill = 'clear' | 'outline' | 'solid' | 'default';

/**
 * Common shape of every `ion-button` addon — properties that don't
 * participate in either XOR axis.
 */
interface IonButtonBase extends BaseAddon {
  readonly kind: 'ion-button';
  /** Ion button colour. */
  readonly color?: IonButtonColor;
  /** Ion button fill style. */
  readonly fill?: IonButtonFill;
  /** Reactive loading state — renders an `<ion-spinner>` when truthy. */
  readonly loading?: DynamicValue<boolean>;
}

/**
 * Click axis — XOR enforced at type level so configurations that combine
 * two click handlers (e.g., `preset` AND `actionRef`) are rejected by
 * TypeScript. The four shapes:
 */
type IonButtonClickPreset = {
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
type IonButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type IonButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef: IonButtonActionRef;
  readonly action?: never;
};
type IonButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. Matches the generic `AddonActionHandler` shape used by `provideAddonActions(...)`. */
  readonly action: AddonActionHandler;
};
type IonButtonClickNone = {
  readonly preset?: never;
  readonly actionRef?: never;
  readonly action?: never;
};
type IonButtonClick = IonButtonClickPreset | IonButtonClickActionRef | IonButtonClickAction | IonButtonClickNone;

/**
 * Content axis — XOR enforced at type level so an icon-only button is
 * forced to declare `ariaLabel`. The three shapes:
 */
type IonButtonContentIconOnly = {
  readonly icon: string;
  readonly label?: never;
  /** REQUIRED: icon-only buttons must carry an accessible label. */
  readonly ariaLabel: DynamicText;
};
type IonButtonContentLabeled = {
  readonly icon?: string;
  readonly label: DynamicText;
  readonly ariaLabel?: DynamicText;
};
type IonButtonContentDecorative = {
  readonly icon?: never;
  readonly label?: never;
  readonly ariaLabel?: DynamicText;
};
type IonButtonContent = IonButtonContentIconOnly | IonButtonContentLabeled | IonButtonContentDecorative;

/** Interactive button addon for Ion fields. */
export type IonButtonAddon = IonButtonBase & IonButtonContent & IonButtonClick;

/** Union of all Ion-shipped addon kinds. */
export type IonAddon = IonIconAddon | IonButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'ion-icon': IonIconAddon;
    'ion-button': IonButtonAddon;
  }
}
