import { computed, Directive, forwardRef, input, Provider, Type, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapper } from '../../models/wrapper-type';
import { ValidationMessages } from '../../models/validation-types';
import { WrapperFieldInputs } from '../wrapper-field-inputs';
import { FIELD_ERROR_DISPLAY, FieldErrorDisplayClaim, injectFieldErrors } from '../../core/validation/field-errors';

/**
 * Plumbing shared by every `field-errors` wrapper: the slot, the inputs, the resolved
 * error surface, and the key this wrapper claims. Subclasses supply only a template —
 * which is the only thing that actually differs between the core default and each
 * adapter's native markup.
 *
 * ```typescript
 * @Component({
 *   selector: 'df-mat-field-errors',
 *   imports: [MatError],
 *   template: `
 *     <ng-container #fieldComponent></ng-container>
 *     @for (error of ngf.errorsToDisplay(); track error.kind) {
 *       <mat-error [id]="ngf.errorId()">{{ error.message }}</mat-error>
 *     }
 *   `,
 *   providers: [provideFieldErrorDisplay(() => MatFieldErrorsWrapperComponent)],
 * })
 * export default class MatFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}
 * ```
 */
@Directive()
export abstract class FieldErrorsWrapperBase implements FieldWrapper, FieldErrorDisplayClaim {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  /** Overrides the messages in `fieldInputs`. Containers forward their own. */
  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  /** The field whose errors this wrapper renders — see `FieldErrorDisplayClaim`. */
  readonly claimedKey = computed(() => this.fieldInputs()?.key);

  /** Resolved error surface, mirroring what `injectNgForgeField()` gives a field component. */
  protected readonly ngf = injectFieldErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

/**
 * Declares that a wrapper renders the wrapped field's errors, so that field's component
 * renders none of its own.
 *
 * Takes a thunk because the class is still being defined when the decorator evaluates.
 */
export function provideFieldErrorDisplay(wrapper: () => Type<FieldErrorDisplayClaim>): Provider {
  return { provide: FIELD_ERROR_DISPLAY, useExisting: forwardRef(wrapper) };
}
