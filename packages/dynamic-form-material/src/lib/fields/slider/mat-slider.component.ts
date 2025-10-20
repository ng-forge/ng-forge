import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatSliderField, MatSliderProps } from './mat-slider.type';

/**
 * Material Design slider field component
 */
@Component({
  selector: 'df-mat-slider',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatSlider, MatSliderThumb],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className()">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <mat-slider
        [min]="minValue()"
        [max]="maxValue()"
        [step]="step()"
        [disabled]="disabled()"
        [discrete]="thumbLabel()"
        [showTickMarks]="tickInterval() !== undefined"
        [color]="color() || 'primary'"
        class="slider-container"
      >
        <input matSliderThumb [(ngModel)]="value" (blur)="touched.set(true)" />
      </mat-slider>

      @if (hint(); as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      } @if (invalid() && touched()) {
      <mat-error>
        @for (error of errors(); track error) {
        <span>{{ error.message }}</span>
        }
      </mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      .slider-container {
        width: 100%;
        margin: 16px 0;
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
  readonly tickInterval = input<MatSliderProps['tickInterval']>();
  readonly vertical = input<MatSliderProps['vertical']>(false);
  readonly invert = input<MatSliderProps['invert']>(false);
  readonly color = input<MatSliderProps['color']>('primary');
  readonly hint = input<MatSliderProps['hint']>('');
  readonly className = input<MatSliderProps['className']>('');
  readonly appearance = input<MatSliderProps['appearance']>('fill');
}
