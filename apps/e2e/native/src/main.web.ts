import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { mount } from '@ng-native/web';
import { App } from './app/app.ts';
import { SCENARIO_LINK_SOURCE } from './app/deep-link.ts';
import { webLinks } from './hosts/web-links.ts';

mount(document.getElementById('root')!, App, {
  providers: [provideDynamicForm(...withNativeFields()), { provide: SCENARIO_LINK_SOURCE, useValue: webLinks }],
});
