import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonNote } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS, provideHostMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { IonicToggleProps } from './ionic-toggle.type';
import { IonicToggleControlComponent } from './ionic-toggle-control.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-toggle',
  imports: [IonicToggleControlComponent, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  providers: [provideHostMetaTarget()],
  template: `
    @let f = field.field();
    @let toggleId = field.key() + '-toggle';

    <df-ion-toggle-control
      [id]="toggleId"
      [formField]="f"
      [meta]="field.meta()"
      [labelPlacement]="props()?.labelPlacement ?? 'end'"
      [justify]="props()?.justify"
      [color]="props()?.color ?? 'primary'"
      [enableOnOffLabels]="props()?.enableOnOffLabels ?? false"
      [tabIndex]="field.tabIndex()"
      [ariaDescribedBy]="field.ariaDescribedBy()"
    >
      {{ field.label() | dynamicText | async }}
    </df-ion-toggle-control>

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
export default class IonicToggleFieldComponent {
  protected readonly field = injectNgForgeField<boolean>();

  readonly props = input<IonicToggleProps>();

  // strict template type-check; runtime shape is correct.
}
