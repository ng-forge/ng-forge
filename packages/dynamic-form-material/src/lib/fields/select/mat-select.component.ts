import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatHint } from '@angular/material/input';

type Option<T> = { value: T; label: string; disabled?: boolean };

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
export class MatSelectFieldComponent<T> implements FormValueControl<T> {
  readonly value = model<T>(undefined as T);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly options = input.required<Option<T>[]>();
  readonly multiple = input<boolean>(false);
  readonly compareWith = input<((o1: T, o2: T) => boolean) | undefined>();
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
  readonly required = input<boolean>(false);
  defaultCompare = Object.is;
}
