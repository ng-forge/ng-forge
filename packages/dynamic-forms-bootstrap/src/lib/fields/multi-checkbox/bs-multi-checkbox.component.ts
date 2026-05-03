import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { isEqual, NgForgeField, provideSkipMetaTarget, setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { BsMultiCheckboxProps } from './bs-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-multi-checkbox',
  imports: [DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  // Skip directive-owned meta tracking; we set up manual tracking with `dependents: [this.options]`
  // since the dynamic checkbox inputs need to be re-decorated when options change.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = formFieldTree();
    @let checked = checkedValuesMap();
    @if (field.label(); as label) {
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
            [id]="field.key() + '_' + i"
            [checked]="checked['' + option.value]"
            [disabled]="f().disabled() || option.disabled"
            (change)="onCheckboxChange(option, $event)"
            class="form-check-input"
            [class.is-invalid]="f().invalid() && f().touched()"
            [attr.tabindex]="field.tabIndex()"
            [attr.aria-invalid]="field.ariaInvalid()"
            [attr.aria-required]="field.ariaRequired()"
            [attr.aria-describedby]="field.ariaDescribedBy()"
          />
          <label [for]="field.key() + '_' + i" class="form-check-label">
            {{ option.label | dynamicText | async }}
          </label>
        </div>
      }
    </div>

    @if (field.errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
    } @else if (props()?.hint; as hint) {
      <div class="form-text" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsMultiCheckboxFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<BsMultiCheckboxProps>();

  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType[]>);

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
      const currentValues = this.formFieldTree()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    // Manual meta tracking: dependents reference instance signals, which the
    // declarative `provideMetaTarget` provider can't accept.
    setupMetaTracking(this.elementRef, this.field.meta, {
      selector: 'input[type="checkbox"]',
      dependents: [this.options],
    });

    explicitEffect([this.valueViewModel], ([selectedOptions]: [FieldOption<ValueType>[]]) => {
      const selectedValues = selectedOptions.map((option: FieldOption<ValueType>) => option.value);

      if (!isEqual(selectedValues, this.formFieldTree()().value())) {
        this.formFieldTree()().value.set(selectedValues);
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
}
