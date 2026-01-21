import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, isEqual, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { BsMultiCheckboxComponent, BsMultiCheckboxProps } from './bs-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-bs-multi-checkbox',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let checked = checkedValuesMap();
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
            [checked]="checked['' + option.value]"
            [disabled]="f().disabled() || option.disabled"
            (change)="onCheckboxChange(option, $event)"
            class="form-check-input"
            [class.is-invalid]="f().invalid() && f().touched()"
            [attr.tabindex]="tabIndex()"
            [attr.aria-invalid]="ariaInvalid()"
            [attr.aria-required]="ariaRequired()"
            [attr.aria-describedby]="ariaDescribedBy()"
          />
          <label [for]="key() + '_' + i" class="form-check-label">
            {{ option.label | dynamicText | async }}
          </label>
        </div>
      }
    </div>

    @if (errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="hintId()">{{ hint | dynamicText | async }}</div>
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
export default class BsMultiCheckboxFieldComponent implements BsMultiCheckboxComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<ValueType[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<BsMultiCheckboxProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
  readonly meta = input<FieldMeta>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  /** Computed map of checked option values for O(1) lookup in template */
  readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input[type="checkbox"]', dependents: [this.options] });

    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<ValueType>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<ValueType>) => option.value);

      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]: [FieldOption<ValueType>[]]) => {
      const values = options.map((option: FieldOption<ValueType>) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in bs-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<ValueType>, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
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

  protected readonly hintId = computed(() => `${this.key()}-hint`);
  protected readonly errorId = computed(() => `${this.key()}-error`);

  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
