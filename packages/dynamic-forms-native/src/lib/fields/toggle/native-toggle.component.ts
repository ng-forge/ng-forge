import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Switch, Text, View } from '@ng-native/components';
import { NativeToggleProps } from './native-toggle.type';

@Component({
  selector: 'df-native-toggle',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, Switch],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let label = ngf.label() | dynamicText | async;
    <view class="field">
      <view class="row">
        <text class="label grow">{{ label }}</text>
        <switch [formField]="f" [testID]="ngf.key() + '-toggle'" [accessibilityLabel]="label ?? undefined" />
      </view>
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
export default class NativeToggleFieldComponent {
  protected readonly ngf = injectNgForgeField<boolean>();
  readonly props = input<NativeToggleProps>();
}
