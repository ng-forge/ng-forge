import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';

export interface BsRadioGroupProps {
  /**
   * Display radio buttons inline (horizontal)
   */
  inline?: boolean;
  /**
   * Reverse the position of the radio button and label
   */
  reverse?: boolean;
  /**
   * Display as button group instead of radio buttons
   */
  buttonGroup?: boolean;
  /**
   * Button size when using button group
   */
  buttonSize?: 'sm' | 'lg';
  /**
   * Hint text to display below the radio group
   */
  hint?: DynamicText;
}

@Component({
  selector: 'df-bs-radio-group',
  imports: [DynamicTextPipe, AsyncPipe],
  template: `
    @let props = properties();
    @if (props?.buttonGroup) {
      <div class="btn-group" role="group" [attr.aria-label]="label() | dynamicText | async">
        @for (option of options(); track option.value; let i = $index) {
          <input
            type="radio"
            [name]="name()"
            [value]="option.value"
            [checked]="value() === option.value"
            (change)="onRadioChange(option.value)"
            [disabled]="disabled() || option.disabled || false"
            [attr.aria-describedby]="ariaDescribedBy()"
            class="btn-check"
            [id]="name() + '_' + i"
            autocomplete="off"
          />
          <label
            class="btn btn-outline-primary"
            [class.btn-sm]="props?.buttonSize === 'sm'"
            [class.btn-lg]="props?.buttonSize === 'lg'"
            [for]="name() + '_' + i"
          >
            {{ option.label | dynamicText | async }}
          </label>
        }
      </div>
    } @else {
      @for (option of options(); track option.value; let i = $index) {
        <div class="form-check" [class.form-check-inline]="props?.inline" [class.form-check-reverse]="props?.reverse">
          <input
            type="radio"
            [name]="name()"
            [value]="option.value"
            [checked]="value() === option.value"
            (change)="onRadioChange(option.value)"
            [disabled]="disabled() || option.disabled || false"
            [attr.aria-describedby]="ariaDescribedBy()"
            class="form-check-input"
            [id]="name() + '_' + i"
          />
          <label class="form-check-label" [for]="name() + '_' + i">
            {{ option.label | dynamicText | async }}
          </label>
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BsRadioGroupComponent implements FormValueControl<ValueType | undefined> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Value model - FormField directive binds form value to this
  readonly value = model<ValueType | undefined>(undefined);

  // Optional FormValueControl properties - Field directive will bind these
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly name = input<string>('');

  // Component-specific inputs
  readonly label = input<DynamicText>();
  readonly options = input.required<FieldOption<ValueType>[]>();
  readonly properties = input<BsRadioGroupProps>();
  readonly meta = input<FieldMeta>();

  // Accessibility - this will be provided by parent component through input
  readonly ariaDescribedBy = input<string | null>(null);

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input[type="radio"]', dependents: [this.options] });
  }

  /**
   * Handle radio button change event
   */
  protected onRadioChange(newValue: ValueType): void {
    if (!this.disabled() && !this.readonly()) {
      this.value.set(newValue);
    }
  }
}
