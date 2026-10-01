import { signal } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { render, screen } from '@ng-native/testing';
import { describe, expect, test, vi } from 'vitest';
import type { ScenarioRoute } from '../app/deep-link';

const route = signal<ScenarioRoute | null>(null);
// The real helper reads React Native's Linking, which Node does not have.
vi.mock('../app/deep-link', () => ({ injectScenarioRoute: () => route.asReadonly() }));
vi.mock('react-native', () => ({ Linking: { openURL: vi.fn() } }));

const phone = { conditions: { width: 411, height: 914, colorScheme: 'light' as const } };

describe('app shell', () => {
  test('shows the index, then a scenario when a link arrives', async () => {
    const errors: unknown[] = [];
    vi.spyOn(console, 'error').mockImplementation((...args) => void errors.push(args.map(String).join(' ')));
    const { App } = await import('../app/app');
    const r = await render(App, { ...phone, providers: [provideDynamicForm(...withNativeFields())] });
    expect(await screen.findByTestId('test-index')).toBeTruthy();

    route.set({ suiteId: 'layout', testId: 'row-columns' });
    await r.detectChanges();
    expect(await screen.findByTestId('row-columns')).toBeTruthy();

    route.set({ suiteId: 'group-fields', testId: 'group-nested' });
    await r.detectChanges();
    expect(await screen.findByTestId('group-nested')).toBeTruthy();
    expect(errors.map((e) => String(e).slice(0, 300))).toEqual([]);
  });
});
