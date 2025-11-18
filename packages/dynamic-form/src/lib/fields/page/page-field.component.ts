import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { PageField, validatePageNesting } from '../../definitions/default/page-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FieldTree, FormUiControl } from '@angular/forms/signals';
import { FieldSignalContext } from '../../mappers/types';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

@Component({
  selector: 'page-field',
  template: `
    <div
      class="df-page"
      [class.df-page-visible]="isVisible()"
      [class.df-page-hidden]="!isVisible()"
      [attr.aria-hidden]="!isVisible()"
      [fieldRenderer]="fields()"
      (fieldsInitialized)="onFieldsInitialized()"
    >
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </div>
  `,
  styleUrl: './page-field.component.scss',
  host: {
    class: 'df-field df-page-field',
    '[class.disabled]': 'disabled()',
    '[class.df-page-visible]': 'isVisible()',
    '[class.df-page-hidden]': '!isVisible()',
    '[style.display]': 'isVisible() ? "block" : "none"',
    '[attr.aria-hidden]': '!isVisible()',
    '[attr.data-page-index]': 'pageIndex()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  imports: [FieldRendererDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageFieldComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // Page field definition and parent form context
  field = input.required<PageField<any>>();
  key = input.required<string>();

  form = input.required<FieldTree<any>>();

  fieldSignalContext = input.required<FieldSignalContext>();

  /**
   * Page index passed from orchestrator
   */
  pageIndex = input.required<number>();

  /**
   * Page visibility state passed from orchestrator
   */
  isVisible = input.required<boolean>();

  readonly disabled = computed(() => this.field().disabled || false);

  // EventBus outputs for page navigation
  readonly nextPage = outputFromObservable(this.eventBus.on<NextPageEvent>('next-page'));

  readonly previousPage = outputFromObservable(this.eventBus.on<PreviousPageEvent>('previous-page'));

  readonly pageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  // Validate that this page doesn't contain nested pages
  readonly isValid = computed(() => {
    const pageField = this.field();
    const valid = validatePageNesting(pageField);

    if (!valid) {
      console.error(
        `[PageField] Invalid configuration: Page '${pageField.key}' contains nested page fields. ` +
          `Pages cannot contain other pages. Consider using groups or rows for nested structure.`,
        pageField,
      );
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

  private mapFields(fields: any[]): Promise<ComponentRef<FormUiControl>>[] {
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

        // Pass through the parent form context - page doesn't change form shape like row
        const fieldSignalContext = this.fieldSignalContext();

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext,
          fieldRegistry: this.fieldRegistry.raw,
        });

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        // Only log errors if component hasn't been destroyed
        if (!this.destroyRef.destroyed) {
          const fieldKey = fieldDef.key || '<no key>';
          const pageKey = this.field().key;
          console.error(
            `[PageField] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
              `within page '${pageKey}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'page', this.field().key);
  }
}
