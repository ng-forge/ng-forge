import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DynamicTextPipe, type DynamicText } from '@ng-forge/dynamic-forms/integration';
import { Text } from '@ng-native/components';

@Component({
  selector: 'df-native-text',
  imports: [DynamicTextPipe, AsyncPipe, Text],
  template: `@if (!hidden()) {
    <text [role]="isHeading() ? 'header' : undefined" [testID]="key()">{{ label() | dynamicText | async }}</text>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeTextComponent {
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
  readonly className = input<string>();
  readonly hidden = input<boolean>(false);
  readonly props = input<{ elementType?: string }>();
  protected readonly isHeading = computed(() => /^h[1-6]$/.test(this.props()?.elementType ?? ''));
}
