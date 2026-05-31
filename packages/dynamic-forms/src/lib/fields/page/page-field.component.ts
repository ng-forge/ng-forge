import { ChangeDetectionStrategy, Component, computed, DestroyRef, EnvironmentInjector, inject, Injector, input } from '@angular/core';
import { DfFieldOutlet } from '../../directives/df-field-outlet/df-field-outlet.directive';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { derivedFromDeferred } from '@ng-forge/dynamic-forms/internal';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { computeContainerHostClasses, setupContainerInitEffect } from '../../utils/container-utils/container-utils';
import { PageField, validatePageNesting } from '@ng-forge/dynamic-forms/internal';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';

/** Renders a single page in multi-page (wizard) forms. */
@Component({
  selector: 'section[page-field]',
  imports: [DfFieldOutlet],
  template: `
    @for (field of resolvedFields(); track field.key) {
      @if (!field.hidden()) {
        <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
      }
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
  protected readonly environmentInjector = inject(EnvironmentInjector);
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
