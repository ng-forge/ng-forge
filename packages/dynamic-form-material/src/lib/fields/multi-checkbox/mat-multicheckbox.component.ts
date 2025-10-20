import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatError, MatFormField, MatFormFieldAppearance, MatHint, MatLabel } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MulticheckboxField, MulticheckboxOption } from '@ng-forge/dynamic-form';

/**
 * Material Design multi-checkbox field component
 */
@Component({
  selector: 'df-mat-multi-checkbox',
  imports: [FormsModule, MatFormField, MatLabel, MatHint, MatError, MatCheckbox],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
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
      <mat-hint>{{ hint }}</mat-hint>
      } @if (invalid() && touched()) {
      <mat-error>
        @for (error of errors(); track error) {
        <span>{{ error.message }}</span>
        }
      </mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
      }

      mat-checkbox {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMultiCheckboxFieldComponent implements FormValueControl<any[]>, MulticheckboxField {
  // FormValueControl implementation
  readonly value = model<any[]>([]);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // MulticheckboxField implementation
  readonly label = input.required<string>();
  readonly options = input.required<MulticheckboxOption[]>();
  readonly required = input<boolean>(false);
  readonly color = input<'primary' | 'accent' | 'warn'>('primary');
  readonly labelPosition = input<'before' | 'after'>('after');
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<MatFormFieldAppearance>('fill');

  isChecked(optionValue: any): boolean {
    return this.value().includes(optionValue);
  }

  onCheckboxChange(optionValue: any, checked: boolean): void {
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
