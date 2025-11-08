import { ValueFieldComponent, SliderField } from '@ng-forge/dynamic-form';

export interface IonicSliderProps {
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

export type IonicSliderComponent = ValueFieldComponent<IonicSliderField>;
