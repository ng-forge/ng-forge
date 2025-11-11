import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { PrimeTextareaComponent, PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'df-prime-textarea',
  imports: [TextareaModule, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
      <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <textarea
        pInputTextarea
        [id]="inputId()"
        [(ngModel)]="f().value"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [attr.maxlength]="props()?.maxlength ?? null"
        [autoResize]="props()?.autoResize ?? false"
        [attr.tabindex]="tabIndex()"
        [class]="textareaClasses()"
        [disabled]="f().disabled()"
        [readonly]="f().readonly()"
      ></textarea>

      @if (props()?.hint; as hint) {
      <small class="df-prime-hint">{{ hint | dynamicText | async }}</small>
      } @for (error of errorsToDisplay(); track error.kind) {
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
export default class PrimeTextareaFieldComponent implements PrimeTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeTextareaProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly textareaClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }

    // Add p-invalid class when there are errors to display
    if (this.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }

    return classes.join(' ');
  });

  readonly inputId = computed(() => `${this.key()}-textarea`);
}
