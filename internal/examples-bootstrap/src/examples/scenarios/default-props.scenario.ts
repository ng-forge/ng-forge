import { BsFormConfig } from '@ng-forge/dynamic-forms-bootstrap';
import { ExampleScenario } from '../shared/types';

export const defaultPropsScenario: ExampleScenario = {
  id: 'default-props',
  title: 'Default Props Demo',
  description: 'Testing form-level defaultProps cascading to all fields.',
  config: {
    defaultProps: {
      size: 'lg',
      floatingLabel: true,
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name (should be lg + floating)',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email (should be lg + floating)',
        props: {
          type: 'email',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description (should be lg + floating)',
      },
      {
        key: 'overrideSize',
        type: 'input',
        label: 'Override (should be sm)',
        props: {
          size: 'sm', // Override form-level default
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
      },
    ],
  } satisfies BsFormConfig,
};
