import { AppRegistry, Image, Platform, processColor } from 'react-native';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withNativeFields } from '@ng-forge/dynamic-forms-native';
import { mount } from '@ng-native/platform';
import { currentConditions, deviceTokens, watchConditions } from '@ng-native/device';
import { getFabricUIManager, registerPlatformComponents } from '@ng-native/fabric';
import { App } from './app/app.ts';
import { SCENARIO_LINK_SOURCE } from './app/deep-link.ts';
import { nativeLinks } from './hosts/native-links.ts';

registerPlatformComponents(Platform.OS);

AppRegistry.registerRunnable('main', ({ rootTag }: { rootTag: number | string }) => {
  const app = mount(Number(rootTag), App, getFabricUIManager(), {
    processColor,
    conditions: currentConditions(),
    tokens: deviceTokens(),
    resolveAssetSource: (value) => Image.resolveAssetSource(value as never),
    providers: [provideDynamicForm(...withNativeFields()), { provide: SCENARIO_LINK_SOURCE, useValue: nativeLinks }],
  });
  watchConditions(app.engine);
});
