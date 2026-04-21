import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeSliderProps {
  /**
   * Minimum value of the slider.
   *
   * Adapter-level override. Field-level `minValue` (or the validator `min`) takes
   * precedence — set this only when you need a render-only override that should
   * not flow into form validation.
   */
  min?: number;
  /**
   * Maximum value of the slider.
   *
   * Adapter-level override. Field-level `maxValue` (or the validator `max`) takes
   * precedence — set this only when you need a render-only override that should
   * not flow into form validation.
   */
  max?: number;
  /**
   * Step increment for slider values.
   *
   * Adapter-level override. Field-level `step` on `SliderField` takes precedence.
   */
  step?: number;
  /**
   * Enable range mode with two handles.
   */
  range?: boolean;
  /**
   * Orientation of the slider.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * CSS class to apply to the slider element.
   */
  styleClass?: string;
  /**
   * Hint text displayed below the slider.
   */
  hint?: DynamicText;
}

export type PrimeSliderField = SliderField<PrimeSliderProps>;

export type PrimeSliderComponent = ValueFieldComponent<PrimeSliderField>;
