import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { ValidationMessages } from '../../../src/lib/models/validation-types';

@Component({
  selector: 'df-test-input',
  template: `<input [type]="type()" [formField]="field()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
})
export default class TestInputHarness {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly props = input<Record<string, unknown>>({});
  readonly className = input<string>('');
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
}
