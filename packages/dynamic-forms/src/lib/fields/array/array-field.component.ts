import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  inputBinding,
  runInInjectionContext,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, forkJoin, map, of, switchMap } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FieldTree, form, FormUiControl } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent } from '../../events';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { ArrayContext, FieldSignalContext } from '../../mappers';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';

/**
 * Array field component that manages dynamic arrays of field values.
 *
 * Key behaviors:
 * - Fields array defines the TEMPLATE (not instances)
 * - Collects values as flat array: [value1, value2, value3]
 * - Supports dynamic add/remove via event bus
 * - Template stored in computed signal for type enforcement
 *
 * Example:
 * ```typescript
 * {
 *   key: 'items',
 *   type: 'array',
 *   fields: [
 *     { key: 'item', type: 'input', value: '' }
 *   ]
 * }
 * // Creates: { items: ['value1', 'value2', 'value3'] }
 * ```
 */
@Component({
  selector: 'array-field',
  template: `
    <div class="array-container">
      <div class="array-items" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
        <!-- Array items will be rendered here -->
      </div>
    </div>
  `,
  styleUrl: './array-field.component.scss',
  host: {
    class: 'df-field df-array',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class ArrayFieldComponent<TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<ArrayField>();

  key = input.required<string>();

  /**
   * Get the field template from the array field definition.
   * This template is used when adding new items dynamically.
   */
  private readonly fieldTemplate = computed<FieldDef<unknown> | null>(() => {
    const arrayField = this.field();
    // Array fields should have exactly one field as the template
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

  /**
   * Get the array of FieldTree objects from the parent form.
   * Signal Forms automatically creates FieldTree for each array item.
   *
   * IMPORTANT: Only track array structure changes (add/remove), not individual item value changes.
   * This prevents unnecessary re-rendering when typing in fields.
   */
  private readonly arrayFieldTrees = computed<readonly FieldTree<unknown>[]>(() => {
    const arrayKey = this.field().key;

    // Get the parent form - this tracks when the form structure changes
    const parentForm = this.parentFieldSignalContext.form();

    // Access the array FieldTree through the form's structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childrenMap = (parentForm as any).structure?.childrenMap?.();
    if (!childrenMap) return [];

    const arrayFieldTree = childrenMap.get(arrayKey);
    if (!arrayFieldTree) return [];

    const arrayItemsMap = arrayFieldTree.structure?.childrenMap?.();
    if (!arrayItemsMap) return [];

    // Return array of FieldTree objects (one per array item)
    // This only re-runs when items are added/removed, not when values change
    return Array.from(arrayItemsMap.values());
  });

  private currentComponents: ComponentRef<FormUiControl>[] = [];

  // TODO: Eliminate flicker when adding/removing array items
  // Current implementation clears all components and recreates them when array length changes,
  // causing a brief visual flicker. Consider implementing:
  // - Differential updates (only add/remove changed items)
  // - Animation transitions for smoother add/remove operations
  // - Reusing existing component instances when possible

  // Create field components from FieldTree array
  fields = toSignal(
    toObservable(this.arrayFieldTrees).pipe(
      switchMap((fieldTrees: readonly FieldTree<unknown>[]) => {
        if (fieldTrees.length !== this.currentComponents.length) {
          this.vcr.clear();
          this.currentComponents = [];

          if (fieldTrees.length === 0) {
            return of([]);
          }

          return forkJoin(this.mapFieldTrees(fieldTrees)).pipe(
            map((components) => {
              this.currentComponents = components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp);
              return this.currentComponents;
            }),
          );
        }

        return of(this.currentComponents);
      }),
    ),
    { initialValue: [] },
  );

  /**
   * Listen for AddArrayItemEvent and RemoveArrayItemEvent
   * Using takeUntilDestroyed() to prevent memory leaks
   */
  constructor() {
    // Store key signal reference for use in subscription
    const keySignal = this.key;

    this.eventBus
      .on<AddArrayItemEvent>('add-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === keySignal()),
      )
      .subscribe((event) => this.addItem(event.field, event.index));

    this.eventBus
      .on<RemoveArrayItemEvent>('remove-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === keySignal()),
      )
      .subscribe((event) => this.removeItem(event.index));
  }

  /**
   * Add a new item to the array
   * @param fieldTemplate - The field template to use for the new item (provided by the event)
   * @param index - Optional index where to insert the item
   */
  private addItem(fieldTemplate: FieldDef<unknown>, index?: number): void {
    if (!fieldTemplate) {
      return;
    }

    const arrayKey = this.field().key;
    const currentArray = this.getArrayValue(this.parentFieldSignalContext.value(), arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    const value = getFieldDefaultValue(fieldTemplate, this.fieldRegistry.raw);
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    this.parentFieldSignalContext.value.update((current) => ({ ...current, [arrayKey]: newArray }) as TModel);
  }

  /**
   * Remove an item from the array
   */
  private removeItem(index?: number): void {
    const arrayKey = this.field().key;

    this.parentFieldSignalContext.value.update((current) => {
      const currentArray = this.getArrayValue(current, arrayKey);
      if (currentArray.length === 0) return current;

      const removeIndex = index !== undefined ? Math.min(index, currentArray.length - 1) : currentArray.length - 1;
      const newArray = [...currentArray];
      newArray.splice(removeIndex, 1);

      return { ...current, [arrayKey]: newArray } as TModel;
    });
  }

  /**
   * Safely get array value from parent model
   */
  private getArrayValue(value: Partial<TModel> | undefined, key: string): unknown[] {
    const arrayValue = (value as Record<string, unknown>)?.[key];
    return Array.isArray(arrayValue) ? arrayValue : [];
  }

  /**
   * Map FieldTree array to component references
   */
  private mapFieldTrees(fieldTrees: readonly FieldTree<unknown>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fieldTrees
      .map((fieldTree, index) => this.mapSingleFieldTree(fieldTree, index))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  /**
   * Create a component for a single FieldTree
   */
  private async mapSingleFieldTree(fieldTree: FieldTree<unknown>, index: number): Promise<ComponentRef<FormUiControl> | undefined> {
    const template = this.fieldTemplate();
    if (!template) {
      return undefined;
    }

    const arrayKey = this.field().key;

    return this.fieldRegistry
      .loadTypeComponent(template.type)
      .then((componentType) => {
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        const valueHandling = this.fieldRegistry.raw.get(template.type)?.valueHandling || 'include';

        if (valueHandling === 'flatten' && 'fields' in template && template.fields) {
          return this.createFlattenTypeComponent(componentType as Type<FormUiControl>, fieldTree, template, index);
        }

        return this.createRegularComponent(componentType as Type<FormUiControl>, fieldTree, template, index);
      })
      .catch((error) => {
        if (!this.destroyRef.destroyed) {
          console.error(
            `[Dynamic Forms] Failed to load component for field type '${template.type}' at index ${index} ` +
              `within array '${arrayKey}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  /**
   * Create component for regular field types (input, group, select, etc.)
   * Uses mapFieldToBindings for all bindings, then adds the field binding manually
   * since we already have the FieldTree.
   */
  private createRegularComponent(
    componentType: Type<FormUiControl>,
    fieldTree: FieldTree<unknown>,
    template: FieldDef<unknown>,
    index: number,
  ): ComponentRef<FormUiControl> {
    const arrayKey = this.field().key;
    const valueHandling = this.fieldRegistry.raw.get(template.type)?.valueHandling || 'include';

    // For group types inside arrays, use the flatten type approach
    // This bypasses the group's form creation and uses the FieldTree directly
    if (template.type === 'group' && valueHandling === 'include') {
      return this.createFlattenTypeComponent(componentType, fieldTree, template, index);
    }

    // For value fields (input, select, checkbox, etc.), pass FieldTree directly
    const key = template.key || `${arrayKey}[${index}]`;

    const bindings = [
      inputBinding('field', () => fieldTree),
      inputBinding('key', () => key),
      inputBinding('arrayContext', () => ({
        arrayKey,
        index,
        formValue: this.parentFieldSignalContext.value(),
      })),
    ];

    if ('label' in template && template.label) {
      bindings.push(inputBinding('label', () => template.label));
    }
    if ('placeholder' in template && template.placeholder) {
      bindings.push(inputBinding('placeholder', () => template.placeholder));
    }

    return this.vcr.createComponent(componentType, { bindings, injector: this.injector });
  }

  /**
   * Create component for flatten types (row/page) and groups within arrays
   * These need special handling because they contain nested fields
   */
  private createFlattenTypeComponent(
    componentType: Type<FormUiControl>,
    fieldTree: FieldTree<unknown>,
    template: FieldDef<unknown>,
    index: number,
  ): ComponentRef<FormUiControl> {
    const arrayKey = this.field().key;

    // For flatten types, create a custom FieldSignalContext that points to this array item's FieldTree
    // This allows child fields to resolve themselves from the array item's structure
    // The form property needs to be callable (wrapped in a function that returns the FieldTree)
    const itemFieldSignalContext: FieldSignalContext<unknown> = {
      injector: this.injector,
      value: this.parentFieldSignalContext.value,
      defaultValues: () => ({}),
      form: (() => fieldTree) as ReturnType<typeof form<unknown>>,
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages,
    };

    // Create scoped child injector that provides the array item's context
    const arrayContext: ArrayContext = {
      arrayKey,
      index,
      formValue: this.parentFieldSignalContext.value(),
    };

    const arrayItemInjector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useValue: itemFieldSignalContext,
        },
        {
          provide: ARRAY_CONTEXT,
          useValue: arrayContext,
        },
      ],
    });

    // Map field to bindings using the scoped injector
    const bindings = runInInjectionContext(arrayItemInjector, () => {
      return mapFieldToBindings(template, this.fieldRegistry.raw);
    });

    return this.vcr.createComponent(componentType, { bindings, injector: arrayItemInjector });
  }

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };
