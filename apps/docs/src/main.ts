import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

injectVercelAnalytics();
injectSpeedInsights();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
