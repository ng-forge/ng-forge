import { fireEvent, screen, userEvent, waitFor } from '@ng-native/testing';
import { describe, expect, test } from 'vitest';
import { plain, renderForm } from './render-form';

describe('selection fields', () => {
  test('checkbox toggles, announces its state and marks the field touched', async () => {
    const r = await renderForm({
      defaultValidationMessages: { required: 'Please accept' },
      fields: [{ key: 'terms', type: 'checkbox', label: 'Accept terms', required: true, value: false }],
    });
    const box = await screen.findByTestId('terms-checkbox');
    expect(box.props.accessibilityRole).toBe('checkbox');
    expect(box.props.accessibilityState).toMatchObject({ checked: false });

    await userEvent.setup().press(box);
    await waitFor(() => expect(plain(r.instance.value())).toEqual({ terms: true }));
    expect(screen.getByTestId('terms-checkbox').props.accessibilityState).toMatchObject({ checked: true });

    await userEvent.setup().press(screen.getByTestId('terms-checkbox'));
    await waitFor(() => expect(screen.getByText('Please accept')).toBeTruthy());
  });

  test('radio selects one option', async () => {
    const r = await renderForm({
      fields: [
        {
          key: 'plan',
          type: 'radio',
          label: 'Plan',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'team', label: 'Team', disabled: true },
          ],
        },
      ],
    });
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('plan-free'));
    await user.press(screen.getByTestId('plan-pro'));
    await waitFor(() => expect(plain(r.instance.value())).toEqual({ plan: 'pro' }));
    expect(screen.getByTestId('plan-pro').props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByTestId('plan-free').props.accessibilityState).toMatchObject({ checked: false });

    fireEvent.press(screen.getByTestId('plan-team'));
    await r.detectChanges();
    expect(plain(r.instance.value())).toEqual({ plan: 'pro' });
  });

  test('multi-checkbox adds and removes values', async () => {
    const r = await renderForm({
      fields: [
        {
          key: 'tags',
          type: 'multi-checkbox',
          label: 'Tags',
          value: [],
          options: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ],
        },
      ],
    });
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('tags-a'));
    await user.press(screen.getByTestId('tags-b'));
    await waitFor(() => expect(plain(r.instance.value())).toEqual({ tags: ['a', 'b'] }));
    await user.press(screen.getByTestId('tags-a'));
    await waitFor(() => expect(plain(r.instance.value())).toEqual({ tags: ['b'] }));
  });
});
