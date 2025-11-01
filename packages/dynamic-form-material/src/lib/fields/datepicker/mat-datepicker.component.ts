import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatDatepickerComponent, MatDatepickerProps } from './mat-datepicker.type';

@Component({
  selector: 'df-mat-datepicker',
  imports: [MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent, MatDatepicker, MatDatepickerInput, MatDatepickerToggle, Field],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <input
        matInput
        [matDatepicker]="picker"
        [field]="f"
        [placeholder]="placeholder() || ''"
        [min]="minDate()"
        [max]="maxDate()"
        [attr.tabindex]="tabIndex()"
      />

      <mat-datepicker-toggle matIconSuffix [for]="$any(picker)" />
      <mat-datepicker #picker [startAt]="startAt()" [startView]="props()?.startView || 'month'" [touchUi]="props()?.touchUi ?? false" />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatDatepickerFieldComponent implements MatDatepickerComponent {
  readonly field = input.required<FieldTree<Date | null>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly props = input<MatDatepickerProps>();
}
