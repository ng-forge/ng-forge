import { createSandboxPlaywrightConfig } from './playwright.sandbox-config';

export default createSandboxPlaywrightConfig(import.meta.url, 'ionic');
