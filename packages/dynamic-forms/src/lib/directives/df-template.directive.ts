import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Marks an `<ng-template>` projected into `<df-dynamic-form>` content as
 * available to template addons by name.
 *
 * The host form collects all `DfTemplate` instances via `contentChildren`
 * and exposes them through {@link DF_FIELD_TEMPLATES}, where the template
 * addon kind looks them up by `templateKey` at render time.
 *
 * @example
 * ```html
 * <df-dynamic-form [config]="config">
 *   <ng-template dfTemplate="searchIcon" let-field>
 *     <my-icon [field]="field" />
 *   </ng-template>
 * </df-dynamic-form>
 * ```
 *
 * In the field config:
 * ```ts
 * { slot: 'prefix', kind: 'template', templateKey: 'searchIcon' }
 * ```
 */
@Directive({
  selector: 'ng-template[dfTemplate]',
  exportAs: 'dfTemplate',
})
export class DfTemplate {
  /** Name this template registers under — referenced from `TemplateAddon.templateKey`. */
  readonly dfTemplate = input.required<string>();

  /** The wrapped template, captured for registration and `NgTemplateOutlet` rendering. */
  readonly templateRef: TemplateRef<unknown> = inject(TemplateRef);
}
