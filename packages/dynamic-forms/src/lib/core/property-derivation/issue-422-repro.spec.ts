/**
 * End-to-end regression test for issue #422.
 *
 * Reproduces the exact field config from the bug report:
 *   https://github.com/ng-forge/ng-forge/issues/422
 *
 * Before this PR:
 *  - The property-derivation collector dropped `source`/`http`/`responseExpression`,
 *    so no HTTP request was ever sent.
 *  - The expression parser didn't accept arrow functions or object literals,
 *    so `responseExpression: 'response.map(d => ({...}))'` would have thrown
 *    even if the stream had fired.
 *
 * This spec runs the reporter's config through the pieces it actually touches
 * — collector → property-derivation entry → HTTP stream → override store —
 * and verifies every step.
 */

import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldDef } from '../../definitions/base/field-def';
import { createMockLogger } from '../../../../testing/src/mock-logger';
import { createWarningTracker } from '../../utils/warning-tracker';
import { collectPropertyDerivations } from './property-derivation-collector';
import { createHttpPropertyDerivationStream, HttpPropertyDerivationStreamContext } from './http-property-derivation-stream';
import { createPropertyOverrideStore } from './property-override-store';

describe('issue #422 — HTTP property derivation for select.options', () => {
  // Verbatim from the bug report (https://github.com/ng-forge/ng-forge/issues/422).
  const streetDropdownField = {
    key: 'streetDropdown',
    type: 'select',
    value: '',
    options: [],
    label: 'Street Dropdown',
    logic: [
      {
        type: 'derivation',
        targetProperty: 'options',
        source: 'http',
        http: {
          url: '/api/address/streets/search',
        },
        responseExpression: 'response.map(d => ({ value: d.id, label: d.streetNameShort }))',
        dependsOn: ['street'],
      },
    ],
  } as unknown as FieldDef<unknown>;

  it('collects the field as a property-derivation entry with all HTTP fields preserved', () => {
    const logger = createMockLogger();
    const tracker = createWarningTracker();

    const collection = collectPropertyDerivations([streetDropdownField], logger, tracker);

    expect(collection.entries).toHaveLength(1);
    const entry = collection.entries[0];

    expect(entry.fieldKey).toBe('streetDropdown');
    expect(entry.targetProperty).toBe('options');
    expect(entry.http).toEqual({ url: '/api/address/streets/search' });
    expect(entry.responseExpression).toBe('response.map(d => ({ value: d.id, label: d.streetNameShort }))');
    expect(entry.dependsOn).toEqual(['street']);
  });

  it('fires the HTTP request when `street` changes and writes the mapped response to the override store', () => {
    vi.useFakeTimers();
    try {
      const logger = createMockLogger();
      const tracker = createWarningTracker();
      const store = createPropertyOverrideStore();

      const collection = collectPropertyDerivations([streetDropdownField], logger, tracker);
      const entry = collection.entries[0];

      // Realistic server response — the kind of payload the reporter's
      // backend would return.
      const httpClient = {
        request: vi.fn().mockReturnValue(
          of([
            { id: 's-1', streetNameShort: 'Mainstr.' },
            { id: 's-2', streetNameShort: 'Eichenallee' },
          ]),
        ),
      };

      const formValueSignal = signal<Record<string, unknown>>({ street: '', streetDropdown: '' });
      const formValue$ = new Subject<Record<string, unknown>>();

      const context: HttpPropertyDerivationStreamContext = {
        formValue: formValueSignal,
        store,
        httpClient: httpClient as unknown as HttpPropertyDerivationStreamContext['httpClient'],
        logger,
      };

      const stream$ = createHttpPropertyDerivationStream(entry, formValue$, context);
      stream$.subscribe();

      // Initial form value — pairwise(null, current) treats every field as
      // changed on the first emission, so this triggers the initial request.
      formValue$.next({ street: '', streetDropdown: '' });

      // User types into `street`.
      formValueSignal.set({ street: 'Mai', streetDropdown: '' });
      formValue$.next({ street: 'Mai', streetDropdown: '' });

      // Advance past the default 300ms debounce.
      vi.advanceTimersByTime(300);

      // Confirm the request hit the URL from the config.
      expect(httpClient.request).toHaveBeenCalledTimes(1);
      const [method, url] = httpClient.request.mock.calls[0];
      expect(method).toBe('GET');
      expect(url).toBe('/api/address/streets/search');

      // Confirm the mapped options landed on the field's override store.
      // The response was mapped via the arrow function + object literal in
      // `responseExpression` — both features added by this PR.
      expect(store.getOverrides('streetDropdown')()).toEqual({
        options: [
          { value: 's-1', label: 'Mainstr.' },
          { value: 's-2', label: 'Eichenallee' },
        ],
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not fire requests when fields other than `street` change', () => {
    vi.useFakeTimers();
    try {
      const logger = createMockLogger();
      const tracker = createWarningTracker();
      const store = createPropertyOverrideStore();

      const collection = collectPropertyDerivations([streetDropdownField], logger, tracker);
      const entry = collection.entries[0];

      const httpClient = { request: vi.fn().mockReturnValue(of([])) };
      const formValueSignal = signal<Record<string, unknown>>({ street: 'Main', other: 'a' });
      const formValue$ = new Subject<Record<string, unknown>>();

      const stream$ = createHttpPropertyDerivationStream(entry, formValue$, {
        formValue: formValueSignal,
        store,
        httpClient: httpClient as unknown as HttpPropertyDerivationStreamContext['httpClient'],
        logger,
      });
      stream$.subscribe();

      // First emission — initial load, fires once.
      formValue$.next({ street: 'Main', other: 'a' });
      vi.advanceTimersByTime(300);
      expect(httpClient.request).toHaveBeenCalledTimes(1);

      // `other` changes; `street` does not — must not fire.
      formValue$.next({ street: 'Main', other: 'b' });
      vi.advanceTimersByTime(300);
      expect(httpClient.request).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
