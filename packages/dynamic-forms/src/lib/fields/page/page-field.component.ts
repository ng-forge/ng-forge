import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DfFieldOutlet } from '../../directives/df-field-outlet/df-field-outlet.directive';
import { DF_FIELD_PLACEHOLDERS, type FieldPlaceholderContext } from '../../directives/df-placeholder/df-placeholder.directive';
import { resolvePlaceholderTemplate } from '../../directives/df-placeholder/resolve-placeholder-template';
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
import { FORM_OPTIONS } from '@ng-forge/dynamic-forms/internal';
import { getGridClassString } from '@ng-forge/dynamic-forms/internal';
import { isContainerField } from '@ng-forge/dynamic-forms/internal';
import { FIELD_WINDOWING } from '../../providers/features/field-windowing/field-windowing.token';
import { resolveFieldWindowing } from '../../providers/features/field-windowing/resolve-field-windowing';

/** Renders a single page in multi-page (wizard) forms. */
@Component({
  selector: 'section[page-field]',
  imports: [DfFieldOutlet, NgTemplateOutlet],
  template: `
    @for (field of resolvedFields(); track field.key; let i = $index) {
      @if (!field.hidden()) {
        @if (windowsField(field, i)) {
          @defer (on viewport) {
            <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
          } @placeholder {
            <div
              [class]="placeholderGridClass(field)"
              [style.min-height]="fieldWindowing().placeholderHeight"
              [attr.data-field-key]="field.key"
              aria-hidden="true"
            >
              @if (placeholderTemplate(field); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="placeholderContext(field)" />
              }
            </div>
          }
        } @else {
          <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
        }
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
  private readonly formOptions = inject(FORM_OPTIONS, { optional: true });
  private readonly globalFieldWindowing = inject(FIELD_WINDOWING);
  private readonly fieldPlaceholders = inject(DF_FIELD_PLACEHOLDERS, { optional: true });
  private readonly placeholderCtx = new Map<string, FieldPlaceholderContext>();

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

  /**
   * Effective field-windowing config for this page. Per-form
   * `FormOptions.fieldWindowing` wins over the global `withFieldWindowing()`
   * default; both fall back to disabled (fully eager).
   */
  protected readonly fieldWindowing = computed(() =>
    resolveFieldWindowing(this.globalFieldWindowing, this.formOptions?.()?.fieldWindowing),
  );

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

  /**
   * Whether a field should be deferred by field windowing. Containers are never
   * windowed: they emit `ComponentInitializedEvent`, which the form's init
   * tracker counts, so deferring one would stall `initialized` until it scrolls
   * into view. Leaf fields carry no such count, so they defer freely.
   */
  protected windowsField(field: ResolvedField, index: number): boolean {
    const w = this.fieldWindowing();
    return w.enabled && index >= w.eager && !isContainerField(field.fieldDef);
  }

  /** Class string for a windowed field's placeholder — matches the real field's grid column. */
  protected placeholderGridClass(field: ResolvedField): string {
    const grid = getGridClassString(field.fieldDef);
    return grid ? `df-field-placeholder ${grid}` : 'df-field-placeholder';
  }

  /** Projected placeholder template for a windowed field, or null for the built-in bare div. */
  protected placeholderTemplate(field: ResolvedField): TemplateRef<FieldPlaceholderContext> | null {
    const placeholders = this.fieldPlaceholders?.();
    return placeholders ? resolvePlaceholderTemplate(placeholders, { key: field.key, type: field.fieldDef.type }) : null;
  }

  /** Memoised template context for a windowed field's projected placeholder. */
  protected placeholderContext(field: ResolvedField): FieldPlaceholderContext {
    let ctx = this.placeholderCtx.get(field.key);
    if (!ctx) {
      const label = typeof field.fieldDef.label === 'string' ? field.fieldDef.label : undefined;
      const info = { key: field.key, type: field.fieldDef.type, label, col: field.fieldDef.col };
      ctx = { $implicit: info, field: info };
      this.placeholderCtx.set(field.key, ctx);
    }
    return ctx;
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
