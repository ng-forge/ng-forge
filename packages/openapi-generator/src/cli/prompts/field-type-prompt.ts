import { select } from '@inquirer/prompts';
import type { AmbiguousField } from '../../mapper/schema-to-fields.js';

/**
 * Prompt the user to choose between ambiguous field types.
 * Returns a map of fieldPath -> chosen field type.
 */
export async function promptFieldTypeChoices(ambiguousFields: AmbiguousField[]): Promise<Record<string, string>> {
  const decisions: Record<string, string> = {};

  for (const field of ambiguousFields) {
    const choices = getChoicesForScope(field.scope, field.currentType, field.alternative);

    const chosen = await select({
      message: `Field "${field.fieldPath}": which type?`,
      choices,
      default: field.currentType,
    });

    decisions[field.fieldPath] = chosen;
  }

  return decisions;
}

function getChoicesForScope(scope: string, currentType: string, alternative: string): Array<{ name: string; value: string }> {
  const scopeMap: Record<string, Array<{ name: string; value: string }>> = {
    'text-input': [
      { name: 'Input (single-line text)', value: 'input' },
      { name: 'Textarea (multi-line text)', value: 'textarea' },
    ],
    'single-select': [
      { name: 'Select (dropdown)', value: 'select' },
      { name: 'Radio (radio buttons)', value: 'radio' },
    ],
    numeric: [
      { name: 'Input (number input)', value: 'input' },
      { name: 'Slider (range slider)', value: 'slider' },
    ],
    boolean: [
      { name: 'Checkbox', value: 'checkbox' },
      { name: 'Toggle (switch)', value: 'toggle' },
    ],
  };

  return (
    scopeMap[scope] ?? [
      { name: currentType, value: currentType },
      { name: alternative, value: alternative },
    ]
  );
}
