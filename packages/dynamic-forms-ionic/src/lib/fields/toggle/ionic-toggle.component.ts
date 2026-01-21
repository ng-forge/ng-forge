import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicToggleComponent, IonicToggleProps } from './ionic-toggle.type';
import { IonicToggleControlComponent } from './ionic-toggle-control.component';
import { AsyncPipe } from '@angular/common';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-ion-toggle',
  imports: [IonicToggleControlComponent, IonNote, FormField, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let toggleId = key() + '-toggle';

    <df-ion-toggle-control
      [id]="toggleId"
      [formField]="f"
      [meta]="meta()"
      [labelPlacement]="props()?.labelPlacement ?? 'end'"
      [justify]="props()?.justify"
      [color]="props()?.color ?? 'primary'"
      [enableOnOffLabels]="props()?.enableOnOffLabels ?? false"
      [tabIndex]="tabIndex()"
      [ariaDescribedBy]="ariaDescribedBy()"
    >
      {{ label() | dynamicText | async }}
    </df-ion-toggle-control>

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
export default class IonicToggleFieldComponent implements IonicToggleComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicToggleProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  constructor() {
    setupMetaTracking(this.elementRef, this.meta);
  }

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  protected readonly errorId = computed(() => `${this.key()}-error`);

  /** Unique ID for the helper text element */
  protected readonly hintId = computed(() => `${this.key()}-hint`);

  /** aria-describedby linking to hint OR error elements (mutually exclusive) */
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );
}
