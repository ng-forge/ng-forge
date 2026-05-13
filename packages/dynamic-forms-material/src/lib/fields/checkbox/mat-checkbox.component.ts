import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import {
  NgForgeControl,
  injectNgForgeField,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';
import { MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field();
    @let checkboxId = ngf.key() + '-checkbox';

    <mat-checkbox
      ngForgeControl="input[type='checkbox']"
      [id]="checkboxId"
      [formField]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="disableRipple()"
      [required]="!!f().required()"
      [tabIndex]="ngf.tabIndex() ?? 0"
      [attr.hidden]="f().hidden() || null"
    >
      {{ ngf.label() | dynamicText | async }}
    </mat-checkbox>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <mat-error [id]="ngf.errorId()" [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="ngf.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<boolean>();

  readonly props = input<MatCheckboxProps>();

  readonly disableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);
}
