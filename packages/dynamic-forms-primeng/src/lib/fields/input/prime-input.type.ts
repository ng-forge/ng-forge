import { DynamicText, TemplateAddon, TextAddon, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { InputField, InputProps } from '@ng-forge/dynamic-forms/integration';
import type { PiButtonAddon, PiIconAddon } from '../../types/addons';

export interface PrimeInputProps extends InputProps {
  /**
   * CSS class to apply to the input element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the input.
   */
  hint?: DynamicText;
  /**
   * Size variant of the input.
   */
  size?: 'small' | 'large';
  /**
   * Visual variant of the input.
   */
  variant?: 'outlined' | 'filled';
  /**
   * Type of the input element.
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

/**
 * Addon kinds accepted by `prime-input`.
 *
 * PrimeNG-specific kinds (`pi-icon`, `pi-button`) plus the universal `text`
 * and `template` kinds. `component` is permitted at runtime via the broader
 * `BaseAddon` union (and dropped in JSON-derived configs by the validator)
 * but excluded here so the IDE narrows tightly to declarative shapes.
 */
export type PrimeInputAddon = PiIconAddon | PiButtonAddon | TextAddon | TemplateAddon;

export type PrimeInputField = InputField<PrimeInputProps> & {
  addons?: ReadonlyArray<PrimeInputAddon>;
};

export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
