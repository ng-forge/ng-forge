import { ChangeDetectionStrategy, Component, inject, input, ViewContainerRef, viewChild } from '@angular/core';
import { EventBus, arrayEvent } from '@ng-forge/dynamic-forms';
import type { FieldDef, FieldWrapperContract, WrapperFieldInputs } from '@ng-forge/dynamic-forms';

/**
 * Demo "arraySection" wrapper — wraps an array field in a titled card
 * whose header already contains an "Add" button. The wrapper dispatches
 * `arrayEvent(key).append(template)` on click using the array key it
 * reads from `fieldInputs`, so the consumer config stays tiny:
 *
 * ```typescript
 * {
 *   key: 'tags',
 *   type: 'array',
 *   wrappers: [{
 *     type: 'arraySection',
 *     title: 'Tags',
 *     addLabel: 'Add tag',
 *     itemTemplate: tagTemplate,
 *   }],
 *   fields: [...]
 * }
 * ```
 */
@Component({
  selector: 'demo-array-section-wrapper',
  template: `
    <div class="demo-section">
      <div class="demo-section__header demo-section__header--with-action">
        <span class="demo-section__title">{{ title() }}</span>
        <button type="button" class="demo-section__action" (click)="addItem()">
          <span aria-hidden="true">+</span>
          {{ addLabel() ?? 'Add' }}
        </button>
      </div>
      <div class="demo-section__body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  styleUrl: './section-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArraySectionWrapperComponent implements FieldWrapperContract {
  private readonly eventBus = inject(EventBus);

  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
  readonly addLabel = input<string>();
  readonly itemTemplate = input<FieldDef<unknown> | readonly FieldDef<unknown>[]>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  addItem(): void {
    const key = this.fieldInputs()?.key;
    const template = this.itemTemplate();
    if (!key || !template) return;
    this.eventBus.dispatch(arrayEvent(key).append(template as Parameters<ReturnType<typeof arrayEvent>['append']>[0]));
  }
}

export { ArraySectionWrapperComponent };

export interface ArraySectionWrapper {
  readonly type: 'arraySection';
  readonly title?: string;
  readonly addLabel?: string;
  readonly itemTemplate: FieldDef<unknown> | readonly FieldDef<unknown>[];
}

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryWrappers {
    arraySection: ArraySectionWrapper;
  }
}
