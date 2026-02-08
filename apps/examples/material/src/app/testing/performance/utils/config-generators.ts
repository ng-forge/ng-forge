import { FormConfig } from '@ng-forge/dynamic-forms';

/**
 * Generate a flat form with N input fields.
 */
export function generateFlatFields(count: number, type: string = 'input'): FormConfig {
  const fields = Array.from({ length: count }, (_, i) => ({
    key: `field${i}`,
    type,
    label: `Field ${i + 1}`,
    props: { placeholder: `Enter value ${i + 1}` },
    col: 12,
  }));

  fields.push({
    key: 'submit',
    type: 'submit',
    label: 'Submit',
    props: { type: 'submit', color: 'primary' } as any,
    col: 12,
  });

  return { fields } as FormConfig;
}

/**
 * Generate a form with mixed field types.
 */
export function generateMixedFields(count: number): FormConfig {
  const types = ['input', 'select', 'checkbox', 'radio', 'textarea', 'slider'];
  const fields = Array.from({ length: count }, (_, i) => {
    const fieldType = types[i % types.length];
    const base: Record<string, unknown> = {
      key: `field${i}`,
      type: fieldType,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} ${i + 1}`,
      col: 6,
    };

    if (fieldType === 'select' || fieldType === 'radio') {
      base['options'] = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
      ];
    }

    if (fieldType === 'input' || fieldType === 'textarea') {
      base['props'] = { placeholder: `Enter ${fieldType} ${i + 1}` };
    }

    if (fieldType === 'slider') {
      base['props'] = { min: 0, max: 100, step: 1 };
      base['value'] = 50;
    }

    if (fieldType === 'checkbox') {
      base['value'] = false;
    }

    return base;
  });

  fields.push({
    key: 'submit',
    type: 'submit',
    label: 'Submit',
    props: { type: 'submit', color: 'primary' },
    col: 12,
  });

  return { fields } as FormConfig;
}

/**
 * Generate a form with fields that have conditional logic.
 */
export function generateConditionalFields(totalFields: number, conditionalCount: number): FormConfig {
  const fields: Record<string, unknown>[] = [
    {
      key: 'toggleField',
      type: 'checkbox',
      label: 'Toggle Conditional Fields',
      value: true,
      col: 12,
    },
  ];

  for (let i = 0; i < totalFields - 1; i++) {
    const field: Record<string, unknown> = {
      key: `field${i}`,
      type: 'input',
      label: `Field ${i + 1}`,
      props: { placeholder: `Value ${i + 1}` },
      col: 6,
    };

    if (i < conditionalCount) {
      field['logic'] = [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'toggleField',
            operator: 'equals',
            value: false,
          },
        },
      ];
    }

    fields.push(field);
  }

  fields.push({
    key: 'submit',
    type: 'submit',
    label: 'Submit',
    props: { type: 'submit', color: 'primary' },
    col: 12,
  });

  return { fields } as FormConfig;
}

/**
 * Generate an array config with N items, each having M fields.
 */
export function generateArrayConfig(itemCount: number, fieldsPerItem: number): FormConfig {
  const itemTemplate = Array.from({ length: fieldsPerItem }, (_, i) => ({
    key: `itemField${i}`,
    type: 'input',
    label: `Item Field ${i + 1}`,
    col: Math.floor(12 / fieldsPerItem) || 4,
    props: { placeholder: `Value ${i + 1}` },
  }));

  const items = Array.from({ length: itemCount }, () => [...itemTemplate]);

  return {
    fields: [
      {
        key: 'items',
        type: 'array',
        fields: items,
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        props: { type: 'submit', color: 'primary' },
        col: 12,
      },
    ],
  } as FormConfig;
}

/**
 * Generate a multi-page form config.
 */
export function generatePagedConfig(pages: number, fieldsPerPage: number): FormConfig {
  const pageFields = Array.from({ length: pages }, (_, pageIndex) => ({
    key: `page${pageIndex}`,
    type: 'page',
    fields: Array.from({ length: fieldsPerPage }, (_, fieldIndex) => ({
      key: `p${pageIndex}f${fieldIndex}`,
      type: 'input',
      label: `Page ${pageIndex + 1} - Field ${fieldIndex + 1}`,
      props: { placeholder: `Enter value` },
      col: 6,
    })),
  }));

  return {
    fields: [
      ...pageFields,
      {
        key: 'submit',
        type: 'submit',
        label: 'Submit',
        props: { type: 'submit', color: 'primary' },
        col: 12,
      },
    ],
  } as FormConfig;
}
