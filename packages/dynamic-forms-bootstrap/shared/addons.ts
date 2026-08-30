import type { AddonActionPreset, BaseAddon, DynamicText, DynamicValue, RegisteredActionRef } from '@ng-forge/dynamic-forms';
import type { AddonActionHandler } from '@ng-forge/dynamic-forms/integration';

/** Decorative icon addon for Bootstrap fields. */
export interface BsIconAddon extends BaseAddon {
  readonly type: 'bs-icon';
  /** Bootstrap Icons name without the `bi-` prefix (e.g., `'search'`, `'x'`). */
  readonly icon: string;
  /** Accessible label for icons that convey meaning. */
  readonly ariaLabel?: DynamicText;
}

interface BsButtonBase extends BaseAddon {
  readonly type: 'bs-button';
  readonly severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  readonly loading?: DynamicValue<boolean>;
}

type BsButtonActionRef = [RegisteredActionRef] extends [never] ? string : RegisteredActionRef;
type BsButtonClick =
  | { readonly preset: AddonActionPreset; readonly actionRef?: never; readonly action?: never }
  | { readonly preset?: never; readonly actionRef: BsButtonActionRef; readonly action?: never }
  | { readonly preset?: never; readonly actionRef?: never; readonly action: AddonActionHandler }
  | { readonly preset?: never; readonly actionRef?: never; readonly action?: never };

type BsButtonContent =
  | { readonly icon: string; readonly label?: never; readonly ariaLabel: DynamicText }
  | { readonly icon?: string; readonly label: DynamicText; readonly ariaLabel?: DynamicText }
  | { readonly icon?: never; readonly label?: never; readonly ariaLabel?: DynamicText };

/** Interactive button addon for Bootstrap fields. */
export type BsButtonAddon = BsButtonBase & BsButtonContent & BsButtonClick;

/** Union of all Bootstrap-shipped addon types. */
export type BsAddon = BsIconAddon | BsButtonAddon;

declare module '@ng-forge/dynamic-forms' {
  interface DynamicFormAddonRegistry {
    'bs-icon': BsIconAddon;
    'bs-button': BsButtonAddon;
  }
}
