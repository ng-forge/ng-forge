import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'df-test-button',
  template: `<button type="button" [field]="field()" (click)="handleClick()">{{ label() || 'Button' }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Field],
})
export default class TestButtonHarness {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Field-specific properties
  readonly label = input<string>('');
  readonly props = input<Record<string, any>>({});

  handleClick(): void {
    const onClick = this.props()?.['onClick'];
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  }
}
