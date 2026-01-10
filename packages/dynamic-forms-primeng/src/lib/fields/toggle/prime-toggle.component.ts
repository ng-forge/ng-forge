import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { PrimeToggleComponent, PrimeToggleProps } from './prime-toggle.type';
import { AsyncPipe } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'df-prime-toggle',
  imports: [ToggleSwitch, DynamicTextPipe, AsyncPipe, FormField],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();

    <div class="df-prime-field">
      @if (label()) {
        <label [for]="key()" class="df-prime-label">{{ label() | dynamicText | async }}</label>
      }

      <p-toggleSwitch
        [id]="key()"
        [formField]="f"
        [attr.tabindex]="tabIndex()"
        [attr.aria-invalid]="ariaInvalid"
        [attr.aria-required]="ariaRequired"
        [attr.aria-describedby]="ariaDescribedBy"
        [trueValue]="true"
        [falseValue]="false"
        [styleClass]="toggleClasses()"
      />

      @if (props()?.hint; as hint) {
        <small class="p-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
      }
      @for (error of errorsToDisplay(); track error.kind; let i = $index) {
        <small class="p-error" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[class.df-touched]': 'field()().touched()',
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
export default class PrimeToggleFieldComponent implements PrimeToggleComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeToggleProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Apply meta attributes to the internal toggle input
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'input[type="checkbox"]',
    });
  }

  readonly toggleClasses = computed(() => {
    const classes: string[] = [];

    const styleClass = this.props()?.styleClass;
    if (styleClass) {
      classes.push(styleClass);
    }

    // Note: p-invalid is handled by [invalid] input binding, not manual class
    return classes.join(' ');
  });

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

  /** aria-required: true if field is required, null otherwise (to remove attribute) */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby: links to hint and error messages for screen readers */
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.props()?.hint) {
      ids.push(this.hintId());
    }

    const errors = this.errorsToDisplay();
    errors.forEach((_, i) => {
      ids.push(`${this.errorId()}-${i}`);
    });

    return ids.length > 0 ? ids.join(' ') : null;
  });
}
