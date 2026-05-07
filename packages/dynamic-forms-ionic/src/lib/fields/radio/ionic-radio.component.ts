import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonItem, IonNote, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import { DynamicTextPipe, FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { IonicRadioProps } from './ionic-radio.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-radio',
  imports: [IonRadioGroup, IonRadio, IonItem, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let radioGroupId = field.key() + '-radio-group';
    @if (field.label(); as label) {
      <div class="radio-label">{{ label | dynamicText | async }}</div>
    }

    <ion-radio-group
      [id]="radioGroupId"
      [formField]="f"
      [compareWith]="props()?.compareWith || defaultCompare"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <ion-item [lines]="'none'">
          <ion-radio
            ngForgeControl
            [value]="option.value"
            [disabled]="option.disabled || false"
            [labelPlacement]="props()?.labelPlacement ?? 'end'"
            [justify]="props()?.justify"
            [color]="props()?.color ?? 'primary'"
          >
            {{ option.label | dynamicText | async }}
          </ion-radio>
        </ion-item>
      }
    </ion-radio-group>

    @if (field.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="field.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</ion-note>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }

      .radio-label {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--ion-text-color);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicRadioFieldComponent {
  protected readonly field = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<IonicRadioProps>();

  defaultCompare = Object.is;
}
