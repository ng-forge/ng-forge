import { Directive, Injectable, inject, input, Signal, signal, TemplateRef } from '@angular/core';

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

/**
 * Holder service published at the `<df-dynamic-form>` component scope.
 * `DynamicForm` collects projected `<ng-template dfTemplate="...">` via
 * `contentChildren(DfTemplate)` and pushes the resulting map through
 * `DfFieldTemplateRegistry.set(...)`. The {@link DF_FIELD_TEMPLATES}
 * injection token is provided as a factory that returns this service's
 * `map` signal, so template-addon components can resolve `templateKey`
 * without coupling to the host form's generic class.
 */
@Injectable()
export class DfFieldTemplateRegistry {
  private readonly _map = signal<ReadonlyMap<string, TemplateRef<unknown>>>(new Map());

  /** Reactive view consumed by the `template` addon kind via DI. */
  readonly map: Signal<ReadonlyMap<string, TemplateRef<unknown>>> = this._map.asReadonly();

  /** Replace the registry contents — called from `DynamicForm` when projected templates change. */
  set(value: ReadonlyMap<string, TemplateRef<unknown>>): void {
    this._map.set(value);
  }
}
