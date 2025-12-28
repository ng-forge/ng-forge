import { CycleDetectionResult, DerivationCollection } from './derivation-types';

/**
 * Node in the derivation dependency graph.
 *
 * @internal
 */
interface GraphNode {
  /** Field key this node represents */
  fieldKey: string;

  /** Set of field keys this node depends on (edges to other nodes) */
  dependsOn: Set<string>;

  /** Set of field keys that depend on this node (reverse edges) */
  dependedOnBy: Set<string>;
}

/**
 * State for topological sort cycle detection.
 *
 * @internal
 */
const enum VisitState {
  /** Node has not been visited */
  Unvisited = 0,
  /** Node is currently being processed (in the stack) */
  InProgress = 1,
  /** Node has been fully processed */
  Completed = 2,
}

/**
 * Detects cycles in the derivation dependency graph.
 *
 * Uses Kahn's algorithm variant with DFS to detect cycles.
 * Cycles in derivation logic would cause infinite loops at runtime.
 *
 * @param collection - The collected derivation entries
 * @returns Result indicating whether a cycle exists and details if found
 *
 * @example
 * ```typescript
 * const collection = collectDerivations(fields);
 * const result = detectCycles(collection);
 *
 * if (result.hasCycle) {
 *   console.error(`Cycle detected: ${result.cyclePath?.join(' -> ')}`);
 *   throw new Error(result.errorMessage);
 * }
 * ```
 *
 * @public
 */
export function detectCycles(collection: DerivationCollection): CycleDetectionResult {
  // Build directed graph from derivation entries
  const graph = buildDependencyGraph(collection);

  // No entries means no cycles
  if (graph.size === 0) {
    return { hasCycle: false };
  }

  // Run DFS to detect cycles
  return detectCyclesWithDFS(graph);
}

/**
 * Builds a dependency graph from derivation entries.
 *
 * Creates nodes for each field involved in derivations and
 * edges representing the derivation dependencies.
 *
 * Edge direction: sourceField -> targetField
 * (source triggers derivation that modifies target)
 *
 * @internal
 */
function buildDependencyGraph(collection: DerivationCollection): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Helper to ensure a node exists
  const ensureNode = (fieldKey: string): GraphNode => {
    let node = graph.get(fieldKey);
    if (!node) {
      node = {
        fieldKey,
        dependsOn: new Set(),
        dependedOnBy: new Set(),
      };
      graph.set(fieldKey, node);
    }
    return node;
  };

  for (const entry of collection.entries) {
    const sourceNode = ensureNode(entry.sourceFieldKey);
    const targetNode = ensureNode(entry.targetFieldKey);

    // For cycle detection, we care about the data flow:
    // When sourceField changes -> targetField gets updated
    // So the edge is: sourceField -> targetField
    //
    // A cycle exists if: A -> B -> A
    // (A triggers B, B triggers A)

    // The target depends on the source for its value
    targetNode.dependsOn.add(entry.sourceFieldKey);
    sourceNode.dependedOnBy.add(entry.targetFieldKey);

    // Also track dependencies from the derivation expression/condition
    for (const dep of entry.dependsOn) {
      if (dep !== '*' && dep !== entry.targetFieldKey) {
        const depNode = ensureNode(dep);
        targetNode.dependsOn.add(dep);
        depNode.dependedOnBy.add(entry.targetFieldKey);
      }
    }
  }

  return graph;
}

/**
 * Detects cycles using depth-first search.
 *
 * Uses three-color marking:
 * - Unvisited (white): Not yet processed
 * - InProgress (gray): Currently in the DFS stack
 * - Completed (black): Fully processed
 *
 * A cycle is detected when we visit a node that's InProgress.
 *
 * @internal
 */
function detectCyclesWithDFS(graph: Map<string, GraphNode>): CycleDetectionResult {
  const visitState = new Map<string, VisitState>();
  const parent = new Map<string, string | null>();

  // Initialize all nodes as unvisited
  for (const fieldKey of graph.keys()) {
    visitState.set(fieldKey, VisitState.Unvisited);
  }

  // Process each unvisited node
  for (const fieldKey of graph.keys()) {
    if (visitState.get(fieldKey) === VisitState.Unvisited) {
      const cycleResult = dfsVisit(fieldKey, graph, visitState, parent, []);
      if (cycleResult) {
        return cycleResult;
      }
    }
  }

  return { hasCycle: false };
}

/**
 * DFS visit function that detects back edges (cycles).
 *
 * @internal
 */
function dfsVisit(
  fieldKey: string,
  graph: Map<string, GraphNode>,
  visitState: Map<string, VisitState>,
  parent: Map<string, string | null>,
  path: string[],
): CycleDetectionResult | null {
  visitState.set(fieldKey, VisitState.InProgress);
  path.push(fieldKey);

  const node = graph.get(fieldKey);
  if (!node) {
    visitState.set(fieldKey, VisitState.Completed);
    path.pop();
    return null;
  }

  // Check all nodes that this field's changes would trigger
  for (const targetFieldKey of node.dependedOnBy) {
    const targetState = visitState.get(targetFieldKey);

    if (targetState === VisitState.InProgress) {
      // Back edge found - this is a cycle!
      const cyclePath = extractCyclePath(path, targetFieldKey);
      return {
        hasCycle: true,
        cyclePath,
        errorMessage: formatCycleError(cyclePath),
      };
    }

    if (targetState === VisitState.Unvisited) {
      parent.set(targetFieldKey, fieldKey);
      const result = dfsVisit(targetFieldKey, graph, visitState, parent, path);
      if (result) {
        return result;
      }
    }
  }

  visitState.set(fieldKey, VisitState.Completed);
  path.pop();
  return null;
}

/**
 * Extracts the cycle path from the DFS path.
 *
 * @internal
 */
function extractCyclePath(path: string[], cycleStart: string): string[] {
  const cycleStartIndex = path.indexOf(cycleStart);
  if (cycleStartIndex === -1) {
    // Shouldn't happen, but handle gracefully
    return [...path, cycleStart];
  }

  // Extract from cycle start to current position, then back to start
  const cyclePath = path.slice(cycleStartIndex);
  cyclePath.push(cycleStart); // Close the cycle
  return cyclePath;
}

/**
 * Formats a human-readable error message for a detected cycle.
 *
 * @internal
 */
function formatCycleError(cyclePath: string[]): string {
  const pathStr = cyclePath.join(' -> ');
  return (
    `Derivation cycle detected: ${pathStr}\n` +
    `This would cause an infinite loop at runtime. ` +
    `Remove one of the derivations to break the cycle.`
  );
}

/**
 * Validates a derivation collection and throws if cycles are detected.
 *
 * This is the main entry point for cycle validation during form initialization.
 * Should be called after collecting derivations and before setting up effects.
 *
 * @param collection - The collected derivation entries to validate
 * @throws Error if a cycle is detected, with details about the cycle
 *
 * @example
 * ```typescript
 * const collection = collectDerivations(fields);
 *
 * // This will throw if cycles exist
 * validateNoCycles(collection);
 *
 * // Safe to set up derivation effects now
 * setupDerivationEffects(collection);
 * ```
 *
 * @public
 */
export function validateNoCycles(collection: DerivationCollection): void {
  const result = detectCycles(collection);

  if (result.hasCycle) {
    throw new Error(result.errorMessage);
  }
}
