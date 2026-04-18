---
description: 'Wrap an array field in a custom wrapper whose header hosts its own Add button. The wrapper dispatches arrayEvent(key).append(template), so the consumer config stays free of separate action fields.'
---

Action buttons for an array (Add, Clear, etc.) don't have to be separate fields in the config — a wrapper can own the button and the behaviour. Here, `arraySection` renders a titled card whose header contains an Add button; clicking it dispatches `arrayEvent(key).append(itemTemplate)` against the array it wraps.

## Live Demo

<docs-live-example scenario="examples/wrapper-array-actions"></docs-live-example>

## Config

The consumer only lists the wrapper and the item template. No separate `addArrayItem` field; no button placement logic.

```typescript
const tagItemTemplate = [
  { key: 'value', type: 'input', label: 'Tag', required: true, minLength: 2 },
  { key: 'removeTag', type: 'removeArrayItem', label: 'Remove', props: { color: 'warn' } },
] as const;

const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      wrappers: [{ type: 'arraySection', title: 'Tags', addLabel: 'Add tag', itemTemplate: tagItemTemplate }],
      fields: [...],
    },
  ],
} as const satisfies FormConfig;
```

## Inside the wrapper

The wrapper component reads the array's key from `fieldInputs`, then injects `EventBus` and dispatches the append event itself.

```typescript
@Component({
  selector: 'demo-array-section-wrapper',
  template: `
    <div class="demo-section">
      <div class="demo-section__header demo-section__header--with-action">
        <span>{{ title() }}</span>
        <button type="button" (click)="addItem()">+ {{ addLabel() ?? 'Add' }}</button>
      </div>
      <div class="demo-section__body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export default class ArraySectionWrapper implements FieldWrapperContract {
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
    this.eventBus.dispatch(arrayEvent(key).append(template));
  }
}
```

## Why this pattern

- **Config stays focused.** The array owns the data shape; the wrapper owns the chrome plus the add action.
- **Reusable.** Apply the same wrapper to any array by changing the `itemTemplate` — no custom buttons to wire up.
- **Consistent placement.** Every array wrapped this way has the Add button in the same visual position.

## Related

- **[Wrappers overview](/wrappers/overview)** — concept and built-ins
- **[Writing a wrapper](/wrappers/writing-a-wrapper)** — the component contract
- **[Complete Array API](/prebuilt/form-arrays/complete)** — alternative: add button as a separate field
