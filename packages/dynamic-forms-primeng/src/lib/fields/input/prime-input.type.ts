import { DynamicText, TemplateAddon, TextAddon } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import type { PrimeButtonAddon, PrimeIconAddon } from '../../types/addons';

export interface PrimeInputProps extends InputProps {
  /** CSS class to apply to the input element. */
  styleClass?: string;
  /** Hint text displayed below the input. */
  hint?: DynamicText;
  /** Size variant of the input. */
  size?: 'small' | 'large';
  /** Visual variant of the input. */
  variant?: 'outlined' | 'filled';
  /** Type of the input element. */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

/**
 * Module-augmentable seam for adding custom addon kinds to `prime-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface PrimeAddonExtensions {}

type PrimeAddonExtension = PrimeAddonExtensions[keyof PrimeAddonExtensions];

/** Addon kinds accepted by `prime-input`. */
export type PrimeInputAddon = PrimeIconAddon | PrimeButtonAddon | TextAddon | TemplateAddon | PrimeAddonExtension;

export type PrimeInputField = InputField<PrimeInputProps> & {
  addons?: ReadonlyArray<PrimeInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
