import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { BsInputComponent, BsInputProps } from './bs-input.type';
import { AsyncPipe } from '@angular/common';
import { BOOTSTRAP_CONFIG } from '../../models/bootstrap-config.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-bs-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field(); @let p = props(); @let inputId = key() + '-input';
    @if (effectiveFloatingLabel()) {
      <!-- Floating label variant -->
      <div class="form-floating mb-3">
        <input
          #inputRef
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid()"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-describedby]="ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="effectiveSize() === 'sm'"
          [class.form-control-lg]="effectiveSize() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (label()) {
          <label [for]="inputId">{{ label() | dynamicText | async }}</label>
        }
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
        }
      </div>
    } @else {
      <!-- Standard variant -->
      <div class="mb-3">
        @if (label()) {
          <label [for]="inputId" class="form-label">{{ label() | dynamicText | async }}</label>
        }
        <input
          #inputRef
          [formField]="f"
          [id]="inputId"
          [type]="p?.type ?? 'text'"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [attr.tabindex]="tabIndex()"
          [attr.aria-invalid]="ariaInvalid()"
          [attr.aria-required]="ariaRequired()"
          [attr.aria-describedby]="ariaDescribedBy()"
          class="form-control"
          [class.form-control-sm]="effectiveSize() === 'sm'"
          [class.form-control-lg]="effectiveSize() === 'lg'"
          [class.form-control-plaintext]="p?.plaintext"
          [class.is-invalid]="f().invalid() && f().touched()"
          [class.is-valid]="f().valid() && f().touched() && p?.validFeedback"
        />
        @if (p?.validFeedback && f().valid() && f().touched()) {
          <div class="valid-feedback d-block">
            {{ p?.validFeedback | dynamicText | async }}
          </div>
        }
        @if (errorsToDisplay()[0]; as error) {
          <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
        } @else if (p?.hint) {
          <div class="form-text" [id]="hintId()">{{ p?.hint | dynamicText | async }}</div>
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<BsInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
  readonly meta = input<InputMeta>();

  /**
   * Reference to the native input element.
   * Used to imperatively sync the readonly attribute since Angular Signal Forms'
   * [field] directive doesn't sync FieldState.readonly() to the DOM.
   */
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  /**
   * Computed signal that extracts the readonly state from the field.
   * Used by the effect to reactively sync the readonly attribute to the DOM.
   */
  private readonly isReadonly = computed(() => this.field()().readonly());

  /**
   * Workaround: Angular Signal Forms' [field] directive does NOT sync the readonly
   * attribute to the DOM. This effect imperatively sets/removes the readonly attribute
   * on the native input element whenever the readonly state changes.
   *
   * Uses afterRenderEffect to ensure DOM is ready before manipulating attributes.
   */
  private readonly syncReadonlyToDom = afterRenderEffect({
    write: () => {
      const inputRef = this.inputRef();
      const isReadonly = this.isReadonly();
      if (inputRef?.nativeElement) {
        if (isReadonly) {
          inputRef.nativeElement.setAttribute('readonly', '');
        } else {
          inputRef.nativeElement.removeAttribute('readonly');
        }
      }
    },
  });

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }

  readonly effectiveSize = computed(() => this.props()?.size ?? this.bootstrapConfig?.size);
  readonly effectiveFloatingLabel = computed(() => this.props()?.floatingLabel ?? this.bootstrapConfig?.floatingLabel ?? false);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

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

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
