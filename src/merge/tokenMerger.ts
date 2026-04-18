import { FlatTokens } from '../parser/tokenParser';

export type MergeStrategy = 'source' | 'target' | 'union';

export interface MergeOptions {
  strategy?: MergeStrategy;
  dryRun?: boolean;
}

export interface MergeResult {
  merged: FlatTokens;
  conflicts: string[];
  added: string[];
  overwritten: string[];
}

/**
 * Merges two flat token maps together.
 * - 'source': source wins on conflict
 * - 'target': target wins on conflict (default)
 * - 'union': all keys included, source wins on conflict
 */
export function mergeTokens(
  source: FlatTokens,
  target: FlatTokens,
  options: MergeOptions = {}
): MergeResult {
  const strategy = options.strategy ?? 'target';
  const merged: FlatTokens = {};
  const conflicts: string[] = [];
  const added: string[] = [];
  const overwritten: string[] = [];

  const allKeys = new Set([...Object.keys(source), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inSource = key in source;
    const inTarget = key in target;

    if (inSource && inTarget) {
      if (source[key] !== target[key]) {
        conflicts.push(key);
        if (strategy === 'source') {
          merged[key] = source[key];
          overwritten.push(key);
        } else {
          merged[key] = target[key];
        }
      } else {
        merged[key] = target[key];
      }
    } else if (inSource) {
      merged[key] = source[key];
      if (strategy === 'union' || strategy === 'source') {
        added.push(key);
      }
    } else {
      merged[key] = target[key];
      added.push(key);
    }
  }

  return { merged, conflicts, added, overwritten };
}

export function formatMergeResult(result: MergeResult): string {
  const lines: string[] = [];
  lines.push(`Merged tokens: ${Object.keys(result.merged).length}`);
  lines.push(`Conflicts: ${result.conflicts.length}`);
  lines.push(`Added: ${result.added.length}`);
  lines.push(`Overwritten: ${result.overwritten.length}`);
  if (result.conflicts.length > 0) {
    lines.push('\nConflicting keys:');
    result.conflicts.forEach(k => lines.push(`  - ${k}`));
  }
  return lines.join('\n');
}
