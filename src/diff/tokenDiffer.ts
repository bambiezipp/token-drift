import { FlatTokenMap } from '../parser/tokenParser';

export type ChangeType = 'added' | 'removed' | 'modified';

export interface TokenChange {
  key: string;
  type: ChangeType;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface DiffResult {
  added: TokenChange[];
  removed: TokenChange[];
  modified: TokenChange[];
  unchanged: string[];
}

export function diffTokens(
  oldTokens: FlatTokenMap,
  newTokens: FlatTokenMap
): DiffResult {
  const result: DiffResult = { added: [], removed: [], modified: [], unchanged: [] };

  const allKeys = new Set([...Object.keys(oldTokens), ...Object.keys(newTokens)]);

  for (const key of allKeys) {
    const inOld = key in oldTokens;
    const inNew = key in newTokens;

    if (inOld && !inNew) {
      result.removed.push({ key, type: 'removed', oldValue: oldTokens[key] });
    } else if (!inOld && inNew) {
      result.added.push({ key, type: 'added', newValue: newTokens[key] });
    } else if (JSON.stringify(oldTokens[key]) !== JSON.stringify(newTokens[key])) {
      result.modified.push({
        key,
        type: 'modified',
        oldValue: oldTokens[key],
        newValue: newTokens[key],
      });
    } else {
      result.unchanged.push(key);
    }
  }

  return result;
}

export function hasDrift(diff: DiffResult): boolean {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;
}
