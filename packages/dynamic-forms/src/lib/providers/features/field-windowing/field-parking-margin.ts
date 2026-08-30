const DEFAULT_MARGIN = '100%';
const ROOT_MARGIN_PART = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?(?:px|%)$/i;

/**
 * IntersectionObserver accepts one to four whitespace-separated pixel or
 * percentage lengths. Invalid public configuration must not make its
 * constructor throw and abort form rendering.
 */
export function normalizeFieldParkingMargin(value: string | undefined, fallback = DEFAULT_MARGIN): string {
  const normalizedFallback = isValidRootMargin(fallback) ? fallback.trim() : DEFAULT_MARGIN;
  if (!value || !isValidRootMargin(value)) return normalizedFallback;
  return value.trim().split(/\s+/).join(' ');
}

function isValidRootMargin(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length >= 1 && parts.length <= 4 && parts.every((part) => ROOT_MARGIN_PART.test(part));
}
