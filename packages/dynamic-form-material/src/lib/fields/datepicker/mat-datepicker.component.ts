import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatErrorsComponent } from '../../shared/mat-errors.component';

@Component({
  selector: 'df-mat-datepicker',
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatErrorsComponent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatNativeDateModule,
  ],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [subscriptSizing]="subscriptSizing()" [class]="className() || ''">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <input
        matInput
        [matDatepicker]="picker"
        [(ngModel)]="value"
        [placeholder]="placeholder() || ''"
        [disabled]="disabled()"
        [min]="minDate()"
        [max]="maxDate()"
        [attr.tabindex]="tabIndex()"
        (blur)="touched.set(true)"
      />

      <mat-datepicker-toggle matIconSuffix [for]="$any(picker)"></mat-datepicker-toggle>
      <mat-datepicker #picker [startAt]="startAt()" [startView]="startView() || 'month'" [touchUi]="touchUi() || false"></mat-datepicker>

      @if (hint(); as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatDatepickerFieldComponent implements FormValueControl<Date | null> {
  readonly value = model<Date | null>(null);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly required = input<boolean>(false);

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly startAt = input<Date | null>(null);
  readonly startView = input<'month' | 'year' | 'multi-year'>('month');
  readonly touchUi = input<boolean>(false);
  readonly hint = input<string>('');
  readonly tabIndex = input<number>();
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('fixed');
}
