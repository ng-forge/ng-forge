import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'df-mat-datepicker',
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatError,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatNativeDateModule,
  ],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className() || ''">
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
export class MatDatepickerFieldComponent implements FormValueControl<Date | null> {
  readonly value = model<Date | null>(null);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
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
}
