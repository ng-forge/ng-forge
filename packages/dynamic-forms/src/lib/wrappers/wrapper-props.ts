/** Zero-cost type carrier used in wrapper registrations. */
export function wrapperProps<T>(): T {
  return undefined as unknown as T;
}
