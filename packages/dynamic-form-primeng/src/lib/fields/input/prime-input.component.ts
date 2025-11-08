import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages, createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-form';
import { PrimeInputComponent, PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

/**
 * PrimeNG input field component
 */
@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
      <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <input
        pInputText
        [id]="inputId()"
        [(ngModel)]="f().value"
        (ngModelChange)="onValueChange($event)"
        [attr.type]="props()?.type ?? 'text'"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [class]="inputClasses()"
        [disabled]="f().disabled()"
        [readonly]="f().readonly()"
      />

      @if (props()?.hint; as hint) {
      <small class="df-prime-hint">{{ hint | dynamicText | async }}</small>
      } @if (showErrors()) { @for (error of resolvedErrors(); track error.kind) {
      <small class="p-error">{{ error.message }}</small>
      } }
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
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly inputClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
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

  readonly inputId = computed(() => `${this.key()}-input`);

  onValueChange(value: string): void {
    // Convert to number for number inputs (ngModel returns strings)
    if (this.props()?.type === 'number' && value !== '' && value != null) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        this.field()().value.set(numValue as any);
        return;
      }
    }
    // For other types, value is already set by ngModel
  }
}
