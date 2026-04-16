import * as fs from 'fs';
import * as path from 'path';
import { parseTokenFile } from '../parser/tokenParser';
import { diffTokens, hasDrift } from '../diff/tokenDiffer';
import { formatDiff } from '../diff/formatDiff';
import { TokenMap } from '../diff/tokenDiffer';

export interface WatchOptions {
  baselineFile: string;
  targetFile: string;
  interval?: number;
  onDrift?: (output: string) => void;
  onError?: (err: Error) => void;
}

export interface WatchHandle {
  stop: () => void;
}

export function watchTokenFile(
  options: WatchOptions
): WatchHandle {
  const { baselineFile, targetFile, interval = 1000, onDrift, onError } = options;

  let lastSnapshot: TokenMap | null = null;

  function check() {
    try {
      const baseline = parseTokenFile(baselineFile);
      const current = parseTokenFile(targetFile);

      const diff = diffTokens(baseline, current);

      if (hasDrift(diff)) {
        const snapshot = JSON.stringify(current);
        if (snapshot !== JSON.stringify(lastSnapshot)) {
          lastSnapshot = current;
          const output = formatDiff(diff);
          if (onDrift) onDrift(output);
        }
      } else {
        lastSnapshot = current;
      }
    } catch (err) {
      if (onError) onError(err as Error);
    }
  }

  const timer = setInterval(check, interval);
  check();

  return {
    stop: () => clearInterval(timer),
  };
}
