import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import {
  NgForgeField,
  injectNgForgeField,
  NG_FORGE_FIELD_INPUTS,
  provideSkipMetaTarget,
  setupMetaTracking,
} from '@ng-forge/dynamic-forms/integration';
import { PrimeRadioProps } from './prime-radio.type';
import { AsyncPipe } from '@angular/common';
import { PrimeRadioGroupComponent } from './prime-radio-group.component';

@Component({
  selector: 'df-prime-radio',
  imports: [PrimeRadioGroupComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  // Manual meta tracking with dependents on `options`; opt out of directive-owned tracking.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = field.field();
    @if (field.label()) {
      <div class="radio-label">{{ field.label() | dynamicText | async }}</div>
    }

    <df-prime-radio-group
      [formField]="f"
      [options]="options()"
      [properties]="props()"
      [meta]="field.meta()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    />

    @if (field.errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="field.hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
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

      .radio-label {
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeRadioFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeRadioProps>();

  constructor() {
    setupMetaTracking(this.elementRef, this.field.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }
}
