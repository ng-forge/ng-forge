import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';

type Option<T> = { value: T; label: string; disabled?: boolean };

@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [FormsModule, MatCheckbox],
  template: `
    <div [class]="className() || ''">
      @if (label(); as label) {
      <div class="checkbox-group-label">{{ label }}</div>
      }

      <div class="checkbox-group">
        @for (option of options(); track option.value) {
        <mat-checkbox
          [checked]="isChecked(option.value)"
          [disabled]="option.disabled || disabled()"
          [color]="color() || 'primary'"
          [labelPosition]="labelPosition() || 'after'"
          (change)="onCheckboxChange(option.value, $event.checked)"
        >
          {{ option.label }}
        </mat-checkbox>
        }
      </div>

      @if (hint(); as hint) {
      <div class="mat-hint">{{ hint }}</div>
      } @if (invalid() && touched()) { @for (error of errors(); track error) {
      <div class="mat-error">{{ error.message }}</div>
      } }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .checkbox-group-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 8px;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-checkbox {
        margin: 0;
      }

      .mat-hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 4px;
      }

      .mat-error {
        font-size: 12px;
        color: #f44336;
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiCheckboxFieldComponent<T> implements FormValueControl<T[]> {
  readonly value = model<T[]>([]);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly options = input.required<Option<T>[]>();
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');

  isChecked(optionValue: T): boolean {
    return this.value().includes(optionValue);
  }

  onCheckboxChange(optionValue: T, checked: boolean): void {
    const currentValue = [...this.value()];

    if (checked) {
      if (!currentValue.includes(optionValue)) {
        currentValue.push(optionValue);
      }
    } else {
      const index = currentValue.indexOf(optionValue);
      if (index > -1) {
        currentValue.splice(index, 1);
      }
    }

    this.value.set(currentValue);
    this.touched.set(true);
  }
}
