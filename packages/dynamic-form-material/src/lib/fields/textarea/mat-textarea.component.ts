import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import {
  DynamicText,
  DynamicTextPipe,
  ValidationMessages,
  createResolvedErrorsSignal,
  shouldShowErrors,
} from '@ng-forge/dynamic-form';
import { MatTextareaComponent, MatTextareaProps } from './mat-textarea.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-textarea',
  imports: [MatFormField, MatLabel, MatInput, MatHint, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field
      [appearance]="props()?.appearance || 'fill'"
      [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'"
      [class]="className() || ''"
    >
      @if (label()) {
      <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }

      <textarea
        matInput
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [rows]="props()?.rows || 4"
        [cols]="props()?.cols"
        [attr.tabindex]="tabIndex()"
        [style.resize]="props()?.resize || 'vertical'"
      ></textarea>

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      }

      @if (showErrors()) {
        @for (error of resolvedErrors(); track error.kind) {
          <mat-error>{{ error.message }}</mat-error>
        }
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
})
export default class MatTextareaFieldComponent implements MatTextareaComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<MatTextareaProps>();
  readonly validationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages);
  readonly showErrors = shouldShowErrors(this.field);
}
