import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatHint } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatSelectComponent, MatSelectProps } from './mat-select.type';
import { SelectOption } from '@ng-forge/dynamic-form';

@Component({
  selector: 'df-mat-select',
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatErrorsComponent, Field],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <mat-select
        [field]="f"
        [placeholder]="placeholder() || ''"
        [multiple]="props()?.multiple || false"
        [compareWith]="props()?.compareWith || defaultCompare"
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

      <df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSelectFieldComponent<T> implements MatSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<SelectOption<T>[]>([]);
  readonly props = input<MatSelectProps<T>>();

  defaultCompare = Object.is;
}
