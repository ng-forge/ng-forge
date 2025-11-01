import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatTextareaComponent, MatTextareaProps } from './mat-textarea.type';

@Component({
  selector: 'df-mat-textarea',
  imports: [MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent, Field],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'"
      [class]="className() || ''"
    >
      @if (label(); as label) {
      <mat-label>{{ label }}</mat-label>
      }

      <textarea
        matInput
        [field]="f"
        [placeholder]="placeholder() || ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [maxLength]="maxLength() || null"
        [attr.tabindex]="tabIndex()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatTextareaFieldComponent implements MatTextareaComponent {
  readonly field = input.required<FieldTree<string>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');

  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly maxLength = input<number>();

  readonly props = input<MatTextareaProps>();
}
