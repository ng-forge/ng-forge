import { fireEvent, render, screen, userEvent, waitFor } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { host } from './test-host';

test('text field renders through the adapter override', async () => {
  await render(...host({ fields: [{ key: 'title', type: 'text', label: 'Hello there', props: { elementType: 'h2' } }] }));
  expect((await screen.findByText('Hello there')).props.accessibilityRole).toBe('header');
});

test('group nests the value', async () => {
  const r = await render(
    ...host({ fields: [{ key: 'address', type: 'group', fields: [{ key: 'street', type: 'input', label: 'Street' }] }] }),
  );
  await userEvent.setup().type(await screen.findByTestId('address_street-input'), 'Main St');
  await r.detectChanges();
  expect(r.instance.value()).toEqual({ address: { street: 'Main St' } });
});

test('row renders its children (layout is not applied, see README)', async () => {
  await render(
    ...host({
      fields: [
        {
          key: 'r1',
          type: 'row',
          fields: [
            { key: 'first', type: 'input', label: 'First', col: 6 },
            { key: 'last', type: 'input', label: 'Last', col: 6 },
          ],
        },
      ],
    }),
  );
  expect(await screen.findByTestId('first-input')).toBeTruthy();
  expect(await screen.findByTestId('last-input')).toBeTruthy();
});

test('conditional hidden shows and hides top-level and nested fields', async () => {
  const hiddenUnlessNewsletter = [
    { type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'newsletter', operator: 'equals', value: false } },
  ];
  const r = await render(
    ...host({
      fields: [
        { key: 'newsletter', type: 'toggle', label: 'Newsletter', value: false },
        { key: 'email', type: 'input', label: 'Email', logic: hiddenUnlessNewsletter },
        { key: 'grp', type: 'group', fields: [{ key: 'note', type: 'input', label: 'Note', logic: hiddenUnlessNewsletter }] },
      ],
    }),
  );
  const toggle = await screen.findByTestId('newsletter-switch');
  expect(screen.queryByTestId('email-input')).toBeNull();
  expect(screen.queryByTestId('grp_note-input')).toBeNull();

  fireEvent(toggle, 'change', { nativeEvent: { value: true } });
  await r.detectChanges();
  await waitFor(() => expect(screen.queryByTestId('email-input')).not.toBeNull());
  await waitFor(() => expect(screen.queryByTestId('grp_note-input')).not.toBeNull());

  fireEvent(toggle, 'change', { nativeEvent: { value: false } });
  await r.detectChanges();
  await waitFor(() => expect(screen.queryByTestId('email-input')).toBeNull());
});

test('array add button appends items', async () => {
  const r = await render(
    ...host({
      fields: [
        { key: 'tags', type: 'array', fields: [] },
        {
          key: 'addTag',
          type: 'add-array-item',
          label: 'Add tag',
          arrayKey: 'tags',
          template: [{ key: 'name', type: 'input', label: 'Tag' }],
        },
      ],
    }),
  );
  const user = userEvent.setup();
  await user.press(await screen.findByTestId('addTag'));
  await user.press(screen.getByTestId('addTag'));
  await waitFor(() => expect(screen.queryAllByText('Tag').length).toBe(2));
  // Signal Forms tags array items with symbol keys; compare the plain value.
  expect(JSON.parse(JSON.stringify(r.instance.value()))).toEqual({ tags: [{ name: '' }, { name: '' }] });
});
