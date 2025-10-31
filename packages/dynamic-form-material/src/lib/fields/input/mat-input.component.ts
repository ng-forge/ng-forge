import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatInputComponent, MatInputProps } from './mat-input.type';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent],
  template: `
    <mat-form-field
      [appearance]="props()?.appearance ?? 'outline'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'"
      [class]="className() || ''"
    >
      @if (label()) {
      <mat-label>{{ label() }}</mat-label>
      }

      <input
        matInput
        [(ngModel)]="value"
        [type]="props()?.type || 'text'"
        [placeholder]="placeholder() || ''"
        [disabled]="disabled()"
        [attr.tabindex]="tabIndex()"
        (blur)="touched.set(true)"
      />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="errors()" [invalid]="invalid()" [touched]="touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatInputFieldComponent implements FormValueControl<string>, MatInputComponent {
  readonly value = model.required<string>();

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

  readonly props = input<MatInputProps>();
}
