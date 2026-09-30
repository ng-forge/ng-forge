import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DynamicTextPipe, injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { Pressable, Text } from '@ng-native/components';

@Component({
  selector: 'df-native-button',
  imports: [DynamicTextPipe, AsyncPipe, Pressable, Text],
  hostDirectives: [NgForgeActionHost],
  template: `
    <pressable role="button" [testID]="action.key()" [disabled]="action.disabled()" (press)="action.dispatch()">
      <text>{{ action.label() | dynamicText | async }}</text>
    </pressable>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeButtonComponent {
  protected readonly action = injectNgForgeAction();
  readonly props = input<Record<string, unknown>>();
}
