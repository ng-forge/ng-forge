import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';
import { MatInputField, MatInputProps } from './mat-input.type';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatError],
  template: `
    <mat-form-field [appearance]="appearance() ?? 'fill'" [class]="className() || ''">
      @if (label()) {
      <mat-label>{{ label() }}</mat-label>
      }

      <input
        matInput
        [(ngModel)]="value"
        [type]="type() || 'text'"
        [placeholder]="placeholder() || ''"
        [disabled]="disabled()"
        [attr.autocomplete]="autocomplete()"
        [attr.tabindex]="tabIndex()"
        (blur)="touched.set(true)"
      />

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
export class MatInputFieldComponent implements FormValueControl<string>, MatInputField {
  readonly value = model<string>('');
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // InputField implementation
  readonly label = input.required<MatInputProps['label']>();
  readonly placeholder = input<MatInputProps['placeholder']>('');
  readonly type = input<MatInputProps['type']>('text');
  readonly autocomplete = input<MatInputProps['autocomplete']>();
  readonly hint = input<MatInputProps['hint']>('');
  readonly tabIndex = input<MatInputProps['tabIndex']>();
  readonly className = input<MatInputProps['className']>('');
  readonly appearance = input<MatInputProps['appearance']>('fill');
}
