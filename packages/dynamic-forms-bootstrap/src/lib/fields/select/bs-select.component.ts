import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { BsSelectComponent, BsSelectProps } from './bs-select.type';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-bs-select',
  imports: [Field, DynamicTextPipe, AsyncPipe],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();
    @let ariaInvalid = this.ariaInvalid(); @let ariaRequired = this.ariaRequired();
    @let ariaDescribedBy = this.ariaDescribedBy();

    <div class="mb-3">
      @if (label(); as label) {
        <label [for]="key()" class="form-label">{{ label | dynamicText | async }}</label>
      }
      <select
        [field]="f"
        [id]="key()"
        class="form-select"
        [class.form-select-sm]="props()?.size === 'sm'"
        [class.form-select-lg]="props()?.size === 'lg'"
        [class.is-invalid]="f().invalid() && f().touched()"
        [multiple]="props()?.multiple || false"
        [size]="props()?.htmlSize"
        [attr.aria-invalid]="ariaInvalid"
        [attr.aria-required]="ariaRequired"
        [attr.aria-describedby]="ariaDescribedBy"
      >
        @if (placeholder(); as placeholder) {
          <option value="" disabled [selected]="!f().value()">{{ placeholder | dynamicText | async }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled || false" [selected]="isSelected(option.value, f().value())">
            {{ option.label | dynamicText | async }}
          </option>
        }
      </select>

      @if (props()?.helpText; as helpText) {
        <div class="form-text" [id]="helpTextId()">{{ helpText | dynamicText | async }}</div>
      }
      @for (error of errorsToDisplay(); track error.kind; let i = $index) {
        <div class="invalid-feedback d-block" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</div>
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
export default class BsSelectFieldComponent<T extends string = string> implements BsSelectComponent<T> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<T>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly options = input<FieldOption<T>[]>([]);
  readonly props = input<BsSelectProps<T>>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();
  readonly meta = input<FieldMeta>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    setupMetaTracking(this.elementRef, this.meta, { selector: 'select' });
  }

  defaultCompare = Object.is;

  protected isSelected(optionValue: T, fieldValue: T | T[] | null): boolean {
    const compareWith = this.props()?.compareWith || this.defaultCompare;

    if (Array.isArray(fieldValue)) {
      return fieldValue.some((v) => compareWith(v, optionValue));
    }

    return fieldValue !== null && compareWith(fieldValue, optionValue);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  protected readonly helpTextId = computed(() => `${this.key()}-help`);
  protected readonly errorId = computed(() => `${this.key()}-error`);

  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];
    if (this.props()?.helpText) {
      ids.push(this.helpTextId());
    }
    const errors = this.errorsToDisplay();
    errors.forEach((_, i) => {
      ids.push(`${this.errorId()}-${i}`);
    });
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
