import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { PrimeRadioProps } from './prime-radio.type';
import { AsyncPipe } from '@angular/common';
import { PrimeRadioGroupComponent } from './prime-radio-group.component';

@Component({
  selector: 'df-prime-radio',
  imports: [PrimeRadioGroupComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @if (ngf.label()) {
      <div class="radio-label">{{ ngf.label() | dynamicText | async }}</div>
    }

    <df-prime-radio-group [formField]="f" [options]="options()" [properties]="props()" />

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

      .radio-label {
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeRadioFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeRadioProps>();
}
