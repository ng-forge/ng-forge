import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';

/**
 * Test harness component for select fields
 */
@Component({
  selector: 'df-test-select',
  template: `
    @let f = field();
    <select [formField]="f">
      <option value="">Select...</option>
      @for (option of options(); track option.value) {
        <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
})
export default class TestSelectHarness {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly options = input<Array<{ value: string; label: string }>>([]);
  readonly className = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);
  readonly hidden = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly props = input<Record<string, unknown>>({});
}
