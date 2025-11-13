import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
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
   * Help text to display below the radio group
   */
  helpText?: DynamicText;
}

/**
 * Bootstrap radio group wrapper that implements FormValueControl
 * for proper integration with Angular 21's Field directive
 */
@Component({
  selector: 'df-bs-radio-group',
  imports: [DynamicTextPipe, AsyncPipe],
  template: `
    @let props = properties(); @if (props?.buttonGroup) {
    <div class="btn-group" role="group" [attr.aria-label]="label() | dynamicText | async">
      @for (option of options(); track option.value; let i = $index) {
      <input
        type="radio"
        [name]="name()"
        [value]="option.value"
        [checked]="value() === option.value"
        (change)="onRadioChange(option.value)"
        [disabled]="disabled() || option.disabled || false"
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
    } @else { @for (option of options(); track option.value; let i = $index) {
    <div class="form-check" [class.form-check-inline]="props?.inline" [class.form-check-reverse]="props?.reverse">
      <input
        type="radio"
        [name]="name()"
        [value]="option.value"
        [checked]="value() === option.value"
        (change)="onRadioChange(option.value)"
        [disabled]="disabled() || option.disabled || false"
        class="form-check-input"
        [id]="name() + '_' + i"
      />
      <label class="form-check-label" [for]="name() + '_' + i">
        {{ option.label | dynamicText | async }}
      </label>
    </div>
    } }
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
export class BsRadioGroupComponent<T = unknown> implements FormValueControl<T> {
  // Required by FormValueControl
  readonly value = model.required<T>();

  // Optional FormValueControl properties - Field directive will bind these
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly name = input<string>('');

  // Component-specific inputs
  readonly label = input<DynamicText>();
  readonly options = input.required<FieldOption<T>[]>();
  readonly properties = input<BsRadioGroupProps>();

  /**
   * Handle radio button change event
   */
  protected onRadioChange(newValue: T): void {
    if (!this.disabled() && !this.readonly()) {
      this.value.set(newValue);
    }
  }
}
