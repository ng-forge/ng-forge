import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'df-test-input',
  template: `<input [type]="type()" [field]="field()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field],
})
export default class TestInputHarness {
  readonly field = input.required<FieldTree<string>>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly props = input<Record<string, any>>({});
  readonly className = input<string>('');
}
