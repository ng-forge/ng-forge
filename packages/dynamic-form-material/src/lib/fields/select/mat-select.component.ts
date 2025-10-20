import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatFormFieldAppearance, MatLabel } from '@angular/material/form-field';
import { SelectField, SelectOption } from '@ng-forge/dynamic-form';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatHint } from '@angular/material/input';

/**
 * Material Design select field component
 */
@Component({
  selector: 'df-mat-select',
  imports: [FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatError],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
      @if (label()) {
      <mat-label>{{ label() }}</mat-label>
      }

      <mat-select
        [(ngModel)]="value"
        [placeholder]="placeholder() || ''"
        [multiple]="multiple() || false"
        [disabled]="disabled()"
        [compareWith]="compareWith() || defaultCompare"
        (blur)="touched.set(true)"
      >
        @for (option of options(); track option.value) {
        <mat-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label }}
        </mat-option>
        }
      </mat-select>

      @if (hint()) {
      <mat-hint>{{ hint() }}</mat-hint>
      } @if (invalid() && touched()) {
      <mat-error>
        @for (error of errors(); track error) {
        <span>{{ error.message }}</span>
        }
      </mat-error>
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSelectFieldComponent implements FormValueControl<any>, SelectField {
  // FormValueControl implementation
  readonly value = model<any>(null);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // SelectField implementation
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly options = input.required<SelectOption[]>();
  readonly multiple = input<boolean>(false);
  readonly compareWith = input<((o1: unknown, o2: unknown) => boolean) | undefined>();
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<MatFormFieldAppearance>('fill');

  /**
   * Default comparison function
   */
  defaultCompare = Object.is;
}
