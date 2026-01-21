import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { MatSliderComponent, MatSliderProps } from './mat-slider.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-mat-slider',
  imports: [MatSlider, MatSliderThumb, MatError, DynamicTextPipe, AsyncPipe, FormField],
  template: `
    @let f = field();
    @let inputId = key() + '-input';

    @if (label(); as label) {
      <div class="slider-label">{{ label | dynamicText | async }}</div>
    }

    <mat-slider
      [min]="f().min?.() ?? 0"
      [max]="f().max?.() ?? 100"
      [step]="props()?.step ?? 1"
      [discrete]="props()?.thumbLabel || props()?.showThumbLabel"
      [showTickMarks]="props()?.tickInterval !== undefined"
      [color]="props()?.color || 'primary'"
      class="slider-container"
    >
      <input
        matSliderThumb
        [id]="inputId"
        [formField]="f"
        [attr.tabindex]="tabIndex()"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-describedby]="ariaDescribedBy()"
      />
    </mat-slider>

    @if (errorsToDisplay()[0]; as error) {
      <mat-error [id]="errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      .slider-container {
        width: 100%;
      }
    `,
  ],
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatSliderFieldComponent implements MatSliderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'input' });
  }

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatSliderProps>();
  readonly meta = input<InputMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Unique ID for the hint element, used for aria-describedby */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Base ID for error elements, used for aria-describedby */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** aria-invalid: true when field is invalid AND touched, false otherwise */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
