import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeSliderComponent, PrimeSliderProps } from './prime-slider.type';
import { AsyncPipe } from '@angular/common';
import { Slider } from 'primeng/slider';

/**
 * PrimeNG slider field component
 */
@Component({
  selector: 'df-prime-slider',
  imports: [Slider, Field, PrimeErrorsComponent, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
      <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <p-slider
        [id]="key()"
        [field]="f"
        [step]="step()"
        [range]="props()?.range || false"
        [orientation]="props()?.orientation || 'horizontal'"
        [attr.tabindex]="tabIndex()"
        [styleClass]="props()?.styleClass || ''"
      />

      @if (props()?.hint; as hint) {
      <small class="p-hint">{{ hint | dynamicText | async }}</small>
      }

      <df-prime-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class PrimeSliderFieldComponent implements PrimeSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);

  readonly props = input<PrimeSliderProps>();
}
