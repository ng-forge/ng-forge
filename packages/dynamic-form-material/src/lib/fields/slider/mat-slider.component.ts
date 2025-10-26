import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatErrorsComponent } from '../../shared/mat-errors.component';

@Component({
  selector: 'df-mat-slider',
  imports: [FormsModule, MatSlider, MatSliderThumb, MatErrorsComponent],
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
      }
      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSliderFieldComponent implements FormValueControl<number> {
  readonly value = model<number>(0);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);
  readonly thumbLabel = input<boolean>(false);
  readonly showThumbLabel = input<boolean>(false);
  readonly tickInterval = input<number>();
  readonly vertical = input<boolean>(false);
  readonly invert = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
}
