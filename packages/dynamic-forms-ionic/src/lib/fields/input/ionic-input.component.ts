import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicInputComponent, IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';
import { IONIC_CONFIG } from '../../models/ionic-config.token';

@Component({
  selector: 'df-ion-input',
  imports: [IonInput, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let inputId = key() + '-input';

    <ion-input
      [id]="inputId"
      [type]="props()?.type ?? 'text'"
      [formField]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="effectiveLabelPlacement()"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [clearInput]="props()?.clearInput ?? false"
      [counter]="props()?.counter ?? false"
      [color]="effectiveColor()"
      [fill]="effectiveFill()"
      [shape]="effectiveShape()"
      [readonly]="f().readonly()"
      [helperText]="errorsToDisplay().length === 0 ? ((props()?.hint | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-describedby]="ariaDescribedBy()"
    />
    @if (errorsToDisplay()[0]; as error) {
      <ion-note color="danger" class="df-ion-error" [id]="errorId()" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  styleUrl: '../../styles/_form-field.scss',
  styles: [
    `
      :host([hidden]) {
        display: none !important;
      }
    `,
  ],
})
export default class IonicInputFieldComponent implements IonicInputComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private ionicConfig = inject(IONIC_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicInputProps>();
  readonly meta = input<InputMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveFill = computed(() => this.props()?.fill ?? this.ionicConfig?.fill ?? 'solid');
  readonly effectiveShape = computed(() => this.props()?.shape ?? this.ionicConfig?.shape);
  readonly effectiveLabelPlacement = computed(() => this.props()?.labelPlacement ?? this.ionicConfig?.labelPlacement ?? 'start');
  readonly effectiveColor = computed(() => this.props()?.color ?? this.ionicConfig?.color);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Shadow DOM - apply meta to ion-input element
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'ion-input',
    });

    // Workaround: Ionic's ion-input does NOT automatically propagate aria-describedby changes
    // to the native input element inside its shadow DOM. This effect imperatively syncs the attribute
    // after a microtask to ensure Ionic has processed the attribute change.
    explicitEffect([this.ariaDescribedBy], ([describedBy]) => {
      queueMicrotask(() => {
        const ionInput = this.elementRef.nativeElement.querySelector('ion-input') as HTMLIonInputElement | null;
        if (ionInput?.getInputElement) {
          ionInput.getInputElement().then((inputEl) => {
            if (inputEl) {
              if (describedBy) {
                inputEl.setAttribute('aria-describedby', describedBy);
              } else {
                inputEl.removeAttribute('aria-describedby');
              }
            }
          });
        }
      });
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
