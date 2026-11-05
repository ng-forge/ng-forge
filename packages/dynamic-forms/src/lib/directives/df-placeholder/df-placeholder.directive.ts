import { computed, Directive, Injectable, inject, InjectionToken, input, Signal, signal, TemplateRef } from '@angular/core';

/**
 * Field metadata handed to a projected placeholder template as its context —
 * both `$implicit` (for `let-field`) and the named `field`. Deliberately narrow
 * and stable: it is NOT the internal `ResolvedField`.
 */
export interface FieldPlaceholderInfo {
  /** The field's key. */
  readonly key: string;
  /** The field's type (e.g. `input`, `textarea`, `select`). */
  readonly type: string;
  /** The field's label when it is a plain string; translated (Observable or Signal) labels are not resolved. */
  readonly label?: string;
  /** The field's grid column span, if any. */
  readonly col?: number;
}

/** Template context for a projected `dfPlaceholder`. */
export interface FieldPlaceholderContext {
  readonly $implicit: FieldPlaceholderInfo;
  readonly field: FieldPlaceholderInfo;
}

/**
 * Resolved placeholder templates, indexed for the resolution cascade
 * (key → type → default). Empty maps + no default means "use the built-in
 * bare div", preserving the pre-projection behaviour.
 */
export interface ResolvedPlaceholders {
  readonly byKey: ReadonlyMap<string, TemplateRef<FieldPlaceholderContext>>;
  readonly byType: ReadonlyMap<string, TemplateRef<FieldPlaceholderContext>>;
  readonly default?: TemplateRef<FieldPlaceholderContext>;
}

/**
 * Marks an `<ng-template>` projected into `<form dynamic-form>` content as a
 * field-windowing placeholder. Mirrors {@link DfTemplate}: the template is
 * captured by `DynamicForm` via `contentChildren` and published through
 * {@link DF_FIELD_PLACEHOLDERS} so dynamically-rendered pages can resolve it.
 *
 * - `<ng-template dfPlaceholder let-field>` — default, used for any field
 * - `<ng-template dfPlaceholder="textarea">` — matched by field type
 * - `<ng-template dfPlaceholderKey="username">` — matched by a specific field key
 */
@Directive({
  selector: 'ng-template[dfPlaceholder], ng-template[dfPlaceholderKey]',
  exportAs: 'dfPlaceholder',
})
export class DfPlaceholder {
  /** Field-type match, or empty for the default placeholder. */
  readonly dfPlaceholder = input<string>('');
  /** Field-key match (escape hatch); wins over a type match. */
  readonly dfPlaceholderKey = input<string>('');

  readonly templateRef = inject(TemplateRef) as TemplateRef<FieldPlaceholderContext>;

  /** Types `let-field` in `<ng-template dfPlaceholder let-field>`. */
  static ngTemplateContextGuard(_dir: DfPlaceholder, ctx: unknown): ctx is FieldPlaceholderContext {
    return true;
  }
}

/**
 * Holder service published at the `<form dynamic-form>` component scope.
 * `DynamicForm` collects projected `<ng-template dfPlaceholder>` via
 * `contentChildren(DfPlaceholder)` and folds them into the cascade structure.
 * The {@link DF_FIELD_PLACEHOLDERS} token exposes the resulting signal so
 * page/container renderers resolve placeholders without coupling to the host
 * form's generic class.
 */
@Injectable()
export class DfPlaceholderRegistry {
  private readonly source = signal<Signal<readonly DfPlaceholder[]> | undefined>(undefined);

  /** Reactive view consumed via {@link DF_FIELD_PLACEHOLDERS}; follows bound inputs on the projected templates. */
  readonly placeholders: Signal<ResolvedPlaceholders> = computed(() => foldPlaceholders(this.source()?.() ?? []));

  /** Connects the form's `contentChildren(DfPlaceholder)` query. */
  bind(projected: Signal<readonly DfPlaceholder[]>): void {
    this.source.set(projected);
  }
}

/** Folds projected templates into the cascade structure (last wins per bucket). Key beats type beats default. */
function foldPlaceholders(placeholders: readonly DfPlaceholder[]): ResolvedPlaceholders {
  const byKey = new Map<string, TemplateRef<FieldPlaceholderContext>>();
  const byType = new Map<string, TemplateRef<FieldPlaceholderContext>>();
  let fallback: TemplateRef<FieldPlaceholderContext> | undefined;
  for (const p of placeholders) {
    const key = p.dfPlaceholderKey();
    const type = p.dfPlaceholder();
    if (key) byKey.set(key, p.templateRef);
    else if (type) byType.set(type, p.templateRef);
    else fallback = p.templateRef;
  }
  return { byKey, byType, default: fallback };
}

/** Reactive resolved placeholders, provided at the DynamicForm scope. */
export const DF_FIELD_PLACEHOLDERS = new InjectionToken<Signal<ResolvedPlaceholders>>('DF_FIELD_PLACEHOLDERS');
