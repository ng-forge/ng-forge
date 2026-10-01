import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { Pressable, Text, View } from '@ng-native/components';

/**
 * A checkbox for Signal Forms. React Native has no checkbox view, so it is a pressable row with a
 * box, announced to screen readers as a checkbox. A tap commits the choice, so it also marks the
 * field touched: there is no blur to do it.
 */
@Component({
  selector: 'df-native-checkbox-control',
  imports: [Pressable, View, Text],
  template: `
    <pressable
      class="choice"
      role="checkbox"
      [testID]="testID()"
      [disabled]="disabled() || readonly()"
      [accessibilityLabel]="label()"
      [accessibilityState]="{ checked: checked(), disabled: disabled() }"
      (press)="toggle()"
    >
      <view class="box" [class.on]="checked()" [class.disabled]="disabled()">
        @if (checked()) {
          <text class="check">✓</text>
        }
      </view>
      <text class="choice-label">{{ label() }}</text>
    </pressable>
  `,
  styleUrl: '../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeCheckboxControlComponent implements FormCheckboxControl {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly touch = output<void>();

  readonly label = input<string | undefined>();
  readonly testID = input<string>();

  protected toggle(): void {
    this.checked.update((checked) => !checked);
    this.touch.emit();
  }
}
