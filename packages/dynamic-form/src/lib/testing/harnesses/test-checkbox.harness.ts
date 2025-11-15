import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { ValidationMessages } from '../../models/validation-types';

@Component({
  selector: 'df-test-checkbox',
  template: ` <input type="checkbox" [field]="field()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field],
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
