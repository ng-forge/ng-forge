import { FormConfig } from '@ng-forge/dynamic-forms';

type DynamicField = Record<string, unknown>;

function submitButton(): DynamicField {
  return {
    key: 'submit',
    type: 'submit',
    label: 'Submit',
    props: { type: 'submit', color: 'primary' },
    col: 12,
  };
}

/**
 * Generate a flat form with N input fields.
 */
export function generateFlatFields(count: number, type = 'input'): FormConfig {
  const fields: DynamicField[] = Array.from({ length: count }, (_, i) => ({
    key: `field${i}`,
    type,
    label: `Field ${i + 1}`,
    props: { placeholder: `Enter value ${i + 1}` },
    col: 12,
  }));

  fields.push(submitButton());

  return { fields } as FormConfig;
}

/**
 * Generate a form with mixed field types.
 */
export function generateMixedFields(count: number): FormConfig {
  const types = ['input', 'select', 'checkbox', 'radio', 'textarea', 'slider'];
  const fields: DynamicField[] = Array.from({ length: count }, (_, i) => {
    const fieldType = types[i % types.length];
    const base: DynamicField = {
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

  fields.push(submitButton());

  return { fields } as FormConfig;
}

/**
 * Generate a form with fields that have conditional logic.
 */
export function generateConditionalFields(totalFields: number, conditionalCount: number): FormConfig {
  const fields: DynamicField[] = [
    {
      key: 'toggleField',
      type: 'checkbox',
      label: 'Toggle Conditional Fields',
      value: true,
      col: 12,
    },
  ];

  for (let i = 0; i < totalFields - 1; i++) {
    const field: DynamicField = {
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

  fields.push(submitButton());

  return { fields } as FormConfig;
}

/**
 * Generate an array config with N items, each having M fields.
 */
export function generateArrayConfig(itemCount: number, fieldsPerItem: number): FormConfig {
  const itemTemplate: DynamicField[] = Array.from({ length: fieldsPerItem }, (_, i) => ({
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
      submitButton(),
    ],
  } as FormConfig;
}

/**
 * Generate a multi-page form config.
 */
export function generatePagedConfig(pages: number, fieldsPerPage: number): FormConfig {
  const pageFields: DynamicField[] = Array.from({ length: pages }, (_, pageIndex) => {
    const fields: DynamicField[] = Array.from({ length: fieldsPerPage }, (_, fieldIndex) => ({
      key: `p${pageIndex}f${fieldIndex}`,
      type: 'input',
      label: `Page ${pageIndex + 1} - Field ${fieldIndex + 1}`,
      props: { placeholder: `Enter value` },
      col: 6,
    }));

    if (pageIndex === pages - 1) {
      fields.push(submitButton());
    }

    return {
      key: `page${pageIndex}`,
      type: 'page',
      fields,
    };
  });

  return { fields: pageFields } as FormConfig;
}
