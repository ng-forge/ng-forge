/**
 * Creates a proxy around `document` that intercepts DOM mutation methods on `document.head`
 * (appendChild, insertBefore, prepend) and tracks any injected <style> elements via
 * the provided callback.
 *
 * When `shadowRootRef.current` is non-null, style elements are **redirected** to the shadow root
 * instead of being inserted into `document.head`. This prevents third-party libraries (e.g.
 * PrimeNG's `providePrimeNG()`) from leaking component styles into the docs page's `document.head`
 * where they cannot pierce the shadow DOM boundary.
 *
 * Lifecycle in scoped mode:
 * 1. Proxy is created before `createApplication()` — `shadowRootRef.current` is null.
 *    Any styles injected during app creation go to `document.head` and are tracked.
 * 2. After `createComponent()`, the shadow root exists. The caller sets `shadowRootRef.current`
 *    and moves any already-tracked styles from `document.head` into the shadow root.
 * 3. From that point forward, all style injections go directly to the shadow root.
 *
 * @param transformStyle - Pure transform applied to CSS text before insertion into the shadow root.
 *   Called both for content already present on the element at redirect time AND for content set
 *   afterward via a `textContent` setter interceptor installed on the element instance.
 *   This handles PrimeNG's `UseStyle` pattern where `HEAD.appendChild(el)` is called with an
 *   empty element, and `el.textContent = css` is set only after the append returns.
 */
export function createDocumentProxy(
  document: Document,
  onStyleInjected: (el: HTMLStyleElement) => void,
  shadowRootRef?: { current: ShadowRoot | null },
  transformStyle?: (css: string) => string,
): Document {
  const headProxy = new Proxy(document.head, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target);
      if ((prop === 'appendChild' || prop === 'insertBefore' || prop === 'prepend') && typeof value === 'function') {
        return (node: Node, ...args: unknown[]) => {
          if (node instanceof HTMLStyleElement) {
            const redirectTarget = shadowRootRef?.current;
            if (redirectTarget) {
              // Redirect: append to shadow root, never touch document.head.
              // appendChild() is used regardless of the original method since insertion
              // order within the shadow root doesn't need to match document.head order.
              if (transformStyle) {
                // Install a textContent interceptor on this element instance so the transform
                // fires when content is actually set — not just during appendChild.
                // PrimeNG's UseStyle calls HEAD.appendChild(el) with an empty element, then
                // sets el.textContent = css afterward, bypassing a naive transformStyle(el) call.
                const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')!;
                // Transform any content already present (defensive; usually empty at this point).
                if (node.textContent) {
                  originalDescriptor.set!.call(node, transformStyle(node.textContent));
                }
                // Shadow the prototype property on this instance so future sets are intercepted.
                Object.defineProperty(node, 'textContent', {
                  get() {
                    return originalDescriptor.get!.call(node);
                  },
                  set(value: string) {
                    originalDescriptor.set!.call(node, transformStyle(value ?? ''));
                  },
                  configurable: true,
                });
              }
              redirectTarget.appendChild(node);
              onStyleInjected(node);
              return node;
            }
          }
          const result = (value as (...a: unknown[]) => unknown).call(target, node, ...args);
          if (node instanceof HTMLStyleElement) onStyleInjected(node);
          return result;
        };
      }
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return new Proxy(document, {
    get(target, prop) {
      if (prop === 'head') return headProxy;
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
