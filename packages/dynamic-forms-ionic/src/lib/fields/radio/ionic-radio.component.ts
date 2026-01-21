import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonItem, IonNote, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldMeta, FieldOption, ValidationMessages, ValueType } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicRadioComponent, IonicRadioProps } from './ionic-radio.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-ion-radio',
  imports: [IonRadioGroup, IonRadio, IonItem, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let radioGroupId = key() + '-radio-group';
    @if (label(); as label) {
      <div class="radio-label">{{ label | dynamicText | async }}</div>
    }

    <ion-radio-group
      [id]="radioGroupId"
      [formField]="f"
      [compareWith]="props()?.compareWith || defaultCompare"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
    >
      @for (option of options(); track option.value) {
        <ion-item [lines]="'none'">
          <ion-radio
            [value]="option.value"
            [disabled]="option.disabled || false"
            [labelPlacement]="props()?.labelPlacement ?? 'end'"
            [justify]="props()?.justify"
            [color]="props()?.color ?? 'primary'"
          >
            {{ option.label | dynamicText | async }}
          </ion-radio>
        </ion-item>
      }
    </ion-radio-group>

    @if (errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="errorId()" role="alert">{{ error.message }}</ion-note>
    } @else if (props()?.hint; as hint) {
      <ion-note class="df-ion-hint" [id]="hintId()">{{ hint | dynamicText | async }}</ion-note>
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

      .radio-label {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--ion-text-color);
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
export default class IonicRadioFieldComponent implements IonicRadioComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<ValueType>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly options = input<FieldOption<ValueType>[]>([]);
  readonly props = input<IonicRadioProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  defaultCompare = Object.is;

  constructor() {
    // Shadow DOM - apply meta to ion-radio elements, re-apply when options change
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-radio',
      dependents: [this.options],
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** Unique ID for the helper text element */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** Whether the field is currently in an invalid state (invalid AND touched) */
  protected readonly ariaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** Whether the field has a required validator */
  protected readonly ariaRequired = computed(() => {
    return this.field()().required?.() === true ? true : null;
  });

  /** aria-describedby linking to hint OR error elements (mutually exclusive) */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
