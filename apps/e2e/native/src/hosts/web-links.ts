import type { ScenarioLinkSource } from '../app/deep-link.ts';

export const webLinks: ScenarioLinkSource = {
  initialUrl: async () => location.href,
  subscribe: (listener) => {
    const onChange = () => listener(location.href);
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  },
  open: (url) => location.assign(url),
  linkTo: (suiteId, testId) => `#/test/${suiteId}/${testId}`,
};
