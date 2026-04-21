/**
 * Wrapper Registry Data
 *
 * Canonical source of wrapper metadata for the MCP server.
 *
 * Wrappers decorate the rendered output of a field without changing the form
 * data structure. They are composed as a chain: each wrapper exposes a
 * `#fieldComponent` `ViewContainerRef` slot where the next wrapper (or the
 * field itself) is rendered.
 *
 * Categories:
 *   - core    — ships from `@ng-forge/dynamic-forms`, always available.
 *   - demo    — ships from `@internal/examples-shared-ui` for the docs
 *               sandbox. NOT a library primitive — use as a pattern, not
 *               a dependency.
 *   - adapter — (reserved) would ship from a UI adapter library.
 */

import type { WrapperInfo } from './index.js';

/**
 * Authoring-contract pitfalls that apply to every wrapper component.
 * Surfaced by `ngforge_lookup topic="wrappers"` and any wrapper-scoped
 * lookup so consumers can't miss them.
 */
export const WRAPPER_AUTHORING_CONTRACT = `All wrapper components MUST:

1. Implement \`FieldWrapperContract\` from \`@ng-forge/dynamic-forms\`.
2. Expose \`readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });\`
   — this is the slot where the inner wrapper (or the field) is rendered
   imperatively by the outlet.
3. Place the \`#fieldComponent\` template ref UNCONDITIONALLY. It cannot
   live inside \`@if\`, \`@defer\`, \`@for\`, \`@switch\`, \`<ng-template>\`,
   or any structural directive that delays view creation. The outlet reads
   the \`ViewContainerRef\` immediately after creation — if the slot isn't
   materialised yet, \`viewChild.required\` throws \`NG0951\`
   (REQUIRED_QUERY_NO_VALUE), the wrapper chain is torn down, and the field
   renders bare.
4. Declare every config key the wrapper consumes as an Angular \`input()\`.
   Unknown keys are silently dropped — the outlet probes
   \`reflectComponentType(...).inputs\` before calling \`setInput()\`.
   Runtime typos in config will NOT throw; rely on TypeScript (via
   \`FieldRegistryWrappers\` module augmentation) to catch them.
5. Optionally accept \`fieldInputs: input<WrapperFieldInputs>()\` to read
   the wrapped field's mapper outputs and read-only form state.`;

export const WRAPPERS: WrapperInfo[] = [
  {
    type: 'css',
    category: 'core',
    availability: 'shipping',
    package: '@ng-forge/dynamic-forms',
    description:
      'Invisible wrapper that applies CSS classes to the host element via a `DynamicText` input. Useful for decorating any field (or container) with styling without authoring a custom wrapper. Resolves `Signal<string>` / `Observable<string>` / `string` uniformly.',
    props: {
      cssClasses: {
        name: 'cssClasses',
        type: 'DynamicText',
        description:
          'Space-separated CSS class names to apply to the wrapper host element. Accepts a literal string, a Signal<string>, or an Observable<string> — the wrapper subscribes and updates the host [class] binding reactively.',
        required: false,
      },
    },
    autoAppliesTo: [],
    componentName: 'CssWrapperComponent',
    contract: WRAPPER_AUTHORING_CONTRACT,
    example: `// Field-level CSS wrapper (scoped to a single field)
{
  key: 'email',
  type: 'input',
  label: 'Email',
  wrappers: [{ type: 'css', cssClasses: 'field--highlight' }]
}

// Dynamic classes via Signal<string>
{
  key: 'amount',
  type: 'input',
  label: 'Amount',
  wrappers: [{ type: 'css', cssClasses: highlightClass }] // highlightClass: Signal<string>
}

// Chained with other wrappers (outer-most first)
{
  key: 'contact',
  type: 'group',
  wrappers: [
    { type: 'section', title: 'Contact' }, // outer
    { type: 'css', cssClasses: 'pad-lg' }  // inner
  ],
  fields: [...]
}`,
    minimalExample: `{ type: 'css', cssClasses: 'my-class' }`,
  },
  {
    type: 'arraySection',
    category: 'demo',
    availability: 'demo-only',
    package: '@internal/examples-shared-ui',
    description:
      'Demo wrapper used by the docs sandbox. Wraps an array field in a titled card whose header contains an "Add" button — the wrapper owns the append behaviour, dispatching `arrayEvent(key).append(itemTemplate)` on click via the `EventBus`. Lets the consumer config drop the separate `addArrayItem` button field. NOT a shipping primitive; copy the component out of `internal/examples-shared-ui/src/lib/demo-wrappers/` or author your own if you want this pattern in production.',
    props: {
      title: {
        name: 'title',
        type: 'string',
        description: 'Card header text rendered above the array.',
        required: false,
      },
      addLabel: {
        name: 'addLabel',
        type: 'string',
        description: 'Text for the Add button in the header. Defaults to "Add" when omitted.',
        required: false,
      },
      itemTemplate: {
        name: 'itemTemplate',
        type: 'FieldDef<unknown> | readonly FieldDef<unknown>[]',
        description:
          "Template passed to `arrayEvent(key).append(template)` when the Add button is clicked. Should match the array's `fields` shape.",
        required: true,
      },
    },
    autoAppliesTo: [],
    componentName: 'ArraySectionWrapperComponent',
    contract: WRAPPER_AUTHORING_CONTRACT,
    example: `// Array wrapped with arraySection — the wrapper owns the Add button
import { arrayEvent } from '@ng-forge/dynamic-forms';

const tagItemTemplate = { key: 'tag', type: 'input', label: 'Tag' } as const satisfies FieldDef;

{
  key: 'tags',
  type: 'array',
  wrappers: [{
    type: 'arraySection',
    title: 'Tags',
    addLabel: 'Add tag',
    itemTemplate: tagItemTemplate,
  }],
  fields: [tagItemTemplate],
}
// Clicking the header button dispatches arrayEvent('tags').append(tagItemTemplate)`,
    minimalExample: `{ type: 'arraySection', title: 'Items', itemTemplate: { key: 'item', type: 'input', label: 'Item' } }`,
  },
  {
    type: 'section',
    category: 'demo',
    availability: 'demo-only',
    package: '@internal/examples-shared-ui',
    description:
      'Demo wrapper used by the docs sandbox. Renders a titled card around the wrapped content and is registered with every sandbox adapter so the Writing-a-Wrapper docs can demonstrate an end-to-end custom wrapper. NOT a shipping primitive — use as a pattern/template, not a dependency.',
    props: {
      title: {
        name: 'title',
        type: 'string',
        description: 'Card header text. Omit to render a header-less card.',
        required: false,
      },
    },
    autoAppliesTo: [],
    componentName: 'SectionWrapperComponent',
    contract: WRAPPER_AUTHORING_CONTRACT,
    example: `// Section wrapper around a group
{
  key: 'address',
  type: 'group',
  wrappers: [{ type: 'section', title: 'Shipping address' }],
  fields: [
    { key: 'street', type: 'input', label: 'Street' },
    { key: 'city', type: 'input', label: 'City' }
  ]
}

// Header-less card (title omitted)
{
  key: 'details',
  type: 'group',
  wrappers: [{ type: 'section' }],
  fields: [...]
}`,
    minimalExample: `{ type: 'section', title: 'Section title' }`,
  },
];
