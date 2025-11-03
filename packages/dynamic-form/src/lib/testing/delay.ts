/**
 * Creates a promise that resolves after the specified delay.
 *
 * Utility function for testing scenarios where you need to wait for
 * asynchronous operations, animations, or timing-dependent behavior.
 *
 * @param ms - Delay in milliseconds (defaults to 0 for next tick)
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * // Wait for async operations in tests
 * await delay(100);
 * expect(component.isLoaded).toBe(true);
 *
 * // Wait for next tick (micro-task)
 * await delay();
 * fixture.detectChanges();
 * ```
 */
export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
