import { FlatTokenMap } from '../parser/tokenParser';

export interface SearchOptions {
  query: string;
  keys?: boolean;
  values?: boolean;
  caseSensitive?: boolean;
}

export interface SearchResult {
  key: string;
  value: string;
  matchedOn: 'key' | 'value';
}

export function searchTokens(
  tokens: FlatTokenMap,
  options: SearchOptions
): SearchResult[] {
  const { query, keys = true, values = true, caseSensitive = false } = options;

  if (!query) return [];

  const normalize = (s: string) => (caseSensitive ? s : s.toLowerCase());
  const needle = normalize(query);
  const results: SearchResult[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    if (keys && normalize(key).includes(needle)) {
      results.push({ key, value, matchedOn: 'key' });
      continue;
    }
    if (values && normalize(value).includes(needle)) {
      results.push({ key, value, matchedOn: 'value' });
    }
  }

  return results;
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return 'No tokens matched.';

  const lines = results.map(
    (r) => `[${r.matchedOn}] ${r.key}: ${r.value}`
  );
  return lines.join('\n');
}
