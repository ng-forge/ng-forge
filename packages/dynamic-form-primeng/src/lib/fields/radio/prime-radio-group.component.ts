import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { AsyncPipe } from '@angular/common';

export interface PrimeRadioGroupProps {
  /**
   * Custom CSS class for the radio buttons
   */
  styleClass?: string;
}

/**
 * PrimeNG radio group wrapper that implements FormValueControl
 * for proper integration with Angular 21's Field directive using signal forms
 */
@Component({
  selector: 'df-prime-radio-group',
  imports: [DynamicTextPipe, AsyncPipe],
  template: `
    <div class="radio-group">
      @for (option of options(); track option.value) {
      <div class="radio-option">
        <input
          type="radio"
          [id]="name() + '-' + option.value"
          [name]="name()"
          [value]="option.value"
          [checked]="value() === option.value"
          (change)="onRadioChange(option.value)"
          [disabled]="disabled() || option.disabled || false"
          [class.p-radiobutton]="true"
          [class.p-invalid]="invalid()"
          style="display: none"
        />
        <label [for]="name() + '-' + option.value" class="radio-option-label">
          <span class="p-radiobutton p-component" [class.p-radiobutton-checked]="value() === option.value" [class.p-invalid]="invalid()">
            <span
              class="p-radiobutton-box"
              [class.p-highlight]="value() === option.value"
              [class.p-disabled]="disabled() || option.disabled"
            >
              @if (value() === option.value) {
              <span class="p-radiobutton-icon"></span>
              }
            </span>
          </span>
          <span class="radio-label-text">{{ option.label | dynamicText | async }}</span>
        </label>
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .radio-option-label {
        cursor: pointer;
        user-select: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeRadioGroupComponent<T = unknown> implements FormValueControl<T> {
  // Required by FormValueControl
  readonly value = model.required<T>();

  // Optional FormValueControl properties - Field directive will bind these
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly name = input<string>('');

  // Component-specific inputs
  readonly options = input.required<FieldOption<T>[]>();
  readonly properties = input<PrimeRadioGroupProps>();

  /**
   * Handle radio button change event
   */
  protected onRadioChange(newValue: T): void {
    if (!this.disabled() && !this.readonly()) {
      this.value.set(newValue);
    }
  }
}
