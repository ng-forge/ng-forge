import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';
import { ValidationErrorsPipe, ValidationMessages } from '@ng-forge/dynamic-form';

/**
 * Generic error display component for Bootstrap forms
 * Provides consistent error messaging across all Bootstrap form fields
 * Uses Bootstrap's .invalid-feedback and .d-block classes for styling
 */
@Component({
  selector: 'df-bs-errors',
  imports: [ValidationErrorsPipe],
  template: `
    @if (shouldShowErrors()) {
      @for (error of (errors() | validationErrors:validationMessages()); track error) {
        <div class="invalid-feedback d-block">
          {{ error.message }}
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BsErrorsComponent {
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly validationMessages = input<ValidationMessages>();
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);

  shouldShowErrors = computed(() => this.invalid() && this.touched() && this.errors().length > 0);
}
