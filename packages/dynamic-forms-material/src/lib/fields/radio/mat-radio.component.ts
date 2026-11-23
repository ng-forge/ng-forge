import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { MatRadioProps } from './mat-radio.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '@ng-forge/dynamic-forms-material/shared';

@Component({
  selector: 'df-mat-radio',
  imports: [MatRadioGroup, MatRadioButton, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let radioGroupId = ngf.key() + '-radio-group';

    @if (ngf.label()) {
      <div class="radio-label" [id]="ngf.key() + '-label'">{{ ngf.label() | dynamicText | async }}</div>
    }

    <mat-radio-group
      [id]="radioGroupId"
      [formField]="f"
      [attr.aria-labelledby]="ngf.label() ? ngf.key() + '-label' : null"
      [attr.aria-invalid]="ngf.ariaInvalid()"
      [attr.aria-required]="ngf.ariaRequired()"
      [attr.aria-describedby]="ngf.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <mat-radio-button
          ngForgeControl="input[type='radio']"
          [value]="option.value"
          [disabled]="option.disabled || false"
          [color]="props()?.color || 'primary'"
          [labelPosition]="props()?.labelPosition || 'after'"
          [disableRipple]="disableRipple()"
        >
          {{ option.label | dynamicText | async }}
        </mat-radio-button>
      }
    </mat-radio-group>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatRadioFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType>();
  private readonly materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<MatRadioProps>();

  readonly disableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);
}
