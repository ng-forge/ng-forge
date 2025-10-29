import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatHint } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatSelectComponent, MatSelectProps } from './mat-select.type';
import { SelectOption } from '@ng-forge/dynamic-form';

@Component({
  selector: 'df-mat-select',
  imports: [FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatErrorsComponent],
  template: `
    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <mat-select
        [(ngModel)]="value"
        [placeholder]="placeholder() || ''"
        [multiple]="props()?.multiple || false"
        [disabled]="disabled()"
        [compareWith]="props()?.compareWith || defaultCompare"
        (blur)="touched.set(true)"
      >
        @for (option of options(); track option.value) {
        <mat-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label }}
        </mat-option>
        }
      </mat-select>

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSelectFieldComponent<T> implements FormValueControl<T>, MatSelectComponent<T> {
  readonly value = model<T>(undefined as T);

  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<readonly SelectOption<T>[]>([]);
  readonly props = input<MatSelectProps<T>>();

  defaultCompare = Object.is;
}
