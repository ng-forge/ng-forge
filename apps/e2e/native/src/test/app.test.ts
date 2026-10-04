import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { render, screen } from '@ng-native/testing';
import { describe, expect, test, vi } from 'vitest';
import { App } from '../app/app';
import { SCENARIO_LINK_SOURCE, type ScenarioLinkSource } from '../app/deep-link';

const listeners = new Set<(url: string) => void>();
const links: ScenarioLinkSource = {
  initialUrl: async () => null,
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  open: (url) => listeners.forEach((listener) => listener(url)),
  linkTo: (suiteId, testId) => `#/test/${suiteId}/${testId}`,
};

const phone = { conditions: { width: 411, height: 914, colorScheme: 'light' as const } };

describe('app shell', () => {
  test('shows the index, then a scenario when a link arrives', async () => {
    const errors: unknown[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args.map(String).join(' ')));
    const r = await render(App, {
      ...phone,
      providers: [provideDynamicForm(...withNativeFields()), { provide: SCENARIO_LINK_SOURCE, useValue: links }],
    });
    expect(await screen.findByTestId('test-index')).toBeTruthy();

    links.open('#/test/layout/row-columns');
    await r.detectChanges();
    expect(await screen.findByTestId('row-columns')).toBeTruthy();

    links.open('ngforge-e2e://test/group-fields/group-nested');
    await r.detectChanges();
    expect(await screen.findByTestId('group-nested')).toBeTruthy();
    expect(errors.map((e) => String(e).slice(0, 300))).toEqual([]);
  });
});
