import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  OnDestroy,
  runInInjectionContext,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { isEqual, keyBy, mapValues } from 'lodash-es';
import { mapFieldToBindings } from './utils/field-mapper/field-mapper';
import { FormConfig, RegisteredFieldTypes } from './models';
import { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
import { createSchemaFromFields } from './core';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { InferGlobalFormValue } from './models/types';
import { flattenFields } from './utils';
import { FieldDef } from './definitions';
import { getFieldDefaultValue } from './utils/default-value/default-value';
import { FieldSignalContext } from './mappers';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from './core/registry';
import { detectFormMode, FormModeDetectionResult } from './models/types/form-mode';
import { FormModeValidator } from './utils/form-validation/form-mode-validator';
import { PageOrchestratorComponent } from './core/page-orchestrator';

/**
 * Dynamic form component that renders a complete form based on configuration.
 *
 * This is the main entry point component for the dynamic form system. It handles
 * form state management, validation, field rendering, and event coordination using
 * Angular's signal-based reactive forms.
 *
 * @example
 * ```html
 * <dynamic-form
 *   [config]="formConfig"
 *   [(value)]="formData"
 *   (submitted)="handleSubmit($event)"
 *   (validityChange)="handleValidityChange($event)">
 * </dynamic-form>
 * ```
 *
 * @example
 * ```typescript
 * // Component usage with typed form configuration
 * export class MyComponent {
 *   formConfig: FormConfig = {
 *     fields: [
 *       { type: 'input', key: 'email', label: 'Email', validation: ['required', 'email'] },
 *       { type: 'input', key: 'password', label: 'Password', validation: ['required'] }
 *     ]
 *   };
 *
 *   formData = signal<Partial<UserProfile>>({});
 *
 *   handleSubmit(values: Partial<UserProfile>) {
 *     console.log('Form submitted:', values);
 *   }
 * }
 * ```
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TModel - The strongly-typed interface for form values
 *
 * @public
 */
@Component({
  selector: 'dynamic-form',
  imports: [FieldRendererDirective, PageOrchestratorComponent],
  template: `
    <form
      class="df-form"
      [class.disabled]="formOptions().disabled"
      [class.df-form-paged]="formModeDetection().mode === 'paged'"
      [class.df-form-non-paged]="formModeDetection().mode === 'non-paged'"
    >
      @if (formModeDetection().mode === 'paged') {
      <!-- Paged form: Use page orchestrator with page fields -->
      <page-orchestrator
        [pageComponents]="fields()"
        [config]="{ initialPageIndex: 0 }"
        (pageChanged)="onPageChanged($event)"
        (navigationStateChanged)="onNavigationStateChanged($event)"
      >
        <!-- Page fields will be rendered here -->
        <div [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
          <!-- Page field components will be automatically rendered by the fieldRenderer directive -->
        </div>
      </page-orchestrator>
      } @else {
      <!-- Non-paged form: Render fields directly -->
      <div [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
        <!-- Fields will be automatically rendered by the fieldRenderer directive -->
      </div>
      }
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [EventBus, SchemaRegistryService, FunctionRegistryService, RootFormRegistryService, FieldContextRegistryService],
  host: {
    '[class.disabled]': 'disabled()',
    '[attr.data-form-mode]': 'formModeDetection().mode',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[], TModel = InferGlobalFormValue>
  implements OnDestroy
{
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly rootFormRegistry = inject(RootFormRegistryService);

  /**
   * Form configuration defining the structure, validation, and behavior.
   *
   * Changes to this input will rebuild the form structure and reset form state.
   * For incremental updates, use the form's update methods instead.
   *
   * @example
   * ```typescript
   * const config: FormConfig = {
   *   fields: [
   *     { type: 'input', key: 'name', label: 'Full Name', validation: ['required'] },
   *     { type: 'group', key: 'address', label: 'Address', fields: [
   *       { type: 'input', key: 'street', label: 'Street' },
   *       { type: 'input', key: 'city', label: 'City' }
   *     ]}
   *   ],
   *   options: { validateOnChange: true }
   * };
   * ```
   */
  config = input.required<FormConfig<TFields>>();

  /**
   * Form values for two-way data binding.
   *
   * Supports both partial and complete form values. When used with two-way binding,
   * automatically syncs with form state changes and user input.
   *
   * @example
   * ```typescript
   * // Two-way binding
   * formData = signal<Partial<UserProfile>>({ email: 'user@example.com' });
   *
   * // In template
   * <dynamic-form [config]="config" [(value)]="formData" />
   * ```
   *
   * @defaultValue undefined
   */
  value = model<Partial<TModel> | undefined>(undefined);

  /**
   * Form mode detection and validation
   */
  readonly formModeDetection = computed<FormModeDetectionResult>(() => {
    const config = this.config();
    const fields = config.fields || [];

    const detection = detectFormMode(fields);

    // Validate form configuration and log errors/warnings
    const validation = FormModeValidator.validateFormConfiguration(fields);

    if (!validation.isValid) {
      console.error('Invalid form configuration:', validation.errors);
    }

    if (validation.warnings.length > 0) {
      console.warn('Form configuration warnings:', validation.warnings);
    }

    return detection;
  });

  private readonly formSetup = computed(() => {
    const config = this.config();
    const modeDetection = this.formModeDetection();

    if (config.fields && config.fields.length > 0) {
      // Always flatten fields for form schema - this extracts child fields from page/row containers
      const flattenedFields = flattenFields(config.fields);
      const fieldsById = keyBy(flattenedFields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => getFieldDefaultValue(field)) as TModel;

      // For rendering, paged forms keep original structure, non-paged use flattened
      const fieldsToRender = modeDetection.mode === 'paged' ? config.fields : flattenedFields;

      return {
        fields: fieldsToRender,
        schemaFields: flattenedFields, // Fields for form schema (always flattened)
        originalFields: config.fields,
        defaultValues,
        schema: undefined,
        mode: modeDetection.mode,
      };
    }

    // Fallback: empty form
    return {
      fields: [],
      schemaFields: [],
      defaultValues: {} as TModel,
      schema: undefined,
      mode: 'non-paged' as const,
    };
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  private readonly entity = linkedSignal(() => {
    const inputValue = this.value();
    const defaults = this.defaultValues();

    return { ...defaults, ...inputValue } as TModel;
  });

  readonly formOptions = computed(() => {
    const config = this.config();
    return config.options || {};
  });

  private readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      let formInstance: ReturnType<typeof form<TModel>>;

      if (setup.schemaFields && setup.schemaFields.length > 0) {
        const schema = createSchemaFromFields(setup.schemaFields);
        formInstance = untracked(() => form(this.entity, schema));
      } else {
        formInstance = untracked(() => form(this.entity));
      }

      // Register the root form field in the registry for context access
      this.rootFormRegistry.registerRootForm(formInstance);

      return formInstance;
    });
  });

  readonly formValue = computed(() => this.form()().value());

  private readonly syncEntityToValue = explicitEffect([this.entity], ([currentEntity]) => {
    const currentValue = this.value();

    if (!isEqual(currentEntity, currentValue)) {
      this.value.set(currentEntity);
    }
  });

  /**
   * Signal indicating whether the form is valid.
   *
   * @returns `true` if all form fields pass validation, `false` otherwise
   */
  readonly valid = computed(() => this.form()().valid());

  /**
   * Signal indicating whether the form is invalid.
   *
   * @returns `true` if any form field fails validation, `false` otherwise
   */
  readonly invalid = computed(() => this.form()().invalid());

  /**
   * Signal indicating whether the form has been modified.
   *
   * @returns `true` if any field value differs from its initial value
   */
  readonly dirty = computed(() => this.form()().dirty());

  /**
   * Signal indicating whether any form field has been touched.
   *
   * @returns `true` if user has interacted with any field
   */
  readonly touched = computed(() => this.form()().touched());

  /**
   * Signal containing all form validation errors.
   *
   * @returns Object with field keys and their validation error messages
   */
  readonly errors = computed(() => this.form()().errors());

  /**
   * Signal indicating whether the form is disabled.
   *
   * @returns `true` if form is disabled through configuration or programmatically
   */
  readonly disabled = computed(() => this.form()().disabled());

  /**
   * Emitted when form validity state changes.
   *
   * Subscribe to this output to react to validation state changes in real-time.
   *
   * @example
   * ```typescript
   * onValidityChange(isValid: boolean) {
   *   this.submitButton.disabled = !isValid;
   * }
   * ```
   */
  readonly validityChange = outputFromObservable(toObservable(this.valid));

  /**
   * Emitted when form dirty state changes.
   *
   * Useful for implementing unsaved changes warnings or auto-save functionality.
   *
   * @example
   * ```typescript
   * onDirtyChange(isDirty: boolean) {
   *   if (isDirty) {
   *     this.showUnsavedWarning = true;
   *   }
   * }
   * ```
   */
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));

  /**
   * Emitted when the form is submitted and passes validation.
   *
   * The event contains the complete form values object with proper typing
   * based on the form configuration.
   *
   * @example
   * ```typescript
   * handleSubmit(values: Partial<UserProfile>) {
   *   // values is properly typed based on form configuration
   *   this.userService.updateProfile(values);
   * }
   * ```
   */
  readonly submitted = outputFromObservable(this.eventBus.subscribe<SubmitEvent>('submit').pipe(map(() => this.value())));

  private readonly fieldsInitializedSubject = new Subject<void>();

  readonly initialized$ = this.fieldsInitializedSubject.asObservable();

  fields$ = toObservable(computed(() => this.formSetup().fields));

  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return combineLatest(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    ),
    { initialValue: [] }
  );

  private mapFields(fields: readonly FieldDef<Record<string, unknown>>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        let componentType;
        try {
          componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type);
        } catch (error) {
          console.error(error);
          return undefined;
        }

        const fieldSignalContext: FieldSignalContext<TModel> = {
          injector: this.injector,
          value: this.value,
          defaultValues: this.defaultValues,
          form: this.form(),
        };

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext,
          fieldRegistry: this.fieldRegistry.raw,
        });

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  onFieldsInitialized(): void {
    this.fieldsInitializedSubject.next();
  }

  /**
   * Handle page change events from the page orchestrator
   * @param event The page change event
   */
  onPageChanged(event: any): void {
    // Re-emit the page change event for external consumers
    // This allows users to listen to page changes at the form level
  }

  /**
   * Handle navigation state changes from the page orchestrator
   * @param state The new navigation state
   */
  onNavigationStateChanged(state: any): void {
    // Could be used for additional state management or logging
    // Currently just provides a hook for future functionality
  }

  ngOnDestroy(): void {
    // Clean up the root form registry to prevent memory leaks
    this.rootFormRegistry.unregisterForm();
  }
}
