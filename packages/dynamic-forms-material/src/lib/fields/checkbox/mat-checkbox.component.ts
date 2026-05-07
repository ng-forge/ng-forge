import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { MatCheckboxProps } from './mat-checkbox.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-checkbox',
  imports: [MatCheckbox, FormField, MatError, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let checkboxId = field.key() + '-checkbox';

    <mat-checkbox
      ngForgeControl
      [id]="checkboxId"
      [formField]="f"
      [labelPosition]="props()?.labelPosition || 'after'"
      [indeterminate]="props()?.indeterminate || false"
      [color]="props()?.color || 'primary'"
      [disableRipple]="effectiveDisableRipple()"
      [required]="!!f().required()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
      [attr.tabindex]="field.tabIndex()"
      [attr.hidden]="f().hidden() || null"
    >
      {{ field.label() | dynamicText | async }}
    </mat-checkbox>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()" [attr.hidden]="f().hidden() || null">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatCheckboxFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = injectNgForgeField<boolean>();

  readonly props = input<MatCheckboxProps>();

  readonly effectiveDisableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);

  /**
   * Workaround: Angular Material's MatCheckbox does NOT set aria-required on its internal
   * input element when [required] is passed, even though it sets the native required attribute.
   * This effect imperatively sets/removes aria-required on the internal input.
   *
   * Bug: MatCheckbox sets `required` attribute but not `aria-required` for screen readers.
   *
   * Uses afterRenderEffect to ensure DOM is ready before manipulating attributes.
   */
  private readonly syncAriaRequiredToDom = afterRenderEffect(() => {
    const isRequired = this.field.ariaRequired();
    const inputEl = this.elementRef.nativeElement.querySelector('input[type="checkbox"]');
    if (inputEl) {
      if (isRequired) {
        inputEl.setAttribute('aria-required', 'true');
      } else {
        inputEl.removeAttribute('aria-required');
      }
    }
  });

  /**
   * Workaround: Angular Material's MatCheckbox does NOT propagate aria-describedby to its internal
   * input element. This effect imperatively sets/removes aria-describedby on the internal input.
   *
   * Uses afterRenderEffect to ensure DOM is ready before querying internal elements.
   */
  private readonly syncAriaDescribedByToDom = afterRenderEffect(() => {
    const describedBy = this.field.ariaDescribedBy();
    const inputEl = this.elementRef.nativeElement.querySelector('input[type="checkbox"]');
    if (inputEl) {
      if (describedBy) {
        inputEl.setAttribute('aria-describedby', describedBy);
      } else {
        inputEl.removeAttribute('aria-describedby');
      }
    }
  });
}
