import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { computeContainerHostClasses, setupContainerInitEffect } from '../../utils/container-utils/container-utils';
import { PageField, validatePageNesting } from '../../definitions/default/page-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';

/**
 * Renders a single page in multi-page (wizard) forms.
 *
 * Visibility is controlled by the PageOrchestrator via the isVisible input.
 * Pages cannot be nested within other pages - validation prevents this.
 * Field values are flattened into the parent form (no nesting under page key).
 */
@Component({
  selector: 'section[page-field]',
  imports: [NgComponentOutlet],
  template: `
    @for (field of resolvedFields(); track field.key) {
      <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
    }
  `,
  styleUrl: './page-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[class.disabled]': 'disabled()',
    '[class.df-page-visible]': 'isVisible()',
    '[class.df-page-hidden]': '!isVisible()',
    '[attr.aria-hidden]': '!isVisible()',
    '[attr.data-page-index]': 'pageIndex()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageFieldComponent {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<PageField>();
  key = input.required<string>();
  className = input<string>();
  pageIndex = input.required<number>();
  isVisible = input.required<boolean>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly hostClasses = computed(() => computeContainerHostClasses('page-field', this.className()));

  readonly disabled = computed(() => this.field().disabled || false);

  readonly isValid = computed(() => validatePageNesting(this.field()));

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

  private readonly fieldsSource = computed(() => {
    if (!this.isValid()) {
      return [];
    }
    return this.field().fields || [];
  });

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    createFieldResolutionPipe(() => ({
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      registry: this.rawFieldRegistry(),
      injector: this.injector,
      destroyRef: this.destroyRef,
      onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
        const fieldKey = fieldDef.key || '<no key>';
        this.logger.error(
          `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
            `within page '${this.field().key}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      },
    })),
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
    setupContainerInitEffect(this.resolvedFields, this.eventBus, 'page', () => this.field().key, this.injector);

    explicitEffect([this.isValid, this.field], ([valid, pageField]) => {
      if (!valid) {
        this.logger.error(
          `Invalid configuration: Page '${pageField.key}' contains nested page fields. ` +
            `Pages cannot contain other pages. Consider using groups or rows for nested structure.`,
          pageField,
        );
      }
    });
  }
}
