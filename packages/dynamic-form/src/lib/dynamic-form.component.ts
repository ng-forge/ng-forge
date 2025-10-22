import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
  inject,
  input,
  inputBinding,
  linkedSignal,
  output,
  twoWayBinding,
  ViewContainerRef,
} from '@angular/core';
import { FieldDef, FormConfig } from './models/field-config';
import { FieldRegistry } from './core/field-registry';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';
import { NgComponentOutlet } from '@angular/common';
import { form } from '@angular/forms/signals';
import { keyBy, mapValues } from 'lodash-es';

@Component({
  selector: 'dynamic-form',
  imports: [NgComponentOutlet],
  template: `<form>
    @for (field of fields(); track $index) {
    <ng-container [ngComponentOutlet]="field.componentType" [ngComponentOutletInjector]="field.injector" />
    }
  </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent<TModel = unknown> {
  private readonly fieldRegistry = inject(FieldRegistry);
  private vcr = inject(ViewContainerRef);

  config = input.required<FormConfig>();

  /**
   * Linked signal that creates default values object from field definitions
   */
  readonly defaultValues = linkedSignal(() => {
    const config = this.config();
    const fieldsById = keyBy(config.fields, 'key');

    return mapValues(fieldsById, (field) => field.defaultValue) as TModel;
  });

  /**
   * Signal forms integration using the linkedSignal as the model
   */
  private readonly form = form(this.defaultValues);

  /**
   * Computed signals that expose form properties
   */
  readonly value = computed(() => this.form().value());
  readonly valid = computed(() => this.form().valid());
  readonly invalid = computed(() => this.form().invalid());
  readonly dirty = computed(() => this.form().dirty());
  readonly touched = computed(() => this.form().touched());
  readonly errors = computed(() => this.form().errors());
  readonly errorSummary = computed(() => this.form().errorSummary());
  readonly disabled = computed(() => this.form().disabled());

  /**
   * Output events for form state changes
   */
  readonly valueChange = output<TModel>();
  readonly validityChange = output<boolean>();
  readonly dirtyChange = output<boolean>();

  constructor() {
    // Set up reactive effects to emit output events when form state changes
    effect(() => {
      const currentValue = this.value();
      this.valueChange.emit(currentValue);
    });

    effect(() => {
      const currentValid = this.valid();
      this.validityChange.emit(currentValid);
    });

    effect(() => {
      const currentDirty = this.dirty();
      this.dirtyChange.emit(currentDirty);
    });
  }

  config$ = toObservable(this.config);

  fields = toSignal(
    this.config$.pipe(
      switchMap((config) => {
        return combineLatest(
          config.fields.map(async (fieldDef) => {
            const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

            if (!componentType) {
              return undefined;
            }

            const bindings: Binding[] = [];

            // value binding
            const valueProp = this.getValueProp(fieldDef);

            if (valueProp) {
              // Access the field control through the form FieldTree
              const fieldControl = (this.form as any)[fieldDef.key];
              bindings.push(twoWayBinding('field', fieldControl));
            }

            // Create input bindings map
            const inputBindingsMap = {
              // Base properties
              label: () => fieldDef.label,
              conditionals: () => fieldDef.conditionals,
              className: () => fieldDef.className,
              // Angular specific properties
              validation: () => fieldDef.validation,
              disabled: () => fieldDef.disabled,
              disabledReasons: () => fieldDef.disabledReasons,
              readonly: () => fieldDef.readonly,
              hidden: () => fieldDef.hidden,
              name: () => fieldDef.name,
              required: () => fieldDef.required,
              min: () => fieldDef.min,
              minLength: () => fieldDef.minLength,
              max: () => fieldDef.max,
              maxLength: () => fieldDef.maxLength,
              pattern: () => fieldDef.pattern,
            };

            // Apply input bindings from map - only if property exists in fieldDef
            Object.entries(inputBindingsMap).forEach(([key, valueFn]) => {
              if (key in fieldDef && (fieldDef as any)[key] !== undefined) {
                bindings.push(inputBinding(key, valueFn));
              }
            });

            // Add custom properties from fieldDef.props
            if (fieldDef.props) {
              Object.entries(fieldDef.props).forEach(([key, value]) => {
                bindings.push(inputBinding(key, () => value));
              });
            }

            return this.vcr.createComponent(componentType, { bindings });
          })
        );
      }),
      map((fields) => fields.filter((field): field is ComponentRef<unknown> => !!field))
    )
  );

  getValueProp(fieldDef: FieldDef): 'checked' | 'value' | undefined {
    // For checkbox/toggle types, use 'checked'
    if (fieldDef.type.includes('checkbox') || fieldDef.type.includes('toggle')) {
      return 'checked';
    }

    // For all other field types, default to 'value'
    return 'value';
  }
}
