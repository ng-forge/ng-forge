import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-forms';
import { AsyncPipe } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';

export interface PrimeRadioGroupProps {
  /**
   * Custom CSS class for the radio buttons
   */
  styleClass?: string;
}

@Component({
  selector: 'df-prime-radio-group',
  imports: [RadioButton, FormsModule, DynamicTextPipe, AsyncPipe],
  template: `
    <div class="radio-group">
      @for (option of options(); track option.value; let i = $index) {
        <div class="radio-option">
          <p-radiobutton
            [name]="name()"
            [value]="option.value"
            [ngModel]="value()"
            (ngModelChange)="onRadioChange($event)"
            [disabled]="disabled() || option.disabled || false"
            [inputId]="name() + '_' + i"
            [styleClass]="properties()?.styleClass"
          />
          <label [for]="name() + '_' + i" class="radio-option-label">{{ option.label | dynamicText | async }}</label>
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
