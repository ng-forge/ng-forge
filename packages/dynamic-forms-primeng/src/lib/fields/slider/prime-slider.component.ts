import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeControl, NgForgeField, injectNgForgeField, NG_FORGE_FIELD_INPUTS } from '@ng-forge/dynamic-forms/integration';
import { PrimeSliderProps } from './prime-slider.type';
import { AsyncPipe } from '@angular/common';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'df-prime-slider',
  imports: [Slider, FormField, DynamicTextPipe, AsyncPipe, NgForgeControl],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  template: `
    @let f = ngf.field();

    <div class="df-prime-field">
      @if (ngf.label(); as label) {
        <label [for]="ngf.key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <p-slider
        ngForgeControl
        [id]="ngf.key()"
        [formField]="f"
        [min]="f().min?.() ?? props()?.min ?? 0"
        [max]="f().max?.() ?? props()?.max ?? 100"
        [step]="step() ?? props()?.step ?? 1"
        [range]="props()?.range || false"
        [orientation]="props()?.orientation || 'horizontal'"
        [attr.tabindex]="ngf.tabIndex()"
        [styleClass]="sliderClasses()"
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

  protected readonly sliderClasses = computed(() => {
    const classes: string[] = [];
    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }
    return classes.join(' ');
  });
}
