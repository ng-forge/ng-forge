import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Checkbox } from 'primeng/checkbox';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { PrimeCheckboxProps } from './prime-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-prime-checkbox',
  imports: [Checkbox, DynamicTextPipe, AsyncPipe, FormField, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = ngf.field(); @let checkboxId = ngf.key() + '-checkbox';

    <div class="flex items-center">
      <p-checkbox
        ngForgeControl="input[type='checkbox']"
        [formField]="f"
        [inputId]="checkboxId"
        [binary]="props()?.binary ?? true"
        [trueValue]="props()?.trueValue ?? true"
        [falseValue]="props()?.falseValue ?? false"
        [styleClass]="checkboxClasses()"
        [attr.tabindex]="ngf.tabIndex()"
      />
      @if (ngf.label(); as labelText) {
        <label [for]="checkboxId" class="ml-2">{{ labelText | dynamicText | async }}</label>
      }
    </div>

    @if (ngf.errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="ngf.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeCheckboxFieldComponent {
  protected readonly ngf = injectNgForgeField<boolean>();

  readonly props = input<PrimeCheckboxProps>();

  protected readonly checkboxClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });
}
