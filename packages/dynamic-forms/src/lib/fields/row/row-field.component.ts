import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  Renderer2,
  runInInjectionContext,
  ViewContainerRef,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { RowField } from '../../definitions/default/row-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FormUiControl } from '@angular/forms/signals';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

@Component({
  selector: 'row-field',
  template: `
    <div class="df-row">
      <!-- Fields are rendered directly via effect -->
    </div>
  `,
  styleUrl: './row-field.component.scss',
  host: {
    class: 'df-field df-row',
    '[class.disabled]': 'disabled()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RowFieldComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  // Track rendered components for cleanup
  private renderedComponents: ComponentRef<FormUiControl>[] = [];

  // Row field definition
  field = input.required<RowField<any>>();
  key = input.required<string>();
  value = model<any>(undefined);

  readonly disabled = computed(() => {
    try {
      return this.field().disabled || false;
    } catch {
      return false;
    }
  });

  // Row fields are just layout containers - they pass through child fields directly
  // Note: Use try/catch to handle timing where field input isn't available during class initialization
  fields$ = toObservable(
    computed(() => {
      try {
        const rowField = this.field();
        return rowField.fields || [];
      } catch {
        // Input not yet available during component initialization
        return [];
      }
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

  // Effect to render fields directly into the row div
  // This bypasses template binding issues with OnPush change detection
  private readonly renderFieldsEffect = effect(() => {
    const currentFields = this.fields();
    this.renderFields(currentFields);
  });

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
            `[Dynamic Forms] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
              `within row '${rowKey}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  /**
   * Renders field components directly into the row's .df-row div.
   * This bypasses the FieldRendererDirective to avoid OnPush change detection issues.
   */
  private renderFields(fields: ComponentRef<FormUiControl>[]): void {
    // Clear existing rendered components
    this.clearFields();

    if (!fields || fields.length === 0) {
      // Still emit event even with no fields
      this.emitFieldsInitialized();
      return;
    }

    // Find the .df-row container element
    const rowContainer = this.elementRef.nativeElement.querySelector('.df-row');
    if (!rowContainer) {
      return;
    }

    // Append each field component to the row container
    fields.forEach((fieldComponent) => {
      if (fieldComponent && fieldComponent.location) {
        this.renderer.appendChild(rowContainer, fieldComponent.location.nativeElement);
        this.renderedComponents.push(fieldComponent);
      }
    });

    // Emit initialized event after next render
    this.emitFieldsInitialized();
  }

  /**
   * Clears previously rendered field components from the DOM.
   */
  private clearFields(): void {
    const rowContainer = this.elementRef.nativeElement.querySelector('.df-row');
    if (!rowContainer) {
      return;
    }

    this.renderedComponents.forEach((fieldComponent) => {
      if (fieldComponent.location?.nativeElement?.parentNode === rowContainer) {
        this.renderer.removeChild(rowContainer, fieldComponent.location.nativeElement);
      }
    });

    this.renderedComponents = [];
  }

  /**
   * Emits the fieldsInitialized event after the next render cycle.
   */
  private emitFieldsInitialized(): void {
    afterNextRender(
      () => {
        try {
          this.eventBus.dispatch(ComponentInitializedEvent, 'row', this.field().key);
        } catch {
          // Input not available - component may have been destroyed
        }
      },
      { injector: this.injector },
    );
  }
}

export { RowFieldComponent };
