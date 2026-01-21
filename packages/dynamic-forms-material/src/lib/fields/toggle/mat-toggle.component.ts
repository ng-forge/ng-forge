import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicText, DynamicTextPipe, FieldMeta, ValidationMessages } from '@ng-forge/dynamic-forms';
import { createResolvedErrorsSignal, setupMetaTracking, shouldShowErrors } from '@ng-forge/dynamic-forms/integration';

import { MatToggleComponent, MatToggleProps } from './mat-toggle.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';
import { createAriaDescribedBySignal } from '../../utils/create-aria-described-by';

@Component({
  selector: 'df-mat-toggle',
  imports: [MatSlideToggle, FormField, MatError, DynamicTextPipe, AsyncPipe],
  template: `
    @let f = field();
    @let toggleId = key() + '-toggle';

    <mat-slide-toggle
      [id]="toggleId"
      [formField]="f"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="effectiveDisableRipple()"
      [required]="!!f().required()"
      [attr.aria-describedby]="ariaDescribedBy()"
      [attr.tabindex]="tabIndex()"
      class="toggle-container"
    >
      {{ label() | dynamicText | async }}
    </mat-slide-toggle>

    @if (errorsToDisplay()[0]; as error) {
      <mat-error [id]="errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  host: {
    '[class]': 'className()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'field()().hidden() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent implements MatToggleComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly field = input.required<FieldTree<boolean>>();
  readonly key = input.required<string>();

  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();

  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  readonly props = input<MatToggleProps>();
  readonly meta = input<FieldMeta>();
  readonly validationMessages = input<ValidationMessages>();
  readonly defaultValidationMessages = input<ValidationMessages>();

  readonly effectiveDisableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);

  readonly resolvedErrors = createResolvedErrorsSignal(this.field, this.validationMessages, this.defaultValidationMessages);
  readonly showErrors = shouldShowErrors(this.field);

  readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));

  constructor() {
    // Apply meta attributes to the internal toggle button
    // Note: mat-slide-toggle uses <button role="switch"> instead of <input type="checkbox">
    setupMetaTracking(this.elementRef, this.meta, {
      selector: 'button[role="switch"]',
    });
  }

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
  protected readonly ariaDescribedBy = createAriaDescribedBySignal(
    this.errorsToDisplay,
    this.errorId,
    this.hintId,
    () => !!this.props()?.hint,
  );

  /**
   * Workaround: Angular Material's MatSlideToggle does NOT propagate aria-required to its internal
   * button element. This effect imperatively sets/removes aria-required on the internal button.
   *
   * Uses afterRenderEffect to ensure DOM is ready before querying internal elements.
   */
  private readonly syncAriaRequiredToDom = afterRenderEffect(() => {
    const isRequired = this.ariaRequired();
    const buttonEl = this.elementRef.nativeElement.querySelector('button[role="switch"]');
    if (buttonEl) {
      if (isRequired) {
        buttonEl.setAttribute('aria-required', 'true');
      } else {
        buttonEl.removeAttribute('aria-required');
      }
    }
  });

  /**
   * Workaround: Angular Material's MatSlideToggle does NOT propagate aria-describedby to its internal
   * button element. This effect imperatively sets/removes aria-describedby on the internal button.
   *
   * Uses afterRenderEffect to ensure DOM is ready before querying internal elements.
   */
  private readonly syncAriaDescribedByToDom = afterRenderEffect(() => {
    const describedBy = this.ariaDescribedBy();
    const buttonEl = this.elementRef.nativeElement.querySelector('button[role="switch"]');
    if (buttonEl) {
      if (describedBy) {
        buttonEl.setAttribute('aria-describedby', describedBy);
      } else {
        buttonEl.removeAttribute('aria-describedby');
      }
    }
  });
}
