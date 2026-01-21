import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors, TextareaMeta } from '@ng-forge/dynamic-forms/integration';
import { PrimeTextareaComponent, PrimeTextareaProps } from './prime-textarea.type';
import { AsyncPipe } from '@angular/common';
import { PrimeTextareaControlComponent } from './prime-textarea-control.component';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-prime-textarea',
  imports: [DynamicTextPipe, AsyncPipe, FormField, PrimeTextareaControlComponent],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <df-prime-textarea-control
        [id]="inputId()"
        [formField]="f"
        [meta]="meta()"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [maxlength]="props()?.maxlength"
        [tabIndex]="tabIndex()"
        [autoResize]="props()?.autoResize ?? false"
        [ariaDescribedBy]="ariaDescribedBy()"
        [styleClass]="textareaClasses()"
      />

      @if (errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeTextareaProps>();
  readonly meta = input<TextareaMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'textarea' });
  }

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
