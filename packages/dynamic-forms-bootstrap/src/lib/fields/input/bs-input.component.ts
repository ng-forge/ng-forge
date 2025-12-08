import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { BsInputComponent, BsInputProps } from './bs-input.type';
import { AsyncPipe } from '@angular/common';
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';

@Component({
  selector: 'df-bs-input',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props(); @let effectiveSize = this.effectiveSize();
    @let effectiveFloatingLabel = this.effectiveFloatingLabel();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();
    @if (effectiveFloatingLabel) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        @switch (p?.type ?? 'text') {
          @case ('email') {
            <input
              type="email"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('password') {
            <input
              type="password"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('number') {
            <input
              type="number"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('tel') {
            <input
              type="tel"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('url') {
            <input
              type="url"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @default {
            <input
              type="text"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
        }
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
        @switch (p?.type ?? 'text') {
          @case ('email') {
            <input
              type="email"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('password') {
            <input
              type="password"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('number') {
            <input
              type="number"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('tel') {
            <input
              type="tel"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @case ('url') {
            <input
              type="url"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
          @default {
            <input
              type="text"
              [field]="f"
              [id]="key()"
              [placeholder]="(placeholder() | dynamicText | async) ?? ''"
              [attr.tabindex]="tabIndex()"
              [attr.aria-invalid]="ariaInvalid"
              [attr.aria-required]="ariaRequired"
              [attr.aria-describedby]="ariaDescribedBy"
              class="form-control"
              [class.form-control-sm]="effectiveSize === 'sm'"
              [class.form-control-lg]="effectiveSize === 'lg'"
              [class.form-control-plaintext]="p?.plaintext"
              [class.is-invalid]="f().invalid() && f().touched()"
              [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
            />
          }
        }
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
export default class BsInputFieldComponent implements BsInputComponent {
  private bootstrapConfig = inject(BOOTSTRAP_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveSize = computed(() => this.props()?.size ?? this.bootstrapConfig?.size);
  readonly effectiveFloatingLabel = computed(() => this.props()?.floatingLabel ?? this.bootstrapConfig?.floatingLabel ?? false);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the help text element, used for aria-describedby */
  protected readonly helpTextId = computed(() => `${this.key()}-help`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-invalid: true when field is invalid AND touched, false otherwise */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** aria-required: true if field is required, null otherwise (to remove attribute) */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby: links to help text and error messages for screen readers */
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
