import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { IonNote } from '@ionic/angular/standalone';
import { DynamicText, DynamicTextPipe, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';
import { IonicToggleComponent, IonicToggleProps } from './ionic-toggle.type';
import { IonicToggleControlComponent } from './ionic-toggle-control.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'df-ionic-toggle',
  imports: [IonicToggleControlComponent, IonNote, Field, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();

    <df-ionic-toggle-control
      [field]="f"
      [labelPlacement]="props()?.labelPlacement ?? 'end'"
      [justify]="props()?.justify"
      [color]="props()?.color ?? 'primary'"
      [enableOnOffLabels]="props()?.enableOnOffLabels ?? false"
      [tabIndex]="tabIndex()"
    >
      {{ label() | dynamicText | async }}
    </df-ionic-toggle-control>

    @for (error of errorsToDisplay(); track error.kind; let i = $index) {
      <ion-note color="danger" [id]="errorId() + '-' + i" role="alert">{{ error.message }}</ion-note>
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
  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  // Properties
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<IonicToggleProps>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────────

  /** Base ID for error elements */
  readonly errorId = computed(() => `${this.key()}-error`);
}
