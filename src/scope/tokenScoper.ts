/**
 * tokenScoper.ts
 * Scope tokens by prefix or namespace, and extract scoped subsets.
 */

export interface ScopeResult {
  scope: string;
  tokens: Record<string, string>;
  count: number;
}

/**
 * Extract tokens that belong to a given scope prefix (e.g. "color", "spacing").
 */
export function extractScope(
  tokens: Record<string, string>,
  scope: string
): Record<string, string> {
  const prefix = scope.endsWith(".") ? scope : `${scope}.`;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}

/**
 * List all unique top-level scopes present in a flat token map.
 */
export function listScopes(tokens: Record<string, string>): string[] {
  const scopes = new Set<string>();
  for (const key of Object.keys(tokens)) {
    const dot = key.indexOf(".");
    if (dot !== -1) {
      scopes.add(key.slice(0, dot));
    }
  }
  return Array.from(scopes).sort();
}

/**
 * Group all tokens by their top-level scope.
 */
export function groupByScope(
  tokens: Record<string, string>
): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const dot = key.indexOf(".");
    const scope = dot !== -1 ? key.slice(0, dot) : "__root__";
    const subKey = dot !== -1 ? key.slice(dot + 1) : key;
    if (!groups[scope]) groups[scope] = {};
    groups[scope][subKey] = value;
  }
  return groups;
}

/**
 * Build a ScopeResult summary for a given scope.
 */
export function buildScopeResult(
  tokens: Record<string, string>,
  scope: string
): ScopeResult {
  const scoped = extractScope(tokens, scope);
  return { scope, tokens: scoped, count: Object.keys(scoped).length };
}

/**
 * Format a scope summary for CLI output.
 */
export function formatScopeResult(result: ScopeResult): string {
  const lines: string[] = [`Scope: ${result.scope} (${result.count} tokens)`];
  for (const [key, value] of Object.entries(result.tokens)) {
    lines.push(`  ${key}: ${value}`);
  }
  return lines.join("\n");
}
