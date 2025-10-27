/**
 * Test utility for creating delays in tests
 * Internal utility for dynamic-form-material testing - not exported from the package
 */
export function delay(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}