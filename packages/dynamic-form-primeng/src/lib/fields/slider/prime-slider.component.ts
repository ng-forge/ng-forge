import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-form';
import { PrimeSliderComponent, PrimeSliderProps } from './prime-slider.type';
import { AsyncPipe } from '@angular/common';
import { Slider } from 'primeng/slider';

/**
 * PrimeNG slider field component
 */
@Component({
  selector: 'df-prime-slider',
  imports: [Slider, Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
        <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }

      <p-slider
        [id]="key()"
        [field]="f"
        [min]="props()?.min ?? f().min?.() ?? 0"
        [max]="props()?.max ?? f().max?.() ?? 100"
        [disabled]="f().disabled()"
        [step]="props()?.step ?? 1"
        [range]="props()?.range || false"
        [orientation]="props()?.orientation || 'horizontal'"
        [attr.tabindex]="tabIndex()"
        [styleClass]="sliderClasses()"
      />

      @if (props()?.hint; as hint) {
        <small class="p-hint">{{ hint | dynamicText | async }}</small>
      }
      @for (error of errorsToDisplay(); track error.kind) {
        <small class="p-error">{{ error.message }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class PrimeSliderFieldComponent implements PrimeSliderComponent {
  readonly field = input.required<FieldTree<number>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<PrimeSliderProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly sliderClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }

    // Add p-invalid class when there are errors to display
    if (this.errorsToDisplay().length > 0) {
      classes.push('p-invalid');
    }

    return classes.join(' ');
  });
}
