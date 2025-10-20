import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput, MatInputModule } from '@angular/material/input';
import { InputField } from '@ng-forge/dynamic-form';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatError],
  template: `
    <mat-form-field [class]="className() || ''">
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

      @if (hint()) {
      <mat-hint>{{ hint() }}</mat-hint>
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
export class MatInputFieldComponent implements FormValueControl<string>, InputField {
  // FormValueControl implementation
  readonly value = model<string>('');
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // InputField implementation
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  readonly autocomplete = input<string>();
  readonly hint = input<string>('');
  readonly tabIndex = input<number>();
  readonly className = input<string>('');
}
