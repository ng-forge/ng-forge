import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

/**
 * Test harness component for select fields
 */
@Component({
  selector: 'df-test-select',
  template: `<select [value]="value()" [disabled]="disabled()" (change)="value.set($any($event.target).value)" (blur)="touched.set(true)">
    <option value="">Select...</option>
    @for (option of options(); track option.value) {
    <option [value]="option.value">{{ option.label }}</option>
    }
  </select>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestSelectHarness implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly options = input<Array<{ value: string; label: string }>>([]);
  readonly className = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);
  readonly hidden = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly props = input<Record<string, any>>({});
}
