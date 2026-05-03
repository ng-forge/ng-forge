import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import {
  isEqual,
  NgForgeField,
  NG_FORGE_FIELD_INPUTS,
  provideSkipMetaTarget,
  setupMetaTracking,
} from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PrimeMultiCheckboxProps } from './prime-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-multi-checkbox',
  imports: [Checkbox, FormsModule, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  // Skip directive-owned meta tracking; we set up manual tracking with `dependents: [this.options]`
  // since the dynamic radio-style inputs need to be re-decorated when options change.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = formFieldTree();
    @let checked = checkedValuesMap();
    @if (field.label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div class="checkbox-group" [class]="groupClasses()" [attr.aria-describedby]="field.ariaDescribedBy()">
      @for (option of options(); track option.value) {
        <div class="checkbox-option">
          <p-checkbox
            [inputId]="field.key() + '-' + option.value"
            [binary]="true"
            [ngModel]="checked['' + option.value] || false"
            (onChange)="onCheckboxChange(option, $event)"
            [disabled]="f().disabled() || option.disabled || false"
          />
          <label [for]="field.key() + '-' + option.value" class="ml-2">{{ option.label | dynamicText | async }}</label>
        </div>
      }
    </div>
    @if (field.errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</small>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeMultiCheckboxFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeMultiCheckboxProps>();

  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType[]>);

  protected readonly groupClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    if (this.field.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }
    return classes.join(' ');
  });

  protected valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.formFieldTree()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  /** Computed map of checked option values for O(1) lookup in template */
  protected readonly checkedValuesMap = computed(() => {
    const map: Record<string, boolean> = {};
    for (const opt of this.valueViewModel()) {
      map[String(opt.value)] = true;
    }
    return map;
  });

  protected onCheckboxChange(option: FieldOption<ValueType>, event: CheckboxChangeEvent): void {
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
