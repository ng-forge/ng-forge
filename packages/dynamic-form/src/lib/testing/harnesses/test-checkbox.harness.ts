import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';

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
  readonly props = input<Record<string, any>>({});
  readonly className = input<string>('');
}
