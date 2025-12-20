import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { DynamicText, DynamicTextPipe, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { isEqual } from '../../utils/is-equal';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PrimeMultiCheckboxComponent, PrimeMultiCheckboxProps } from './prime-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-multi-checkbox',
  imports: [Checkbox, DynamicTextPipe, AsyncPipe, FormsModule],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let ariaDescribedBy = this.ariaDescribedBy();
    @if (label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group" [class]="groupClasses()" [attr.aria-describedby]="ariaDescribedBy">
      @for (option of options(); track option.value) {
        <div class="checkbox-option">
          <p-checkbox
            [inputId]="key() + '-' + option.value"
            [binary]="false"
            [value]="option.value"
            [(ngModel)]="valueViewModel"
            [disabled]="f().disabled() || option.disabled || false"
          />
          <label [for]="key() + '-' + option.value" class="ml-2">{{ option.label | dynamicText | async }}</label>
        </div>
      }
    </div>
    @if (props()?.hint; as hint) {
      <small class="p-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
    }
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <small class="p-error" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</small>
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

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeMultiCheckboxFieldComponent<T extends ValueType> implements PrimeMultiCheckboxComponent<T> {
  readonly field = input.required<FieldTree<T[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeMultiCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly groupClasses = computed(() => {
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

  valueViewModel = linkedSignal<T[]>(() => this.field()().value(), { equal: isEqual });

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

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

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedValues]) => {
      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]) => {
      const values = options.map((option) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in prime-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }
}
