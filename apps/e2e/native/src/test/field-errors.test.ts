import type { CustomValidator } from '@ng-forge/dynamic-forms';
import { screen, userEvent } from '@ng-native/testing';
import { describe, expect, test } from 'vitest';
import { renderForm } from './render-form';

/** Fails when a row's `to` precedes its `from`. */
const periodOrder: CustomValidator = (ctx) => {
  const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];
  return rows.some((r) => r?.from && r?.to && r.to < r.from) ? { kind: 'periodOrder' } : null;
};

describe('field-errors wrapper', () => {
  test('renders a container-level message as native text', async () => {
    await renderForm({
      customFnConfig: { validators: { periodOrder } },
      fields: [
        {
          key: 'periods',
          type: 'array',
          template: [
            { key: 'from', type: 'input', label: 'From' },
            { key: 'to', type: 'input', label: 'To' },
          ],
          value: [{ from: '', to: '' }],
          validators: [{ type: 'custom', functionName: 'periodOrder' }],
          validationMessages: { periodOrder: 'The end must not be before the start.' },
        },
        { key: 'submit', type: 'submit', label: 'Submit' },
      ],
    } as never);
    const user = userEvent.setup();
    await user.type(await screen.findByTestId('from_0-input'), '2026');
    await user.type(screen.getByTestId('to_0-input'), '2025');
    await user.press(screen.getByTestId('submit-button'));
    const message = await screen.findByText('The end must not be before the start.');
    expect(message.props.accessibilityRole).toBe('alert');
  });
});
