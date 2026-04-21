import { DynamicText, ValueFieldComponent } from '@ng-forge/dynamic-forms';
import { SliderField } from '@ng-forge/dynamic-forms/integration';

export interface IonicSliderProps {
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
  dualKnobs?: boolean;
  pin?: boolean;
  pinFormatter?: (value: number) => string | number;
  ticks?: boolean;
  snaps?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
  hint?: DynamicText;
}

export type IonicSliderField = SliderField<IonicSliderProps>;

export type IonicSliderComponent = ValueFieldComponent<IonicSliderField>;
