import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Text, View } from '@ng-native/components';
import { NativeCheckboxControlComponent } from '../../controls/native-checkbox-control.component';
import { NativeCheckboxProps } from './native-checkbox.type';

@Component({
  selector: 'df-native-checkbox',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, NativeCheckboxControlComponent],
  hostDirectives: [NgForgeFieldHost],
  template: `
    <view class="field">
      <df-native-checkbox-control
        [formField]="ngf.field()"
        [label]="(ngf.label() | dynamicText | async) ?? undefined"
        [testID]="ngf.key() + '-checkbox'"
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
export default class NativeCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<boolean>();
  readonly props = input<NativeCheckboxProps>();
}
