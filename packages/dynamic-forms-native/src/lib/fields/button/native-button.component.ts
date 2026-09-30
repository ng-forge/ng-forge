import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormEvent } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe, injectNgForgeAction, NgForgeActionHost } from '@ng-forge/dynamic-forms/integration';
import { Pressable, Text } from '@ng-native/components';
import { NativeButtonProps } from './native-button.type';

@Component({
  selector: 'df-native-button',
  imports: [DynamicTextPipe, AsyncPipe, Pressable, Text],
  hostDirectives: [NgForgeActionHost],
  template: `
    <pressable
      class="button"
      role="button"
      [class.secondary]="props()?.variant === 'secondary'"
      [class.disabled]="action.disabled()"
      [testID]="action.key() + '-button'"
      [disabled]="action.disabled()"
      [accessibilityState]="{ disabled: action.disabled() }"
      (press)="action.dispatch()"
    >
      <text class="button-label">{{ action.label() | dynamicText | async }}</text>
    </pressable>
  `,
  styleUrl: '../../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeButtonFieldComponent<TEvent extends FormEvent> {
  protected readonly action = injectNgForgeAction<TEvent>();
  readonly props = input<NativeButtonProps>();
}
