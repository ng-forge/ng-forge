import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { ValidationMessages } from '../../../src/lib/models/validation-types';

@Component({
  selector: 'df-test-checkbox',
  template: ` <input type="checkbox" [formField]="field()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
})
export default class TestCheckboxHarness {
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly props = input<Record<string, unknown>>({});
  readonly className = input<string>('');
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
}
