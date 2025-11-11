import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import {
  createResolvedErrorsSignal,
  DynamicText,
  DynamicTextPipe,
  getDisabledSignal,
  shouldShowErrors,
  ValidationMessages,
} from '@ng-forge/dynamic-form';
import { MatInputComponent, MatInputProps } from './mat-input.type';
import { AsyncPipe } from '@angular/common';

/**
 * Material Design input field component
 */
@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, Field, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <mat-form-field [appearance]="props()?.appearance ?? 'outline'" [subscriptSizing]="props()?.subscriptSizing ?? 'dynamic'">
      @if (label()) {
      <mat-label>{{ label() | dynamicText | async }}</mat-label>
      }

      <input
        matInput
        [field]="f"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="tabIndex()"
        [disabled]="isDisabled()"
      />

      @if (props()?.hint; as hint) {
      <mat-hint>{{ hint | dynamicText | async }}</mat-hint>
      } @for (error of errorsToDisplay(); track error.kind) {
      <mat-error>{{ error.message }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
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
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper that breaks Material projection
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // Get disabled state from logic registry
  readonly isDisabled = computed(() => getDisabledSignal(this.key(), this.field)());
}
