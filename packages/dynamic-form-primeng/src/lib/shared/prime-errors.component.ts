import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';
import { ValidationErrorsPipe, ValidationMessages } from '@ng-forge/dynamic-form';

/**
 * Generic error display component for PrimeNG forms
 * Provides consistent error messaging across all PrimeNG form definitions
 */
@Component({
  selector: 'df-prime-errors',
  imports: [ValidationErrorsPipe],
  template: `
    @if (shouldShowErrors()) { @for (error of (errors() | validationErrors:validationMessages()); track error) {
    <small class="p-error">{{ error.message }}</small>
    } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimeErrorsComponent {
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly validationMessages = input<ValidationMessages>();
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);

  shouldShowErrors = computed(() => this.invalid() && this.touched() && this.errors().length > 0);
}
