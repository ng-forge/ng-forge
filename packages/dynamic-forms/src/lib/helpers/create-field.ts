import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { AvailableFieldTypes, ExtractField } from '@ng-forge/dynamic-forms/internal';

/** Container field types that do NOT support labels */
const CONTAINER_TYPES = ['group', 'row', 'array', 'container'] as const;

/** Container and page field types that only support 'hidden' logic */
const HIDDEN_ONLY_LOGIC_TYPES = ['group', 'row', 'array', 'container', 'page'] as const;

/** Field types that support options at the field level */
const OPTION_FIELD_TYPES = ['select', 'radio', 'multi-checkbox'] as const;

/** Field type that uses minValue/maxValue instead of min/max in props */
const SLIDER_TYPE = 'slider' as const;

/** Hidden field type - no logic, no validators, no label */
const HIDDEN_TYPE = 'hidden' as const;

/**
 * Creates a typed field configuration with helpful error messages for common mistakes.
 *
 * @param type - The field type (e.g., 'input', 'select', 'group')
 * @param config - The field configuration (excluding the 'type' property)
 * @returns A properly typed field configuration
 * @throws DynamicFormError if the configuration contains common mistakes
 */
export function createField<T extends AvailableFieldTypes>(type: T, config: Omit<ExtractField<T>, 'type'>): ExtractField<T> {
  const configWithProps = config as Record<string, unknown>;

  // Validate key is present
  if (!configWithProps['key']) {
    throw new DynamicFormError(`createField('${type}'): 'key' property is required`);
  }

  // Container validation: no label allowed
  if (CONTAINER_TYPES.includes(type as (typeof CONTAINER_TYPES)[number])) {
    if ('label' in configWithProps && configWithProps['label'] !== undefined) {
      throw new DynamicFormError(
        `createField('${type}'): Container fields (${CONTAINER_TYPES.join(', ')}) do NOT support 'label'. ` +
          `Labels go on the child fields inside the container.`,
      );
    }
  }

  // Container + page validation: only hidden logic allowed
  if (HIDDEN_ONLY_LOGIC_TYPES.includes(type as (typeof HIDDEN_ONLY_LOGIC_TYPES)[number])) {
    if ('logic' in configWithProps && configWithProps['logic'] !== undefined) {
      const logic = configWithProps['logic'] as Array<{ type: string }>;
      if (Array.isArray(logic)) {
        const nonHiddenLogic = logic.filter((l) => l.type !== 'hidden');
        if (nonHiddenLogic.length > 0) {
          throw new DynamicFormError(
            `createField('${type}'): Only 'hidden' logic type is supported. ` +
              `Found unsupported logic types: ${nonHiddenLogic.map((l) => l.type).join(', ')}. ` +
              `For other logic types, apply them to child fields instead.`,
          );
        }
      }
    }
  }

  // Options placement validation
  if (OPTION_FIELD_TYPES.includes(type as (typeof OPTION_FIELD_TYPES)[number])) {
    const props = configWithProps['props'] as Record<string, unknown> | undefined;
    if (props && 'options' in props) {
      throw new DynamicFormError(
        `createField('${type}'): 'options' must be at FIELD level, NOT inside 'props'. ` +
          `Move 'options' from props to the field root: { type: '${type}', key: '...', options: [...] }`,
      );
    }
  }

  // Slider props validation
  if ((type as string) === SLIDER_TYPE) {
    const props = configWithProps['props'] as Record<string, unknown> | undefined;
    if (props) {
      if ('min' in props || 'max' in props) {
        throw new DynamicFormError(
          `createField('slider'): Use 'minValue' and 'maxValue' at FIELD level, NOT 'min'/'max' in props. ` +
            `Example: { type: 'slider', key: '...', minValue: 0, maxValue: 100, step: 1 }`,
        );
      }
      if ('step' in props) {
        throw new DynamicFormError(
          `createField('slider'): Use 'step' at FIELD level, NOT in props. ` +
            `Example: { type: 'slider', key: '...', minValue: 0, maxValue: 100, step: 1 }`,
        );
      }
    }
  }

  // Hidden field validation
  if ((type as string) === HIDDEN_TYPE) {
    if ('logic' in configWithProps && configWithProps['logic'] !== undefined) {
      throw new DynamicFormError(
        `createField('hidden'): Hidden fields do NOT support 'logic'. ` + `Hidden fields are purely for passing values through the form.`,
      );
    }
    if ('validators' in configWithProps && configWithProps['validators'] !== undefined) {
      throw new DynamicFormError(
        `createField('hidden'): Hidden fields do NOT support 'validators'. ` +
          `Hidden fields are purely for passing values through the form.`,
      );
    }
    if ('required' in configWithProps && configWithProps['required']) {
      throw new DynamicFormError(
        `createField('hidden'): Hidden fields do NOT support 'required' validation. ` +
          `Hidden fields are purely for passing values through the form.`,
      );
    }
    if ('label' in configWithProps && configWithProps['label'] !== undefined) {
      throw new DynamicFormError(
        `createField('hidden'): Hidden fields do NOT support 'label'. ` +
          `Hidden fields are not rendered and have no visual representation.`,
      );
    }
  }

  // Array field validation
  if ((type as string) === 'array') {
    if ('template' in configWithProps) {
      throw new DynamicFormError(
        `createField('array'): Use 'fields' (NOT 'template') to define the array item structure. ` +
          `Example: { type: 'array', key: '...', fields: [{ type: 'group', key: 'item', fields: [...] }] }`,
      );
    }
  }

  // Generic button validation
  if ((type as string) === 'button') {
    if (!('event' in configWithProps) || configWithProps['event'] === undefined) {
      throw new DynamicFormError(
        `createField('button'): Generic buttons REQUIRE the 'event' property with a FormEventConstructor. ` +
          `For common actions, use 'submit', 'next', or 'previous' instead which don't require event configuration. ` +
          `Example: { type: 'submit', key: 'submit', label: 'Submit' }`,
      );
    }
  }

  return { type, ...config } as ExtractField<T>;
}

/** Shorthand alias for createField */
export const field = createField;
