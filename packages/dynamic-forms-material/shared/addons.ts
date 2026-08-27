import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for Material fields. */
export interface MatIconAddon extends BaseAddon {
  readonly type: 'mat-icon';
  /** Material Icons name (ligature, e.g., `'search'`, `'close'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

interface MatButtonBase extends BaseAddon {
  readonly type: 'mat-button';
  readonly color?: 'primary' | 'accent' | 'warn';
  readonly loading?: DynamicValue<boolean>;
}

type MatButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type MatButtonClick =
  | { readonly preset: AddonActionPreset; readonly actionRef?: never; readonly action?: never }
  | { readonly preset?: never; readonly actionRef: MatButtonActionRef; readonly action?: never }
  | { readonly preset?: never; readonly actionRef?: never; readonly action: AddonActionHandler }
  | { readonly preset?: never; readonly actionRef?: never; readonly action?: never };

type MatButtonContent =
  | { readonly icon: string; readonly label?: never; readonly ariaLabel: DynamicText }
  | { readonly icon?: string; readonly label: DynamicText; readonly ariaLabel?: DynamicText }
  | { readonly icon?: never; readonly label?: never; readonly ariaLabel?: DynamicText };

/** Interactive button addon for Material fields. */
export type MatButtonAddon = MatButtonBase & MatButtonContent & MatButtonClick;

/** Union of all Material-shipped addon types. */
export type MatAddon = MatIconAddon | MatButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'mat-icon': MatIconAddon;
    'mat-button': MatButtonAddon;
  }
}
