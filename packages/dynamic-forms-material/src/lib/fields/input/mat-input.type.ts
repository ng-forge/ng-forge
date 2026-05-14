import { DynamicText, TemplateAddon, TextAddon, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import { FloatLabelType, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type { MatButtonAddon, MatIconAddon } from '../../types/addons';

export interface MatInputProps extends InputProps {
  appearance?: MatFormFieldAppearance;
  disableRipple?: boolean;
  subscriptSizing?: SubscriptSizing;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  hint?: DynamicText;
}

/**
 * Module-augmentable seam for adding custom addon kinds to `mat-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 *
 * ```ts
 * declare module '@ng-forge/dynamic-forms-material' {
 *   interface MatInputAddonExtensions {
 *     'my-rating': MyRatingAddon;
 *   }
 * }
 * ```
 *
 * Empty by default — the extension lookup resolves to `never` and contributes
 * nothing to the union.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface MatInputAddonExtensions {}

type MatInputAddonExtension = MatInputAddonExtensions[keyof MatInputAddonExtensions];

/**
 * Addon kinds accepted by `mat-input`.
 *
 * Material-specific kinds (`mat-icon`, `mat-button`) plus the universal
 * `text` and `template` kinds. `component` is permitted at runtime via the
 * broader `BaseAddon` union (and dropped in JSON-derived configs by the
 * validator) but excluded here so the IDE narrows tightly to declarative
 * shapes.
 *
 * To extend with custom kinds, augment `MatInputAddonExtensions`.
 */
export type MatInputAddon = MatIconAddon | MatButtonAddon | TextAddon | TemplateAddon | MatInputAddonExtension;

export type MatInputField = InputField<MatInputProps> & {
  addons?: ReadonlyArray<MatInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatInputComponent = ValueFieldComponent<MatInputField>;
