import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Set up iframe height broadcasting before bootstrap
if (window.parent !== window) {
  // Remove min-height to prevent feedback loop, then observe body
  document.body.style.minHeight = '0';

  let lastHeight = 0;
  const sendHeight = () => {
    const height = document.body.scrollHeight;
    // Only send if height changed by more than 2px (prevents micro-loops)
    if (Math.abs(height - lastHeight) > 2) {
      lastHeight = height;
      // Include URL so parent can filter messages by iframe source
      window.parent.postMessage({ type: 'example-iframe-height', height, url: window.location.href }, '*');
    }
  };

  const observer = new ResizeObserver(sendHeight);
  observer.observe(document.body);

  // Also observe mutations for dynamic content changes
  const mutationObserver = new MutationObserver(sendHeight);
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
