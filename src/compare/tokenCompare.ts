/**
 * tokenCompare.ts
 * Provides side-by-side comparison of two token files with contextual output.
 * Useful for reviewing token evolution between design system versions.
 */

import { parseTokenFile } from '../parser/tokenParser';
import { diffTokens, DiffResult } from '../diff/tokenDiffer';
import { applyIgnore, loadIgnoreFile } from '../ignore/tokenIgnore';
import { filterTokens } from '../filter/tokenFilter';

export interface CompareOptions {
  /** Only include tokens matching this category prefix (e.g. "color", "spacing") */
  category?: string;
  /** Path to a .tokenignore file */
  ignorePath?: string;
  /** Show unchanged tokens in output */
  showUnchanged?: boolean;
}

export interface CompareEntry {
  key: string;
  baseValue: string | undefined;
  headValue: string | undefined;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
}

export interface CompareResult {
  entries: CompareEntry[];
  totalBase: number;
  totalHead: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

/**
 * Compares two flattened token maps and returns structured comparison entries.
 */
export function compareTokenMaps(
  base: Record<string, string>,
  head: Record<string, string>,
  options: CompareOptions = {}
): CompareResult {
  const diff: DiffResult = diffTokens(base, head);

  const allKeys = new Set([
    ...Object.keys(base),
    ...Object.keys(head),
  ]);

  const entries: CompareEntry[] = [];

  for (const key of Array.from(allKeys).sort()) {
    let status: CompareEntry['status'];

    if (diff.added[key] !== undefined) {
      status = 'added';
    } else if (diff.removed[key] !== undefined) {
      status = 'removed';
    } else if (diff.modified[key] !== undefined) {
      status = 'modified';
    } else {
      status = 'unchanged';
    }

    if (status === 'unchanged' && !options.showUnchanged) {
      continue;
    }

    entries.push({
      key,
      baseValue: base[key],
      headValue: head[key],
      status,
    });
  }

  return {
    entries,
    totalBase: Object.keys(base).length,
    totalHead: Object.keys(head).length,
    added: Object.keys(diff.added).length,
    removed: Object.keys(diff.removed).length,
    modified: Object.keys(diff.modified).length,
    unchanged: allKeys.size - Object.keys(diff.added).length
      - Object.keys(diff.removed).length
      - Object.keys(diff.modified).length,
  };
}

/**
 * Loads two token files from disk and compares them.
 */
export async function compareTokenFiles(
  basePath: string,
  headPath: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  let base = parseTokenFile(basePath);
  let head = parseTokenFile(headPath);

  if (options.ignorePath) {
    const patterns = loadIgnoreFile(options.ignorePath);
    base = applyIgnore(base, patterns);
    head = applyIgnore(head, patterns);
  }

  if (options.category) {
    base = filterTokens(base, { category: options.category });
    head = filterTokens(head, { category: options.category });
  }

  return compareTokenMaps(base, head, options);
}

/**
 * Formats a CompareResult as a human-readable string table.
 */
export function formatCompareResult(result: CompareResult): string {
  const lines: string[] = [];

  lines.push(`Comparing ${result.totalBase} base tokens → ${result.totalHead} head tokens`);
  lines.push(
    `  + ${result.added} added  - ${result.removed} removed  ~ ${result.modified} modified  = ${result.unchanged} unchanged`
  );
  lines.push('');

  const statusSymbol: Record<CompareEntry['status'], string> = {
    added: '+',
    removed: '-',
    modified: '~',
    unchanged: '=',
  };

  for (const entry of result.entries) {
    const sym = statusSymbol[entry.status];
    if (entry.status === 'modified') {
      lines.push(`${sym} ${entry.key}: ${entry.baseValue} → ${entry.headValue}`);
    } else if (entry.status === 'added') {
      lines.push(`${sym} ${entry.key}: ${entry.headValue}`);
    } else if (entry.status === 'removed') {
      lines.push(`${sym} ${entry.key}: ${entry.baseValue}`);
    } else {
      lines.push(`${sym} ${entry.key}: ${entry.baseValue}`);
    }
  }

  return lines.join('\n');
}
