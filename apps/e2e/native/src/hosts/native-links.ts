import { Linking } from 'react-native';
import type { ScenarioLinkSource } from '../app/deep-link.ts';

export const nativeLinks: ScenarioLinkSource = {
  initialUrl: () => Linking.getInitialURL(),
  subscribe: (listener) => {
    const subscription = Linking.addEventListener('url', ({ url }) => listener(url));
    return () => subscription.remove();
  },
  open: (url) => void Linking.openURL(url),
  linkTo: (suiteId, testId) => `ngforge-e2e://test/${suiteId}/${testId}`,
};
