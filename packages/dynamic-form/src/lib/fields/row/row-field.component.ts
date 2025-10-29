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
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { keyBy, mapValues } from 'lodash-es';
import { RowChildField, RowField } from '../../definitions/default/row-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { FieldSignalContext, getFieldDefaultValue } from '../../mappers/utils/field-signal-utils';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { createSchemaFromFields } from '../../core/schema-factory';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { flattenFields } from '../../utils';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'row-field',
  template: `
    <form [class.disabled]="disabled()" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './row-field.component.scss',
  host: {
    class: 'lib-row-field field__container lib-row-field__responsive',
  },
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class RowFieldComponent {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  field = input.required<RowField<any>>();

  // Form value model for two-way binding
  value = model<any>(undefined);

  private readonly formSetup = computed(() => {
    const rowField = this.field();

    this.fieldSignals.clear();

    if (rowField.fields && rowField.fields.length > 0) {
      const flattenedFields = flattenFields(rowField.fields);
      const fieldsById = keyBy(flattenedFields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => getFieldDefaultValue(field));

      return {
        fields: flattenedFields,
        originalFields: rowField.fields,
        defaultValues,
      };
    }

    return {
      fields: [],
      originalFields: [],
      defaultValues: {},
    };
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  private readonly entity = linkedSignal(() => {
    const inputValue = this.value();
    const defaults = this.defaultValues();

    return { ...defaults, ...inputValue };
  });

  private readonly fieldSignals = new Map<string, WritableSignal<unknown>>();

  private readonly form = computed(() => {
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
  readonly submitted = outputFromObservable(this.eventBus.subscribe<SubmitEvent>('submit'));

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

  private mapFields(fields: readonly any[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        let componentType;
        try {
          componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type);
        } catch (error) {
          console.error(error);
          return undefined;
        }

        const fieldSignalContext: FieldSignalContext<any> = {
          injector: this.injector,
          value: this.value,
          defaultValues: this.defaultValues,
        };

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext,
          fieldSignals: this.fieldSignals,
          fieldRegistry: this.fieldRegistry.raw,
        });

        const componentRef = this.vcr.createComponent(componentType, { bindings, injector: this.injector });

        // Apply column styles if field has col property
        const rowChildField = fieldDef as RowChildField;
        if (rowChildField.col) {
          this.applyColumnStyles(componentRef as ComponentRef<FormUiControl>, rowChildField);
        }

        return componentRef;
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private applyColumnStyles(componentRef: ComponentRef<FormUiControl>, field: RowChildField): void {
    if (field.col && componentRef.location.nativeElement) {
      const element = componentRef.location.nativeElement as HTMLElement;
      if (field.col.span) {
        element.style.gridColumn = `span ${field.col.span}`;
      }
      if (field.col.start) {
        element.style.gridColumnStart = field.col.start.toString();
      }
      if (field.col.end) {
        element.style.gridColumnEnd = field.col.end.toString();
      }
    }
  }

  onFieldsInitialized(): void {
    this.fieldsInitializedSubject.next();
  }
}

export { RowFieldComponent };
