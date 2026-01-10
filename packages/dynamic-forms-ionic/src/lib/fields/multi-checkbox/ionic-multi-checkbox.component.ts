import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { IonCheckbox, IonItem, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import {
  createResolvedErrorsSignal,
  isEqual,
  setupMetaTracking,
  shouldShowErrors,
  ValueInArrayPipe,
} from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { IonicMultiCheckboxComponent, IonicMultiCheckboxProps } from './ionic-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ionic-multi-checkbox',
  imports: [IonCheckbox, IonItem, IonNote, ValueInArrayPipe, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @if (label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div
      class="checkbox-group"
      role="group"
      [attr.aria-invalid]="isAriaInvalid()"
      [attr.aria-required]="isRequired() || null"
      [class.ion-invalid]="showErrors()"
      [class.ion-touched]="field()().touched()"
    >
      @for (option of options(); track option.value) {
        <ion-item lines="none">
          <ion-checkbox
            [checked]="option | inArray: valueViewModel()"
            [disabled]="f().disabled() || option.disabled"
            [labelPlacement]="props()?.labelPlacement ?? 'end'"
            [justify]="props()?.justify ?? 'start'"
            [color]="props()?.color ?? 'primary'"
            (ionChange)="onCheckboxChange(option, $event.detail.checked)"
          >
            {{ option.label | dynamicText | async }}
          </ion-checkbox>
        </ion-item>
      }
    </div>

    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <ion-note color="danger" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }

      .checkbox-group-label {
        margin-bottom: 8px;
        font-weight: 500;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      ion-item {
        --padding-start: 0;
        --inner-padding-end: 0;
      }
    `,
  ],
  host: {
    '[class]': 'className() || ""',
    '[class.df-invalid]': 'showErrors()',
    '[class.df-touched]': 'field()().touched()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  providers: [ValueInArrayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicMultiCheckboxFieldComponent<T extends ValueType> implements IonicMultiCheckboxComponent<T> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<T[]>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<IonicMultiCheckboxProps<T>>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  readonly errorId = computed(() => `${this.key()}-error`);

  /** Whether the field is currently in an invalid state (invalid AND touched) */
  readonly isAriaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** Whether the field has a required validator */
  readonly isRequired = computed(() => {
    return this.field()().required?.() === true;
  });

  valueViewModel = linkedSignal<FieldOption<T>[]>(
    () => {
      const currentValues = this.field()().value();
      return this.options().filter((option) => currentValues.includes(option.value));
    },
    { equal: isEqual },
  );

  constructor() {
    // Shadow DOM - apply meta to ion-checkbox elements, re-apply when options change
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-checkbox',
      dependents: [this.options],
    });

    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.field()().value())) {
        this.field()().value.set(selectedValues);
      }
    });

    explicitEffect([this.options], ([options]) => {
      const values = options.map((option) => option.value);
      const uniqueValues = new Set(values);

      if (values.length !== uniqueValues.size) {
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        throw new Error(`Duplicate option values detected in ionic-multi-checkbox: ${duplicates.join(', ')}`);
      }
    });
  }

  onCheckboxChange(option: FieldOption<T>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
