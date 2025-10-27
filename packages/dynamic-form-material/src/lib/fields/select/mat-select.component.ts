import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatHint } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';

type Option<T> = { value: T; label: string; disabled?: boolean };

@Component({
  selector: 'df-mat-select',
  imports: [FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatErrorsComponent],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [subscriptSizing]="subscriptSizing()" [class]="className() || ''">
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
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
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

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly options = input.required<Option<T>[]>();
  readonly multiple = input<boolean>(false);
  readonly compareWith = input<((o1: T, o2: T) => boolean) | undefined>();
  readonly hint = input<string>('');
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
  readonly required = input<boolean>(false);
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('fixed');
  defaultCompare = Object.is;
}
