import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TemplateAddon } from '../models/addon/addon-def';
import { DF_FIELD_TEMPLATES } from '../models/addon/df-field-templates.token';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

/**
 * Renderer for the universal `template` addon kind.
 *
 * Resolves the addon's `templateKey` against {@link DF_FIELD_TEMPLATES}
 * (populated by `<df-dynamic-form>` from `<ng-template dfTemplate="...">`
 * children) and renders via `NgTemplateOutlet`.
 *
 * If the key is unresolved, logs a warning and renders nothing — keeps the
 * form alive when a backend references a template the FE has not registered.
 */
@Component({
  selector: 'df-template-addon',
  imports: [NgTemplateOutlet],
  template: `
    @if (template(); as tpl) {
      <ng-container *ngTemplateOutlet="tpl" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateAddonComponent {
  private readonly templates = inject(DF_FIELD_TEMPLATES, { optional: true });
  private readonly logger = inject(DynamicFormLogger);

  readonly addon = input.required<TemplateAddon>();
  /** Forwarded by `df-addon-slot`; templates that need field state read it via `let-` context binding. */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();

  protected readonly template = computed(() => {
    const map = this.templates?.();
    const key = this.addon().templateKey;
    const tpl = map?.get(key);
    if (!tpl) {
      this.logger.warn(
        `[Dynamic Forms] Template addon: no <ng-template dfTemplate="${key}"> found. ` +
          `Did you project it as a child of <df-dynamic-form>?`,
      );
      return null;
    }
    return tpl;
  });
}
