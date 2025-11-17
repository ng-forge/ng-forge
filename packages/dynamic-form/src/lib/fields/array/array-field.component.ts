import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  linkedSignal,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, forkJoin, map, of, switchMap } from 'rxjs';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { form, FormUiControl, runInInjectionContext } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { FieldSignalContext } from '../../mappers';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { arrayItemFieldMapper } from '../../mappers/array-item/array-item-field-mapper';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class ArrayFieldComponent<T extends any[], TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<ArrayField<T>>();
  key = input.required<string>();

  /**
   * Store the field template in a linkedSignal for type enforcement.
   * This template is cloned when adding new items dynamically.
   */
  private readonly fieldTemplate = linkedSignal<FieldDef<unknown> | null>(() => {
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
    const parentValue = this.parentFieldSignalContext.value();
    const arrayKey = this.field().key;
    const arrayValue = (parentValue as any)?.[arrayKey];

    // Initialize with existing array length or 0
    if (Array.isArray(arrayValue)) {
      return arrayValue.length;
    }
    return 0;
  });

  /**
   * Generate field instances for each array item.
   * Uses structural sharing to reduce memory allocation.
   */
  private readonly fieldInstances = computed(() => {
    const template = this.fieldTemplate();
    const count = this.arrayItemCount();
    const arrayKey = this.key();

    if (!template || count === 0) {
      return [];
    }

    // Cache the base properties that don't change per item
    // Only key and index vary per item
    const baseInstance = {
      ...template,
      _templateKey: template.key,
    };

    // Create instances with only the varying properties
    return Array.from({ length: count }, (_, index) => ({
      ...baseInstance,
      key: `${arrayKey}[${index}]`,
      _arrayIndex: index,
    })) as FieldDef<unknown>[];
  });

  // Convert to observable for field mapping
  fields$ = toObservable(this.fieldInstances);

  // Create field components
  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields: FieldDef<unknown>[]) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp)),
    ),
    { initialValue: [] },
  );

  /**
   * Listen for AddArrayItemEvent and RemoveArrayItemEvent
   * Using takeUntilDestroyed() to prevent memory leaks
   */
  constructor() {
    this.eventBus
      .on<AddArrayItemEvent>('add-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === this.key()),
      )
      .subscribe((event) => this.addItem(event.index));

    this.eventBus
      .on<RemoveArrayItemEvent>('remove-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === this.key()),
      )
      .subscribe((event) => this.removeItem(event.index));
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
    const parentValue = this.parentFieldSignalContext.value();
    const arrayKey = this.field().key;
    const currentArray = (parentValue as any)?.[arrayKey] || [];

    // Create default value for new item
    const value = getFieldDefaultValue(template, this.fieldRegistry.raw);

    // Insert new item at specified index
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    // Update parent form value
    (this.parentFieldSignalContext.form() as any)[arrayKey].set(newArray);

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
    const parentValue = this.parentFieldSignalContext.value();
    const arrayKey = this.field().key;
    const currentArray = (parentValue as any)?.[arrayKey] || [];

    // Remove item at specified index
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update parent form value
    (this.parentFieldSignalContext.form() as any)[arrayKey].set(newArray);

    // Update count
    this.arrayItemCount.set(newArray.length);
  }

  private mapFields(fields: FieldDef<unknown>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: FieldDef<unknown>): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // For array items, create scoped context with parent's form
        // Each field will bind to the array index in the parent form
        const arrayFieldSignalContext: FieldSignalContext<TModel> = {
          injector: this.injector,
          value: this.parentFieldSignalContext.value,
          defaultValues: this.parentFieldSignalContext.defaultValues,
          form: this.parentFieldSignalContext.form,
        };

        // Create scoped child injector for array item
        const arrayItemInjector = Injector.create({
          parent: this.injector,
          providers: [
            {
              provide: FIELD_SIGNAL_CONTEXT,
              useValue: arrayFieldSignalContext,
            },
          ],
        });

        // Use custom array item mapper that handles array notation parsing
        // This enables keys like 'tags[0]' to correctly access parentForm().tags[0]
        const bindings = runInInjectionContext(arrayItemInjector, () => {
          return arrayItemFieldMapper(fieldDef);
        });

        return this.vcr.createComponent(componentType, { bindings, injector: arrayItemInjector }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        if (!this.destroyRef.destroyed) {
          const fieldKey = fieldDef.key || '<no key>';
          const arrayKey = this.field().key;
          console.error(
            `[ArrayField] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
              `within array '${arrayKey}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  /**
   * Computed signal that accesses the array form field from the parent form.
   * Consolidates the repeated pattern of accessing (parentForm as any)[arrayKey].
   */
  private readonly arrayFormField = computed(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form();
    return (parentForm as any)[arrayKey];
  });

  readonly valid = computed(() => this.arrayFormField()?.valid() ?? true);
  readonly invalid = computed(() => !this.valid());
  readonly dirty = computed(() => this.arrayFormField()?.dirty() ?? false);
  readonly touched = computed(() => this.arrayFormField()?.touched() ?? false);
  readonly errors = computed(() => this.arrayFormField()?.errors() ?? null);
  readonly disabled = computed(() => this.arrayFormField()?.disabled() ?? false);

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
  readonly submitted = outputFromObservable(this.eventBus.on<SubmitEvent>('submit'));

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };
