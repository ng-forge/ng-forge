import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Text, TextInput, View } from '@ng-native/components';

export interface NativeInputProps {
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  hint?: string;
}

@Component({
  selector: 'df-native-input',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, TextInput],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    <view>
      @if (ngf.label(); as label) {
        <text>{{ label | dynamicText | async }}</text>
      }
      <text-input
        [formField]="f"
        [testID]="ngf.key() + '-input'"
        [accessibilityLabel]="(ngf.label() | dynamicText | async) ?? undefined"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? undefined"
        [secureTextEntry]="props()?.secure"
        [keyboardType]="props()?.keyboardType"
      />
      @if (ngf.errorsToDisplay()[0]; as error) {
        <text role="alert" [testID]="ngf.errorId()">{{ error.message }}</text>
      } @else if (props()?.hint; as hint) {
        <text>{{ hint | dynamicText | async }}</text>
      }
    </view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeInputComponent {
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<NativeInputProps>();
}
