import type { WalkedSchema } from '../parser/schema-walker.js';
import type { FieldConfig } from './schema-to-fields.js';
import { toLabel, toEnumLabel } from '../utils/naming.js';

export interface DiscriminatorFieldConfig {
  discriminatorField: {
    key: string;
    type: 'radio';
    label: string;
    options: Array<{ label: string; value: string }>;
    validators: Array<{ type: string }>;
  };
  conditionalGroups: Array<{
    discriminatorValue: string;
    fields: FieldConfig[];
  }>;
}

export function mapDiscriminator(discriminator: NonNullable<WalkedSchema['discriminator']>): DiscriminatorFieldConfig {
  const options = Object.keys(discriminator.mapping).map((value) => ({
    label: toEnumLabel(value),
    value,
  }));

  return {
    discriminatorField: {
      key: discriminator.propertyName,
      type: 'radio',
      label: toLabel(discriminator.propertyName),
      options,
      validators: [{ type: 'required' }],
    },
    conditionalGroups: Object.entries(discriminator.mapping).map(([value]) => ({
      discriminatorValue: value,
      fields: [],
    })),
  };
}
