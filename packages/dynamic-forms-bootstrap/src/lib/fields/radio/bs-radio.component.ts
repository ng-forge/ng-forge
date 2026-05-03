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
import { BsRadioProps } from './bs-radio.type';
import { AsyncPipe } from '@angular/common';
import { BsRadioGroupComponent } from './bs-radio-group.component';

@Component({
  selector: 'df-bs-radio',
  imports: [BsRadioGroupComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  // Manual meta tracking with dependents on `options`; opt out of directive-owned tracking.
  providers: [provideSkipMetaTarget()],
  template: `
    @let f = field.field();

    <div class="mb-3">
      @if (field.label(); as label) {
        <div class="form-label">{{ label | dynamicText | async }}</div>
      }

      <df-bs-radio-group
        [formField]="f"
        [label]="field.label()"
        [options]="options()"
        [properties]="props()"
        [ariaDescribedBy]="field.ariaDescribedBy()"
      />

      @if (field.errorsToDisplay()[0]; as error) {
        <div class="invalid-feedback d-block" [id]="field.errorId()" role="alert">{{ error.message }}</div>
      } @else if (props()?.hint; as hint) {
        <div class="form-text" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
      }
    </div>
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
export default class BsRadioFieldComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<BsRadioProps>();

  constructor() {
    setupMetaTracking(this.elementRef, this.field.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }
}
