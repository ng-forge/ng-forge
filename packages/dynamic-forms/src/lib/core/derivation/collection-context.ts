import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Tokens recognised by the dependency resolver. Exported so the few callers
 * that build `dependsOn` arrays programmatically (e.g. tests) don't have to
 * inline the string literal.
 */
export const SELF_DEPENDENCY_TOKEN = '$self';

/**
 * Token resolving to the absolute path of the field's nearest parent
 * container (group or array).
 */
export const GROUP_DEPENDENCY_TOKEN = '$group';

/**
 * Context threaded through {@link traverseFieldsWithContext} during derivation
 * collection. Tracks array + group ancestry so absolute field paths and
 * `$self` / `$group` tokens can be resolved without re-walking the tree.
 *
 * @internal
 */
export interface CollectionContext {
  /** Path to the enclosing array (e.g. `'items'` or `'orders.0.lineItems'`). */
  arrayPath?: string;
  /**
   * Dot-joined ancestor group keys scoped to the current array item (or
   * top-level when not inside an array). Reset at array boundaries — the
   * array placeholder path takes over, and group ancestors OUTSIDE an
   * array don't contribute to descendants' entry keys.
   */
  groupPath?: string;
}

/**
 * Builds the absolute field path for an entry whose enclosing context is
 * tracked by {@link CollectionContext}.
 *
 * @internal
 */
export function buildEffectiveFieldKey(fieldKey: string, context: CollectionContext): string {
  if (context.arrayPath && context.groupPath) {
    return `${context.arrayPath}.$.${context.groupPath}.${fieldKey}`;
  }
  if (context.arrayPath) {
    return `${context.arrayPath}.$.${fieldKey}`;
  }
  if (context.groupPath) {
    return `${context.groupPath}.${fieldKey}`;
  }
  return fieldKey;
}

/**
 * Resolves the absolute path of the field's nearest parent container
 * (group or array). Returns `undefined` when the field is at the form root
 * with no parent container.
 *
 * @internal
 */
export function buildNearestGroupPath(context: CollectionContext): string | undefined {
  if (context.arrayPath && context.groupPath) {
    return `${context.arrayPath}.$.${context.groupPath}`;
  }
  return context.arrayPath ?? context.groupPath;
}

/**
 * Substitutes `$self` / `$self.X` / `$group` / `$group.X` tokens in a
 * `dependsOn` array with their resolved absolute paths. Non-token strings
 * pass through unchanged.
 *
 * @internal
 */
export function resolveTokenDependencies(deps: string[], effectiveFieldKey: string, context: CollectionContext): string[] {
  return deps.map((dep) => {
    if (dep === SELF_DEPENDENCY_TOKEN) {
      return effectiveFieldKey;
    }
    if (dep.startsWith(`${SELF_DEPENDENCY_TOKEN}.`)) {
      return effectiveFieldKey + dep.slice(SELF_DEPENDENCY_TOKEN.length);
    }
    if (dep === GROUP_DEPENDENCY_TOKEN || dep.startsWith(`${GROUP_DEPENDENCY_TOKEN}.`)) {
      const groupPath = buildNearestGroupPath(context);
      if (!groupPath) {
        throw new DynamicFormError(
          `Derivation for '${effectiveFieldKey}' uses '${dep}' but the field has no parent group or array. ` +
            `'${GROUP_DEPENDENCY_TOKEN}' is only valid for fields nested inside a group or array container.`,
        );
      }
      if (dep === GROUP_DEPENDENCY_TOKEN) return groupPath;
      return groupPath + dep.slice(GROUP_DEPENDENCY_TOKEN.length);
    }
    return dep;
  });
}

/**
 * Standard `traverseFieldsWithContext` step handlers for derivation
 * collection.
 *
 * @internal
 */
export const CONTEXT_TRAVERSAL_OPTIONS = {
  onArrayChild: (_parent: CollectionContext, field: { key: string }) => ({ arrayPath: field.key, groupPath: undefined }),
  onGroupChild: (parent: CollectionContext, field: { key?: string }) => {
    if (!field.key) return {};
    return { groupPath: parent.groupPath ? `${parent.groupPath}.${field.key}` : field.key };
  },
};
