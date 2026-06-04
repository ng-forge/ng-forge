import { DynamicText, TemplateAddon, TextAddon } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import type { IonButtonAddon, IonIconAddon } from '../../types/addons';

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
 * Module-augmentable seam for adding custom addon kinds to `ion-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface IonAddonExtensions {}

type IonAddonExtension = IonAddonExtensions[keyof IonAddonExtensions];

/** Addon kinds accepted by `ion-input`. */
export type IonInputAddon = IonIconAddon | IonButtonAddon | TextAddon | TemplateAddon | IonAddonExtension;

export type IonicInputField = InputField<IonicInputProps> & {
  addons?: ReadonlyArray<IonInputAddon>;
};
