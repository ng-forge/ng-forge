import { DynamicText, TemplateAddon, TextAddon } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import type { IonicButtonAddon, IonicIconAddon } from '../../types/addons';

export interface IonicInputProps extends InputProps {
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  hint?: DynamicText;
  errorText?: DynamicText;
  counter?: boolean;
  clearInput?: boolean;
}

/**
 * Module-augmentable seam for adding custom addon types to `ion-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface IonicAddonExtensions {}

type IonicAddonExtension = IonicAddonExtensions[keyof IonicAddonExtensions];

/** Addon types accepted by `ion-input`. */
export type IonicInputAddon = IonicIconAddon | IonicButtonAddon | TextAddon | TemplateAddon | IonicAddonExtension;

export type IonicInputField = InputField<IonicInputProps> & {
  addons?: ReadonlyArray<IonicInputAddon>;
};
