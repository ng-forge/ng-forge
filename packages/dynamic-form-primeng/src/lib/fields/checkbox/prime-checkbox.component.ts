import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { Checkbox } from 'primeng/checkbox';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeCheckboxComponent, PrimeCheckboxProps } from './prime-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-checkbox',
  imports: [Checkbox, PrimeErrorsComponent, Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let checkboxId = key() + '-checkbox';

    <div class="flex items-center">
      <p-checkbox
        [field]="f"
        [inputId]="checkboxId"
        [binary]="props()?.binary ?? true"
        [trueValue]="props()?.trueValue ?? true"
        [falseValue]="props()?.falseValue ?? false"
        [styleClass]="props()?.styleClass"
        [attr.tabindex]="tabIndex()"
        [attr.hidden]="f().hidden() || null"
      />
      @if (label(); as labelText) {
      <label [for]="checkboxId" class="ml-2">{{ labelText | dynamicText | async }}</label>
      }
    </div>

    @if (props()?.hint; as hint) {
    <small class="p-hint" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    }
    <df-prime-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" [attr.hidden]="f().hidden() || null" />
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
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeCheckboxFieldComponent implements PrimeCheckboxComponent {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeCheckboxProps>();
}
