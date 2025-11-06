import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { AsyncPipe } from '@angular/common';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeSelectComponent, PrimeSelectProps } from './prime-select.type';

@Component({
  selector: 'df-prime-select',
  imports: [Field, Select, MultiSelect, DynamicTextPipe, AsyncPipe, PrimeErrorsComponent],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
      <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      } @if (isMultiple()) {
      <p-multiSelect
        [field]="f"
        [inputId]="key()"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="props()?.styleClass ?? ''"
      />
      } @else {
      <p-select
        [inputId]="key()"
        [options]="options()"
        optionLabel="label"
        optionValue="value"
        [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
        [filter]="props()?.filter ?? false"
        [showClear]="props()?.showClear ?? false"
        [styleClass]="props()?.styleClass ?? ''"
      />
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
export default class PrimeSelectFieldComponent<T> implements PrimeSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeSelectProps<T>>();

  readonly isMultiple = computed(() => this.props()?.multiple ?? false);
}
