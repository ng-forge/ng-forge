import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, pipe, scan, switchMap } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from '../../utils/resolve-field/resolve-field';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PageField, validatePageNesting } from '../../definitions/default/page-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { FieldDef } from '../../definitions/base/field-def';

@Component({
  selector: 'page-field',
  imports: [NgComponentOutlet],
  template: `
    <div class="df-page" [class.df-page-visible]="isVisible()" [class.df-page-hidden]="!isVisible()" [attr.aria-hidden]="!isVisible()">
      @for (field of resolvedFields(); track field.key) {
        <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
      }
    </div>
  `,
  styleUrl: './page-field.component.scss',
  host: {
    class: 'df-field df-page-field',
    '[class.disabled]': 'disabled()',
    '[class.df-page-visible]': 'isVisible()',
    '[class.df-page-hidden]': '!isVisible()',
    '[style.display]': 'isVisible() ? "block" : "none"',
    '[attr.aria-hidden]': '!isVisible()',
    '[attr.data-page-index]': 'pageIndex()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageFieldComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<PageField>();
  key = input.required<string>();
  /** Page index passed from orchestrator */
  pageIndex = input.required<number>();
  /** Page visibility state passed from orchestrator */
  isVisible = input.required<boolean>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly disabled = computed(() => this.field().disabled || false);

  /** Validates that this page doesn't contain nested pages */
  readonly isValid = computed(() => {
    const pageField = this.field();
    const valid = validatePageNesting(pageField);

    if (!valid) {
      console.error(
        `[Dynamic Forms] Invalid configuration: Page '${pageField.key}' contains nested page fields. ` +
          `Pages cannot contain other pages. Consider using groups or rows for nested structure.`,
        pageField,
      );
    }

    return valid;
  });

  /** Memoized field registry raw access */
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  readonly nextPage = outputFromObservable(this.eventBus.on<NextPageEvent>('next-page'));
  readonly previousPage = outputFromObservable(this.eventBus.on<PreviousPageEvent>('previous-page'));
  readonly pageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  /** Source signal for fields to render. Only returns fields if validation passes. */
  private readonly fieldsSource = computed(() => {
    // Only return fields if validation passes
    if (!this.isValid()) {
      return [];
    }
    return this.field().fields || [];
  });

  /**
   * Resolved fields for declarative rendering using derivedFromDeferred.
   * Page components pass through parent FIELD_SIGNAL_CONTEXT unchanged.
   */
  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([] as (ResolvedField | undefined)[]);
        }
        const pageKey = this.field().key;
        const context = {
          loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
          registry: this.rawFieldRegistry(),
          injector: this.injector, // Pass through parent injector
          destroyRef: this.destroyRef,
          onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
            const fieldKey = fieldDef.key || '<no key>';
            console.error(
              `[Dynamic Forms] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
                `within page '${pageKey}'. Ensure the field type is registered in your field registry.`,
              error,
            );
          },
        };
        return forkJoin(fields.map((f) => resolveField(f as FieldDef<unknown>, context)));
      }),
      // Filter out undefined (failed loads) and cast to ResolvedField[]
      map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
      // Reconcile to reuse injectors for unchanged fields
      scan(reconcileFields, [] as ResolvedField[]),
    ),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects - Declarative side effects as class fields
  // ─────────────────────────────────────────────────────────────────────────────

  /** Emits initialization event when fields are resolved */
  private readonly emitInitializedOnFieldsResolved = explicitEffect([this.resolvedFields], ([fields]) => {
    if (fields.length > 0) {
      emitComponentInitialized(this.eventBus, 'page', this.field().key, this.injector);
    }
  });
}
