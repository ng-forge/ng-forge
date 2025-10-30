import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'df-test-input',
  template: `<input [value]="value()" (input)="value.set($any($event.target).value)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestInputHarness implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
}