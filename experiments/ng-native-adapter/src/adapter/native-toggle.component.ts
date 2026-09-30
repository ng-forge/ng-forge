import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Switch, Text, View } from '@ng-native/components';

@Component({
  selector: 'df-native-toggle',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, Switch],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    <view>
      <text>{{ ngf.label() | dynamicText | async }}</text>
      <switch [formField]="f" [testID]="ngf.key() + '-switch'" [accessibilityLabel]="(ngf.label() | dynamicText | async) ?? undefined" />
      @if (ngf.errorsToDisplay()[0]; as error) {
        <text role="alert">{{ error.message }}</text>
      }
    </view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NativeToggleComponent {
  protected readonly ngf = injectNgForgeField<boolean>();
  readonly props = input<Record<string, unknown>>();
}
