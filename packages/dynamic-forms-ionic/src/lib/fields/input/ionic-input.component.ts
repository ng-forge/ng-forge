import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, InputMeta, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicInputComponent, IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';
import { IONIC_CONFIG } from '../../models/ionic-config.token';

@Component({
  selector: 'df-ionic-input',
  imports: [IonInput, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let ariaInvalid = isAriaInvalid();
    @let ariaRequired = isRequired() || null;

    <ion-input
      [type]="props()?.type ?? 'text'"
      [field]="f"
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
      [errorText]="f().invalid() && f().touched() ? ((props()?.errorText | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="tabIndex()"
      [attr.aria-invalid]="ariaInvalid"
      [attr.aria-required]="ariaRequired"
      [class.ion-invalid]="f().invalid()"
      [class.ion-touched]="f().touched()"
    >
      <div slot="error">
        @for (error of errorsToDisplay(); track error.kind; let i = $index) {
          <ion-note color="danger" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
        }
      </div>
    </ion-input>
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
