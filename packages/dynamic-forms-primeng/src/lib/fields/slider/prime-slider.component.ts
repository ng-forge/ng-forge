import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms/integration';
import { NgForgeControl, injectNgForgeField, NgForgeFieldHost } from '@ng-forge/dynamic-forms/integration';
import { PrimeSliderProps } from './prime-slider.type';
import { AsyncPipe } from '@angular/common';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'df-prime-slider',
  imports: [Slider, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [NgForgeFieldHost],
  template: `
    @let f = ngf.field();
    @let inputId = ngf.key() + '-input';

    <div class="df-prime-field">
      @if (ngf.label(); as label) {
        <label [for]="inputId" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <p-slider
        ngForgeControl
        [id]="inputId"
        [formField]="f"
        [min]="f().min?.() ?? props()?.min ?? 0"
        [max]="f().max?.() ?? props()?.max ?? 100"
        [step]="step() ?? props()?.step ?? 1"
        [range]="props()?.range || false"
        [orientation]="props()?.orientation || 'horizontal'"
        [attr.tabindex]="ngf.tabIndex()"
        [styleClass]="props()?.styleClass ?? ''"
      />

      @if (ngf.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="ngf.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="p-hint" [id]="ngf.hintId()">{{ hint | dynamicText | async }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeSliderFieldComponent {
  protected readonly ngf = injectNgForgeField<number>();

  readonly step = input<number>();
  readonly props = input<PrimeSliderProps>();
}
