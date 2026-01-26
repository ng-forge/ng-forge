import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormField, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let checkboxId = key() + '-checkbox';

    <mat-checkbox
      [id]="checkboxId"
      [formField]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="effectiveDisableRipple()"
      [required]="!!f().required()"
      [attr.aria-describedby]="ariaDescribedBy()"
      [attr.tabindex]="tabIndex()"
      [attr.hidden]="f().hidden() || null"
    >
      {{ label() | dynamicText | async }}
    </mat-checkbox>

    @if (errorsToDisplay()[0]; as error) {
      <mat-error [id]="errorId()" [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent implements MatCheckboxComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatCheckboxProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveDisableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Apply meta attributes to the internal checkbox input
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="checkbox"]',
    });
  }

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

  /**
   * Workaround: Angular Material's MatCheckbox does NOT set aria-required on its internal
   * input element when [required] is passed, even though it sets the native required attribute.
   * This effect imperatively sets/removes aria-required on the internal input.
   *
   * Bug: MatCheckbox sets `required` attribute but not `aria-required` for screen readers.
   * @see https://github.com/angular/components/issues/XXXXX (TODO: file issue)
   *
   * Uses afterRenderEffect to ensure DOM is ready before manipulating attributes.
   */
  private readonly syncAriaRequiredToDom = afterRenderEffect(() => {
    const isRequired = this.ariaRequired();
    const inputEl = this.elementRef.nativeElement.querySelector('input[type="checkbox"]');
    if (inputEl) {
      if (isRequired) {
        inputEl.setAttribute('aria-required', 'true');
      } else {
        inputEl.removeAttribute('aria-required');
      }
    }
  });

  /**
   * Workaround: Angular Material's MatCheckbox does NOT propagate aria-describedby to its internal
   * input element. This effect imperatively sets/removes aria-describedby on the internal input.
   *
   * Uses afterRenderEffect to ensure DOM is ready before querying internal elements.
   */
  private readonly syncAriaDescribedByToDom = afterRenderEffect(() => {
    const describedBy = this.ariaDescribedBy();
    const inputEl = this.elementRef.nativeElement.querySelector('input[type="checkbox"]');
    if (inputEl) {
      if (describedBy) {
        inputEl.setAttribute('aria-describedby', describedBy);
      } else {
        inputEl.removeAttribute('aria-describedby');
      }
    }
  });
}
