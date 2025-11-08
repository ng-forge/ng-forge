import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import {
  DynamicText, DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { PrimeDatepickerComponent, PrimeDatepickerProps } from './prime-datepicker.type';
import { AsyncPipe } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';

/**
 * PrimeNG datepicker field component
 */
@Component({
  selector: 'df-prime-datepicker',
  imports: [DatePicker, Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
      <label [for]="key()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
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
        [styleClass]="props()?.styleClass || ''"
      />

      @if (props()?.hint; as hint) {
      <small class="p-hint">{{ hint | dynamicText | async }}</small>
      }

      @if (showErrors()) {
      @for (error of resolvedErrors(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    }
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
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
