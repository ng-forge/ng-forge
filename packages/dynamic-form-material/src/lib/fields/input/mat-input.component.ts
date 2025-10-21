import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatError],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
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
export class MatInputFieldComponent implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  readonly autocomplete = input<string>();
  readonly hint = input<string>('');
  readonly tabIndex = input<number>();
  readonly className = input<string>('');
  readonly appearance = input<'fill' | 'outline'>('fill');
}
