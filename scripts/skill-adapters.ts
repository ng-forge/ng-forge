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
npx --yes @ng-forge/dynamic-forms-cli "path/to/your.form.ts" --ui ${adapter.library}
\`\`\`

Passing the wrong \`--ui\` validates against a different adapter's properties, which
can accept a config this project will not render. Requires Node 24 or newer.

## Reference

- [Adapter properties](references/props.md) — every \`props\` key ${label} adds, per field type
`;
}

/** Per field type, the props this adapter adds on top of the core definition. */
export function adapterPropsMd(adapter: UIAdapterInfo, deps: AdapterSkillDeps): string {
  const label = labelFor(adapter.library);
  const lines: string[] = [deps.generatedNote, '', `# ${label} field properties`, ''];

  lines.push(
    `These keys go inside \`props\`. Everything else about a field — its \`key\`,`,
    `\`type\`, \`label\`, validation and logic — is adapter independent and documented`,
    'in the core skill.',
    '',
  );

  for (const field of adapter.fieldTypes) {
    const props = Object.values(field.additionalProps ?? {});
    if (props.length === 0) continue;

    lines.push(`## \`${field.type}\``, '');
    lines.push(`Rendered by \`${field.componentName}\`.`, '');
    lines.push('| Prop | Type | Required | Default | Description |');
    lines.push('| ---- | ---- | -------- | ------- | ----------- |');

    for (const prop of props) {
      const dflt = prop.default === undefined ? '' : `\`${deps.cell(String(prop.default))}\``;
      lines.push(
        `| \`${deps.cell(prop.name)}\` | \`${deps.cell(prop.type)}\` | ${prop.required ? 'yes' : 'no'} | ${dflt} | ${deps.cell(prop.description ?? '')} |`,
      );
    }
    lines.push('');
  }

  return deps.withTableOfContents(lines.join('\n'));
}
