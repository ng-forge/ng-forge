/**
 * Custom Array Events for Array Fields Tests
 * These events may be needed later for programmatic array manipulation
 */
import { AppendArrayItemEvent, PopArrayItemEvent } from '@ng-forge/dynamic-forms';

export class AddEmailsEvent extends AppendArrayItemEvent {
  constructor() {
    super('emails', [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
        },
      },
    ]);
  }
}

export class AddMembersEvent extends AppendArrayItemEvent {
  constructor() {
    super('members', [
      {
        key: 'member',
        type: 'group',
        fields: [
          {
            key: 'name',
            type: 'input',
            label: 'Name',
            required: true,
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            email: true,
          },
        ],
      },
    ]);
  }
}

export class AddTagsEvent extends AppendArrayItemEvent {
  constructor() {
    super('tags', [
      {
        key: 'tag',
        type: 'input',
        label: 'Tag',
      },
    ]);
  }
}

export class AddItemsEvent extends AppendArrayItemEvent {
  constructor() {
    super('items', [
      {
        key: 'item',
        type: 'input',
        label: 'Item',
      },
    ]);
  }
}

export class AddNotesEvent extends AppendArrayItemEvent {
  constructor() {
    super('notes', [
      {
        key: 'note',
        type: 'input',
        label: 'Note',
      },
    ]);
  }
}

export class RemoveNotesEvent extends PopArrayItemEvent {
  constructor() {
    super('notes');
  }
}

export class AddUsersEvent extends AppendArrayItemEvent {
  constructor() {
    super('users', [
      {
        key: 'user',
        type: 'group',
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            col: 6,
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            col: 6,
          },
          {
            key: 'role',
            type: 'select',
            label: 'Role',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
            ],
          },
        ],
      },
    ]);
  }
}

export class RemovePhonesEvent extends PopArrayItemEvent {
  constructor() {
    super('phones');
  }
}
