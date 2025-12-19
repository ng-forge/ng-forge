import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeSliderProps {
  /**
   * Minimum value of the slider.
   */
  min?: number;
  /**
   * Maximum value of the slider.
   */
  max?: number;
  /**
   * Step increment for slider values.
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
