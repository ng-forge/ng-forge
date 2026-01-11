import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { MatCheckboxComponent, MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { explicitEffect } from 'ngxtension/explicit-effect';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormField, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaDescribedBy = this.ariaDescribedBy();

    <mat-checkbox
      [formField]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="effectiveDisableRipple()"
      [required]="!!f().required()"
      [aria-describedby]="ariaDescribedBy"
      [attr.tabindex]="tabIndex()"
      [attr.hidden]="f().hidden() || null"
    >
      {{ label() | dynamicText | async }}
    </mat-checkbox>

    @if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <mat-error [id]="errorId() + '-' + i" [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
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
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.props()?.hint) {
      ids.push(this.hintId());
    }

    const errors = this.errorsToDisplay();
    errors.forEach((_, i) => {
      ids.push(`${this.errorId()}-${i}`);
    });

    return ids.join(' ');
  });

  /**
   * Workaround: Angular Material's MatCheckbox does NOT set aria-required on its internal
   * input element when [required] is passed, even though it sets the native required attribute.
   * This effect imperatively sets/removes aria-required on the internal input.
   *
   * Bug: MatCheckbox sets `required` attribute but not `aria-required` for screen readers.
   * @see https://github.com/angular/components/issues/XXXXX (TODO: file issue)
   */
  private readonly syncAriaRequiredToDom = explicitEffect([this.ariaRequired], ([isRequired]) => {
    const inputEl = this.elementRef.nativeElement.querySelector('input[type="checkbox"]');
    if (inputEl) {
      if (isRequired) {
        inputEl.setAttribute('aria-required', 'true');
      } else {
        inputEl.removeAttribute('aria-required');
      }
    }
  });
}
