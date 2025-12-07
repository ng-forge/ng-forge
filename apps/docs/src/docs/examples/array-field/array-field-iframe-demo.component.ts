import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'array-field-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="array" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayFieldIframeDemoComponent {
  code = `{
  fields: [
    // Flat array: stores ['tag1', 'tag2']
    { key: 'tags', type: 'array', label: 'Tags',
      fields: [{ key: 'tag', type: 'row',
        fields: [
          { key: 'value', type: 'input', label: 'Tag', value: '', required: true, minLength: 2 },
          { key: 'removeTag', type: 'button', label: 'Remove', event: RemoveArrayItemEvent, eventArgs: ['$arrayKey', '$index'] }
        ]
      }]
    },
    { key: 'addTag', type: 'button', label: 'Add Tag', event: AddTagsEvent },

    // Object array: stores [{name: '', phone: '', relationship: ''}]
    { key: 'contacts', type: 'array', label: 'Emergency Contacts',
      fields: [{ key: 'contact', type: 'group',
        fields: [
          { key: 'name', type: 'input', label: 'Contact Name', required: true },
          { key: 'phone', type: 'input', label: 'Phone Number', required: true, pattern: /^\\d{10}$/ },
          { key: 'relationship', type: 'select', label: 'Relationship',
            options: [{ label: 'Family', value: 'family' }, { label: 'Friend', value: 'friend' }] },
          { key: 'removeContact', type: 'button', label: 'Remove', event: RemoveArrayItemEvent, eventArgs: ['$arrayKey', '$index'] }
        ]
      }]
    },
    { key: 'addContact', type: 'button', label: 'Add Contact', event: AddContactEvent },
  ],
}`;
}
