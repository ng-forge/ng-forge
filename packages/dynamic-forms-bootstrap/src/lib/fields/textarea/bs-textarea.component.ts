import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { BsTextareaComponent, BsTextareaProps } from './bs-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-textarea',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props(); @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();
    @if (p?.floatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <textarea
          [field]="f"
          [id]="key()"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [rows]="p?.rows || 4"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid"
          [attr.aria-required]="ariaRequired"
          [attr.aria-describedby]="ariaDescribedBy"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        ></textarea>

        @if (label()) {
          <label [for]="key()">{{ label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @for (error of errorsToDisplay(); track error.kind; let i = $index) {
          <div class="invalid-feedback d-block" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (label()) {
          <label [for]="key()" class="form-label">{{ label() | dynamicText | async }}</label>
        }

        <textarea
          [field]="f"
          [id]="key()"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [rows]="p?.rows || 4"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid"
          [attr.aria-required]="ariaRequired"
          [attr.aria-describedby]="ariaDescribedBy"
          class="form-control"
          [class.form-control-sm]="p?.size === 'sm'"
          [class.form-control-lg]="p?.size === 'lg'"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        ></textarea>

        @if (p?.helpText) {
          <div class="form-text" [id]="helpTextId()">
            {{ p?.helpText | dynamicText | async }}
          </div>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @for (error of errorsToDisplay(); track error.kind; let i = $index) {
          <div class="invalid-feedback d-block" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</div>
        }
      </div>
    }
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
export default class BsTextareaFieldComponent implements BsTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsTextareaProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  protected readonly helpTextId = computed(() => `${this.key()}-help`);
  protected readonly errorId = computed(() => `${this.key()}-error`);

  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.props()?.helpText) {
      ids.push(this.helpTextId());
    }
    const errors = this.errorsToDisplay();
    errors.forEach((_, i) => {
      ids.push(`${this.errorId()}-${i}`);
    });
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
