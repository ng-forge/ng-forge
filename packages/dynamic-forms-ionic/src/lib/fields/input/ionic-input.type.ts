import { DynamicText, TemplateAddon, TextAddon, ValueFieldComponent } from '@ng-forge/dynamic-forms';
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
 *
 * ```ts
 * declare module '@ng-forge/dynamic-forms-ionic' {
 *   interface IonAddonExtensions {
 *     'my-rating': MyRatingAddon;
 *   }
 * }
 * ```
 *
 * Empty by default — the extension lookup resolves to `never` and contributes
 * nothing to the union.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type -- Intentionally empty: module-augmentation seam
export interface IonAddonExtensions {}

type IonAddonExtension = IonAddonExtensions[keyof IonAddonExtensions];

/**
 * Addon kinds accepted by `ion-input`.
 *
 * Ionic-specific kinds (`ion-icon`, `ion-button`) plus the universal `text`
 * and `template` kinds. `component` is permitted at runtime via the broader
 * `BaseAddon` union (and dropped in JSON-derived configs by the validator)
 * but excluded here so the IDE narrows tightly to declarative shapes.
 *
 * To extend with custom kinds, augment `IonAddonExtensions`.
 */
export type IonInputAddon = IonIconAddon | IonButtonAddon | TextAddon | TemplateAddon | IonAddonExtension;

export type IonicInputField = InputField<IonicInputProps> & {
  addons?: ReadonlyArray<IonInputAddon>;
};

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type IonicInputComponent = ValueFieldComponent<IonicInputField>;
