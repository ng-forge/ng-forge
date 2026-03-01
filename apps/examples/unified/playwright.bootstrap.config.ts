import { createUnifiedPlaywrightConfig } from './playwright.unified-config';

export default createUnifiedPlaywrightConfig(import.meta.url, 'bootstrap');
