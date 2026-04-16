import { loadSnapshot, Snapshot } from './snapshotManager';
import { diffTokens, TokenDiff } from '../diff/tokenDiffer';

export interface SnapshotDiffResult {
  from: string;
  to: string;
  fromTimestamp: string;
  toTimestamp: string;
  diff: TokenDiff;
}

export function diffSnapshots(
  fromVersion: string,
  toVersion: string,
  snapshotDir: string
): SnapshotDiffResult {
  const fromSnap: Snapshot = loadSnapshot(fromVersion, snapshotDir);
  const toSnap: Snapshot = loadSnapshot(toVersion, snapshotDir);
  const diff = diffTokens(fromSnap.tokens, toSnap.tokens);
  return {
    from: fromVersion,
    to: toVersion,
    fromTimestamp: fromSnap.timestamp,
    toTimestamp: toSnap.timestamp,
    diff,
  };
}
