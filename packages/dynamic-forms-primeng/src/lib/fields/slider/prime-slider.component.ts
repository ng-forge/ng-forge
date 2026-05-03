import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';
import { PrimeSliderProps } from './prime-slider.type';
import { AsyncPipe } from '@angular/common';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'df-prime-slider',
  imports: [Slider, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  hostDirectives: [
    {
      directive: NgForgeField,
      inputs: ['field', 'key', 'label', 'placeholder', 'className', 'tabIndex', 'props', 'meta', 'validationMessages'],
    },
  ],
  providers: [provideMetaTarget('input')],
  template: `
    @let f = field.field();

    <div class="df-prime-field">
      @if (field.label(); as label) {
        <label [for]="field.key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <p-slider
        [id]="field.key()"
        [formField]="f"
        [min]="f().min?.() ?? props()?.min ?? 0"
        [max]="f().max?.() ?? props()?.max ?? 100"
        [step]="step() ?? props()?.step ?? 1"
        [range]="props()?.range || false"
        [orientation]="props()?.orientation || 'horizontal'"
        [attr.tabindex]="field.tabIndex()"
        [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-required]="field.ariaRequired()"
        [attr.aria-describedby]="field.ariaDescribedBy()"
        [styleClass]="sliderClasses()"
      />

      @if (field.errorsToDisplay()[0]; as error) {
        <small class="p-error" [id]="field.errorId()" role="alert">{{ error.message }}</small>
      } @else if (props()?.hint; as hint) {
        <small class="p-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</small>
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
  protected readonly field = inject(NgForgeField);

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
