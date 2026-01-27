/**
 * Get Field Info Tool
 *
 * Returns human-readable information about field types including
 * properties, validators, and UI-specific options.
 * Optionally includes JSON Schema for machine-readable validation.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFieldType, getFieldTypes, getUIAdapter, type FieldTypeInfo, type UIAdapterFieldType } from '../registry/index.js';
import { getFieldTypeJsonSchema, type UiIntegration, type FieldType } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

// Container fields that do NOT have label property
const CONTAINER_TYPES = ['row', 'group', 'array', 'page'];

// Properties that are at top level, not in props
const TOP_LEVEL_PROPS = ['fields', 'options', 'minValue', 'maxValue', 'step'];

function formatFieldInfo(field: FieldTypeInfo, uiFieldType?: UIAdapterFieldType): string {
  const lines: string[] = [];
  const isContainer = CONTAINER_TYPES.includes(field.type);
  const isHidden = field.type === 'hidden';

  lines.push(`## ${field.type} field`);
  lines.push('');
  lines.push(`**Category:** ${field.category}`);
  lines.push(
    `**Source:** ${field.source === 'core' ? 'Core library (no adapter required)' : 'Adapter required (material, bootstrap, primeng, or ionic)'}`,
  );
  lines.push(`**Description:** ${field.description}`);

  if (field.valueType) {
    lines.push(`**Value Type:** ${field.valueType}`);
  }

  lines.push(`**Validation Supported:** ${field.validationSupported ? 'Yes' : 'No'}`);

  // Placement rules section
  lines.push('');
  lines.push('### Placement Rules');
  lines.push('');
  if (field.allowedIn && field.allowedIn.length > 0) {
    lines.push(`**✅ Allowed in:** ${field.allowedIn.join(', ')}`);
  }
  if (field.notAllowedIn && field.notAllowedIn.length > 0) {
    lines.push(`**❌ NOT allowed in:** ${field.notAllowedIn.join(', ')}`);
  }
  if (field.canContain && field.canContain.length > 0) {
    lines.push(`**Can contain:** ${field.canContain.join(', ')}`);
  }
  if (field.cannotContain && field.cannotContain.length > 0) {
    lines.push(`**Cannot contain:** ${field.cannotContain.join(', ')}`);
  }
  if (!field.allowedIn && !field.notAllowedIn) {
    lines.push('**Allowed in:** top-level, page, row, group, array (no restrictions)');
  }

  // Minimal example section
  if (field.minimalExample) {
    lines.push('');
    lines.push('### Minimal Valid Example');
    lines.push('');
    lines.push('The absolute minimum required to make this field work:');
    lines.push('');
    lines.push('```typescript');
    lines.push(field.minimalExample);
    lines.push('```');
  }

  // Special note for container fields
  if (isContainer) {
    lines.push('');
    lines.push(`**⚠️ Note:** ${field.type} fields do NOT have a \`label\` property.`);
  }

  // Special note for hidden fields
  if (isHidden) {
    lines.push('');
    lines.push('**⚠️ IMPORTANT:** Hidden fields are special - they ONLY support: `key`, `type`, `value`, `className`');
    lines.push('They do NOT render and cannot be validated - they exist purely to pass values through the form.');
  }

  lines.push('');

  // For hidden fields, use special formatting
  if (isHidden) {
    lines.push('### Required Properties');
    lines.push('');
    lines.push('- `key`: string - Unique identifier for the field');
    lines.push(`- \`type\`: "hidden" - Field type discriminator`);
    lines.push('- `value`: string | number | boolean | (string | number | boolean)[] - **REQUIRED!** The value to include in form data');
    lines.push('');
    lines.push('### Optional Properties');
    lines.push('');
    lines.push('- `className`: string - CSS class names');
    lines.push('');
    lines.push('### Forbidden Properties (will cause validation error)');
    lines.push('');
    lines.push('Hidden fields do NOT support any of these properties:');
    lines.push('- `label` - Hidden fields do not render');
    lines.push('- `logic` - No conditional visibility/disabled');
    lines.push('- `validators` - No validation');
    lines.push('- `required` - No validation shorthand');
    lines.push('- `props` - No UI configuration');
    lines.push('- `disabled`, `readonly`, `hidden`, `col`, `tabIndex`, `meta`');
    lines.push('- Validation shorthand: `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`');
  } else {
    // Base properties
    lines.push('### Required Properties');
    lines.push('');
    lines.push('- `key`: string - Unique identifier for the field');
    lines.push(`- \`type\`: "${field.type}" - Field type discriminator`);

    // Only value fields have label
    if (field.category === 'value' && !isContainer) {
      lines.push('- `label`: string | { value: string, translate?: boolean } - Field label');
    }
  }

  // Skip field-specific props section for hidden fields (already handled above)
  if (!isHidden) {
    // Field-specific props
    const requiredProps = Object.values(field.props).filter((p) => p.required);
    for (const prop of requiredProps) {
      // Some props are at top level (fields), others in props
      const prefix = TOP_LEVEL_PROPS.includes(prop.name) ? '' : 'props.';
      lines.push(`- \`${prefix}${prop.name}\`: ${prop.type} - ${prop.description}`);
    }

    lines.push('');
    lines.push('### Optional Properties');
    lines.push('');

    const optionalProps = Object.values(field.props).filter((p) => !p.required);
    for (const prop of optionalProps) {
      const defaultVal = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
      const prefix = TOP_LEVEL_PROPS.includes(prop.name) ? '' : 'props.';
      lines.push(`- \`${prefix}${prop.name}\`: ${prop.type} - ${prop.description}${defaultVal}`);
    }
  }

  // Common optional properties for value fields (but not hidden fields)
  if (field.category === 'value' && !isContainer && !isHidden) {
    lines.push('- `value`: initial value for the field');
    lines.push('- `disabled`: boolean - Disable the field');
    lines.push('- `readonly`: boolean - Make field read-only');
    lines.push('- `hidden`: boolean - Hide the field');
    lines.push('- `col`: number (1-12) - Column width in grid layout');
    lines.push('- `className`: string - CSS class to apply');
    lines.push('- `logic`: LogicConfig[] - Conditional behavior and derivation');
    lines.push('');
    lines.push('### Logic Blocks (conditional behavior)');
    lines.push('');
    lines.push('Use `logic` array for dynamic behavior. NO hideWhen/showWhen shorthand exists!');
    lines.push('');
    lines.push('```typescript');
    lines.push('logic: [');
    lines.push("  // Conditional visibility - use type: 'hidden'");
    lines.push('  {');
    lines.push("    type: 'hidden',");
    lines.push('    condition: {');
    lines.push("      type: 'fieldValue',");
    lines.push("      fieldPath: 'otherField',");
    lines.push("      operator: 'equals',");
    lines.push("      value: 'someValue'");
    lines.push('    }');
    lines.push('  },');
    lines.push("  // Or use JavaScript expression with type: 'javascript'");
    lines.push('  {');
    lines.push("    type: 'hidden',");
    lines.push("    condition: { type: 'javascript', expression: 'formValue.age < 18' }");
    lines.push('  },');
    lines.push('  // Dynamic required');
    lines.push('  {');
    lines.push("    type: 'required',");
    lines.push("    condition: { type: 'fieldValue', fieldPath: 'type', operator: 'equals', value: 'business' }");
    lines.push('  },');
    lines.push('  // Value derivation');
    lines.push('  {');
    lines.push("    type: 'derivation',");
    lines.push("    targetField: 'fullName',");
    lines.push('    expression: \'formValue.firstName + " " + formValue.lastName\'');
    lines.push('  }');
    lines.push(']');
    lines.push('```');
  }

  // UI-specific properties
  if (uiFieldType && Object.keys(uiFieldType.additionalProps).length > 0) {
    lines.push('');
    lines.push('### UI-Specific Properties');
    lines.push('');

    for (const prop of Object.values(uiFieldType.additionalProps)) {
      const defaultVal = prop.default !== undefined ? ` (default: ${JSON.stringify(prop.default)})` : '';
      lines.push(`- \`${prop.name}\`: ${prop.type} - ${prop.description}${defaultVal}`);
    }
  }

  // Validators (for value fields)
  if (field.validationSupported) {
    lines.push('');
    lines.push('### Validation (shorthand)');
    lines.push('');
    lines.push('- `required`: boolean - Field must have a value');
    lines.push('- `email`: boolean - Must be valid email format');
    lines.push('- `min`: number - Minimum numeric value');
    lines.push('- `max`: number - Maximum numeric value');
    lines.push('- `minLength`: number - Minimum string length');
    lines.push('- `maxLength`: number - Maximum string length');
    lines.push('- `pattern`: string - Regex pattern to match');
  }

  // Example
  lines.push('');
  lines.push('### Example');
  lines.push('');
  lines.push('```typescript');
  lines.push(field.example);
  lines.push('```');

  return lines.join('\n');
}

// Field types that support JSON Schema generation
const SCHEMA_SUPPORTED_FIELD_TYPES = [
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'multi-checkbox',
  'toggle',
  'slider',
  'datepicker',
  'button',
  'submit',
  'next',
  'previous',
] as const;

export function registerGetFieldInfoTool(server: McpServer): void {
  server.tool(
    'ngforge_get_field_info',
    `Get COMPLETE documentation for a specific field type. Use when quick_lookup isn't enough.

Returns:
- All properties (required and optional)
- Placement rules (where field can/cannot go)
- Minimal valid example (copy-paste ready)
- Validation options
- UI-specific properties (if uiIntegration specified)
- Logic block examples

Tip: For quick syntax reference, use ngforge_quick_lookup instead. Use this tool for deep dives.`,
    {
      fieldType: z
        .string()
        .optional()
        .describe(
          'Field type to get info for (input, select, checkbox, radio, multi-checkbox, textarea, datepicker, toggle, slider, hidden, text, row, group, array, page, button, submit, next, previous). If omitted, lists all types.',
        ),
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .optional()
        .describe('UI library for UI-specific properties (material, bootstrap, primeng, ionic)'),
      includeSchema: z.boolean().optional().describe('Include JSON Schema for the field type (for tooling/validation). Default: false'),
    },
    async ({ fieldType, uiIntegration, includeSchema }) => {
      // If no fieldType, list all available types
      if (!fieldType) {
        const types = getFieldTypes();
        const byCategory = {
          value: types.filter((t) => t.category === 'value'),
          container: types.filter((t) => t.category === 'container'),
          button: types.filter((t) => t.category === 'button'),
          display: types.filter((t) => t.category === 'display'),
        };

        const lines: string[] = [
          '# Available Field Types',
          '',
          '## Value Fields (hold form data)',
          ...byCategory.value.map((t) => `- **${t.type}**: ${t.description}`),
          '',
          '## Container Fields (layout/grouping)',
          ...byCategory.container.map((t) => `- **${t.type}**: ${t.description}`),
          '',
          '## Button Fields',
          ...byCategory.button.map((t) => `- **${t.type}**: ${t.description}`),
          '',
          '## Display Fields',
          ...byCategory.display.map((t) => `- **${t.type}**: ${t.description}`),
          '',
          'Use `ngforge_get_field_info` with a specific fieldType for detailed properties and examples.',
        ];

        return {
          content: [{ type: 'text' as const, text: lines.join('\n') }],
        };
      }

      // Get specific field type info
      const field = getFieldType(fieldType);

      if (!field) {
        const allTypes = getFieldTypes().map((t) => t.type);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Unknown field type: "${fieldType}". Available types: ${allTypes.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Get UI-specific properties if integration specified
      let uiFieldType: UIAdapterFieldType | undefined;
      if (uiIntegration) {
        const adapter = getUIAdapter(uiIntegration);
        uiFieldType = adapter?.fieldTypes.find((ft) => ft.type === fieldType);
      }

      let info = formatFieldInfo(field, uiFieldType);

      // Optionally include JSON Schema
      if (
        includeSchema &&
        uiIntegration &&
        SCHEMA_SUPPORTED_FIELD_TYPES.includes(fieldType as (typeof SCHEMA_SUPPORTED_FIELD_TYPES)[number])
      ) {
        const schema = getFieldTypeJsonSchema(uiIntegration as UiIntegration, fieldType as FieldType);
        info += `\n\n### JSON Schema\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
      } else if (includeSchema && !uiIntegration) {
        info += '\n\n*Note: Specify uiIntegration to include JSON Schema*';
      }

      return {
        content: [{ type: 'text' as const, text: info }],
      };
    },
  );
}
