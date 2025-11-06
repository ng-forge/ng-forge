import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { BsErrorsComponent } from '../../shared/bs-errors.component';
import { BsSliderComponent, BsSliderProps } from './bs-slider.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-slider',
  imports: [Field, BsErrorsComponent, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="mb-3">
      @if (label(); as label) {
        <label [for]="key()" class="form-label">
          {{ label | dynamicText | async }}
          @if (props()?.showValue) {
            <span class="ms-2 badge bg-secondary">
              {{ props()?.valuePrefix }}{{ f().value() }}{{ props()?.valueSuffix }}
            </span>
          }
        </label>
      }

      <input
        type="range"
        [field]="f"
        [id]="key()"
        [min]="minValue()"
        [max]="maxValue()"
        [step]="step()"
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
        class="form-range"
      />

      @if (props()?.helpText; as helpText) {
        <div class="form-text">
          {{ helpText | dynamicText | async }}
        </div>
      }

      <df-bs-errors
        [errors]="f().errors()"
        [invalid]="f().invalid()"
        [touched]="f().touched()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsSliderFieldComponent implements BsSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly step = input<number>(1);

  readonly props = input<BsSliderProps>();
}
