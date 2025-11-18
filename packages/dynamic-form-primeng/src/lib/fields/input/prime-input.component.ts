import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { PrimeInputComponent, PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';

/**
 * PrimeNG input field component
 */
@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, Field],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }
      @switch (props()?.type ?? 'text') {
        @case ('email') {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="email"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
        @case ('password') {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="password"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
        @case ('number') {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="number"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
        @case ('tel') {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="tel"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
        @case ('url') {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="url"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
        @default {
          <input
            pInputText
            [id]="inputId()"
            [field]="f"
            type="text"
            [placeholder]="(placeholder() | dynamicText | async) ?? ''"
            [attr.tabindex]="tabIndex()"
            [class]="inputClasses()"
          />
        }
      }
      @if (props()?.hint; as hint) {
        <small class="df-prime-hint">{{ hint | dynamicText | async }}</small>
      }
      @for (error of errorsToDisplay(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  private primengConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly effectiveVariant = computed(() =>
    this.props()?.variant ?? this.primengConfig?.variant ?? 'outlined'
  );

  readonly effectiveSize = computed(() =>
    this.props()?.size ?? this.primengConfig?.size
  );

  readonly effectiveStyleClass = computed(() =>
    this.props()?.styleClass ?? this.primengConfig?.styleClass
  );

  readonly inputClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.effectiveStyleClass();
    if (styleClass) {
      classes.push(styleClass);
    }

    const size = this.effectiveSize();
    if (size === 'small') {
      classes.push('p-inputtext-sm');
    } else if (size === 'large') {
      classes.push('p-inputtext-lg');
    }

    if (this.effectiveVariant() === 'filled') {
      classes.push('p-filled');
    }

    // Add p-invalid class when there are errors to display
    if (this.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }

    return classes.join(' ');
  });

  readonly inputId = computed(() => `${this.key()}-input`);
}
