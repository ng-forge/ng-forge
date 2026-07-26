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
  /** The field's label, if any. */
  readonly label?: string;
  /** The field's grid column span, if any. */
  readonly col?: number;
}

/** Template context for a projected `dfPlaceholder`. */
export interface FieldPlaceholderContext {
  readonly $implicit: FieldPlaceholderInfo;
  readonly field: FieldPlaceholderInfo;
}

/** How a projected placeholder template is matched to fields. */
export type PlaceholderKind = 'key' | 'type' | 'default';

/** A projected placeholder template plus how it should be matched. */
export interface PlaceholderDescriptor {
  readonly kind: PlaceholderKind;
  /** Field key (kind `key`) or field type (kind `type`); empty for `default`. */
  readonly value: string;
  readonly templateRef: TemplateRef<FieldPlaceholderContext>;
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

const EMPTY_PLACEHOLDERS: ResolvedPlaceholders = { byKey: new Map(), byType: new Map() };

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

  /** Which cascade bucket this template registers under. Key beats type beats default. */
  readonly descriptor: Signal<PlaceholderDescriptor> = computed(() => {
    const key = this.dfPlaceholderKey();
    if (key) return { kind: 'key', value: key, templateRef: this.templateRef };
    const type = this.dfPlaceholder();
    if (type) return { kind: 'type', value: type, templateRef: this.templateRef };
    return { kind: 'default', value: '', templateRef: this.templateRef };
  });

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
  private readonly _placeholders = signal<ResolvedPlaceholders>(EMPTY_PLACEHOLDERS);

  /** Reactive view consumed via {@link DF_FIELD_PLACEHOLDERS}. */
  readonly placeholders: Signal<ResolvedPlaceholders> = this._placeholders.asReadonly();

  /** Fold projected descriptors into the cascade structure (last wins per bucket). */
  set(descriptors: readonly PlaceholderDescriptor[]): void {
    const byKey = new Map<string, TemplateRef<FieldPlaceholderContext>>();
    const byType = new Map<string, TemplateRef<FieldPlaceholderContext>>();
    let fallback: TemplateRef<FieldPlaceholderContext> | undefined;
    for (const d of descriptors) {
      if (d.kind === 'key') byKey.set(d.value, d.templateRef);
      else if (d.kind === 'type') byType.set(d.value, d.templateRef);
      else fallback = d.templateRef;
    }
    this._placeholders.set({ byKey, byType, default: fallback });
  }
}

/** Reactive resolved placeholders, provided at the DynamicForm scope. */
export const DF_FIELD_PLACEHOLDERS = new InjectionToken<Signal<ResolvedPlaceholders>>('DF_FIELD_PLACEHOLDERS');
