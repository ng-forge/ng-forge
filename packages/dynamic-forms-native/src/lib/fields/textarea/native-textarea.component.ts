import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Text, TextInput, View } from '@ng-native/components';
import { NativeTextareaProps } from './native-textarea.type';

@Component({
  selector: 'df-native-textarea',
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
        class="control multiline"
        multiline
        [formField]="f"
        [testID]="ngf.key() + '-textarea'"
        [accessibilityLabel]="label ?? undefined"
        [placeholder]="(ngf.placeholder() | dynamicText | async) ?? undefined"
        [numberOfLines]="props()?.rows ?? 4"
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
export default class NativeTextareaFieldComponent {
  protected readonly ngf = injectNgForgeField<string>();
  readonly props = input<NativeTextareaProps>();
}
