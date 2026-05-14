import type {
  AddonActionHandler,
  AddonActionPreset,
  BaseAddon,
  DynamicText,
  DynamicValue,
  RegisteredActionRef,
} from '@ng-forge/dynamic-forms';

/**
 * Decorative icon addon for Ionic fields.
 *
 * Renders `<ion-icon name="{icon}">` (Ionicons). The `icon` string is the
 * Ionicons name — e.g., `'search-outline'` produces
 * `<ion-icon name="search-outline">`.
 *
 * Add `ariaLabel` for icons that convey meaning; leave it omitted for
 * purely decorative icons (will be `aria-hidden="true"`).
 */
export interface IonicIconAddon extends BaseAddon {
  readonly kind: 'ion-icon';
  /** Ionicons name (e.g., `'search-outline'`, `'close-outline'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/**
 * Ionic-supported button colour palette.
 */
type IonicButtonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

/**
 * Ionic-supported button fill variants.
 */
type IonicButtonFill = 'clear' | 'outline' | 'solid' | 'default';

/**
 * Common shape of every `ion-button` addon — properties that don't
 * participate in either XOR axis.
 */
interface IonicButtonBase extends BaseAddon {
  readonly kind: 'ion-button';
  /** Ionic button colour. */
  readonly color?: IonicButtonColor;
  /** Ionic button fill style. */
  readonly fill?: IonicButtonFill;
  /** Reactive loading state — renders an `<ion-spinner>` when truthy. */
  readonly loading?: DynamicValue<boolean>;
}

/**
 * Click axis — XOR enforced at type level so configurations that combine
 * two click handlers (e.g., `preset` AND `actionRef`) are rejected by
 * TypeScript. The four shapes:
 *
 * - `Preset`    — built-in preset action.
 * - `ActionRef` — typed reference to a handler registered via `provideAddonActions(...)`.
 * - `Action`    — inline handler (code-only; dropped from JSON-derived configs).
 * - `None`      — decorative button with no handler.
 *
 * Runtime XOR validation stays as defence-in-depth for JSON-source configs
 * that bypass the type checker.
 */
type IonicButtonClickPreset = {
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
type IonicButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type IonicButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef: IonicButtonActionRef;
  readonly action?: never;
};
type IonicButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. Matches the generic `AddonActionHandler` shape used by `provideAddonActions(...)`. */
  readonly action: AddonActionHandler;
};
type IonicButtonClickNone = {
  readonly preset?: never;
  readonly actionRef?: never;
  readonly action?: never;
};
type IonicButtonClick = IonicButtonClickPreset | IonicButtonClickActionRef | IonicButtonClickAction | IonicButtonClickNone;

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
type IonicButtonContentIconOnly = {
  readonly icon: string;
  readonly label?: never;
  /** REQUIRED: icon-only buttons must carry an accessible label. */
  readonly ariaLabel: DynamicText;
};
type IonicButtonContentLabeled = {
  readonly icon?: string;
  readonly label: DynamicText;
  readonly ariaLabel?: DynamicText;
};
type IonicButtonContentDecorative = {
  readonly icon?: never;
  readonly label?: never;
  readonly ariaLabel?: DynamicText;
};
type IonicButtonContent = IonicButtonContentIconOnly | IonicButtonContentLabeled | IonicButtonContentDecorative;

/**
 * Interactive button addon for Ionic fields.
 *
 * Renders `<ion-button>` with optional icon (via `<ion-icon>`), label,
 * colour / fill variants, and a reactive loading state (rendered as
 * `<ion-spinner>`).
 *
 * Type-level guarantees:
 *
 * - **Content axis (XOR):** `IconOnly` (icon + required ariaLabel) |
 *   `Labeled` (label, icon optional) | `Decorative` (neither). The IDE
 *   rejects icon-only configs that omit `ariaLabel`.
 * - **Click axis (XOR):** exactly one of `preset` / `actionRef` / `action`,
 *   or none. Combining two is rejected by TypeScript at the call site;
 *   the runtime validator still drops the addon with a clear warning when
 *   JSON-source configs slip a multi-set past the type checker.
 */
export type IonicButtonAddon = IonicButtonBase & IonicButtonContent & IonicButtonClick;

/** Union of all Ionic-shipped addon kinds. */
export type IonicAddon = IonicIconAddon | IonicButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'ion-icon': IonicIconAddon;
    'ion-button': IonicButtonAddon;
  }
}
