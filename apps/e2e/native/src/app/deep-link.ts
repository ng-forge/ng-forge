import { DestroyRef, inject, InjectionToken, signal, Signal } from '@angular/core';

/** Route of a `test/<suite>/<scenario>` link, or null on the index. */
export interface ScenarioRoute {
  suiteId: string;
  testId: string;
}

/**
 * Where links come from, per host: React Native's `Linking` on a device (`ngforge-e2e://test/...`),
 * the URL hash in a browser (`#/test/...`). This is how Maestro and Playwright navigate.
 */
export interface ScenarioLinkSource {
  initialUrl(): Promise<string | null>;
  /** Returns an unsubscribe. */
  subscribe(listener: (url: string) => void): () => void;
  open(url: string): void;
  /** The url that opens a scenario on this host. */
  linkTo(suiteId: string, testId: string): string;
}

export const SCENARIO_LINK_SOURCE = new InjectionToken<ScenarioLinkSource>('SCENARIO_LINK_SOURCE');

export function parseScenarioLink(url: string | null): ScenarioRoute | null {
  const match = url?.match(/(?:^ngforge-e2e:\/\/|#\/)test\/([^/?#]+)\/([^/?#]+)/);
  return match ? { suiteId: match[1], testId: match[2] } : null;
}

/** The scenario the app was opened with, updated when a new link arrives while it runs. */
export function injectScenarioRoute(): Signal<ScenarioRoute | null> {
  const source = inject(SCENARIO_LINK_SOURCE);
  const route = signal<ScenarioRoute | null>(null);
  void source.initialUrl().then((url) => route.set(parseScenarioLink(url)));
  const unsubscribe = source.subscribe((url) => route.set(parseScenarioLink(url)));
  inject(DestroyRef).onDestroy(unsubscribe);
  return route.asReadonly();
}
