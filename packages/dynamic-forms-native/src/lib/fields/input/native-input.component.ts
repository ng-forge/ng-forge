import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { type KeyboardType, Text, TextInput, View } from '@ng-native/components';
import { NativeInputProps } from './native-input.type';

const KEYBOARD_BY_TYPE: Record<NonNullable<NativeInputProps['type']>, KeyboardType> = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  number: 'numeric',
  tel: 'phone-pad',
  url: 'url',
};

@Component({
  selector: 'df-native-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, TextInput],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let label = ngf.label() | dynamicText | async;
    <view class="field">
      @if (label) {
        <text class="label">{{ label }}</text>
      }
      <text-input
        class="control"
        [formField]="f"
        [testID]="ngf.key() + '-input'"
        [accessibilityLabel]="label ?? undefined"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? undefined"
        [secureTextEntry]="props()?.type === 'password'"
        [keyboardType]="keyboardType()"
        [autoCapitalize]="props()?.type === 'email' || props()?.type === 'url' ? 'none' : undefined"
      />
      @if (ngf.errorsToDisplay()[0]; as error) {
        <text class="error" role="alert" [testID]="ngf.errorId()">{{ error.message }}</text>
      } @else if (props()?.hint; as hint) {
        <text class="hint" [testID]="ngf.hintId()">{{ hint | dynamicText | async }}</text>
      }
    </view>
  `,
  styleUrl: '../../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeInputFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<NativeInputProps>();

  protected readonly keyboardType = computed(() => KEYBOARD_BY_TYPE[this.props()?.type ?? 'text']);
}
