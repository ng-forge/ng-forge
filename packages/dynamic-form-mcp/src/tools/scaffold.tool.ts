/**
 * Scaffold Tool (NEW)
 *
 * Generates valid FormConfig skeletons based on parameters.
 * Produces copy-paste ready code with proper structure.
 *
 * Single tool for "Generate a skeleton for X"
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Field definition from "name:type" string.
 */
interface FieldDef {
  name: string;
  type: string;
}

/**
 * Hidden field definition from "name:value" string.
 */
interface HiddenDef {
  name: string;
  value: string;
}

/**
 * Parse "name:type" pairs.
 */
function parseFieldDefs(fields: string[]): FieldDef[] {
  return fields.map((f) => {
    const [name, type] = f.split(':');
    return {
      name: name?.trim() || 'field',
      type: type?.trim() || 'input',
    };
  });
}

/**
 * Parse "name:value" pairs for hidden fields.
 */
function parseHiddenDefs(hiddens: string[]): HiddenDef[] {
  return hiddens.map((h) => {
    const colonIndex = h.indexOf(':');
    if (colonIndex === -1) {
      return { name: h.trim(), value: '' };
    }
    return {
      name: h.substring(0, colonIndex).trim(),
      value: h.substring(colonIndex + 1).trim(),
    };
  });
}

/**
 * Generate a basic field config.
 */
function generateField(def: FieldDef, indent: string): string {
  const { name, type } = def;

  switch (type) {
    case 'input':
      return `${indent}{ key: '${name}', type: 'input', label: '${capitalize(name)}' }`;

    case 'select':
      return `${indent}{
${indent}  key: '${name}',
${indent}  type: 'select',
${indent}  label: '${capitalize(name)}',
${indent}  options: [
${indent}    { label: 'Option 1', value: 'opt1' },
${indent}    { label: 'Option 2', value: 'opt2' }
${indent}  ]
${indent}}`;

    case 'radio':
      return `${indent}{
${indent}  key: '${name}',
${indent}  type: 'radio',
${indent}  label: '${capitalize(name)}',
${indent}  options: [
${indent}    { label: 'Yes', value: true },
${indent}    { label: 'No', value: false }
${indent}  ]
${indent}}`;

    case 'checkbox':
      return `${indent}{ key: '${name}', type: 'checkbox', label: '${capitalize(name)}' }`;

    case 'textarea':
      return `${indent}{ key: '${name}', type: 'textarea', label: '${capitalize(name)}', props: { rows: 4 } }`;

    case 'datepicker':
      return `${indent}{ key: '${name}', type: 'datepicker', label: '${capitalize(name)}' }`;

    case 'slider':
      return `${indent}{ key: '${name}', type: 'slider', label: '${capitalize(name)}', minValue: 0, maxValue: 100, step: 1, value: 50 }`;

    case 'toggle':
      return `${indent}{ key: '${name}', type: 'toggle', label: '${capitalize(name)}' }`;

    default:
      return `${indent}{ key: '${name}', type: 'input', label: '${capitalize(name)}' }`;
  }
}

/**
 * Generate a hidden field config.
 */
function generateHiddenField(def: HiddenDef, indent: string): string {
  const { name, value } = def;
  // Determine if value should be quoted
  const isNumber = !isNaN(Number(value)) && value !== '';
  const isBool = value === 'true' || value === 'false';
  const formattedValue = isNumber ? value : isBool ? value : `'${value || 'TODO'}'`;

  return `${indent}{ key: '${name}', type: 'hidden', value: ${formattedValue} }`;
}

/**
 * Generate a group skeleton.
 */
function generateGroup(name: string, indent: string): string {
  return `${indent}{
${indent}  key: '${name}',
${indent}  type: 'group',
${indent}  fields: [
${indent}    { key: '${name}Field1', type: 'input', label: '${capitalize(name)} Field 1' },
${indent}    { key: '${name}Field2', type: 'input', label: '${capitalize(name)} Field 2' }
${indent}  ]
${indent}}`;
}

/**
 * Generate an array skeleton with add button.
 */
function generateArray(name: string, indent: string): string[] {
  const array = `${indent}{
${indent}  key: '${name}',
${indent}  type: 'array',
${indent}  fields: [
${indent}    {
${indent}      key: '${name}Item',
${indent}      type: 'group',
${indent}      fields: [
${indent}        { key: 'itemName', type: 'input', label: 'Name' },
${indent}        { key: 'itemValue', type: 'input', label: 'Value' }
${indent}      ]
${indent}    }
${indent}  ]
${indent}}`;

  const addButton = `${indent}{ key: 'add${capitalize(name)}', type: 'addArrayItem', label: 'Add ${capitalize(name)}', arrayKey: '${name}' }`;

  return [array, addButton];
}

/**
 * Capitalize first letter.
 */
function capitalize(s: string): string {
  return (
    s.charAt(0).toUpperCase() +
    s
      .slice(1)
      .replace(/([A-Z])/g, ' $1')
      .trim()
  );
}

/**
 * Generate complete FormConfig skeleton.
 */
function generateScaffold(options: { pages: number; arrays: string[]; groups: string[]; hidden: HiddenDef[]; fields: FieldDef[] }): string {
  const { pages, arrays, groups, hidden, fields } = options;
  const lines: string[] = [];

  lines.push("import { FormConfig } from '@ng-forge/dynamic-forms';");
  lines.push('');
  lines.push('const formConfig = {');
  lines.push('  fields: [');

  if (pages > 0) {
    // Multi-page form
    for (let p = 1; p <= pages; p++) {
      const isFirst = p === 1;
      const isLast = p === pages;

      lines.push('    {');
      lines.push(`      key: 'page${p}',`);
      lines.push("      type: 'page',");
      lines.push('      fields: [');

      // Page header
      lines.push(`        { key: 'header${p}', type: 'text', label: 'Step ${p} of ${pages}', props: { elementType: 'h2' } },`);

      // Hidden fields go in first page
      if (isFirst && hidden.length > 0) {
        for (const h of hidden) {
          lines.push(generateHiddenField(h, '        ') + ',');
        }
      }

      // Groups
      for (const g of groups) {
        lines.push(generateGroup(g, '        ') + ',');
      }

      // Arrays (evenly distribute across pages, or put in middle pages)
      const arraysForThisPage = pages > 2 && p > 1 && p < pages ? arrays : p === Math.ceil(pages / 2) ? arrays : [];
      if (pages <= 2 && isFirst) {
        for (const a of arrays) {
          const [arrayDef, addBtn] = generateArray(a, '        ');
          lines.push(arrayDef + ',');
          lines.push(addBtn + ',');
        }
      } else {
        for (const a of arraysForThisPage) {
          const [arrayDef, addBtn] = generateArray(a, '        ');
          lines.push(arrayDef + ',');
          lines.push(addBtn + ',');
        }
      }

      // Basic fields (distribute across pages)
      const fieldsPerPage = Math.ceil(fields.length / pages);
      const startIdx = (p - 1) * fieldsPerPage;
      const endIdx = Math.min(startIdx + fieldsPerPage, fields.length);
      const pageFields = fields.slice(startIdx, endIdx);

      for (const f of pageFields) {
        lines.push(generateField(f, '        ') + ',');
      }

      // Navigation
      if (!isLast) {
        if (!isFirst) {
          lines.push('        {');
          lines.push(`          key: 'navRow${p}',`);
          lines.push("          type: 'row',");
          lines.push('          fields: [');
          lines.push(`            { key: 'back${p}', type: 'previous', label: 'Back', col: 6 },`);
          lines.push(`            { key: 'next${p}', type: 'next', label: 'Next', col: 6 }`);
          lines.push('          ]');
          lines.push('        }');
        } else {
          lines.push(`        { key: 'next${p}', type: 'next', label: 'Next' }`);
        }
      } else {
        // Last page
        lines.push('        {');
        lines.push(`          key: 'navRow${p}',`);
        lines.push("          type: 'row',");
        lines.push('          fields: [');
        lines.push(`            { key: 'back${p}', type: 'previous', label: 'Back', col: 6 },`);
        lines.push("            { key: 'submit', type: 'submit', label: 'Submit', col: 6 }");
        lines.push('          ]');
        lines.push('        }');
      }

      lines.push('      ]');
      lines.push(p < pages ? '    },' : '    }');
    }
  } else {
    // Single-page form
    // Hidden fields
    for (const h of hidden) {
      lines.push(generateHiddenField(h, '    ') + ',');
    }

    // Groups
    for (const g of groups) {
      lines.push(generateGroup(g, '    ') + ',');
    }

    // Arrays
    for (const a of arrays) {
      const [arrayDef, addBtn] = generateArray(a, '    ');
      lines.push(arrayDef + ',');
      lines.push(addBtn + ',');
    }

    // Fields
    for (const f of fields) {
      lines.push(generateField(f, '    ') + ',');
    }

    // Submit button
    lines.push("    { key: 'submit', type: 'submit', label: 'Submit' }");
  }

  lines.push('  ]');
  lines.push('} as const satisfies FormConfig;');
  lines.push('');
  lines.push('export default formConfig;');

  return lines.join('\n');
}

/**
 * Generate output shape preview.
 */
function generateOutputShape(options: { groups: string[]; arrays: string[]; hidden: HiddenDef[]; fields: FieldDef[] }): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('// Form output shape:');
  lines.push('// {');

  for (const f of options.fields) {
    const tsType = getTypeForFieldType(f.type);
    lines.push(`//   ${f.name}: ${tsType};`);
  }

  for (const g of options.groups) {
    lines.push(`//   ${g}: {`);
    lines.push(`//     ${g}Field1: string;`);
    lines.push(`//     ${g}Field2: string;`);
    lines.push('//   };');
  }

  for (const a of options.arrays) {
    lines.push(`//   ${a}: Array<{`);
    lines.push('//     itemName: string;');
    lines.push('//     itemValue: string;');
    lines.push('//   }>;');
  }

  for (const h of options.hidden) {
    const isNumber = !isNaN(Number(h.value)) && h.value !== '';
    const isBool = h.value === 'true' || h.value === 'false';
    const tsType = isNumber ? 'number' : isBool ? 'boolean' : 'string';
    lines.push(`//   ${h.name}: ${tsType}; // hidden`);
  }

  lines.push('// }');

  return lines.join('\n');
}

/**
 * Get TypeScript type for field type.
 */
function getTypeForFieldType(type: string): string {
  switch (type) {
    case 'input':
    case 'textarea':
      return 'string';
    case 'checkbox':
    case 'toggle':
      return 'boolean';
    case 'slider':
      return 'number';
    case 'select':
    case 'radio':
      return 'T'; // Generic - depends on options
    case 'datepicker':
      return 'Date';
    default:
      return 'unknown';
  }
}

export function registerScaffoldTool(server: McpServer): void {
  server.tool(
    'ngforge_scaffold',
    `SCAFFOLD: Generate FormConfig skeleton - "Generate a skeleton for X"

Creates valid, compilable FormConfig code with:
- Proper page structure with navigation
- Array containers with add/remove
- Groups with placeholder fields
- Hidden fields with values
- Submit button on last page
- 'as const satisfies FormConfig' wrapper

Examples:
- Single page: pages=0 fields=["name:input","email:input"]
- Multi-page wizard: pages=3 fields=["name:input"]
- With arrays: pages=2 arrays=["contacts"]
- With groups: pages=0 groups=["address","billing"]
- With hidden: hidden=["userId:abc123","source:web"]`,
    {
      pages: z.number().min(0).max(10).default(0).describe('Number of pages (0 = single-page form, 1-10 = multi-page wizard)'),
      arrays: z.array(z.string()).optional().describe('Array field names for dynamic lists, e.g., ["contacts", "addresses"]'),
      groups: z.array(z.string()).optional().describe('Group field names for nested objects, e.g., ["address", "billing"]'),
      hidden: z.array(z.string()).optional().describe('Hidden fields as "name:value" pairs, e.g., ["userId:abc", "version:1"]'),
      fields: z
        .array(z.string())
        .optional()
        .describe('Basic fields as "name:type" pairs, e.g., ["email:input", "country:select", "age:slider"]'),
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .default('material')
        .describe('UI library (for future UI-specific props). Defaults to material.'),
    },
    async ({ pages, arrays = [], groups = [], hidden = [], fields = [] }) => {
      // Parse inputs
      const fieldDefs = parseFieldDefs(fields);
      const hiddenDefs = parseHiddenDefs(hidden);

      // Generate scaffold
      const scaffold = generateScaffold({
        pages,
        arrays,
        groups,
        hidden: hiddenDefs,
        fields: fieldDefs,
      });

      // Generate output shape comment
      const outputShape = generateOutputShape({
        groups,
        arrays,
        hidden: hiddenDefs,
        fields: fieldDefs,
      });

      // Summary
      const summary = [
        '# Generated FormConfig Scaffold',
        '',
        `**Structure:** ${pages === 0 ? 'Single-page form' : `${pages}-page wizard`}`,
        `**Fields:** ${fieldDefs.length} basic field(s)`,
        `**Groups:** ${groups.length} nested group(s)`,
        `**Arrays:** ${arrays.length} dynamic array(s)`,
        `**Hidden:** ${hiddenDefs.length} hidden field(s)`,
        '',
        '**Note:** This is a skeleton - customize labels, add validation, and adjust as needed.',
        '',
        '```typescript',
        scaffold,
        outputShape,
        '```',
      ].join('\n');

      return {
        content: [{ type: 'text' as const, text: summary }],
      };
    },
  );
}
