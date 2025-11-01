import { ChangeDetectionStrategy, Component, ComponentRef, computed, inject, Injector, input, ViewContainerRef } from '@angular/core';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, EMPTY, map, of, Subject, switchMap } from 'rxjs';
import { PageField, validatePageNesting } from '../../definitions/default/page-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FieldTree, FormUiControl } from '@angular/forms/signals';
import { FieldSignalContext } from '../../mappers/types';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';

@Component({
  selector: 'page-field',
  template: `
    <div class="df-page" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </div>
  `,
  styleUrl: './page-field.component.scss',
  host: {
    class: 'df-field',
    '[class.disabled]': 'disabled()',
  },
  imports: [FieldRendererDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageFieldComponent {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus, { optional: true });

  // Page field definition and parent form context
  field = input.required<PageField<any>>();

  form = input.required<FieldTree<any>>();

  fieldSignalContext = input.required<FieldSignalContext<any>>();

  readonly disabled = computed(() => this.field().disabled || false);

  private readonly fieldsInitializedSubject = new Subject<void>();

  // EventBus outputs for page navigation (only if EventBus is provided)
  readonly nextPage = outputFromObservable(this.eventBus?.subscribe<NextPageEvent>('next-page') ?? EMPTY);

  readonly previousPage = outputFromObservable(this.eventBus?.subscribe<PreviousPageEvent>('previous-page') ?? EMPTY);

  readonly pageChange = outputFromObservable(this.eventBus?.subscribe<PageChangeEvent>('page-change') ?? EMPTY);

  // Validate that this page doesn't contain nested pages
  readonly isValid = computed(() => {
    const pageField = this.field();
    const valid = validatePageNesting(pageField);

    if (!valid) {
      console.error('Page fields cannot contain nested page fields:', pageField);
    }

    return valid;
  });

  // Page fields are layout containers - they pass through child fields directly like rows
  fields$ = toObservable(
    computed(() => {
      const pageField = this.field();

      // Only return fields if validation passes
      if (!this.isValid()) {
        return [];
      }

      return pageField.fields || [];
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

        // Pass through the parent form context - page doesn't change form shape like row
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
