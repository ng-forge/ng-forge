import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { TemplateAddon } from '@ng-forge/dynamic-forms/internal';
import { DF_FIELD_TEMPLATES } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

/** Renderer for the universal `template` addon kind. */
@Component({
  selector: 'df-template-addon',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as tpl) {
      <ng-container *ngTemplateOutlet="tpl; context: outletContext()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateAddonComponent {
  private readonly templates = inject(DF_FIELD_TEMPLATES, { optional: true });
  private readonly logger = inject(DynamicFormLogger);

  readonly addon = input.required<TemplateAddon>();
  /** Forwarded by `df-addon-slot`; surfaced to the template as its implicit `$implicit` context. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  // Pure computed: pure lookup, no side effects. Unresolved → null; the
  // `@if` in the template skips the outlet and renders nothing.
  protected readonly template = computed(() => {
    const map = this.templates?.();
    const key = this.addon().templateKey;
    return map?.get(key) ?? null;
  });

  /** Implicit context payload — template authors bind via `let-fi`. */
  protected readonly outletContext = computed(() => ({ $implicit: this.fieldInputs() }));

  constructor() {
    // Logging side effect lives in an effect, not the computed — keeps
    // the computed pure so signal-graph evaluations don't duplicate warnings.
    explicitEffect([this.template, this.addon], ([tpl, addon]) => {
      if (!tpl) {
        this.logger.warn(
          `Template addon: no <ng-template dfTemplate="${addon.templateKey}"> found. Did you project it as a child of <df-dynamic-form>?`,
        );
      }
    });
  }
}
