import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { PrimeErrorsComponent } from '../../shared/prime-errors.component';
import { PrimeInputComponent, PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';

/**
 * PrimeNG input field component
 */
@Component({
  selector: 'df-prime-input',
  imports: [InputText, Field, PrimeErrorsComponent, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <div class="p-field">
      @if (label()) {
      <label [for]="key()">{{ label() | dynamicText | async }}</label>
      }

      <input
        pInputText
        [id]="key()"
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [class]="inputClasses()"
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
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeInputProps>();

  readonly inputClasses = computed(() => {
    const classes: string[] = [];

    if (this.props()?.styleClass) {
      classes.push(this.props()!.styleClass!);
    }

    if (this.props()?.size === 'small') {
      classes.push('p-inputtext-sm');
    } else if (this.props()?.size === 'large') {
      classes.push('p-inputtext-lg');
    }

    if (this.props()?.variant === 'filled') {
      classes.push('p-filled');
    }

    return classes.join(' ');
  });
}
