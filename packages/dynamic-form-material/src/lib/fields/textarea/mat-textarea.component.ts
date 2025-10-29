import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatTextareaComponent, MatTextareaProps } from './mat-textarea.type';

@Component({
  selector: 'df-mat-textarea',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent],
  template: `
    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <textarea
        matInput
        [(ngModel)]="value"
        [placeholder]="placeholder() || ''"
        [disabled]="disabled()"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [maxlength]="maxLength() || null"
        [attr.tabindex]="tabIndex()"
        [style.resize]="props()?.resize || 'vertical'"
        (blur)="touched.set(true)"
      ></textarea>

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTextareaFieldComponent implements FormValueControl<string>, MatTextareaComponent {
  readonly value = model<string>('');

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
  readonly maxLength = input<number>();

  readonly props = input<MatTextareaProps>();
}
