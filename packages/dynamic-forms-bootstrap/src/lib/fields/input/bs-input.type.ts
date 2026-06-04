import { DynamicText, TemplateAddon, TextAddon } from '@ng-forge/dynamic-forms';
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
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface BsAddonExtensions {}

type BsAddonExtension = BsAddonExtensions[keyof BsAddonExtensions];

/** Addon kinds accepted by `bs-input`. */
export type BsInputAddon = BsIconAddon | BsButtonAddon | TextAddon | TemplateAddon | BsAddonExtension;

export type BsInputField = InputField<BsInputProps> & {
  addons?: ReadonlyArray<BsInputAddon>;
};
