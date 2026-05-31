import { DynamicText } from '@ng-forge/dynamic-forms';
import { ValueFieldComponent } from '@ng-forge/dynamic-forms/integration';
import { SliderField } from '@ng-forge/dynamic-forms/integration';

export interface BsSliderProps {
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  hint?: DynamicText;
  /**
   * Adapter-level override for the slider minimum.
   * Field-level `minValue` (or the validator `min`) takes precedence.
   */
  min?: number;
  /**
   * Adapter-level override for the slider maximum.
   * Field-level `maxValue` (or the validator `max`) takes precedence.
   */
  max?: number;
  /**
   * Adapter-level override for the slider step increment.
   * Field-level `step` on `SliderField` takes precedence.
   */
  step?: number;
}

export type BsSliderField = SliderField<BsSliderProps>;

/** @deprecated Scheduled for removal in v1. Use `injectNgForgeField<T>()` for typed access to a field component's directive instance. */
export type BsSliderComponent = ValueFieldComponent<BsSliderField>;
