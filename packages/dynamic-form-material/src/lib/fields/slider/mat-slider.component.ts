import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatSliderComponent, MatSliderProps } from './mat-slider.type';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'df-mat-slider',
  imports: [MatSlider, MatSliderThumb, MatErrorsComponent, MatError],
  template: `
    @let f = field(); @if (label(); as label) {
    <div class="slider-label">{{ label }}</div>
    }

    <mat-slider
      [min]="minValue()"
      [max]="maxValue()"
      [step]="step()"
      [discrete]="props()?.thumbLabel || props()?.showThumbLabel"
      [showTickMarks]="props()?.tickInterval !== undefined"
      [color]="props()?.color || 'primary'"
      class="slider-container"
    >
      <input matSliderThumb [(value)]="f().value" [attr.tabindex]="tabIndex()" />
    </mat-slider>

    @if (props()?.hint; as hint) {
    <div class="mat-hint">{{ hint }}</div>
    }
    <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSliderFieldComponent implements MatSliderComponent {
  readonly field = input.required<FieldTree<number>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);

  readonly props = input<MatSliderProps>();
}
