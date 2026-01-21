import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { PrimeRadioComponent, PrimeRadioProps } from './prime-radio.type';
import { AsyncPipe } from '@angular/common';
import { PrimeRadioGroupComponent } from './prime-radio-group.component';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-prime-radio',
  imports: [PrimeRadioGroupComponent, FormField, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @if (label()) {
      <div class="radio-label">{{ label() | dynamicText | async }}</div>
    }

    <df-prime-radio-group
      [formField]="f"
      [options]="options()"
      [properties]="props()"
      [meta]="meta()"
      [attr.aria-describedby]="ariaDescribedBy()"
    />

    @if (errorsToDisplay()[0]; as error) {
      <small class="p-error" [id]="errorId()" role="alert">{{ error.message }}</small>
    } @else if (props()?.hint; as hint) {
      <small class="p-hint" [id]="hintId()" [attr.hidden]="f().hidden() || null">{{ hint | dynamicText | async }}</small>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }

      .radio-label {
        margin-bottom: 0.5rem;
        font-weight: 500;
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
export default class PrimeRadioFieldComponent implements PrimeRadioComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<ValueType>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<PrimeRadioProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="radio"]',
      dependents: [this.options],
    });
  }

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

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
