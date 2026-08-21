import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for Ionic fields. */
export interface IonicIconAddon extends BaseAddon {
  readonly type: 'ion-icon';
  readonly icon: string;
  readonly ariaLabel?: DynamicText;
}

interface IonicButtonBase extends BaseAddon {
  readonly type: 'ion-button';
  readonly color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  readonly fill?: 'clear' | 'outline' | 'solid' | 'default';
  readonly loading?: DynamicValue<boolean>;
}

type IonicButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type IonicButtonClick =
  | { readonly preset: AddonActionPreset; readonly actionRef?: never; readonly action?: never }
  | { readonly preset?: never; readonly actionRef: IonicButtonActionRef; readonly action?: never }
  | { readonly preset?: never; readonly actionRef?: never; readonly action: AddonActionHandler }
  | { readonly preset?: never; readonly actionRef?: never; readonly action?: never };

type IonicButtonContent =
  | { readonly icon: string; readonly label?: never; readonly ariaLabel: DynamicText }
  | { readonly icon?: string; readonly label: DynamicText; readonly ariaLabel?: DynamicText }
  | { readonly icon?: never; readonly label?: never; readonly ariaLabel?: DynamicText };

/** Interactive button addon for Ionic fields. */
export type IonicButtonAddon = IonicButtonBase & IonicButtonContent & IonicButtonClick;

/** Union of all Ionic-shipped addon types. */
export type IonicAddon = IonicIconAddon | IonicButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'ion-icon': IonicIconAddon;
    'ion-button': IonicButtonAddon;
  }
}
