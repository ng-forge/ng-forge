import { linkedSignal, Resource, ResourceSnapshot, resourceFromSnapshots } from '@angular/core';

/**
 * Wraps a `Resource` so that the previous resolved value is preserved while the resource
 * is loading or reloading. This prevents UI flicker when params change and a new request
 * is in-flight — the consumer sees the stale value with a `loading`/`reloading` status
 * instead of `undefined`.
 *
 * Uses Angular's `resource.snapshot` + `resourceFromSnapshots` composition pattern.
 *
 * @example
 * ```typescript
 * const user = withPreviousValue(
 *   resource({ params: () => userId(), loader: ({ params }) => fetchUser(params) })
 * );
 * // user.value() keeps the old user data during loading transitions
 * ```
 *
 * @experimental Uses Angular's experimental resource composition APIs.
 */
export function withPreviousValue<T>(input: Resource<T>): Resource<T> {
  const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
    source: input.snapshot,
    computation: (snapshot, previous) => {
      // During loading/reloading, keep the previous resolved value if available.
      // Don't preserve values from error states — those aren't useful to show.
      if (
        (snapshot.status === 'loading' || snapshot.status === 'reloading') &&
        previous !== undefined &&
        previous.value.status !== 'error'
      ) {
        return { status: snapshot.status, value: previous.value.value } as ResourceSnapshot<T>;
      }
      return snapshot;
    },
  });

  return resourceFromSnapshots(derived);
}
