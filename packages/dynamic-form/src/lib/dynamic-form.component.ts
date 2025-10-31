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
  runInInjectionContext,
  untracked,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { keyBy, mapValues } from 'lodash-es';
import { FieldSignalContext, getFieldDefaultValue } from './mappers/utils/field-signal-utils';
import { mapFieldToBindings } from './utils/field-mapper/field-mapper';
import { FormConfig, RegisteredFieldTypes } from './models';
import { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
import { createSchemaFromFields } from './core/schema-factory';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { InferGlobalFormValue } from './models/global-types';
import { flattenFields } from './utils';
import { FieldDef } from './definitions';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dynamic-form',
  imports: [FieldRendererDirective],
  template: `
    <form [class.disabled]="formOptions().disabled" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[], TModel = InferGlobalFormValue> {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  config = input.required<FormConfig<TFields>>();

  // Form value model for two-way binding
  value = model<Partial<TModel> | undefined>(undefined);

  private readonly formSetup = computed(() => {
    const config = this.config();

    this.fieldSignals.clear();

    if (config.fields && config.fields.length > 0) {
      const flattenedFields = flattenFields(config.fields);
      const fieldsById = keyBy(flattenedFields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => getFieldDefaultValue(field)) as TModel;

      return {
        approach: 'fields' as const,
        fields: flattenedFields,
        originalFields: config.fields,
        defaultValues,
        schema: undefined,
      };
    }

    // Fallback: empty form
    return {
      approach: 'fields' as const,
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

  private readonly fieldSignals = new Map<string, WritableSignal<unknown>>();

  readonly formOptions = computed(() => {
    const config = this.config();
    return config.options || {};
  });

  private readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      if (setup.fields.length > 0) {
        const schema = createSchemaFromFields(setup.fields);
        return untracked(() => form(this.entity, schema));
      }

      return untracked(() => form(this.entity));
    });
  });

  readonly formValue = computed(() => this.entity());

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
    )
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
        };

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext,
          fieldSignals: this.fieldSignals,
          fieldRegistry: this.fieldRegistry.raw,
        });

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  onFieldsInitialized(): void {
    this.fieldsInitializedSubject.next();
  }
}
