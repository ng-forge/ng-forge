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
 * Module-augmentable seam for adding custom addon kinds to `prime-input` at
 * the type level. Pair with `withCustomAddon(...)` for the runtime side:
 *
 * ```ts
 * declare module '@ng-forge/dynamic-forms-primeng' {
 *   interface PrimeInputAddonExtensions {
 *     'my-rating': MyRatingAddon;
 *   }
 * }
 * ```
 *
 * Empty by default — the extension lookup resolves to `never` and contributes
 * nothing to the union.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface PrimeInputAddonExtensions {}

type PrimeInputAddonExtension = PrimeInputAddonExtensions[keyof PrimeInputAddonExtensions];

/**
 * Addon kinds accepted by `prime-input`.
 *
 * PrimeNG-specific kinds (`pi-icon`, `pi-button`) plus the universal `text`
 * and `template` kinds. `component` is permitted at runtime via the broader
 * `BaseAddon` union (and dropped in JSON-derived configs by the validator)
 * but excluded here so the IDE narrows tightly to declarative shapes.
 *
 * To extend with custom kinds, augment `PrimeInputAddonExtensions`.
 */
export type PrimeInputAddon = PiIconAddon | PiButtonAddon | TextAddon | TemplateAddon | PrimeInputAddonExtension;

export type PrimeInputField = InputField<PrimeInputProps> & {
  addons?: ReadonlyArray<PrimeInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
