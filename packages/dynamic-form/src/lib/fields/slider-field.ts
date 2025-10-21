export interface SliderField {
  label: string;
  minValue: number;
  maxValue: number;
  step: number;
  thumbLabel: boolean;
  showThumbLabel?: boolean;
  tickInterval?: number | 'auto' | undefined;
  vertical?: boolean;
  invert?: boolean;
  color?: 'primary' | 'accent' | 'warn';
  hint?: string;
  className?: string;
}
