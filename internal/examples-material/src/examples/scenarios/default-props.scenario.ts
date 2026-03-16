import { MatFormConfig } from '@ng-forge/dynamic-forms-material';
import { ExampleScenario } from '../shared/types';

export const defaultPropsScenario: ExampleScenario = {
  id: 'default-props',
  title: 'Default Props Demo',
  description: 'Testing form-level defaultProps cascading to all fields.',
  config: {
    defaultProps: {
      appearance: 'fill',
      color: 'accent',
      subscriptSizing: 'dynamic',
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name (should be fill + accent)',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email (should be fill + accent)',
        props: {
          type: 'email',
        },
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description (should be fill)',
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe (should be accent color)',
      },
      {
        key: 'overrideAppearance',
        type: 'input',
        label: 'Override (should be outline)',
        props: {
          appearance: 'outline', // Override form-level default
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit',
      },
    ],
  } satisfies MatFormConfig,
};
