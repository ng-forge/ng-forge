import type {
  AddonActionHandler,
  AddonActionPreset,
  BaseAddon,
  DynamicText,
  DynamicValue,
  RegisteredActionRef,
} from '@ng-forge/dynamic-forms';

/**
 * Decorative icon addon for Bootstrap fields.
 *
 * Renders `<i class="bi bi-{icon}">` (Bootstrap Icons). The `icon` string is the
 * bare suffix — e.g., `'search'` produces `<i class="bi bi-search">`.
 *
 * Add `ariaLabel` for icons that convey meaning (search, error, success);
 * leave it omitted for purely decorative icons (will be `aria-hidden="true"`).
 */
export interface BsIconAddon extends BaseAddon {
  readonly kind: 'bs-icon';
  /** Bootstrap Icons name without the `bi-` prefix (e.g., `'search'`, `'x'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

/**
 * Common shape of every `bs-button` addon — properties that don't
 * participate in either XOR axis.
 */
interface BsButtonBase extends BaseAddon {
  readonly kind: 'bs-button';
  /** Bootstrap button variant (mapped to `btn-outline-{severity}`). */
  readonly severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  /** Reactive loading state — swaps the button content for a spinner. */
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
 */
type BsButtonClickPreset = {
  /** Built-in preset action (e.g., `'clear'`, `'toggle-password-visibility'`). JSON-safe. */
  readonly preset: AddonActionPreset;
  readonly actionRef?: never;
  readonly action?: never;
};
/**
 * Value type for the `actionRef` slot. When no actions have been registered
 * via `provideAddonActions(...)`, `RegisteredActionRef` resolves to `never` —
 * which would make this variant uninhabitable. Fall back to `string` so the
 * variant stays usable; once the user augments `DynamicFormActionRegistry`,
 * autocomplete tightens to the registered keys.
 */
type BsButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type BsButtonClickActionRef = {
  readonly preset?: never;
  /** Reference to a handler registered via `provideAddonActions(...)`. JSON-safe. */
  readonly actionRef: BsButtonActionRef;
  readonly action?: never;
};
type BsButtonClickAction = {
  readonly preset?: never;
  readonly actionRef?: never;
  /** Inline handler — code-only; dropped from JSON-derived configs. Matches the generic `AddonActionHandler` shape used by `provideAddonActions(...)`. */
  readonly action: AddonActionHandler;
};
type BsButtonClickNone = {
  readonly preset?: never;
  readonly actionRef?: never;
  readonly action?: never;
};
type BsButtonClick = BsButtonClickPreset | BsButtonClickActionRef | BsButtonClickAction | BsButtonClickNone;

/**
 * Content axis — XOR enforced at type level so an icon-only button is
 * forced to declare `ariaLabel`.
 */
type BsButtonContentIconOnly = {
  readonly icon: string;
  readonly label?: never;
  /** REQUIRED: icon-only buttons must carry an accessible label. */
  readonly ariaLabel: DynamicText;
};
type BsButtonContentLabeled = {
  readonly icon?: string;
  readonly label: DynamicText;
  readonly ariaLabel?: DynamicText;
};
type BsButtonContentDecorative = {
  readonly icon?: never;
  readonly label?: never;
  readonly ariaLabel?: DynamicText;
};
type BsButtonContent = BsButtonContentIconOnly | BsButtonContentLabeled | BsButtonContentDecorative;

/**
 * Interactive button addon for Bootstrap fields.
 *
 * Renders `<button class="btn btn-outline-{severity}">` with optional icon,
 * label, severity, and reactive loading state.
 *
 * Type-level guarantees:
 *
 * - **Content axis (XOR):** `IconOnly` (icon + required ariaLabel) |
 *   `Labeled` (label, icon optional) | `Decorative` (neither).
 * - **Click axis (XOR):** exactly one of `preset` / `actionRef` / `action`,
 *   or none.
 */
export type BsButtonAddon = BsButtonBase & BsButtonContent & BsButtonClick;

/** Union of all Bootstrap-shipped addon kinds. */
export type BsAddon = BsIconAddon | BsButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'bs-icon': BsIconAddon;
    'bs-button': BsButtonAddon;
  }
}
