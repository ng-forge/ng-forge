import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  model,
  runInInjectionContext,
  ViewContainerRef,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { RowField } from '../../definitions/default/row-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FormUiControl } from '@angular/forms/signals';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

@Component({
  selector: 'row-field',
  template: `
    <div class="df-row" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </div>
  `,
  styleUrl: './row-field.component.scss',
  host: {
    class: 'df-field df-row',
    '[class.disabled]': 'disabled()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  imports: [FieldRendererDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RowFieldComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // Row field definition
  field = input.required<RowField<any>>();
  key = input.required<string>();
  value = model<any>(undefined);

  readonly disabled = computed(() => this.field().disabled || false);

  // Row fields are just layout containers - they pass through child fields directly
  fields$ = toObservable(
    computed(() => {
      const rowField = this.field();
      return rowField.fields || [];
    }),
  );

  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp)),
    ),
    { initialValue: [] },
  );

  private mapFields(fields: readonly any[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: any): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        // Check if component is destroyed before creating new components
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // Run mapper in injection context - row passes through parent context unchanged
        const bindings = runInInjectionContext(this.injector, () => {
          return mapFieldToBindings(fieldDef, this.fieldRegistry.raw);
        });

        // Create component with same injector (parent context is passed through)
        return this.vcr.createComponent(componentType, { bindings, injector: this.injector }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        // Only log errors if component hasn't been destroyed
        if (!this.destroyRef.destroyed) {
          const fieldKey = fieldDef.key || '<no key>';
          const rowKey = this.field().key || '<no key>';
          console.error(
            `[RowField] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
              `within row '${rowKey}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'row', this.field().key);
  }
}

export { RowFieldComponent };
