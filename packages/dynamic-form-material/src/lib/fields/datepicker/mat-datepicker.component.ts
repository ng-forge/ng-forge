import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerField, MatDatepickerProps } from './mat-datepicker.type';

/**
 * Material Design datepicker field component
 */
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
export class MatDatepickerFieldComponent implements FormValueControl<Date | null>, MatDatepickerField {
  // FormValueControl implementation
  readonly value = model<Date | null>(null);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // DatepickerField implementation
  readonly label = input.required<MatDatepickerProps['label']>();
  readonly placeholder = input<MatDatepickerProps['placeholder']>('');
  readonly minDate = input<MatDatepickerProps['minDate']>(null);
  readonly maxDate = input<MatDatepickerProps['maxDate']>(null);
  readonly startAt = input<MatDatepickerProps['startAt']>(null);
  readonly startView = input<MatDatepickerProps['startView']>('month');
  readonly touchUi = input<MatDatepickerProps['touchUi']>(false);
  readonly hint = input<MatDatepickerProps['hint']>('');
  readonly tabIndex = input<MatDatepickerProps['tabIndex']>();
  readonly className = input<MatDatepickerProps['className']>('');
  readonly appearance = input<MatDatepickerProps['appearance']>('fill');
  readonly color = input<MatDatepickerProps['color']>();
  readonly disableRipple = input<MatDatepickerProps['disableRipple']>(false);
}
