import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IonNote, IonRange } from '@ionic/angular/standalone';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NgForgeHostControl, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { IonicSliderProps } from './ionic-slider.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ion-slider',
  imports: [IonRange, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }, NgForgeHostControl],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-input';

    <ion-range
      [id]="inputId"
      [formField]="f"
      [label]="(ngf.label() | dynamicText | async) ?? undefined"
      [labelPlacement]="props()?.labelPlacement ?? 'stacked'"
      [min]="f().min?.() ?? props()?.min ?? 0"
      [max]="f().max?.() ?? props()?.max ?? 100"
      [step]="step() ?? props()?.step ?? 1"
      [dualKnobs]="props()?.dualKnobs ?? false"
      [pin]="props()?.pin ?? false"
      [pinFormatter]="props()?.pinFormatter ?? defaultPinFormatter"
      [ticks]="props()?.ticks ?? false"
      [snaps]="props()?.snaps ?? false"
      [color]="props()?.color ?? 'primary'"
      [attr.tabindex]="ngf.tabIndex()"
      [attr.aria-invalid]="ngf.ariaInvalid()"
      [attr.aria-required]="ngf.ariaRequired()"
      [attr.aria-describedby]="ngf.ariaDescribedBy()"
    />

    @if (ngf.errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</ion-note>
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
export default class IonicSliderFieldComponent {
  protected readonly ngf = injectNgForgeField<number>();

  readonly step = input<number>();
  readonly props = input<IonicSliderProps>();

  // strict template type-check; runtime shape is correct.

  protected defaultPinFormatter = (value: number) => String(value);
}
