import { isDevMode } from '@angular/core';
import { CycleDetectionResult, DerivationCollection } from './derivation-types';
import { Logger } from '../../providers/features/logger/logger.interface';

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
 * Bidirectional sync patterns (A→B→A) are allowed because they stabilize
 * via the equality check at runtime.
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

  // Build bidirectional pairs set for cycle exemption
  const bidirectionalPairs = detectBidirectionalPairs(collection);

  // Run DFS to detect cycles
  const result = detectCyclesWithDFS(graph, bidirectionalPairs);

  // Include bidirectional pairs in result for warnings
  if (bidirectionalPairs.size > 0) {
    result.bidirectionalPairs = Array.from(bidirectionalPairs);
  }

  return result;
}

/**
 * Detects bidirectional derivation pairs (A↔B patterns).
 *
 * These patterns are allowed because they stabilize via equality checks.
 * Example: USD/EUR conversion where both fields derive from each other.
 *
 * A bidirectional pair exists when:
 * - Field A derives its value from field B (A depends on B)
 * - Field B derives its value from field A (B depends on A)
 *
 * ## Floating-Point Precision Note
 *
 * Bidirectional derivations stabilize via equality checks using exact IEEE 754
 * comparison with no tolerance. This means:
 *
 * - **Integer math**: Safe (e.g., `A = B * 2`, `B = A / 2` where A is even)
 * - **Floating-point math**: May oscillate due to rounding errors
 *
 * For currency conversions or other floating-point operations, consider:
 * 1. Rounding values in your expression (e.g., `Math.round(value * 100) / 100`)
 * 2. Using integer cents instead of decimal dollars
 * 3. Using one-way derivation instead of bidirectional
 *
 * @example
 * ```typescript
 * // Bidirectional currency conversion
 * { key: 'amountUSD', derivation: 'formValue.amountEUR * 1.1' }
 * { key: 'amountEUR', derivation: 'formValue.amountUSD / 1.1' }
 * ```
 *
 * @internal
 */
function detectBidirectionalPairs(collection: DerivationCollection): Set<string> {
  const pairs = new Set<string>();

  // Build a map of fieldKey -> dependencies (other fields this derivation reads from)
  const dependencyMap = new Map<string, Set<string>>();
  for (const entry of collection.entries) {
    const deps = dependencyMap.get(entry.fieldKey) ?? new Set<string>();
    for (const dep of entry.dependsOn) {
      if (dep !== '*' && dep !== entry.fieldKey) {
        deps.add(dep);
      }
    }
    dependencyMap.set(entry.fieldKey, deps);
  }

  // Find bidirectional pairs: A depends on B AND B depends on A
  for (const [fieldA, depsA] of dependencyMap) {
    for (const fieldB of depsA) {
      const depsB = dependencyMap.get(fieldB);
      if (depsB?.has(fieldA)) {
        // Normalize pair key (alphabetically sorted)
        const pairKey = fieldA < fieldB ? `${fieldA}↔${fieldB}` : `${fieldB}↔${fieldA}`;
        pairs.add(pairKey);
      }
    }
  }

  return pairs;
}

/**
 * Checks if a cycle path represents a bidirectional pair.
 *
 * @internal
 */
function isBidirectionalCycle(cyclePath: string[], bidirectionalPairs: Set<string>): boolean {
  // Bidirectional cycles are exactly: [A, B, A] (length 3 with first=last)
  if (cyclePath.length !== 3) {
    return false;
  }

  const [first, second, third] = cyclePath;
  if (first !== third) {
    return false;
  }

  // Check if this pair is in our bidirectional set
  const pairKey = first < second ? `${first}↔${second}` : `${second}↔${first}`;
  return bidirectionalPairs.has(pairKey);
}

/**
 * Builds a dependency graph from derivation entries.
 *
 * Creates nodes for each field involved in derivations and
 * edges representing the derivation dependencies.
 *
 * Edge direction is based on dependencies:
 * - If field A's derivation depends on field B, then B -> A (changing B triggers A)
 * - A cycle exists if: A -> B -> C -> A (circular dependency chain)
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
    const fieldNode = ensureNode(entry.fieldKey);

    // Track dependencies from the derivation expression/condition.
    // For cycle detection, edges go from dependency -> field:
    // If field A depends on field B, then when B changes, A gets updated.
    // A cycle exists when there's a circular chain of such dependencies.
    for (const dep of entry.dependsOn) {
      // Skip wildcard dependencies and self-references
      if (dep !== '*' && dep !== entry.fieldKey) {
        const depNode = ensureNode(dep);
        // The field depends on 'dep'
        fieldNode.dependsOn.add(dep);
        // 'dep' is depended on by the field
        depNode.dependedOnBy.add(entry.fieldKey);
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
 * A cycle is detected when we visit a node that's InProgress,
 * unless it's a bidirectional sync pattern (allowed).
 *
 * @internal
 */
function detectCyclesWithDFS(graph: Map<string, GraphNode>, bidirectionalPairs: Set<string>): CycleDetectionResult {
  const visitState = new Map<string, VisitState>();
  const parent = new Map<string, string | null>();

  // Initialize all nodes as unvisited
  for (const fieldKey of graph.keys()) {
    visitState.set(fieldKey, VisitState.Unvisited);
  }

  // Process each unvisited node
  for (const fieldKey of graph.keys()) {
    if (visitState.get(fieldKey) === VisitState.Unvisited) {
      const cycleResult = dfsVisit(fieldKey, graph, visitState, parent, [], bidirectionalPairs);
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
  bidirectionalPairs: Set<string>,
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
      // Back edge found - potential cycle
      const cyclePath = extractCyclePath(path, targetFieldKey);

      // Allow bidirectional sync patterns (A→B→A)
      // These stabilize via equality checks at runtime
      if (isBidirectionalCycle(cyclePath, bidirectionalPairs)) {
        // Continue DFS without reporting this as a cycle
        continue;
      }

      return {
        hasCycle: true,
        cyclePath,
        errorMessage: formatCycleError(cyclePath),
      };
    }

    if (targetState === VisitState.Unvisited) {
      parent.set(targetFieldKey, fieldKey);
      const result = dfsVisit(targetFieldKey, graph, visitState, parent, path, bidirectionalPairs);
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
 * In dev mode, logs a warning when bidirectional derivation pairs are detected.
 * These patterns are allowed but may oscillate with floating-point values.
 *
 * @param collection - The collected derivation entries to validate
 * @param logger - Optional logger for dev-mode warnings
 * @throws Error if a cycle is detected, with details about the cycle
 *
 * @example
 * ```typescript
 * const collection = collectDerivations(fields);
 *
 * // This will throw if cycles exist
 * validateNoCycles(collection, logger);
 *
 * // Safe to set up derivation effects now
 * setupDerivationEffects(collection);
 * ```
 *
 * @public
 */
export function validateNoCycles(collection: DerivationCollection, logger?: Logger): void {
  const result = detectCycles(collection);

  if (result.hasCycle) {
    throw new Error(result.errorMessage);
  }

  // Warn about bidirectional patterns in dev mode
  if (isDevMode() && result.bidirectionalPairs && result.bidirectionalPairs.length > 0 && logger) {
    logger.warn(
      '[Derivation] Bidirectional derivation patterns detected. ' +
        'These patterns stabilize via equality checks, but may oscillate with floating-point values ' +
        '(e.g., currency conversions with rounding). ' +
        'Consider adding tolerance-based comparisons for numeric values.',
      result.bidirectionalPairs,
    );
  }
}
