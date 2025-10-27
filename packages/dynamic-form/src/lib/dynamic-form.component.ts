import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  inputBinding,
  linkedSignal,
  model,
  runInInjectionContext,
  twoWayBinding,
  untracked,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { get, isEqual, keyBy, mapValues, set } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef, FormConfig, InferFormValue } from './models/field-config';
import { FieldRegistry } from './core/field-registry';
import { createSchemaFromFields } from './core/schema-factory';

@Component({
  selector: 'dynamic-form',
  imports: [FieldRendererDirective],
  template: `
    <form [class.disabled]="formOptions().disabled" [fieldRenderer]="fields()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly FieldDef[] = readonly FieldDef[], TModel = InferFormValue<TFields>> {
  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  config = input.required<FormConfig<TFields>>();

  // Form value model for two-way binding
  value = model<Partial<TModel> | undefined>(undefined);

  private readonly formSetup = computed(() => {
    const config = this.config();

    this.fieldSignals.clear();

    if (config.fields && config.fields.length > 0) {
      const fieldsById = keyBy(config.fields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => this.getFieldDefaultValue(field)) as TModel;

      return {
        approach: 'fields' as const,
        fields: config.fields,
        defaultValues,
        schema: undefined,
      };
    }

    if (config.schema?.fieldDefs) {
      const fieldsById = keyBy(config.schema.fieldDefs, 'key');
      const defaultValues = mapValues(fieldsById, (field) => this.getFieldDefaultValue(field)) as TModel;

      return {
        approach: 'schema' as const,
        fields: config.schema.fieldDefs,
        defaultValues,
        schema: config.schema.definition,
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

  private createFieldSignal(fieldKey: string, defaultValue: unknown): WritableSignal<unknown> {
    return runInInjectionContext(this.injector, () => {
      const fieldSignal = linkedSignal({
        source: this.value,
        computation: (valueData: Partial<TModel> | undefined) => {
          const defaults = this.defaultValues();
          const mergedData = { ...defaults, ...valueData };
          return get(mergedData, fieldKey) ?? defaultValue;
        },
        equal: isEqual,
      });

      explicitEffect([fieldSignal], ([fieldValue]: [unknown]) => {
        const currentModel = this.value() || ({} as TModel);
        const currentFieldValue = get(currentModel, fieldKey);

        if (!isEqual(fieldValue, currentFieldValue)) {
          const newModel = { ...currentModel };
          set(newModel, fieldKey, fieldValue);
          this.value.set(newModel as Partial<TModel>);
        }
      });

      return fieldSignal;
    });
  }

  private getFieldSignal(fieldKey: string, defaultValue: unknown): WritableSignal<unknown> {
    if (!this.fieldSignals.has(fieldKey)) {
      const fieldSignal = this.createFieldSignal(fieldKey, defaultValue);
      this.fieldSignals.set(fieldKey, fieldSignal);
    }
    return this.fieldSignals.get(fieldKey)!;
  }

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

  fields$ = toObservable(computed(() => this.formSetup().fields));

  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        const fieldArray = fields as readonly FieldDef[];

        if (!fieldArray || fieldArray.length === 0) {
          return of([]);
        }

        return combineLatest(this.mapFields(fieldArray));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    )
  );

  private mapFields(fields: readonly FieldDef[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

        if (!componentType) {
          return undefined;
        }

        const bindings: Binding[] = [];
        const valueProp = this.getValueProp(fieldDef);

        if (valueProp) {
          const defaultValue = this.getFieldDefaultValue(fieldDef);

          const fieldSignal = this.getFieldSignal(fieldDef.key, defaultValue);

          bindings.push(twoWayBinding(valueProp, fieldSignal));
        }

        if (fieldDef.label) {
          bindings.push(inputBinding('label', () => fieldDef.label));
        }

        if (fieldDef.className) {
          bindings.push(inputBinding('className', () => fieldDef.className));
        }

        if (fieldDef.props) {
          Object.entries(fieldDef.props).forEach(([key, value]) => {
            bindings.push(inputBinding(key, () => value));
          });
        }

        return this.vcr.createComponent(componentType, { bindings });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private getValueProp(fieldDef: FieldDef): 'checked' | 'value' | undefined {
    if (fieldDef.type === 'submit') {
      return undefined;
    }

    if (fieldDef.type === 'multi-checkbox') {
      return 'value';
    }

    if (fieldDef.type === 'checkbox' || fieldDef.type === 'toggle') {
      return 'checked';
    }

    return 'value';
  }

  private getFieldDefaultValue(field: FieldDef): unknown {
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    if (field.type === 'multi-checkbox') {
      return [];
    }

    if (field.type === 'checkbox' || field.type === 'toggle') {
      return false;
    }

    return '';
  }
}
