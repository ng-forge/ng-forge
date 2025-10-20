import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatError, MatHint, MatInput } from '@angular/material/input';
import { MatTextareaField, MatTextareaProps } from './mat-textarea.type';

/**
 * Material Design textarea field component
 */
@Component({
  selector: 'df-mat-textarea',
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatHint, MatError],
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
export class MatTextareaFieldComponent implements FormValueControl<string>, MatTextareaField {
  readonly value = model<string>('');
  readonly disabled = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);
  readonly errors = model<readonly any[]>([]);

  // TextareaField implementation
  readonly label = input.required<MatTextareaProps['label']>();
  readonly placeholder = input<MatTextareaProps['placeholder']>('');
  readonly rows = input<MatTextareaProps['rows']>(4);
  readonly cols = input<MatTextareaProps['cols']>();
  readonly maxlength = input<MatTextareaProps['maxlength']>();
  readonly hint = input<MatTextareaProps['hint']>('');
  readonly tabIndex = input<MatTextareaProps['tabIndex']>();
  readonly className = input<MatTextareaProps['className']>('');
  readonly resize = input<MatTextareaProps['resize']>('vertical');
  readonly appearance = input<MatTextareaProps['appearance']>('fill');
}
