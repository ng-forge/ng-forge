import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { appConfig } from './app.config';
import { ssrContentInterceptor } from './interceptors/ssr-content.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideHttpClient(withInterceptors([ssrContentInterceptor]))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
