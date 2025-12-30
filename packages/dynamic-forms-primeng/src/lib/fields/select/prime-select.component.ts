import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { AsyncPipe } from '@angular/common';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { PrimeSelectComponent, PrimeSelectProps } from './prime-select.type';

@Component({
  selector: 'df-prime-select',
  imports: [Field, Select, MultiSelect, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();

    <div class="df-prime-field">
      @if (label(); as label) {
        <label [for]="key()" class="df-prime-label">{{ label | dynamicText | async }}</label>
      }
      @if (isMultiple()) {
        <p-multiSelect
          [field]="f"
          [inputId]="key()"
          [options]="options()"
          optionLabel="label"
          optionValue="value"
          [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
          [filter]="props()?.filter ?? false"
          [showClear]="props()?.showClear ?? false"
          [attr.aria-invalid]="ariaInvalid"
          [attr.aria-required]="ariaRequired"
          [attr.aria-describedby]="ariaDescribedBy"
          [styleClass]="selectClasses()"
        />
      } @else {
        <p-select
          [field]="f"
          [inputId]="key()"
          [options]="options()"
          optionLabel="label"
          optionValue="value"
          [placeholder]="(props()?.placeholder | dynamicText | async) ?? ''"
          [filter]="props()?.filter ?? false"
          [showClear]="props()?.showClear ?? false"
          [attr.aria-invalid]="ariaInvalid"
          [attr.aria-required]="ariaRequired"
          [attr.aria-describedby]="ariaDescribedBy"
          [styleClass]="selectClasses()"
        />
      }
      @if (props()?.hint; as hint) {
        <small class="df-prime-hint" [id]="hintId()">{{ hint | dynamicText | async }}</small>
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
export default class PrimeSelectFieldComponent<T> implements PrimeSelectComponent<T> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<PrimeSelectProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta);
  }

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  readonly isMultiple = computed(() => this.props()?.multiple ?? false);

  readonly selectClasses = computed(() => {
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
