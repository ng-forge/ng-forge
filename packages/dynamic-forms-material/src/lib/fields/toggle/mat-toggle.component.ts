import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import {
  NgForgeControl,
  injectNgForgeField,
  NgForgeField,
  NgForgeFieldShell,
  NG_FORGE_FIELD_SHELL_INPUTS,
  NG_FORGE_VALUE_FIELD_INPUTS,
} from '@ng-forge/dynamic-forms/integration';

import { MatToggleProps } from './mat-toggle.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-toggle',
  imports: [MatSlideToggle, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
  template: `
    @let f = ngf.field();
    @let toggleId = ngf.key() + '-toggle';

    <mat-slide-toggle
      ngForgeControl="button[role='switch']"
      [id]="toggleId"
      [formField]="f"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="disableRipple()"
      [required]="!!f().required()"
      [tabIndex]="ngf.tabIndex() ?? 0"
      class="toggle-container"
    >
      {{ ngf.label() | dynamicText | async }}
    </mat-slide-toggle>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly ngf = injectNgForgeField<boolean>();

  readonly props = input<MatToggleProps>();

  readonly disableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);
}
