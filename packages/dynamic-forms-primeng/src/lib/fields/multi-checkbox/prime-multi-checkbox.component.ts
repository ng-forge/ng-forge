import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, isEqual, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PrimeMultiCheckboxComponent, PrimeMultiCheckboxProps } from './prime-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-prime-multi-checkbox',
  imports: [Checkbox, FormsModule, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let checked = checkedValuesMap();
    @if (label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group" [class]="groupClasses()" [attr.aria-describedby]="ariaDescribedBy()">
      @for (option of options(); track option.value) {
        <div class="checkbox-option">
          <p-checkbox
            [inputId]="key() + '-' + option.value"
            [binary]="true"
            [ngModel]="checked['' + option.value] || false"
            (onChange)="onCheckboxChange(option, $event)"
            [disabled]="f().disabled() || option.disabled || false"
          />
          <label [for]="key() + '-' + option.value" class="ml-2">{{ option.label | dynamicText | async }}</label>
        </div>
      }
    </div>
    @if (errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
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
export default class PrimeMultiCheckboxFieldComponent implements PrimeMultiCheckboxComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<ValueType[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeMultiCheckboxProps>();
  readonly meta = input<FieldMeta>();
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

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  /** Computed map of checked option values for O(1) lookup in template */
  readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  onCheckboxChange(option: FieldOption<ValueType>, event: CheckboxChangeEvent): void {
    const checked = event.checked;
    this.valueViewModel.update((currentOptions: FieldOption<ValueType>[]) => {
      if (checked) {
        return currentOptions.some((opt: FieldOption<ValueType>) => opt.value === option.value)
          ? currentOptions
          : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt: FieldOption<ValueType>) => opt.value !== option.value);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );

  constructor() {
    // Apply meta attributes to all checkbox inputs, re-apply when options change
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="checkbox"]',
      dependents: [this.options],
    });

    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<ValueType>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<ValueType>) => option.value);

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
