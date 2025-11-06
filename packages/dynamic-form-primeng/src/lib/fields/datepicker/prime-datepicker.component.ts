import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeDatepickerComponent, PrimeDatepickerProps } from './prime-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';

/**
 * PrimeNG datepicker field component
 */
@Component({
  selector: 'df-prime-datepicker',
  imports: [DatePicker, Field, PrimeErrorsComponent, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div class="p-field">
      @if (label()) {
      <label [for]="key()">{{ label() | dynamicText | async }}</label>
      }

      <p-datepicker
        [inputId]="key()"
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [dateFormat]="props()?.dateFormat || 'mm/dd/yy'"
        [inline]="props()?.inline ?? false"
        [showIcon]="props()?.showIcon ?? true"
        [showButtonBar]="props()?.showButtonBar ?? false"
        [selectionMode]="props()?.selectionMode || 'single'"
        [touchUI]="props()?.touchUI ?? false"
        [view]="props()?.view || 'date'"
        [minDate]="minDate()"
        [maxDate]="maxDate()"
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
export default class PrimeDatepickerFieldComponent implements PrimeDatepickerComponent {
  readonly field = input.required<FieldTree<Date | null>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<PrimeDatepickerProps>();
}
