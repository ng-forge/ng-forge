import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatFormFieldAppearance, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';
import { TextareaField } from '@ng-forge/dynamic-form';

/**
 * Material Design textarea field component
 */
@Component({
  selector: 'df-mat-textarea',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatError],
  template: `
    <mat-form-field [appearance]="appearance()" [class]="className() || ''">
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
export class MatTextareaFieldComponent implements FormValueControl<string>, TextareaField {
  // FormValueControl implementation
  readonly value = model<string>('');
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // TextareaField implementation
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly rows = input<number>(4);
  readonly cols = input<number>();
  readonly maxlength = input<number>();
  readonly hint = input<string>('');
  readonly tabIndex = input<number>();
  readonly className = input<string>('');
  readonly resize = input<'none' | 'both' | 'horizontal' | 'vertical'>('vertical');
  readonly appearance = input<MatFormFieldAppearance>('fill');
}
