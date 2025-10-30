import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';

@Component({
  selector: 'df-test-checkbox',
  template: `<input type="checkbox" [checked]="checked()" (change)="checked.set($any($event.target).checked)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestCheckboxHarness implements FormCheckboxControl {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
}