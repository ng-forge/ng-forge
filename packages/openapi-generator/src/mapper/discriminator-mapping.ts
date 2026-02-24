import type { WalkedSchema } from '../parser/schema-walker.js';
import type { FieldConfig } from './schema-to-fields.js';

export interface DiscriminatorFieldConfig {
  discriminatorField: {
    key: string;
    type: 'radio';
    label: string;
    options: Array<{ label: string; value: string }>;
    validation: Array<{ type: string }>;
  };
  conditionalGroups: Array<{
    discriminatorValue: string;
    fields: FieldConfig[];
  }>;
}

export function mapDiscriminator(discriminator: NonNullable<WalkedSchema['discriminator']>): DiscriminatorFieldConfig {
  const options = Object.keys(discriminator.mapping).map((value) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value,
  }));

  return {
    discriminatorField: {
      key: discriminator.propertyName,
      type: 'radio',
      label: discriminator.propertyName.charAt(0).toUpperCase() + discriminator.propertyName.slice(1),
      options,
      validation: [{ type: 'required' }],
    },
    conditionalGroups: Object.entries(discriminator.mapping).map(([value]) => ({
      discriminatorValue: value,
      fields: [],
    })),
  };
}
