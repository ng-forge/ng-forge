import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';

@Component({
  selector: 'df-mat-textarea',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent],
  template: `
    <mat-form-field [appearance]="appearance() || 'fill'" [class]="className() || ''">
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <textarea
        matInput
        [(ngModel)]="value"
        [placeholder]="placeholder() || ''"
        [disabled]="disabled()"
        [rows]="rows() || 4"
        [cols]="cols()"
        [maxlength]="maxlength() || null"
        [attr.tabindex]="tabIndex()"
        [style.resize]="resize() || 'vertical'"
        (blur)="touched.set(true)"
      ></textarea>

      @if (hint(); as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTextareaFieldComponent implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);
  readonly cols = input<number>();
  readonly maxlength = input<number>();
  readonly hint = input<string>('');
  readonly tabIndex = input<number>();
  readonly className = input<string>('');
  readonly resize = input<'none' | 'both' | 'horizontal' | 'vertical'>('vertical');
  readonly appearance = input<'fill' | 'outline'>('fill');
  readonly required = input<boolean>(false);
}
