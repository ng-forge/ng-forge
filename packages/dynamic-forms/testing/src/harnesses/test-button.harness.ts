import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'df-test-button',
  template: `<button type="button" [formField]="field()" (click)="handleClick()">{{ label() || 'Button' }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
})
export default class TestButtonHarness {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly props = input<Record<string, unknown>>({});

  handleClick(): void {
    const onClick = this.props()?.['onClick'];
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  }
}
