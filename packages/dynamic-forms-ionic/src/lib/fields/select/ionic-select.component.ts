import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonNote, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { FieldOption, ValueType } from '@ng-forge/dynamic-forms';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { IonicSelectProps } from './ionic-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-select',
  imports: [IonSelect, IonSelectOption, IonNote, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let selectId = ngf.key() + '-select';

    <ion-select
      ngForgeControl
      [id]="selectId"
      [formField]="f"
      [label]="(ngf.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [placeholder]="(ngf.placeholder() | dynamicText | async) ?? ''"
      [multiple]="props()?.multiple ?? false"
      [compareWith]="props()?.compareWith ?? defaultCompare"
      [interface]="props()?.interface ?? 'alert'"
      [interfaceOptions]="props()?.interfaceOptions ?? {}"
      [cancelText]="props()?.cancelText ?? 'Cancel'"
      [okText]="props()?.okText ?? 'OK'"
      [color]="props()?.color"
      [fill]="props()?.fill ?? 'outline'"
      [shape]="props()?.shape"
      [attr.tabindex]="ngf.tabIndex()"
    >
      @for (option of options(); track option.value) {
        <ion-select-option [value]="option.value" [disabled]="option.disabled || false">
          {{ option.label | dynamicText | async }}
        </ion-select-option>
      }
    </ion-select>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicSelectFieldComponent {
  protected readonly ngf = injectNgForgeField<ValueType>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<IonicSelectProps>();

  defaultCompare = Object.is;
}
