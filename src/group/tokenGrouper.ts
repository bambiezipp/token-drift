import { FlatTokenMap } from '../parser/tokenParser';

export interface GroupedTokens {
  [group: string]: FlatTokenMap;
}

export interface GroupSummary {
  group: string;
  count: number;
  keys: string[];
}

/**
 * Groups flat tokens by their top-level namespace (first segment of the key).
 * e.g. "color.primary.500" => group "color"
 */
export function groupByNamespace(tokens: FlatTokenMap): GroupedTokens {
  const groups: GroupedTokens = {};

  for (const [key, value] of Object.entries(tokens)) {
    const parts = key.split('.');
    const group = parts[0] ?? 'root';

    if (!groups[group]) {
      groups[group] = {};
    }
    groups[group][key] = value;
  }

  return groups;
}

/**
 * Groups flat tokens by a custom depth level.
 * depth=1 => top-level key segment, depth=2 => first two segments joined, etc.
 */
export function groupByDepth(tokens: FlatTokenMap, depth: number): GroupedTokens {
  if (depth < 1) throw new Error('depth must be >= 1');

  const groups: GroupedTokens = {};

  for (const [key, value] of Object.entries(tokens)) {
    const parts = key.split('.');
    const group = parts.slice(0, depth).join('.') || 'root';

    if (!groups[group]) {
      groups[group] = {};
    }
    groups[group][key] = value;
  }

  return groups;
}

/**
 * Returns a summary array of groups sorted by count descending.
 */
export function summarizeGroups(grouped: GroupedTokens): GroupSummary[] {
  return Object.entries(grouped)
    .map(([group, tokens]) => ({
      group,
      count: Object.keys(tokens).length,
      keys: Object.keys(tokens),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Formats grouped token summaries as a human-readable string.
 */
export function formatGroupSummary(summaries: GroupSummary[]): string {
  if (summaries.length === 0) return 'No token groups found.';

  const lines: string[] = ['Token Groups:', ''];
  for (const { group, count } of summaries) {
    lines.push(`  ${group.padEnd(30)} ${count} token${count !== 1 ? 's' : ''}`);
  }
  lines.push('');
  lines.push(`Total groups: ${summaries.length}`);
  return lines.join('\n');
}
