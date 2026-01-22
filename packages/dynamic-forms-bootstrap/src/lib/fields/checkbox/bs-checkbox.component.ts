import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { BsCheckboxComponent, BsCheckboxProps } from './bs-checkbox.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-bs-checkbox',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let checkboxId = key() + '-checkbox';

    <div
      class="form-check"
      [class.form-switch]="props()?.switch"
      [class.form-check-inline]="props()?.inline"
      [class.form-check-reverse]="props()?.reverse"
      [attr.hidden]="f().hidden() || null"
    >
      <input
        #checkboxInput
        type="checkbox"
        [formField]="f"
        [id]="checkboxId"
        class="form-check-input"
        [class.is-invalid]="f().invalid() && f().touched()"
        [attr.tabindex]="tabIndex()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-describedby]="ariaDescribedBy()"
      />
      <label [for]="checkboxId" class="form-check-label">
        {{ label() | dynamicText | async }}
      </label>
    </div>

    @if (errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
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
export default class BsCheckboxFieldComponent implements BsCheckboxComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
  readonly meta = input<FieldMeta>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly checkboxInput = viewChild<ElementRef<HTMLInputElement>>('checkboxInput');

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input[type="checkbox"]' });

    // Handle indeterminate state
    effect(() => {
      const indeterminate = this.props()?.indeterminate;
      const inputEl = this.checkboxInput()?.nativeElement;

      if (inputEl && indeterminate !== undefined) {
        inputEl.indeterminate = indeterminate;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  protected readonly hintId = computed(() => `${this.key()}-hint`);
  protected readonly errorId = computed(() => `${this.key()}-error`);

  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
