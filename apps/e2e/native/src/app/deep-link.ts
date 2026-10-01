import { DestroyRef, inject, signal, Signal } from '@angular/core';
import { Linking } from 'react-native';

/** Route of a `ngforge-e2e://test/<suite>/<scenario>` link, or null on the index. */
export interface ScenarioRoute {
  suiteId: string;
  testId: string;
}

export function parseScenarioLink(url: string | null): ScenarioRoute | null {
  const match = url?.match(/^ngforge-e2e:\/\/test\/([^/?#]+)\/([^/?#]+)/);
  return match ? { suiteId: match[1], testId: match[2] } : null;
}

/**
 * The scenario the app was opened with, updated when a new link arrives while it runs. This is
 * how Maestro navigates (`openLink`), the way the web suites navigate by hash route.
 */
export function injectScenarioRoute(): Signal<ScenarioRoute | null> {
  const route = signal<ScenarioRoute | null>(null);
  void Linking.getInitialURL().then((url) => route.set(parseScenarioLink(url)));
  const subscription = Linking.addEventListener('url', ({ url }) => route.set(parseScenarioLink(url)));
  inject(DestroyRef).onDestroy(() => subscription.remove());
  return route.asReadonly();
}
