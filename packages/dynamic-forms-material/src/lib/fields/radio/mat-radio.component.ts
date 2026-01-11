import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { MatRadioComponent, MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, FormField, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();

    @if (label()) {
      <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <mat-radio-group
      [formField]="f"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
      [attr.aria-describedby]="ariaDescribedBy"
    >
      @for (option of options(); track option.value) {
        <mat-radio-button
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
        >
          {{ option.label | dynamicText | async }}
        </mat-radio-button>
      }
    </mat-radio-group>

    @if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="hintId()">{{ hint | dynamicText | async }}</div>
    }
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <mat-error [id]="errorId() + '-' + i">{{ error.message }}</mat-error>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  host: {
    '[class]': 'className() || ""',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent<T> implements MatRadioComponent<T> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatRadioProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Apply meta attributes to all radio inputs, re-apply when options change
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
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

    return ids.length > 0 ? ids.join(' ') : null;
  });
}
