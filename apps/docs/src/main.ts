import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { appConfig } from './app/app.config';
import { App } from './app/app';

injectVercelAnalytics();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
