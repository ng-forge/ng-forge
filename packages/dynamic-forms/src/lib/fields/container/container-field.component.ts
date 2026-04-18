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
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DfFieldOutlet } from '../../directives/df-field-outlet.directive';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { computeContainerHostClasses, setupContainerInitEffect } from '../../utils/container-utils/container-utils';
import { ContainerField } from '../../definitions/default/container-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { WRAPPER_AUTO_ASSOCIATIONS } from '../../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../../models/field-signal-context.token';
import { isSameWrapperChain, resolveWrappers } from '../../utils/resolve-wrappers/resolve-wrappers';
import { createWrapperChainController } from '../../utils/wrapper-chain/wrapper-chain-controller';

/**
 * Layout container that wraps child fields with UI chrome.
 *
 * Resolves children like a row, then chains wrapper components around them
 * using imperative `ViewContainerRef.createComponent()` — each wrapper's
 * `#fieldComponent` slot hosts the next wrapper or the children template.
 *
 * Does not create a new form context - fields share the parent's context.
 * Field values are flattened into the parent form (no nesting under container key).
 * Purely a visual/layout container with no impact on form structure.
 */
@Component({
  selector: 'div[container-field]',
  imports: [DfFieldOutlet],
  template: `
    <ng-template #childrenTpl>
      @for (field of resolvedFields(); track field.key) {
        <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
      }
    </ng-template>
    <ng-container #wrapperContainer></ng-container>
  `,
  styleUrl: './container-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[class.disabled]': 'disabled()',
    '[class.df-container-hidden]': 'hidden()',
    '[attr.aria-hidden]': 'hidden() || null',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContainerFieldComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  protected readonly environmentInjector = inject(EnvironmentInjector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });

  private readonly childrenTpl = viewChild.required('childrenTpl', { read: TemplateRef });
  private readonly wrapperContainer = viewChild.required('wrapperContainer', { read: ViewContainerRef });

  field = input.required<ContainerField>();
  key = input.required<string>();
  className = input<string>();
  hidden = input(false);

  readonly hostClasses = computed(() => computeContainerHostClasses('container', this.className()));
  readonly disabled = computed(() => this.field().disabled || false);

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);
  private readonly fieldsSource = computed(() => (this.field().fields || []) as FieldDef<unknown>[]);

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    createFieldResolutionPipe(() => ({
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      registry: this.rawFieldRegistry(),
      injector: this.injector,
      destroyRef: this.destroyRef,
      onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
        const fieldKey = fieldDef.key || '<no key>';

        const containerKey = this.field().key || '<no key>';
        this.logger.error(
          `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
            `within container '${containerKey}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      },
    })),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  private readonly wrappers = computed(() => resolveWrappers(this.field(), this.defaultWrappersSignal?.(), this.wrapperAutoAssociations), {
    equal: isSameWrapperChain,
  });

  constructor() {
    // `row` is a virtual field type backed by ContainerFieldComponent — at
    // runtime the spread in rowFieldMapper preserves `type: 'row'` on the
    // field input, even though the declared type is `ContainerField`. Widen
    // here so `(events)` consumers filtering by `componentType === 'row'`
    // keep receiving emissions.
    setupContainerInitEffect(
      this.resolvedFields,
      this.eventBus,
      () => ((this.field().type as string) === 'row' ? 'row' : 'container'),
      () => this.field().key,
      this.injector,
    );

    createWrapperChainController({
      vcr: this.wrapperContainer,
      wrappers: this.wrappers,
      renderInnermost: (slot) => slot.createEmbeddedView(this.childrenTpl()),
    });
  }
}

export { ContainerFieldComponent };
