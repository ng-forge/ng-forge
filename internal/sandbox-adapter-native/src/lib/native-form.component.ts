import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';
import { View } from '@ng-native/components';

/** The form itself, rendered by ng-native: `<view>`, `<text-input>` and the rest, not DOM elements. */
@Component({
  selector: 'sandbox-native-form',
  imports: [DynamicForm, View],
  template: `
    <view class="form">
      <form [dynamic-form]="config()"></form>
    </view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeFormComponent {
  readonly config = input.required<FormConfig>();
}
