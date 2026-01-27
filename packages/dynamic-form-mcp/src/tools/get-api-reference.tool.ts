/**
 * Get API Reference Tool
 *
 * Returns compact API reference data optimized for LLM consumption.
 * Includes logic support matrix, field reference, container rules, etc.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import apiReference from '../registry/api-reference.json' with { type: 'json' };

type ApiReferenceSection =
  | 'all'
  | 'fields'
  | 'containers'
  | 'logic'
  | 'validators'
  | 'type-inference'
  | 'logic-matrix'
  | 'array-buttons'
  | 'context-api'
  | 'pitfalls';

interface ApiReference {
  version: string;
  description: string;
  logicMatrix: {
    description: string;
    columns: string[];
    fields: Record<string, string[]>;
  };
  containerRules: Record<string, unknown>;
  fieldReference: Record<string, unknown>;
  validators: Record<string, unknown>;
  logic: Record<string, unknown>;
  typeInference: Record<string, unknown>;
  arrayButtons?: Record<string, unknown>;
  contextApi?: Record<string, unknown>;
  commonPitfalls?: string[];
}

const typedApiReference = apiReference as ApiReference;

export function registerGetApiReferenceTool(server: McpServer): void {
  server.tool(
    'ngforge_get_api_reference',
    'Returns compact API reference data for ng-forge Dynamic Forms. Use this for quick lookups of field properties, logic support, container rules, validation, context APIs, and common pitfalls. Optimized for LLM parsing.',
    {
      section: z
        .enum([
          'all',
          'fields',
          'containers',
          'logic',
          'validators',
          'type-inference',
          'logic-matrix',
          'array-buttons',
          'context-api',
          'pitfalls',
        ])
        .default('all')
        .describe(
          'Section to retrieve: all, fields, containers, logic, validators, type-inference, logic-matrix, array-buttons, context-api, pitfalls',
        ),
      fieldType: z.string().optional().describe('Optional: filter to specific field type (e.g., "input", "select", "group")'),
    },
    async ({ section, fieldType }) => {
      const result = buildApiReferenceResponse(section as ApiReferenceSection, fieldType);

      return {
        content: [{ type: 'text' as const, text: result }],
      };
    },
  );
}

function buildApiReferenceResponse(section: ApiReferenceSection, fieldType?: string): string {
  const parts: string[] = [];

  if (section === 'all' || section === 'pitfalls') {
    parts.push(formatPitfalls());
  }

  if (section === 'all' || section === 'context-api') {
    parts.push(formatContextApi());
  }

  if (section === 'all' || section === 'logic-matrix') {
    parts.push(formatLogicMatrix());
  }

  if (section === 'all' || section === 'containers') {
    parts.push(formatContainerRules());
  }

  if (section === 'all' || section === 'fields') {
    parts.push(formatFieldReference(fieldType));
  }

  if (section === 'all' || section === 'array-buttons') {
    parts.push(formatArrayButtons());
  }

  if (section === 'all' || section === 'validators') {
    parts.push(formatValidators());
  }

  if (section === 'all' || section === 'logic') {
    parts.push(formatLogic());
  }

  if (section === 'all' || section === 'type-inference') {
    parts.push(formatTypeInference());
  }

  return parts.join('\n\n---\n\n');
}

function formatLogicMatrix(): string {
  const { logicMatrix } = typedApiReference;
  const lines: string[] = ['# Logic Support Matrix', '', logicMatrix.description, ''];

  // Header row
  lines.push(`| Field Type | ${logicMatrix.columns.join(' | ')} |`);
  lines.push(`|------------|${logicMatrix.columns.map(() => '---').join('|')}|`);

  // Data rows
  for (const [fieldType, support] of Object.entries(logicMatrix.fields)) {
    lines.push(`| ${fieldType} | ${support.join(' | ')} |`);
  }

  return lines.join('\n');
}

function formatContainerRules(): string {
  const { containerRules } = typedApiReference;
  const lines: string[] = ['# Container Rules', ''];

  for (const [containerType, rules] of Object.entries(containerRules)) {
    const r = rules as {
      hasLabel: boolean;
      supportsLogic: boolean;
      logicTypes?: string[];
      allowedChildren: string[];
      notAllowedChildren: string[];
      notes: string;
    };
    lines.push(`## ${containerType}`);
    lines.push(`- **hasLabel:** ${r.hasLabel ? 'YES' : 'NO'}`);
    lines.push(`- **supportsLogic:** ${r.supportsLogic ? `YES (${r.logicTypes?.join(', ') || 'all'})` : 'NO'}`);
    lines.push(`- **allowed children:** ${r.allowedChildren.join(', ')}`);
    lines.push(`- **NOT allowed:** ${r.notAllowedChildren.join(', ')}`);
    lines.push(`- **notes:** ${r.notes}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatFieldReference(fieldType?: string): string {
  const { fieldReference } = typedApiReference;
  const lines: string[] = ['# Field Reference', ''];

  const entries = fieldType ? Object.entries(fieldReference).filter(([type]) => type === fieldType) : Object.entries(fieldReference);

  if (fieldType && entries.length === 0) {
    return `# Field Reference\n\nField type "${fieldType}" not found. Available types: ${Object.keys(fieldReference).join(', ')}`;
  }

  for (const [type, info] of entries) {
    const f = info as {
      category: string;
      valueType: string | null;
      fieldLevelProps: string[];
      propsObject: string[];
      copyPaste: string;
      copyPasteEmail?: string;
      copyPasteNumber?: string;
      pitfall?: string;
      doesNotSupport?: string[];
      notes?: string;
    };

    lines.push(`## ${type} (${f.category})`);
    if (f.valueType) lines.push(`**valueType:** \`${f.valueType}\``);
    lines.push(`**field-level props:** ${f.fieldLevelProps.join(', ')}`);
    if (f.propsObject.length > 0) {
      lines.push(`**props object:** ${f.propsObject.join(', ')}`);
    }
    lines.push('');
    lines.push('**Copy-paste:**');
    lines.push('```typescript');
    lines.push(f.copyPaste);
    lines.push('```');

    if (f.copyPasteEmail) {
      lines.push('**Email variant:**');
      lines.push('```typescript');
      lines.push(f.copyPasteEmail);
      lines.push('```');
    }

    if (f.copyPasteNumber) {
      lines.push('**Number variant:**');
      lines.push('```typescript');
      lines.push(f.copyPasteNumber);
      lines.push('```');
    }

    if (f.pitfall) {
      lines.push(`\n**Pitfall:** ${f.pitfall}`);
    }

    if (f.doesNotSupport && f.doesNotSupport.length > 0) {
      lines.push(`\n**Does NOT support:** ${f.doesNotSupport.join(', ')}`);
    }

    if (f.notes) {
      lines.push(`\n**Notes:** ${f.notes}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

function formatValidators(): string {
  const { validators } = typedApiReference;
  const v = validators as {
    shorthand: { description: string; list: string[] };
    fullSyntax: { description: string; types: Record<string, string> };
    errorMessages: { description: string; example: string };
  };

  const lines: string[] = [
    '# Validators',
    '',
    '## Shorthand (at field level)',
    v.shorthand.description,
    `Available: ${v.shorthand.list.join(', ')}`,
    '',
    '## Full Syntax (in validators array)',
    v.fullSyntax.description,
    '',
  ];

  for (const [name, example] of Object.entries(v.fullSyntax.types)) {
    lines.push(`- **${name}:** \`${example}\``);
  }

  lines.push('');
  lines.push('## Error Messages');
  lines.push(v.errorMessages.description);
  lines.push(`Example: \`${v.errorMessages.example}\``);

  return lines.join('\n');
}

function formatLogic(): string {
  const { logic } = typedApiReference;
  const l = logic as {
    types: string[];
    conditions: Record<string, string>;
    operators: string[];
    buttonConditions: string[];
    derivationExample: string;
    expressionVariables: Record<string, string>;
  };

  const lines: string[] = ['# Logic System', '', `**Logic types:** ${l.types.join(', ')}`, '', '## Conditions'];

  for (const [name, example] of Object.entries(l.conditions)) {
    lines.push(`- **${name}:** \`${example}\``);
  }

  lines.push('');
  lines.push(`**Operators:** ${l.operators.join(', ')}`);
  lines.push('');
  lines.push(`**Button-only conditions:** ${l.buttonConditions.join(', ')}`);
  lines.push('');
  lines.push('## Derivation Example');
  lines.push('```typescript');
  lines.push(l.derivationExample);
  lines.push('```');
  lines.push('');
  lines.push('## Expression Variables');
  for (const [name, desc] of Object.entries(l.expressionVariables)) {
    lines.push(`- **${name}:** ${desc}`);
  }

  return lines.join('\n');
}

function formatTypeInference(): string {
  const { typeInference } = typedApiReference;
  const t = typeInference as {
    recommended: string;
    pitfall1: string;
    pitfall2: string;
    correct: string;
  };

  return `# Type Inference

## Recommended Pattern
\`\`\`typescript
${t.recommended}
\`\`\`

## Pitfall 1: Type annotation loses inference
${t.pitfall1}

## Pitfall 2: Missing 'as const'
${t.pitfall2}

## Correct Pattern
\`\`\`typescript
${t.correct}
\`\`\``;
}

function formatArrayButtons(): string {
  const ref = typedApiReference as ApiReference & { arrayButtons?: Record<string, unknown> };
  const arrayButtons = ref.arrayButtons;
  if (!arrayButtons) return '# Array Buttons\n\nNo array button documentation available.';

  const lines: string[] = ['# Array Buttons', '', arrayButtons['description'] as string, ''];

  const addButton = arrayButtons['addArrayItem'] as { copyPaste: string; fieldLevelProps: string[]; pitfall: string };
  if (addButton) {
    lines.push('## addArrayItem');
    lines.push('```typescript');
    lines.push(addButton.copyPaste);
    lines.push('```');
    lines.push(`**Field-level props:** ${addButton.fieldLevelProps.join(', ')}`);
    lines.push(`\n**Pitfall:** ${addButton.pitfall}`);
    lines.push('');
  }

  const removeButton = arrayButtons['removeArrayItem'] as { copyPaste: string; fieldLevelProps: string[]; notes: string };
  if (removeButton) {
    lines.push('## removeArrayItem');
    lines.push('```typescript');
    lines.push(removeButton.copyPaste);
    lines.push('```');
    lines.push(`**Field-level props:** ${removeButton.fieldLevelProps.join(', ')}`);
    lines.push(`\n**Notes:** ${removeButton.notes}`);
  }

  return lines.join('\n');
}

function formatContextApi(): string {
  const ref = typedApiReference as ApiReference & { contextApi?: Record<string, unknown> };
  const contextApi = ref.contextApi;
  if (!contextApi) return '# Context API\n\nNo context API documentation available.';

  const lines: string[] = ['# Context API', '', '**' + (contextApi['description'] as string) + '**', ''];

  const expressions = contextApi['expressions'] as {
    usedIn: string[];
    variables: Record<string, string>;
    example: string;
  };
  if (expressions) {
    lines.push('## Expressions (formValue/fieldValue)');
    lines.push(`**Used in:** ${expressions.usedIn.join(', ')}`);
    lines.push('');
    lines.push('**Variables:**');
    for (const [name, desc] of Object.entries(expressions.variables)) {
      lines.push(`- \`${name}\`: ${desc}`);
    }
    lines.push('');
    lines.push('**Example:**');
    lines.push('```typescript');
    lines.push(expressions.example);
    lines.push('```');
    lines.push('');
  }

  const validators = contextApi['validators'] as {
    usedIn: string[];
    api: string;
    methods: Record<string, string>;
    example: string;
    pitfall: string;
  };
  if (validators) {
    lines.push('## Validators (FieldContext API)');
    lines.push(`**Used in:** ${validators.usedIn.join(', ')}`);
    lines.push(`**API:** ${validators.api}`);
    lines.push('');
    lines.push('**Methods:**');
    for (const [method, desc] of Object.entries(validators.methods)) {
      lines.push(`- \`${method}\`: ${desc}`);
    }
    lines.push('');
    lines.push('**Example:**');
    lines.push('```typescript');
    lines.push(validators.example);
    lines.push('```');
    lines.push('');
    lines.push(`**Pitfall:** ${validators.pitfall}`);
  }

  return lines.join('\n');
}

function formatPitfalls(): string {
  const ref = typedApiReference as ApiReference & { commonPitfalls?: string[] };
  const pitfalls = ref.commonPitfalls;
  if (!pitfalls || pitfalls.length === 0) return '# Common Pitfalls\n\nNo pitfalls documented.';

  const lines: string[] = ['# Common Pitfalls', '', 'Review these BEFORE implementing to avoid build errors:', ''];

  for (let i = 0; i < pitfalls.length; i++) {
    lines.push(`${i + 1}. ${pitfalls[i]}`);
  }

  return lines.join('\n');
}
