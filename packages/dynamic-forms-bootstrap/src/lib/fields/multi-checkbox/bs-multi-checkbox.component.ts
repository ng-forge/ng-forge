import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { isEqual } from '../../utils/is-equal';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { BsMultiCheckboxComponent, BsMultiCheckboxProps } from './bs-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-multi-checkbox',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();
    @if (label(); as label) {
      <div class="form-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group">
      @for (option of options(); track option.value; let i = $index) {
        <div
          class="form-check"
          [class.form-switch]="props()?.switch"
          [class.form-check-inline]="props()?.inline"
          [class.form-check-reverse]="props()?.reverse"
        >
          <input
            type="checkbox"
            [id]="key() + '_' + i"
            [checked]="isChecked(option)"
            [disabled]="f().disabled() || option.disabled"
            (change)="onCheckboxChange(option, $any($event.target).checked)"
            class="form-check-input"
            [class.is-invalid]="f().invalid() && f().touched()"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid"
            [attr.aria-required]="ariaRequired"
            [attr.aria-describedby]="ariaDescribedBy"
          />
          <label [for]="key() + '_' + i" class="form-check-label">
            {{ option.label | dynamicText | async }}
          </label>
        </div>
      }
    </div>

    @if (props()?.helpText; as helpText) {
      <div class="form-text" [id]="helpTextId()">
        {{ helpText | dynamicText | async }}
      </div>
    }
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <div class="invalid-feedback d-block" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .checkbox-group {
        margin-bottom: 0.5rem;
      }

      :host([hidden]) {
        display: none !important;
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
export default class BsMultiCheckboxFieldComponent<T extends ValueType> implements BsMultiCheckboxComponent<T> {
  readonly field = input.required<FieldTree<T[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<BsMultiCheckboxProps<T>>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  valueViewModel = linkedSignal<FieldOption<T>[]>(
    () => {
      const currentValues = this.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<T>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<T>) => option.value);

      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]: [FieldOption<T>[]]) => {
      const values = options.map((option: FieldOption<T>) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in bs-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<T>, checked: boolean): void {
    this.valueViewModel.update((currentOptions: FieldOption<T>[]) => {
      if (checked) {
        return currentOptions.some((opt: FieldOption<T>) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt: FieldOption<T>) => opt.value !== option.value);
      }
    });
  }

  isChecked(option: FieldOption<T>): boolean {
    return this.valueViewModel().some((opt: FieldOption<T>) => opt.value === option.value);
  }

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
