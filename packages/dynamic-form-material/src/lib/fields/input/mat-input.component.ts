import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { MatErrorsComponent } from '../../shared/mat-errors.component';
import { MatInputComponent, MatInputProps } from './mat-input.type';
import { AsyncPipe } from '@angular/common';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, MatErrorsComponent, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field [appearance]="props()?.appearance ?? 'outline'" [subscriptSizing]="props()?.subscriptSizing ?? 'fixed'">
      @if (label()) {
      <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }

      <input
        matInput
        [attr.data-testid]="props()?.['data-testid']"
        [field]="f"
        [type]="props()?.type || 'text'"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [disabled]="f().disabled()"
        [attr.tabindex]="tabIndex()"
      />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }

      <mat-error><df-mat-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" /></mat-error>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[class]': 'className()',
  },
})
export default class MatInputFieldComponent implements MatInputComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatInputProps>();
}
