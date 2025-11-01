import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatInputComponent, MatInputProps } from './mat-input.type';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent, Field, MatError],
  template: `
    @let f = field();

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
        [field]="f"
        [type]="props()?.type || 'text'"
        [placeholder]="placeholder() || ''"
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
      />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint }}</mat-hint>
      }

      <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatInputFieldComponent implements MatInputComponent {
  readonly field = input.required<FieldTree<string>>();

  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatInputProps>();
}
