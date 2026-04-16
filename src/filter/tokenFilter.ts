export type FilterOptions = {
  prefix?: string;
  category?: string;
  keys?: string[];
};

/**
 * Filter a flat token map by prefix, category, or explicit keys.
 */
export function filterTokens(
  tokens: Record<string, unknown>,
  options: FilterOptions
): Record<string, unknown> {
  const { prefix, category, keys } = options;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (keys && keys.length > 0) {
      if (keys.includes(key)) {
        result[key] = value;
      }
      continue;
    }

    if (prefix && !key.startsWith(prefix)) {
      continue;
    }

    if (category) {
      const parts = key.split('.');
      if (!parts.includes(category)) {
        continue;
      }
    }

    result[key] = value;
  }

  return result;
}

/**
 * Return all unique top-level categories (first segment of dotted key).
 */
export function listCategories(tokens: Record<string, unknown>): string[] {
  const categories = new Set<string>();
  for (const key of Object.keys(tokens)) {
    const first = key.split('.')[0];
    if (first) categories.add(first);
  }
  return Array.from(categories).sort();
}
