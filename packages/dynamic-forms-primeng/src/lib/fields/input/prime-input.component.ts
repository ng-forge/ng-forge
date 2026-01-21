import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { PrimeInputComponent, PrimeInputProps } from './prime-input.type';
import { AsyncPipe } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { PRIMENG_CONFIG } from '../../models/primeng-config.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="inputId()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }
      <input
        #inputRef
        pInputText
        [id]="inputId()"
        [formField]="f"
        [type]="props()?.type ?? 'text'"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-required]="ariaRequired()"
        [attr.aria-describedby]="ariaDescribedBy()"
        [class]="inputClasses()"
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
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private primeNGConfig = inject(PRIMENG_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

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

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeInputProps>();
  readonly meta = input<InputMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }

  readonly effectiveSize = computed(() => this.props()?.size ?? this.primeNGConfig?.size);
  readonly effectiveVariant = computed(() => this.props()?.variant ?? this.primeNGConfig?.variant);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly inputClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
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

    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });

  readonly inputId = computed(() => `${this.key()}-input`);

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
