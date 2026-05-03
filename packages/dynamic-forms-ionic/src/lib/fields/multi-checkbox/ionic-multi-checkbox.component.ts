import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { IonCheckbox, IonItem, IonNote } from '@ionic/angular/standalone';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { isEqual, NgForgeField, provideSkipMetaTarget, setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { IonicMultiCheckboxProps } from './ionic-multi-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-multi-checkbox',
  imports: [IonCheckbox, IonItem, IonNote, DynamicTextPipe, AsyncPipe],
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  // Skip directive-owned meta tracking; we set up manual tracking with `dependents: [this.options]`
  // since the dynamic ion-checkbox elements need to be re-decorated when options change.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = formFieldTree();
    @let checked = checkedValuesMap();
    @if (field.label(); as label) {
      <div class="checkbox-group-label">{{ label | dynamicText | async }}</div>
    }

    <div
      class="checkbox-group"
      role="group"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
      [class.ion-invalid]="field.showErrors()"
      [class.ion-touched]="f().touched()"
    >
      @for (option of options(); track option.value) {
        <ion-item lines="none">
          <ion-checkbox
            [checked]="checked['' + option.value]"
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

    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</ion-note>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicMultiCheckboxFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<IonicMultiCheckboxProps>();

  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<ValueType[]>);

  valueViewModel = linkedSignal<FieldOption<ValueType>[]>(
    () => {
      const currentValues = this.formFieldTree()().value();
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

  constructor() {
    // Manual meta tracking: dependents reference instance signals, which the
    // declarative `provideMetaTarget` provider can't accept.
    setupMetaTracking(this.elementRef, this.field.meta, {
      selector: 'ion-checkbox',
      dependents: [this.options],
    });

    explicitEffect([this.valueViewModel], ([selectedOptions]) => {
      const selectedValues = selectedOptions.map((option) => option.value);

      if (!isEqual(selectedValues, this.formFieldTree()().value())) {
        this.formFieldTree()().value.set(selectedValues);
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

  onCheckboxChange(option: FieldOption<ValueType>, checked: boolean): void {
    this.valueViewModel.update((currentOptions) => {
      if (checked) {
        return currentOptions.some((opt) => opt.value === option.value) ? currentOptions : [...currentOptions, option];
      } else {
        return currentOptions.filter((opt) => opt.value !== option.value);
      }
    });
  }
}
