import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { FieldMeta, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeField, setupMetaTracking } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';

export interface PrimeRadioGroupProps {
  /** Custom CSS class for the radio buttons */
  styleClass?: string;
}

/**
 * PrimeNG radio group implementing FormValueControl. Rendered inside
 * `df-prime-radio` — picks up meta + aria from the ambient parent NgForgeField
 * via `setupMetaTracking` (selector: `'input[type="radio"]'`).
 */
@Component({
  selector: 'df-prime-radio-group',
  imports: [RadioButton, FormsModule, DynamicTextPipe, AsyncPipe],
  host: {
    '[attr.aria-invalid]': 'parentField?.ariaInvalid() || null',
    '[attr.aria-required]': 'parentField?.ariaRequired()',
    '[attr.aria-describedby]': 'parentField?.ariaDescribedBy()',
  },
  template: `
    <div class="radio-group">
      @for (option of options(); track option.value; let i = $index) {
        <div class="radio-option">
          <p-radiobutton
            [name]="name()"
            [value]="option.value"
            [ngModel]="value()"
            (ngModelChange)="value.set($event)"
            (onBlur)="onBlur()"
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
// Note: FormValueControl is from @angular/forms/signals and provides the contract for
// components that expose a `value` model for use with [formField]. This is the same
// pattern used by the Bootstrap radio group adapter (BsRadioGroupComponent).
export class PrimeRadioGroupComponent implements FormValueControl<ValueType | undefined> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly parentField = inject(NgForgeField, { optional: true });

  // Value model - FormField directive binds form value to this
  readonly value = model<ValueType | undefined>(undefined);

  /** Tracks whether the field has been touched - used by Field directive */
  readonly touched = model<boolean>(false);

  // Optional FormValueControl properties - Field directive will bind these
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly name = input<string>('');

  // Component-specific inputs
  readonly options = input.required<FieldOption<ValueType>[]>();
  readonly properties = input<PrimeRadioGroupProps>();

  // Meta reads from the ambient parent NgForgeField.
  protected readonly meta = computed<FieldMeta | undefined>(() => this.parentField?.meta());

  constructor() {
    this.parentField?.markClaimed();
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }

  /** Marks the field as touched when a radio button loses focus */
  protected onBlur(): void {
    this.touched.set(true);
  }
}
