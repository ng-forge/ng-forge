import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { forkJoin, map, of, pipe, scan, switchMap } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from '../../utils/resolve-field/resolve-field';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { RowField } from '../../definitions/default/row-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { FieldDef } from '../../definitions/base/field-def';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DYNAMIC_FORM_LOGGER } from '../../providers/features/logger/logger.token';

/**
 * Layout container for horizontal field arrangement.
 *
 * Does not create a new form context - fields share the parent's context.
 * Field values are flattened into the parent form (no nesting under row key).
 * Purely a visual/layout container with no impact on form structure.
 */
@Component({
  selector: 'div[row-field]',
  imports: [NgComponentOutlet],
  template: `
    @for (field of resolvedFields(); track field.key) {
      <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
    }
  `,
  styleUrl: './row-field.component.scss',
  host: {
    class: 'df-field df-row',
    '[class.disabled]': 'disabled()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RowFieldComponent {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DYNAMIC_FORM_LOGGER);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<RowField>();
  key = input.required<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly disabled = computed(() => {
    try {
      return this.field().disabled || false;
    } catch {
      return false;
    }
  });

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldsSource = computed(() => this.field().fields || []);

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([] as (ResolvedField | undefined)[]);
        }
        const rowKey = this.field().key || '<no key>';
        const context = {
          loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
          registry: this.rawFieldRegistry(),
          injector: this.injector,
          destroyRef: this.destroyRef,
          onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
            const fieldKey = fieldDef.key || '<no key>';
            this.logger.error(
              `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
                `within row '${rowKey}'. Ensure the field type is registered in your field registry.`,
              error,
            );
          },
        };
        return forkJoin(fields.map((f) => resolveField(f as FieldDef<unknown>, context)));
      }),
      map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
      scan(reconcileFields, [] as ResolvedField[]),
    ),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupEffects();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    // Emit initialization event when fields are resolved
    explicitEffect([this.resolvedFields], ([fields]) => {
      if (fields.length > 0) {
        emitComponentInitialized(this.eventBus, 'row', this.field().key, this.injector);
      }
    });
  }
}

export { RowFieldComponent };
