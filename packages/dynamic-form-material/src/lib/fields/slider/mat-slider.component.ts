import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatSliderField, MatSliderProps } from './mat-slider.type';

/**
 * Material Design slider field component
 */
@Component({
  selector: 'df-mat-slider',
  imports: [FormsModule, MatSlider, MatSliderThumb],
  template: `
    <div [class]="className() || ''">
      @if (label(); as label) {
      <div class="slider-label">{{ label }}</div>
      }

      <mat-slider
        [min]="minValue()"
        [max]="maxValue()"
        [step]="step()"
        [disabled]="disabled()"
        [discrete]="thumbLabel() || showThumbLabel()"
        [showTickMarks]="tickInterval() !== undefined"
        [color]="color() || 'primary'"
        class="slider-container"
      >
        <input matSliderThumb [(ngModel)]="value" (blur)="touched.set(true)" />
      </mat-slider>

      @if (hint(); as hint) {
      <div class="mat-hint">{{ hint }}</div>
      } @if (invalid() && touched()) { @for (error of errors(); track error) {
      <div class="mat-error">{{ error.message }}</div>
      } }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .slider-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 8px;
      }

      .slider-container {
        width: 100%;
        margin: 8px 0;
      }

      .mat-hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 4px;
      }

      .mat-error {
        font-size: 12px;
        color: #f44336;
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSliderFieldComponent implements FormValueControl<number>, MatSliderField {
  readonly value = model<number>(0);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // SliderField implementation
  readonly label = input.required<MatSliderProps['label']>();
  readonly minValue = input<MatSliderProps['minValue']>(0);
  readonly maxValue = input<MatSliderProps['maxValue']>(100);
  readonly step = input<MatSliderProps['step']>(1);
  readonly thumbLabel = input<MatSliderProps['thumbLabel']>(false);
  readonly showThumbLabel = input<boolean>(false);
  readonly tickInterval = input<MatSliderProps['tickInterval']>();
  readonly vertical = input<MatSliderProps['vertical']>(false);
  readonly invert = input<MatSliderProps['invert']>(false);
  readonly color = input<MatSliderProps['color']>('primary');
  readonly hint = input<MatSliderProps['hint']>('');
  readonly className = input<MatSliderProps['className']>('');
  readonly appearance = input<MatSliderProps['appearance']>('fill');
}
