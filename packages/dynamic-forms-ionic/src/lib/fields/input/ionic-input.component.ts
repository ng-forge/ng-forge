import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicInputComponent, IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';
import { IONIC_CONFIG } from '../../models/ionic-config.token';

@Component({
  selector: 'df-ion-input',
  imports: [IonInput, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaInvalid = isAriaInvalid();
    @let ariaRequired = isRequired() || null;
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
      [helperText]="(props()?.helperText | dynamicText | async) ?? undefined"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
    />
    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <ion-note color="danger" class="df-ion-error" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
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
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  readonly errorId = computed(() => `${this.key()}-error`);

  /** Whether the field is currently in an invalid state (invalid AND touched) */
  readonly isAriaInvalid = computed(() => {
    const fieldState = this.field()();
    return fieldState.invalid() && fieldState.touched();
  });

  /** Whether the field has a required validator */
  readonly isRequired = computed(() => {
    return this.field()().required?.() === true;
  });
}
