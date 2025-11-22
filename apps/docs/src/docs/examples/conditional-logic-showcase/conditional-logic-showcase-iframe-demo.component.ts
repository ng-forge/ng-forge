import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'conditional-logic-showcase-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="conditional-logic-showcase" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionalLogicShowcaseIframeDemoComponent {
  code = `{
  fields: [
    { key: 'accountType', type: 'radio', label: 'Account Type',
      options: [
        { value: 'personal', label: 'Personal' },
        { value: 'business', label: 'Business' }
      ]
    },
    // Show business name only if account type is 'business'
    { key: 'businessName', type: 'input', label: 'Business Name',
      logic: [
        { type: 'hidden',
          condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'notEquals', value: 'business' }
        },
        { type: 'required',
          condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'business' },
        }
      ]
    },
    { key: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
    // Show notification preferences only if newsletter is checked
    { key: 'frequency', type: 'select', label: 'Email Frequency',
      options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }],
      logic: [
        { type: 'hidden',
          condition: { type: 'fieldValue', fieldPath: 'newsletter', operator: 'notEquals', value: true }
        }
      ]
    },
  ],
}`;
}
