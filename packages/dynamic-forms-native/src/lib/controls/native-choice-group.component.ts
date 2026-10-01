import { booleanAttribute, ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import type { FormValueControl } from '@angular/forms/signals';
import type { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { Pressable, Text, View } from '@ng-native/components';

/**
 * A list of options for Signal Forms: one value for `radio`, an array of values for
 * `multi-checkbox`. Each option is a pressable row announced as a radio button or a checkbox.
 * A tap commits the choice, so it also marks the field touched.
 */
@Component({
  selector: 'df-native-choice-group',
  imports: [Pressable, View, Text, DynamicTextPipe, AsyncPipe],
  template: `
    <view [role]="multiple() ? undefined : 'radiogroup'">
      @for (option of options(); track option.value) {
        @let selected = isSelected(option.value);
        @let optionDisabled = disabled() || !!option.disabled;
        @let label = option.label | dynamicText | async;
        <pressable
          class="choice"
          [role]="multiple() ? 'checkbox' : 'radio'"
          [testID]="idPrefix() + '-' + option.value"
          [disabled]="optionDisabled || readonly()"
          [accessibilityLabel]="label ?? undefined"
          [accessibilityState]="{ checked: selected, disabled: optionDisabled }"
          (press)="choose(option.value)"
        >
          <view [class]="multiple() ? 'box' : 'radio'" [class.on]="selected" [class.disabled]="optionDisabled">
            @if (selected) {
              @if (multiple()) {
                <text class="check">✓</text>
              } @else {
                <view class="dot"></view>
              }
            }
          </view>
          <text class="choice-label">{{ label }}</text>
        </pressable>
      }
    </view>
  `,
  styleUrl: '../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeChoiceGroupComponent implements FormValueControl<ValueType | ValueType[] | undefined> {
  readonly value = model<ValueType | ValueType[] | undefined>(undefined);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly touch = output<void>();

  readonly options = input.required<readonly FieldOption<ValueType>[]>();
  /** Several values (multi-checkbox) instead of one (radio). */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Prefix for each option's `testID`, `<prefix>-<value>`. */
  readonly idPrefix = input('');

  protected isSelected(optionValue: ValueType): boolean {
    const value = this.value();
    return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
  }

  protected choose(optionValue: ValueType): void {
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? (this.value() as ValueType[]) : [];
      this.value.set(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
    } else {
      this.value.set(optionValue);
    }
    this.touch.emit();
  }
}
