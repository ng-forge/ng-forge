import { DynamicText, TemplateAddon, TextAddon } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
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
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface MatAddonExtensions {}

type MatAddonExtension = MatAddonExtensions[keyof MatAddonExtensions];

/** Addon kinds accepted by `mat-input`. */
export type MatInputAddon = MatIconAddon | MatButtonAddon | TextAddon | TemplateAddon | MatAddonExtension;

export type MatInputField = InputField<MatInputProps> & {
  addons?: ReadonlyArray<MatInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type MatInputComponent = ValueFieldComponent<MatInputField>;
