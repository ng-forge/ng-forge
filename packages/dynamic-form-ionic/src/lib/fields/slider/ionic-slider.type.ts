import { ValueFieldComponent, SliderField } from '@ng-forge/dynamic-form';

export interface IonicSliderProps extends Record<string, unknown> {
  min?: number;
  max?: number;
  step?: number;
  dualKnobs?: boolean;
  pin?: boolean;
  pinFormatter?: (value: number) => string | number;
  ticks?: boolean;
  snaps?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked';
}

export type IonicSliderField = SliderField<IonicSliderProps>;

// Exclude minValue, maxValue, step from component interface since they're handled by Field directive metadata
export type IonicSliderComponent = Omit<ValueFieldComponent<IonicSliderField>, 'minValue' | 'maxValue' | 'step'>;
