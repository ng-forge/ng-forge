/**
 * Per-adapter skill generation.
 *
 * Skills follow package boundaries because that is what a consumer installs:
 * core plus exactly one adapter. A single skill documenting four adapters' props
 * would describe three sets of properties the project does not have, which is
 * the confusion the `--ui` flag exists to avoid.
 *
 * These skills carry adapter `props` and nothing else. Field types, rules,
 * patterns and pitfalls are identical whichever adapter is installed, so they
 * stay in the core skill rather than being copied four times.
 */

import type { UIAdapterInfo } from '../packages/dynamic-form-mcp/src/registry/index.ts';
import { adapterPropsFromDescriptor, readAdapterDescriptor } from './descriptor-props.ts';

/** Human-facing name for an adapter, used in prose. */
const ADAPTER_LABELS: Record<string, string> = {
  material: 'Angular Material',
  bootstrap: 'Bootstrap',
  primeng: 'PrimeNG',
  ionic: 'Ionic',
};

export const labelFor = (library: string): string => ADAPTER_LABELS[library] ?? library;

/** Directory name for an adapter skill, matching its npm package. */
export const adapterSkillName = (library: string): string => `dynamic-forms-${library}`;

export interface AdapterSkillDeps {
  generatedNote: string;
  cell: (value: string) => string;
  withTableOfContents: (content: string) => string;
}

/** The adapter skill entry point. */
export function adapterSkillMd(adapter: UIAdapterInfo, version: string, deps: AdapterSkillDeps): string {
  const label = labelFor(adapter.library);

  return `---
name: ng-forge-${adapterSkillName(adapter.library)}
description: ${label} specific field properties for @ng-forge/dynamic-forms. Use alongside the ng-forge-dynamic-forms skill when the project depends on ${adapter.package}.
---

${deps.generatedNote}

# ng-forge Dynamic Forms: ${label}

Adapter specific \`props\` for \`${adapter.package}\`.

This skill documents version **${version}**.

## Use with the core skill

This skill covers only what ${label} adds. Field types, validation, conditional
logic and the authoring rules are the same for every adapter and live in the
\`ng-forge-dynamic-forms\` skill. Read that one first.

## Confirm the project uses this adapter

\`\`\`bash
node -e "console.log(require('${adapter.package}/package.json').version)"
\`\`\`

If that fails, the project uses a different adapter and none of the properties
below apply. Two adapters cannot both provide the same field type: TypeScript
reports error 2717 when they try, so a project has one adapter per field type.

Fields are registered with \`${adapter.providerFunction}\`.

## Validate against this adapter

\`\`\`bash
npx --yes @ng-forge/dynamic-forms-cli@next "path/to/your.form.ts" --ui ${adapter.library}
\`\`\`

Passing the wrong \`--ui\` validates against a different adapter's properties, which
can accept a config this project will not render. \`@next\` is where the published
executable is; the \`latest\` tag is still a placeholder with no binary. Requires
Node 24 or newer.

## Reference

- [Adapter properties](references/props.md) — every \`props\` key ${label} adds, per field type
`;
}

/**
 * Per field type, the props this adapter adds on top of the core definition.
 *
 * Read from the adapter's descriptor rather than the hand-written registry. The
 * registry covered five field types for Material and two for Bootstrap; the
 * descriptor covers twenty for each, and being derived it cannot fall behind
 * the types the way a maintained copy does.
 */
export function adapterPropsMd(adapter: UIAdapterInfo, deps: AdapterSkillDeps): string {
  return adapterPropsFromDescriptor(readAdapterDescriptor(adapter.library), {
    generatedNote: deps.generatedNote,
    cell: deps.cell,
    withTableOfContents: deps.withTableOfContents,
    label: labelFor(adapter.library),
  });
}
