export interface DocumentProxyResult {
  proxy: Document;
  /**
   * Removes all instance-level `textContent` property interceptors installed by this proxy,
   * restoring the prototype chain for each intercepted style element.
   * Call this when the sub-application is destroyed.
   */
  cleanup: () => void;
}

/**
 * Creates a proxy around `document` that intercepts DOM mutation methods on `document.head`
 * (appendChild, insertBefore, prepend, replaceChild) and tracks any injected <style> elements
 * via the provided callback.
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
 *   Each interceptor is tracked and removed via the returned `cleanup()` function.
 */
export function createDocumentProxy(
  document: Document,
  onStyleInjected: (el: HTMLStyleElement) => void,
  shadowRootRef?: { current: ShadowRoot | null },
  transformStyle?: (css: string) => string,
): DocumentProxyResult {
  // Tracks nodes with an instance-level textContent interceptor so cleanup() can remove them.
  const interceptedNodes = new Set<HTMLStyleElement>();

  const cleanup = (): void => {
    for (const node of interceptedNodes) {
      // Deleting the own property restores the Node.prototype.textContent descriptor.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (node as unknown as Record<string, unknown>)['textContent'];
    }
    interceptedNodes.clear();
  };

  /**
   * Intercepts a single node being inserted into document.head.
   * Non-style nodes are passed through unchanged via `fallback`.
   */
  const interceptNode = (node: Node, fallback: () => Node): Node => {
    if (!(node instanceof HTMLStyleElement)) return fallback();

    const redirectTarget = shadowRootRef?.current;
    if (redirectTarget) {
      // Redirect to shadow root — never touch document.head.
      if (transformStyle) {
        // Install a textContent interceptor so the transform fires when content is set,
        // not just during appendChild. PrimeNG's UseStyle calls HEAD.appendChild(el) with
        // an empty element and sets el.textContent = css afterward.
        const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')!;
        if (node.textContent) {
          originalDescriptor.set!.call(node, transformStyle(node.textContent));
        }
        Object.defineProperty(node, 'textContent', {
          get() {
            return originalDescriptor.get!.call(node);
          },
          set(value: string) {
            originalDescriptor.set!.call(node, transformStyle(value ?? ''));
          },
          configurable: true,
        });
        interceptedNodes.add(node);
      }
      redirectTarget.appendChild(node);
      onStyleInjected(node);
      return node;
    }

    const result = fallback();
    onStyleInjected(node);
    return result;
  };

  const headProxy = new Proxy(document.head, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target);
      if (typeof value !== 'function') return value;

      if (prop === 'appendChild' || prop === 'prepend') {
        return (node: Node) => interceptNode(node, () => (value as (n: Node) => Node).call(target, node));
      }
      if (prop === 'insertBefore') {
        return (node: Node, ref: Node | null) =>
          interceptNode(node, () => (value as (n: Node, r: Node | null) => Node).call(target, node, ref));
      }
      if (prop === 'replaceChild') {
        // replaceChild(newNode, oldNode) — intercept the incoming new node.
        return (newNode: Node, oldNode: Node) =>
          interceptNode(newNode, () => (value as (n: Node, o: Node) => Node).call(target, newNode, oldNode));
      }

      return value.bind(target);
    },
  });

  const proxy = new Proxy(document, {
    get(target, prop) {
      if (prop === 'head') return headProxy;
      const value = Reflect.get(target, prop, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return { proxy, cleanup };
}
