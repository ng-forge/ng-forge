import { PrimeFormConfig } from '@ng-forge/dynamic-forms-primeng';
import { ExampleScenario } from '../shared/types';

export const defaultPropsScenario: ExampleScenario = {
  id: 'default-props',
  title: 'Default Props Demo',
  description: 'Testing form-level defaultProps cascading to all fields.',
  config: {
    defaultProps: {
      size: 'small',
      variant: 'filled',
      severity: 'success',
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name (should be small + filled)',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email (should be small + filled)',
        props: {
          type: 'email',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description (should be small + filled)',
      },
      {
        key: 'overrideVariant',
        type: 'input',
        label: 'Override (should be outlined)',
        props: {
          variant: 'outlined', // Override form-level default
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit (should be success color)',
      },
    ],
  } satisfies PrimeFormConfig,
};
