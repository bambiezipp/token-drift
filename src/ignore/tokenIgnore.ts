import * as fs from 'fs';
import * as path from 'path';
import { TokenDiff } from '../diff';

export interface IgnoreConfig {
  patterns: string[];
}

export function loadIgnoreFile(filePath: string): IgnoreConfig {
  if (!fs.existsSync(filePath)) {
    return { patterns: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const patterns = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));
  return { patterns };
}

export function matchesPattern(key: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    return key.startsWith(pattern.slice(0, -1));
  }
  if (pattern.startsWith('*')) {
    return key.endsWith(pattern.slice(1));
  }
  return key === pattern;
}

export function shouldIgnore(key: string, config: IgnoreConfig): boolean {
  return config.patterns.some(p => matchesPattern(key, p));
}

export function applyIgnore(diff: TokenDiff, config: IgnoreConfig): TokenDiff {
  if (config.patterns.length === 0) return diff;
  return {
    added: Object.fromEntries(
      Object.entries(diff.added).filter(([k]) => !shouldIgnore(k, config))
    ),
    removed: Object.fromEntries(
      Object.entries(diff.removed).filter(([k]) => !shouldIgnore(k, config))
    ),
    modified: Object.fromEntries(
      Object.entries(diff.modified).filter(([k]) => !shouldIgnore(k, config))
    ),
  };
}
