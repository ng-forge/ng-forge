import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';
import { IonNote } from '@ionic/angular/standalone';
import { ValidationErrorsPipe, ValidationMessages } from '@ng-forge/dynamic-form';

/**
 * Generic error display component for Ionic forms
 * Provides consistent error messaging across all ionic form definitions
 */
@Component({
  selector: 'df-ionic-errors',
  imports: [IonNote, ValidationErrorsPipe],
  template: `
    @if (shouldShowErrors()) {
      @for (error of (errors() | validationErrors:validationMessages()); track error) {
        <ion-note color="danger">{{ error.message }}</ion-note>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IonicErrorsComponent {
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly validationMessages = input<ValidationMessages>();
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);

  shouldShowErrors = computed(() => this.invalid() && this.touched() && this.errors().length > 0);
}
