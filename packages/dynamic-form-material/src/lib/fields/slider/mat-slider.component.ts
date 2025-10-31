import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatSliderComponent, MatSliderProps } from './mat-slider.type';

@Component({
  selector: 'df-mat-slider',
  imports: [FormsModule, MatSlider, MatSliderThumb, MatErrorsComponent],
  template: `
    @if (label(); as label) {
    <div class="slider-label">{{ label }}</div>
    }

    <mat-slider
      [min]="minValue()"
      [max]="maxValue()"
      [step]="step()"
      [disabled]="disabled()"
      [discrete]="props()?.thumbLabel || props()?.showThumbLabel"
      [showTickMarks]="props()?.tickInterval !== undefined"
      [color]="props()?.color || 'primary'"
      class="slider-container"
    >
      <input matSliderThumb [(ngModel)]="value" [attr.tabindex]="tabIndex()" (blur)="touched.set(true)" />
    </mat-slider>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }
    <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    class: 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSliderFieldComponent implements FormValueControl<number>, MatSliderComponent {
  readonly value = model.required<number>();

  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);

  readonly props = input<MatSliderProps>();
}
