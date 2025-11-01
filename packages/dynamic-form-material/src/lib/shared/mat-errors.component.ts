import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';

/**
 * Generic error display component for Material Design forms
 * Provides consistent error messaging across all material form definitions
 */
@Component({
  selector: 'df-mat-errors',
  template: `
    @if (shouldShowErrors()) { @for (error of errors(); track error) {
    <span>{{ error.message }}</span>
    } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatErrorsComponent {
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);

  shouldShowErrors = computed(() => this.invalid() && this.touched() && this.errors().length > 0);
}
