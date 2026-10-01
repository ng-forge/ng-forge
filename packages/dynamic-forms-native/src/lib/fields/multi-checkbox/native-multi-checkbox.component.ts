import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { Text, View } from '@ng-native/components';
import { NativeChoiceGroupComponent } from '../../controls/native-choice-group.component';
import { NativeMultiCheckboxProps } from './native-multi-checkbox.type';

@Component({
  selector: 'df-native-multi-checkbox',
  imports: [FormField, DynamicTextPipe, AsyncPipe, View, Text, NativeChoiceGroupComponent],
  hostDirectives: [NgForgeFieldHost],
  template: `
    <view class="field">
      @if (ngf.label(); as label) {
        <text class="label">{{ label | dynamicText | async }}</text>
      }
      <df-native-choice-group multiple [formField]="ngf.field()" [idPrefix]="ngf.key()" [options]="options()" />
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
export default class NativeMultiCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType[]>();
  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<NativeMultiCheckboxProps>();
}
