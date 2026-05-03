import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicTextPipe } from '@ng-forge/dynamic-forms';
import { NgForgeField, NG_FORGE_FIELD_INPUTS, provideMetaTarget } from '@ng-forge/dynamic-forms/integration';

import { MatToggleProps } from './mat-toggle.type';
import { MatError } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MATERIAL_CONFIG } from '../../models/material-config.token';

@Component({
  selector: 'df-mat-toggle',
  imports: [MatSlideToggle, FormField, MatError, DynamicTextPipe, AsyncPipe],
  hostDirectives: [{ directive: NgForgeField, inputs: [...NG_FORGE_FIELD_INPUTS] }],
  // mat-slide-toggle uses <button role="switch"> instead of <input type="checkbox">
  providers: [provideMetaTarget('button[role="switch"]')],
  template: `
    @let f = formFieldTree();
    @let toggleId = field.key() + '-toggle';

    <mat-slide-toggle
      [id]="toggleId"
      [formField]="f"
      [color]="props()?.color || 'primary'"
      [labelPosition]="props()?.labelPosition || 'after'"
      [hideIcon]="props()?.hideIcon || false"
      [disableRipple]="effectiveDisableRipple()"
      [required]="!!f().required()"
      [attr.aria-describedby]="field.ariaDescribedBy()"
      [attr.tabindex]="field.tabIndex()"
      class="toggle-container"
    >
      {{ field.label() | dynamicText | async }}
    </mat-slide-toggle>

    @if (field.errorsToDisplay()[0]; as error) {
      <mat-error [id]="field.errorId()">{{ error.message }}</mat-error>
    } @else if (props()?.hint; as hint) {
      <div class="mat-hint" [id]="field.hintId()">{{ hint | dynamicText | async }}</div>
    }
  `,
  styleUrl: '../../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatToggleFieldComponent {
  private materialConfig = inject(MATERIAL_CONFIG, { optional: true });
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly field = inject(NgForgeField);

  readonly props = input<MatToggleProps>();

  // Narrow FieldTree<unknown> to FieldTree<boolean> for the inner control's strict template type-check.
  protected readonly formFieldTree = computed(() => this.field.field() as FieldTree<boolean>);

  readonly effectiveDisableRipple = computed(() => this.props()?.disableRipple ?? this.materialConfig?.disableRipple ?? false);

  /**
   * Workaround: Angular Material's MatSlideToggle does NOT propagate aria-required to its internal
   * button element. This effect imperatively sets/removes aria-required on the internal button.
   *
   * Uses afterRenderEffect to ensure DOM is ready before querying internal elements.
   */
  private readonly syncAriaRequiredToDom = afterRenderEffect(() => {
    const isRequired = this.field.ariaRequired();
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
    const describedBy = this.field.ariaDescribedBy();
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
