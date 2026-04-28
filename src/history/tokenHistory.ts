import * as fs from 'fs';
import * as path from 'path';
import { FlatTokenMap } from '../parser/tokenParser';
import { diffTokens, TokenDiff } from '../diff/tokenDiffer';

export interface HistoryEntry {
  timestamp: string;
  label: string;
  tokens: FlatTokenMap;
}

export interface HistoryDiffEntry {
  from: string;
  to: string;
  diff: TokenDiff;
}

export function loadHistory(historyFile: string): HistoryEntry[] {
  if (!fs.existsSync(historyFile)) return [];
  const raw = fs.readFileSync(historyFile, 'utf-8');
  return JSON.parse(raw) as HistoryEntry[];
}

export function saveHistory(historyFile: string, entries: HistoryEntry[]): void {
  const dir = path.dirname(historyFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(historyFile, JSON.stringify(entries, null, 2), 'utf-8');
}

export function addHistoryEntry(
  entries: HistoryEntry[],
  tokens: FlatTokenMap,
  label: string
): HistoryEntry[] {
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    label,
    tokens,
  };
  return [...entries, entry];
}

export function getHistoryDiff(
  entries: HistoryEntry[],
  fromLabel: string,
  toLabel: string
): HistoryDiffEntry | null {
  const from = entries.find((e) => e.label === fromLabel);
  const to = entries.find((e) => e.label === toLabel);
  if (!from || !to) return null;
  return {
    from: from.label,
    to: to.label,
    diff: diffTokens(from.tokens, to.tokens),
  };
}

export function pruneHistory(entries: HistoryEntry[], maxEntries: number): HistoryEntry[] {
  if (entries.length <= maxEntries) return entries;
  return entries.slice(entries.length - maxEntries);
}
