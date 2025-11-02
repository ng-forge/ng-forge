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
import { 
  FunctionRegistryService, 
  SchemaRegistryService, 
  RootFormRegistryService, 
  FieldContextRegistryService 
} from './core/registry';

@Component({
  selector: 'dynamic-form',
  imports: [FieldRendererDirective],
  template: `
    <form class="df-form" [class.disabled]="formOptions().disabled" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [
    EventBus, 
    SchemaRegistryService, 
    FunctionRegistryService,
    RootFormRegistryService,
    FieldContextRegistryService
  ],
  host: {
    '[class.disabled]': 'disabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[], TModel = InferGlobalFormValue> implements OnDestroy {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly rootFormRegistry = inject(RootFormRegistryService);

  config = input.required<FormConfig<TFields>>();

  // Form value model for two-way binding
  value = model<Partial<TModel> | undefined>(undefined);

  private readonly formSetup = computed(() => {
    const config = this.config();

    if (config.fields && config.fields.length > 0) {
      const flattenedFields = flattenFields(config.fields);
      const fieldsById = keyBy(flattenedFields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => getFieldDefaultValue(field)) as TModel;

      return {
        fields: flattenedFields,
        originalFields: config.fields,
        defaultValues,
        schema: undefined,
      };
    }

    // Fallback: empty form
    return {
      fields: [],
      defaultValues: {} as TModel,
      schema: undefined,
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
      
      if (setup.fields.length > 0) {
        const schema = createSchemaFromFields(setup.fields);
        formInstance = untracked(() => form(this.entity, schema));
      } else {
        formInstance = untracked(() => form(this.entity));
      }

      // Register the root form field in the registry for context access
      this.rootFormRegistry.registerRootForm(formInstance);

      return formInstance;
    });
  });

  readonly formValue = computed(() => this.entity());

  private readonly syncEntityToValue = explicitEffect([this.entity], ([currentEntity]) => {
    const currentValue = this.value();

    if (!isEqual(currentEntity, currentValue)) {
      this.value.set(currentEntity);
    }
  });

  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
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

  ngOnDestroy(): void {
    // Clean up the root form registry to prevent memory leaks
    this.rootFormRegistry.unregisterForm();
  }
}
