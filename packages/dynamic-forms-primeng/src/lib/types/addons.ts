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
 * participate in either XOR axis.
 */
interface PiButtonBase extends BaseAddon {
  readonly kind: 'pi-button';
  /** PrimeNG button severity / colour variant — mirrors PrimeNG's `ButtonSeverity`. */
  readonly severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  /** Reactive loading state — renders the button's native `[loading]` spinner. */
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
type PiButtonClickPreset = {
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
type PiButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type PiButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef: PiButtonActionRef;
  readonly action?: never;
};
type PiButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. */
  readonly action: (ctx: AddonActionContext) => void;
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
 * - **Click axis (XOR):** exactly one of `preset` / `actionRef` / `action`,
 *   or none. Combining two is rejected by TypeScript at the call site;
 *   the runtime validator still drops the addon with a clear warning when
 *   JSON-source configs slip a multi-set past the type checker.
 */
export type PiButtonAddon = PiButtonBase & PiButtonContent & PiButtonClick;

/** Union of all PrimeNG-shipped addon kinds. */
export type PrimeAddon = PiIconAddon | PiButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'pi-icon': PiIconAddon;
    'pi-button': PiButtonAddon;
  }
}
