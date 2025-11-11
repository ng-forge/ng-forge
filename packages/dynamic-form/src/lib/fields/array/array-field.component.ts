import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  linkedSignal,
  runInInjectionContext,
  signal,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { get } from 'lodash-es';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { FieldSignalContext } from '../../mappers';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { arrayItemFieldMapper } from '../../mappers/array-item/array-item-field-mapper';
import { createSchemaFromFields } from '../../core';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent, SubmitEvent } from '../../events';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

/**
 * Array field component that manages dynamic arrays of field values.
 *
 * Key behaviors:
 * - Fields array defines the TEMPLATE (not instances)
 * - Collects values as flat array: [value1, value2, value3]
 * - Supports dynamic add/remove via event bus
 * - Template stored in linkedSignal for type enforcement
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
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class ArrayFieldComponent<T extends any[], TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<ArrayField<T>>();
  key = input.required<string>();

  // Parent form context inputs
  parentForm = input.required<ReturnType<typeof form<TModel>>>();
  parentFieldSignalContext = input.required<FieldSignalContext<TModel>>();

  /**
   * Store the field template in a linkedSignal for type enforcement.
   * This template is cloned when adding new items dynamically.
   */
  private readonly fieldTemplate = linkedSignal<FieldDef<any> | null>(() => {
    const arrayField = this.field();
    // Array fields should have exactly one field as the template
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

  /**
   * Track array item count dynamically.
   * Starts with 0 items (empty array by default).
   * Grows/shrinks based on AddArrayItemEvent/RemoveArrayItemEvent.
   */
  private readonly arrayItemCount = linkedSignal(() => {
    const parentValue = this.parentFieldSignalContext().value();
    const arrayKey = this.field().key;
    const arrayValue = get(parentValue, arrayKey);

    // Initialize with existing array length or 0
    if (Array.isArray(arrayValue)) {
      return arrayValue.length;
    }
    return 0;
  });

  /**
   * Generate field instances for each array item.
   * Each item gets a unique key based on array index.
   */
  private readonly fieldInstances = computed(() => {
    const template = this.fieldTemplate();
    const count = this.arrayItemCount();
    const arrayKey = this.key();

    if (!template || count === 0) {
      return [];
    }

    // Create one instance per array item
    return Array.from({ length: count }, (_, index) => ({
      ...template,
      // Generate unique key for array item: arrayKey[index]
      key: `${arrayKey}[${index}]`,
      // Store original template key for value extraction
      _templateKey: template.key,
      _arrayIndex: index,
    })) as FieldDef<any>[];
  });

  // Convert to observable for field mapping
  fields$ = toObservable(this.fieldInstances);

  // Create field components
  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields: FieldDef<any>[]) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    ),
    { initialValue: [] }
  );

  /**
   * Listen for AddArrayItemEvent and add new items
   */
  constructor() {
    effect(
      () => {
        const subscription = this.eventBus.on<AddArrayItemEvent>('add-array-item').subscribe((event) => {
          if (event.arrayKey === this.key()) {
            this.addItem(event.index);
          }
        });

        // Cleanup on destroy
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const subscription = this.eventBus.on<RemoveArrayItemEvent>('remove-array-item').subscribe((event) => {
          if (event.arrayKey === this.key()) {
            this.removeItem(event.index);
          }
        });

        // Cleanup on destroy
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Add a new item to the array
   */
  private addItem(index?: number): void {
    const template = this.fieldTemplate();
    if (!template) return;

    const currentCount = this.arrayItemCount();
    const insertIndex = index !== undefined ? Math.min(index, currentCount) : currentCount;

    // Get current parent value
    const parentValue = this.parentFieldSignalContext().value();
    const arrayKey = this.field().key;
    const currentArray = get(parentValue, arrayKey) || [];

    // Create default value for new item
    const defaultValue = getFieldDefaultValue(template, this.fieldRegistry.raw);

    // Insert new item at specified index
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, defaultValue);

    // Update parent form value
    (this.parentForm()() as any)[arrayKey].set(newArray);

    // Update count
    this.arrayItemCount.set(newArray.length);
  }

  /**
   * Remove an item from the array
   */
  private removeItem(index?: number): void {
    const currentCount = this.arrayItemCount();
    if (currentCount === 0) return;

    const removeIndex = index !== undefined ? Math.min(index, currentCount - 1) : currentCount - 1;

    // Get current parent value
    const parentValue = this.parentFieldSignalContext().value();
    const arrayKey = this.field().key;
    const currentArray = get(parentValue, arrayKey) || [];

    // Remove item at specified index
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update parent form value
    (this.parentForm()() as any)[arrayKey].set(newArray);

    // Update count
    this.arrayItemCount.set(newArray.length);
  }

  private mapFields(fields: FieldDef<any>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: FieldDef<any>): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // For array items, use the parent's form context
        // Each field will bind to the array index in the parent form
        const arrayFieldSignalContext: FieldSignalContext<TModel> = {
          injector: this.injector,
          value: this.parentFieldSignalContext().value,
          defaultValues: this.parentFieldSignalContext().defaultValues,
          form: this.parentForm(),
        };

        // Use custom array item mapper that handles array notation parsing
        // This enables keys like 'tags[0]' to correctly access parentForm().tags[0]
        const bindings = arrayItemFieldMapper(fieldDef, {
          fieldSignalContext: arrayFieldSignalContext,
          fieldRegistry: this.fieldRegistry.raw,
        });

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        if (!this.destroyRef.destroyed) {
          console.error(`Failed to load component for field type '${fieldDef.type}':`, error);
        }
        return undefined;
      });
  }

  readonly valid = computed(() => {
    // Validate all array items
    const arrayKey = this.field().key;
    const parentForm = this.parentForm()();
    const arrayField = (parentForm as any)[arrayKey];
    return arrayField ? arrayField.valid() : true;
  });

  readonly invalid = computed(() => !this.valid());
  readonly dirty = computed(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentForm()();
    const arrayField = (parentForm as any)[arrayKey];
    return arrayField ? arrayField.dirty() : false;
  });

  readonly touched = computed(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentForm()();
    const arrayField = (parentForm as any)[arrayKey];
    return arrayField ? arrayField.touched() : false;
  });

  readonly errors = computed(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentForm()();
    const arrayField = (parentForm as any)[arrayKey];
    return arrayField ? arrayField.errors() : null;
  });

  readonly disabled = computed(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentForm()();
    const arrayField = (parentForm as any)[arrayKey];
    return arrayField ? arrayField.disabled() : false;
  });

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
  readonly submitted = outputFromObservable(this.eventBus.on<SubmitEvent>('submit'));

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };
