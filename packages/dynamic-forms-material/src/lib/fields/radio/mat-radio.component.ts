import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let radioGroupId = field.key() + '-radio-group';

    @if (field.label()) {
      <div class="radio-label">{{ field.label() | dynamicText | async }}</div>
    }

    <mat-radio-group
      [id]="radioGroupId"
      [formField]="f"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <mat-radio-button
          ngForgeControl
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
        >
          {{ option.label | dynamicText | async }}
        </mat-radio-button>
      }
    </mat-radio-group>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent {
  protected readonly field = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<MatRadioProps>();
}
