import { fireEvent, screen, userEvent, waitFor } from '@ng-native/testing';
import { describe, expect, test } from 'vitest';
import { plain, renderForm } from './render-form';

describe('form behavior on ng-native', () => {
  test('edits, validates on blur and submits', async () => {
    const r = await renderForm({
      defaultValidationMessages: { required: 'Required', email: 'Enter a valid email' },
      fields: [
        { key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { type: 'email' } },
        { key: 'newsletter', type: 'toggle', label: 'Newsletter', value: false },
        { key: 'submit', type: 'submit', label: 'Sign up' },
      ],
    });
    const user = userEvent.setup();
    const input = await screen.findByTestId('email-input');
    expect(input.props.keyboardType).toBe('email-address');

    await user.type(input, 'not-an-email');
    fireEvent(input, 'blur');
    expect((await screen.findByRole('alert')).props.testID).toBe('email-error');

    await user.clear(input);
    await user.type(input, 'a@b.co');
    fireEvent(screen.getByTestId('newsletter-toggle'), 'change', { nativeEvent: { value: true } });
    await r.detectChanges();
    expect(plain(r.instance.value())).toEqual({ email: 'a@b.co', newsletter: true });

    await user.press(await screen.findByTestId('submit-button'));
    await waitFor(() => expect(plain(r.instance.submissions)).toEqual([{ email: 'a@b.co', newsletter: true }]));
  });

  test('text renders through the native override', async () => {
    await renderForm({ fields: [{ key: 'title', type: 'text', label: 'Hello there', props: { elementType: 'h2' } }] });
    expect((await screen.findByTestId('title')).props.accessibilityRole).toBe('header');
  });

  test('conditional hidden shows and hides fields, nested ones too', async () => {
    const hidden = [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'on', operator: 'equals', value: false } }];
    const r = await renderForm({
      fields: [
        { key: 'on', type: 'toggle', label: 'On', value: false },
        { key: 'email', type: 'input', label: 'Email', logic: hidden },
        { key: 'grp', type: 'group', fields: [{ key: 'note', type: 'input', label: 'Note', logic: hidden }] },
      ],
    } as never);
    const toggle = await screen.findByTestId('on-toggle');
    expect(screen.queryByTestId('email-input')).toBeNull();

    fireEvent(toggle, 'change', { nativeEvent: { value: true } });
    await r.detectChanges();
    await waitFor(() => expect(screen.queryByTestId('grp_note-input')).not.toBeNull());

    fireEvent(toggle, 'change', { nativeEvent: { value: false } });
    await r.detectChanges();
    await waitFor(() => expect(screen.queryByTestId('email-input')).toBeNull());
  });

  test('array add button appends items', async () => {
    const r = await renderForm({
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
    } as never);
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('addTag-button'));
    await user.press(screen.getByTestId('addTag-button'));
    await waitFor(() => expect(plain(r.instance.value())).toEqual({ tags: [{ name: '' }, { name: '' }] }));
  });
});
