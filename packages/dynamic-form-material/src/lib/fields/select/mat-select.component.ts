import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatHint } from '@angular/material/input';
import { DynamicText, DynamicTextPipe, FieldOption } from '@ng-forge/dynamic-form';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatSelectComponent, MatSelectProps } from './mat-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-select',
  imports: [MatFormField, MatLabel, MatSelect, MatOption, MatHint, MatErrorsComponent, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label | dynamicText | async }}</mat-label>
      }

      <mat-select
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [multiple]="props()?.multiple || false"
        [compareWith]="props()?.compareWith || defaultCompare"
      >
        @for (option of options(); track option.value) {
        <mat-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label | dynamicText | async }}
        </mat-option>
        }
      </mat-select>

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }

      <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    id: 'key()',
  },
})
export default class MatSelectFieldComponent<T> implements MatSelectComponent<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<MatSelectProps<T>>();

  defaultCompare = Object.is;
}
