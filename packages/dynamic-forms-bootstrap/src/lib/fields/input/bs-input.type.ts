import { DynamicText, TemplateAddon, TextAddon, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import type { BsButtonAddon, BsIconAddon } from '../../types/addons';

export interface BsInputProps extends InputProps {
  size?: 'sm' | 'lg';
  floatingLabel?: boolean;
  hint?: DynamicText;
  validFeedback?: DynamicText;
  invalidFeedback?: DynamicText;
  plaintext?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

/**
 * Module-augmentable seam for adding custom addon kinds to `bs-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 *
 * ```ts
 * declare module '@ng-forge/dynamic-forms-bootstrap' {
 *   interface BsAddonExtensions {
 *     'my-rating': MyRatingAddon;
 *   }
 * }
 * ```
 *
 * Empty by default — the extension lookup resolves to `never` and contributes
 * nothing to the union.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface BsAddonExtensions {}

type BsAddonExtension = BsAddonExtensions[keyof BsAddonExtensions];

/**
 * Addon kinds accepted by `bs-input`.
 *
 * Bootstrap-specific kinds (`bs-icon`, `bs-button`) plus the universal `text`
 * and `template` kinds. `component` is permitted at runtime via the broader
 * `BaseAddon` union (and dropped in JSON-derived configs by the validator)
 * but excluded here so the IDE narrows tightly to declarative shapes.
 *
 * To extend with custom kinds, augment `BsAddonExtensions`.
 */
export type BsInputAddon = BsIconAddon | BsButtonAddon | TextAddon | TemplateAddon | BsAddonExtension;

export type BsInputField = InputField<BsInputProps> & {
  addons?: ReadonlyArray<BsInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsInputComponent = ValueFieldComponent<BsInputField>;
