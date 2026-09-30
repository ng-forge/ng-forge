import { fireEvent, render, screen, userEvent, waitFor } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { host } from './test-host';

test('edits, validates and submits a form rendered as native views', async () => {
  const r = await render(
    ...host({
      defaultValidationMessages: { required: 'Required', email: 'Enter a valid email' },
      fields: [
        { key: 'email', type: 'input', label: 'Email', required: true, email: true, props: { keyboardType: 'email-address' } },
        { key: 'newsletter', type: 'toggle', label: 'Newsletter', value: false },
        { key: 'submit', type: 'submit', label: 'Sign up' },
      ],
    }),
  );
  const user = userEvent.setup();
  const input = await screen.findByTestId('email-input');
  await screen.findByText('Sign up');

  await user.type(input, 'not-an-email');
  fireEvent(input, 'blur');
  expect((await screen.findByRole('alert')).props.testID).toBe('email-error');
  expect(screen.getByText('Enter a valid email')).toBeTruthy();

  await user.clear(input);
  await user.type(input, 'a@b.co');
  fireEvent(screen.getByTestId('newsletter-switch'), 'change', { nativeEvent: { value: true } });
  await r.detectChanges();
  expect(r.instance.value()).toEqual({ email: 'a@b.co', newsletter: true });

  await user.press(screen.getByTestId('submit'));
  await waitFor(() => expect(r.instance.submissions).toEqual([{ email: 'a@b.co', newsletter: true }]));
});
