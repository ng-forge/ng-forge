import { ChangeDetectionStrategy, Component, ElementRef, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { DynamicTextPipe, FieldMeta, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
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
            (ngModelChange)="value.set($event)"
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
export class PrimeRadioGroupComponent implements FormValueControl<ValueType | undefined> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // Value model - FormField directive binds form value to this
  readonly value = model<ValueType | undefined>(undefined);

  // Optional FormValueControl properties - Field directive will bind these
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly name = input<string>('');

  // Component-specific inputs
  readonly options = input.required<FieldOption<ValueType>[]>();
  readonly properties = input<PrimeRadioGroupProps>();
  readonly meta = input<FieldMeta>();

  constructor() {
    // Apply meta attributes to all radio inputs, re-apply when options change
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }
}
