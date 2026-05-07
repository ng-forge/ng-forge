import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonCheckbox, IonNote } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { IonicCheckboxProps } from './ionic-checkbox.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-checkbox',
  imports: [IonCheckbox, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = field.field();
    @let checkboxId = field.key() + '-checkbox';

    <ion-checkbox
      ngForgeControl
      [id]="checkboxId"
      [formField]="f"
      [labelPlacement]="props()?.labelPlacement ?? 'end'"
      [justify]="props()?.justify"
      [color]="props()?.color ?? 'primary'"
      [indeterminate]="props()?.indeterminate ?? false"
      [attr.tabindex]="field.tabIndex()"
      [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-required]="field.ariaRequired()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
    >
      {{ field.label() | dynamicText | async }}
    </ion-checkbox>

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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicCheckboxFieldComponent {
  protected readonly field = injectNgForgeField<boolean>();

  readonly props = input<IonicCheckboxProps>();

  // strict template type-check; runtime shape is correct.
}
