import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  model,
  ViewContainerRef,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { RowField } from '../../definitions/default/row-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FormUiControl } from '@angular/forms/signals';
import { FieldSignalContext } from '../../mappers/types';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class RowFieldComponent {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  // Row field definition and parent form context
  field = input.required<RowField<any>>();
  value = model<any>(undefined);
  form = input.required<any>(); // Parent form instance
  fieldSignalContext = input.required<FieldSignalContext<any>>();

  readonly disabled = computed(() => this.field().disabled || false);

  private readonly fieldsInitializedSubject = new Subject<void>();
  readonly initialized$ = this.fieldsInitializedSubject.asObservable();

  // Row fields are just layout containers - they pass through child fields directly
  fields$ = toObservable(
    computed(() => {
      const rowField = this.field();
      return rowField.fields || [];
    })
  );

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

        // Pass through the parent form context - row doesn't change form shape
        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext: this.fieldSignalContext(),
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

export { RowFieldComponent };
