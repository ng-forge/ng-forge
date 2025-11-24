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
  private readonly parentInjector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<ArrayField>();

  key = input.required<string>();

  // Memoized field registry raw access (similar to dynamic-form.component.ts:204)
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

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

    // Access the array's inner structure to get the childrenMap for array items
    // Array items in Angular Signal Forms are accessed via structure.childrenMap() with string keys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerChildrenMap = (arrayFieldTree as any).structure?.childrenMap?.();
    if (!innerChildrenMap) return [];

    // Get the current array value to determine length
    const arrayValue = this.getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    // Access each array item FieldTree using string index keys
    const items: FieldTree<unknown>[] = [];
    for (let i = 0; i < arrayValue.length; i++) {
      const itemFieldTree = innerChildrenMap.get(String(i));
      if (itemFieldTree) {
        items.push(itemFieldTree);
      }
    }

    return items;
  });

  // Track the current component refs to avoid recreating them
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
        // Only clear and recreate if the array length changed
        // This prevents re-rendering when individual field values change
        if (fieldTrees.length !== this.currentComponents.length) {
          this.vcr.clear();
          this.currentComponents = [];

          if (fieldTrees.length === 0) {
            return of([]);
          }

          // Create new components
          return forkJoin(this.mapFieldTrees(fieldTrees)).pipe(
            map((components) => {
              this.currentComponents = components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp);
              return this.currentComponents;
            }),
          );
        }

        // Return existing components (array length hasn't changed)
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
      .subscribe((event) => this.addItem(event.field ?? this.fieldTemplate(), event.index));

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
   * @param fieldTemplate - The field template to use for the new item (provided by the event or from array's own template)
   * @param index - Optional index where to insert the item
   */
  private addItem(fieldTemplate: FieldDef<unknown> | null, index?: number): void {
    if (!fieldTemplate) {
      console.error(
        `[Dynamic Forms] Cannot add item to array '${this.field().key}': no field template provided. ` +
          'Ensure the array field has a fields property with at least one field definition.',
      );
      return;
    }

    const arrayKey = this.field().key;
    const formObject = this.parentFieldSignalContext.form();
    const currentValue = formObject.value() as TModel;
    const currentArray = this.getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    const value = getFieldDefaultValue(fieldTemplate, this.rawFieldRegistry());
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    // Update via form's value signal to ensure Angular Signal Forms creates proper FieldTree structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  /**
   * Remove an item from the array
   */
  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const formObject = this.parentFieldSignalContext.form();
    const currentValue = formObject.value() as TModel;
    const currentArray = this.getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    const removeIndex = index !== undefined ? Math.min(index, currentArray.length - 1) : currentArray.length - 1;
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update via form's value signal to ensure Angular Signal Forms updates FieldTree structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
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
   * Create array-specific injector for a single array item
   * This provides FIELD_SIGNAL_CONTEXT and ARRAY_CONTEXT to child components
   */
  private createArrayItemInjector(fieldTree: FieldTree<unknown>, index: number): Injector {
    const arrayKey = this.field().key;

    // Create scoped child injector
    const arrayContext: ArrayContext = {
      arrayKey,
      index,
      formValue: this.parentFieldSignalContext.value(),
      field: this.field(),
    };

    // Create a mutable context object that will reference the injector
    // We need to create the injector first so the context can reference it
    const itemFieldSignalContext: FieldSignalContext<unknown> = {
      injector: undefined as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      value: this.parentFieldSignalContext.value,
      defaultValues: () => ({}),
      form: (() => fieldTree) as any as ReturnType<typeof form<unknown>>,
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages,
    };

    // Create the array item injector with the array context and field signal context
    const arrayItemInjector = Injector.create({
      parent: this.parentInjector,
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

    // Now set the injector in the context to the array item injector
    // This allows child fields to resolve themselves from the array item's structure
    itemFieldSignalContext.injector = arrayItemInjector;

    return arrayItemInjector;
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

        const valueHandling = this.rawFieldRegistry().get(template.type)?.valueHandling || 'include';

        // Handle flatten types (row/page) differently
        if (valueHandling === 'flatten' && 'fields' in template && template.fields) {
          return this.createFlattenTypeComponent(componentType as Type<FormUiControl>, fieldTree, template, index);
        }

        // For regular types (input, group, etc.), pass FieldTree directly
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
   * These components receive the actual FieldTree for their array index
   */
  private createRegularComponent(
    componentType: Type<FormUiControl>,
    fieldTree: FieldTree<unknown>,
    template: FieldDef<unknown>,
    index: number,
  ): ComponentRef<FormUiControl> {
    const valueHandling = this.rawFieldRegistry().get(template.type)?.valueHandling || 'include';

    // For group types inside arrays, use the flatten type approach
    // This bypasses the group's form creation and uses the FieldTree directly
    if (template.type === 'group' && valueHandling === 'include') {
      return this.createFlattenTypeComponent(componentType, fieldTree, template, index);
    }

    // For value fields (input, select, checkbox, etc.), create array-specific context
    const arrayItemInjector = this.createArrayItemInjector(fieldTree, index);

    // Map field to bindings using the scoped injector
    // Pass the actual FieldTree (not the template) so child components get the indexed field
    const bindings = runInInjectionContext(arrayItemInjector, () => {
      return [inputBinding('field', () => fieldTree), ...mapFieldToBindings(template, this.rawFieldRegistry())];
    });

    return this.vcr.createComponent(componentType, { bindings, injector: arrayItemInjector });
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

    // Create scoped child injector first
    const arrayContext: ArrayContext = {
      arrayKey,
      index,
      formValue: this.parentFieldSignalContext.value(),
      field: this.field(),
    };

    // Create a mutable context object that will reference the injector
    // We need to create the injector first so the context can reference it
    const itemFieldSignalContext: FieldSignalContext<unknown> = {
      injector: undefined as any, // Will be set below
      value: this.parentFieldSignalContext.value,
      defaultValues: () => ({}),
      form: (() => fieldTree) as any as ReturnType<typeof form<unknown>>,
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages,
    };

    // Create the array item injector with the array context and field signal context
    const arrayItemInjector = Injector.create({
      parent: this.parentInjector,
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

    // Now set the injector in the context to the array item injector
    // This allows child fields to resolve themselves from the array item's structure
    itemFieldSignalContext.injector = arrayItemInjector;

    // Map field to bindings using the scoped injector
    // Pass the actual FieldTree (not the template) so child components get the indexed field
    const bindings = runInInjectionContext(arrayItemInjector, () => {
      return [inputBinding('field', () => fieldTree), ...mapFieldToBindings(template, this.rawFieldRegistry())];
    });

    return this.vcr.createComponent(componentType, { bindings, injector: arrayItemInjector });
  }

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };
