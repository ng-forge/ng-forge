import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatHint, MatInput } from '@angular/material/input';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { MatInputProps } from './mat-input.type';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-input',
  imports: [MatFormField, MatLabel, MatInput, MatHint, FormField, MatError, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideMetaTarget('input')],
  template: `
    @let inputId = field.key() + '-input';

    <mat-form-field
      [appearance]="effectiveAppearance()"
      [subscriptSizing]="effectiveSubscriptSizing()"
      [floatLabel]="effectiveFloatLabel()"
      [hideRequiredMarker]="effectiveHideRequiredMarker()"
    >
      @if (field.label()) {
        <mat-label>{{ field.label() | dynamicText | async }}</mat-label>
      }
      <input
        matInput
        [id]="inputId"
        [formField]="field.field()"
        [type]="props()?.type ?? 'text'"
        [placeholder]="(field.placeholder() | dynamicText | async) ?? ''"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
      />
      @if (field.errorsToDisplay()[0]; as error) {
        <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
      } @else if (props()?.hint; as hint) {
        <mat-hint [id]="field.hintId()">{{ hint | dynamicText | async }}</mat-hint>
      }
    </mat-form-field>
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatInputFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });

  protected readonly field = injectNgForgeField<string>();

  readonly props = input<MatInputProps>();

  readonly effectiveAppearance = computed(() => this.props()?.appearance ?? this.materialConfig?.appearance ?? 'outline');

  readonly effectiveSubscriptSizing = computed(() => this.props()?.subscriptSizing ?? this.materialConfig?.subscriptSizing ?? 'dynamic');

  readonly effectiveFloatLabel = computed(() => this.props()?.floatLabel ?? this.materialConfig?.floatLabel ?? 'auto');

  readonly effectiveHideRequiredMarker = computed(
    () => this.props()?.hideRequiredMarker ?? this.materialConfig?.hideRequiredMarker ?? false,
  );
}
