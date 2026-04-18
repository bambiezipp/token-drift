/**
 * Resolves token aliases (references) to their concrete values.
 * Aliases follow the format: {category.token.name}
 */

export type FlatTokenMap = Record<string, string>;

const ALIAS_PATTERN = /^\{([^}]+)\}$/;

export function isAlias(value: string): boolean {
  return ALIAS_PATTERN.test(value.trim());
}

export function resolveAlias(
  value: string,
  tokens: FlatTokenMap,
  visited: Set<string> = new Set()
): string {
  const trimmed = value.trim();
  const match = trimmed.match(ALIAS_PATTERN);
  if (!match) return trimmed;

  const ref = match[1];
  if (visited.has(ref)) {
    throw new Error(`Circular alias reference detected: ${ref}`);
  }

  const resolved = tokens[ref];
  if (resolved === undefined) {
    throw new Error(`Unresolved alias: {${ref}}`);
  }

  visited.add(ref);
  return resolveAlias(resolved, tokens, visited);
}

export function resolveAllAliases(tokens: FlatTokenMap): FlatTokenMap {
  const result: FlatTokenMap = {};
  for (const [key, value] of Object.entries(tokens)) {
    try {
      result[key] = resolveAlias(value, tokens);
    } catch (err) {
      result[key] = value; // keep original on error
    }
  }
  return result;
}

export function findUnresolvedAliases(tokens: FlatTokenMap): string[] {
  const unresolved: string[] = [];
  for (const [key, value] of Object.entries(tokens)) {
    if (isAlias(value)) {
      const ref = value.trim().slice(1, -1);
      if (!(ref in tokens)) {
        unresolved.push(key);
      }
    }
  }
  return unresolved;
}
