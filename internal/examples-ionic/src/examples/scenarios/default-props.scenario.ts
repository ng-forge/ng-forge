import { IonicFormConfig } from '@ng-forge/dynamic-forms-ionic';
import { ExampleScenario } from '../shared/types';

export const defaultPropsScenario: ExampleScenario = {
  id: 'default-props',
  title: 'Default Props Demo',
  description: 'Testing form-level defaultProps cascading to all fields.',
  config: {
    defaultProps: {
      fill: 'outline',
      labelPlacement: 'floating',
      color: 'tertiary',
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name (should be outline + floating)',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email (should be outline + floating)',
        props: {
          type: 'email',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description (should be outline + floating)',
      },
      {
        key: 'overrideFill',
        type: 'input',
        label: 'Override (should be solid)',
        props: {
          fill: 'solid', // Override form-level default
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit (should be tertiary color)',
      },
    ],
  } satisfies IonicFormConfig,
};
