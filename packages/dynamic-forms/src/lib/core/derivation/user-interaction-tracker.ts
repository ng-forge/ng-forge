import { InjectionToken } from '@angular/core';

/**
 * Tracks which fields have been manually modified by the user.
 *
 * Used by the `stopOnUserOverride` derivation feature to skip
 * derivations for fields that the user has explicitly edited.
 *
 * @public
 */
export class UserInteractionTracker {
  private readonly modified = new Set<string>();

  /**
   * Marks a field as having been modified by the user.
   */
  markUserModified(key: string): void {
    this.modified.add(key);
  }

  /**
   * Checks whether a field has been modified by the user.
   */
  isUserModified(key: string): boolean {
    return this.modified.has(key);
  }

  /**
   * Clears the user-modified flag for a specific field.
   *
   * Used by `reEngageOnDependencyChange` to re-enable derivations
   * when a dependency changes.
   */
  clearUserModified(key: string): void {
    this.modified.delete(key);
  }

  /**
   * Resets all tracked modifications.
   *
   * Called when the form reinitializes (config change, form reset).
   */
  reset(): void {
    this.modified.clear();
  }
}

/**
 * Injection token for the UserInteractionTracker.
 *
 * @public
 */
export const USER_INTERACTION_TRACKER = new InjectionToken<UserInteractionTracker>('USER_INTERACTION_TRACKER');
