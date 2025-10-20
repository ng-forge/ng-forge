import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatHint } from '@angular/material/input';
import { MatSelectField, MatSelectProps } from './mat-select.type';

/**
 * Material Design select field component
 */
@Component({
  selector: 'df-mat-select',
  imports: [FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatError],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className() || ''">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
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
export class MatSelectFieldComponent<T > implements FormValueControl<T>, MatSelectField<T> {
  readonly value = model<T>(undefined as T);
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // SelectField implementation
  readonly label = input.required<MatSelectProps['label']>();
  readonly placeholder = input<MatSelectProps['placeholder']>('');
  readonly options = input.required<MatSelectProps['options']>();
  readonly multiple = input<MatSelectProps['multiple']>(false);
  readonly compareWith = input<MatSelectProps['compareWith']>();
  readonly hint = input<MatSelectProps['hint']>('');
  readonly className = input<MatSelectProps['className']>('');
  readonly appearance = input<MatSelectProps['appearance']>('fill');
  readonly required = input<boolean>(false);

  /**
   * Default comparison function
   */
  defaultCompare = Object.is;
}
