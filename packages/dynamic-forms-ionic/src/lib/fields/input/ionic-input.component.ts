import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonInput, IonNote } from '@ionic/angular/standalone';
import { createResolvedErrorsSignal, DynamicText, DynamicTextPipe, shouldShowErrors, ValidationMessages } from '@ng-forge/dynamic-forms';
import { IonicInputComponent, IonicInputProps } from './ionic-input.type';
import { AsyncPipe } from '@angular/common';
import { IONIC_CONFIG } from '../../models/ionic-config.token';

/**
 * Ionic input field component
 */
@Component({
  selector: 'df-ionic-input',
  imports: [IonInput, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <ion-input
      [field]="f"
      [label]="(label() | dynamicText | async) ?? undefined"
      [labelPlacement]="effectiveLabelPlacement()"
      [placeholder]="(placeholder() | dynamicText | async) ?? ''"
      [clearInput]="props()?.clearInput ?? false"
      [counter]="props()?.counter ?? false"
      [color]="effectiveColor()"
      [fill]="effectiveFill()"
      [shape]="effectiveShape()"
      [helperText]="(props()?.helperText | dynamicText | async) ?? undefined"
      [errorText]="f().invalid() && f().touched() ? ((props()?.errorText | dynamicText | async) ?? undefined) : undefined"
      [attr.tabindex]="tabIndex()"
    >
      <div slot="error">
        @for (error of errorsToDisplay(); track error.kind) {
          <ion-note color="danger">{{ error.message }}</ion-note>
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
  private ionicConfig = inject(IONIC_CONFIG, { optional: true });

  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicInputProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveFill = computed(() => this.props()?.fill ?? this.ionicConfig?.fill ?? 'solid');
  readonly effectiveShape = computed(() => this.props()?.shape ?? this.ionicConfig?.shape);
  readonly effectiveLabelPlacement = computed(() => this.props()?.labelPlacement ?? this.ionicConfig?.labelPlacement ?? 'start');
  readonly effectiveColor = computed(() => this.props()?.color ?? this.ionicConfig?.color);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  // Combine showErrors and resolvedErrors to avoid @if wrapper
  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}
