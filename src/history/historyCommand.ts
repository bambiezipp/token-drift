import * as path from 'path';
import { parseTokenFile, flattenTokens } from '../parser/tokenParser';
import {
  loadHistory,
  saveHistory,
  addHistoryEntry,
  getHistoryDiff,
  pruneHistory,
} from './tokenHistory';
import { formatDiff } from '../diff/formatDiff';
import { diffSummary } from '../diff/tokenDiffer';

const DEFAULT_HISTORY_FILE = '.token-drift/history.json';
const DEFAULT_MAX_ENTRIES = 50;

export interface HistoryCommandOptions {
  tokenFile: string;
  label?: string;
  historyFile?: string;
  compare?: [string, string];
  list?: boolean;
  prune?: number;
}

export function runHistoryCommand(options: HistoryCommandOptions): void {
  const historyFile = options.historyFile ?? DEFAULT_HISTORY_FILE;
  let entries = loadHistory(historyFile);

  if (options.list) {
    if (entries.length === 0) {
      console.log('No history entries found.');
      return;
    }
    entries.forEach((e, i) => {
      console.log(`  [${i + 1}] ${e.label}  (${e.timestamp})`);
    });
    return;
  }

  if (options.compare) {
    const [fromLabel, toLabel] = options.compare;
    const result = getHistoryDiff(entries, fromLabel, toLabel);
    if (!result) {
      console.error(`Could not find entries for labels: "${fromLabel}" and "${toLabel}"`);
      process.exit(1);
    }
    console.log(`Diff from "${result.from}" → "${result.to}":`);
    console.log(formatDiff(result.diff));
    console.log(diffSummary(result.diff));
    return;
  }

  if (options.prune !== undefined) {
    entries = pruneHistory(entries, options.prune ?? DEFAULT_MAX_ENTRIES);
    saveHistory(historyFile, entries);
    console.log(`History pruned to ${entries.length} entries.`);
    return;
  }

  const label = options.label ?? new Date().toISOString();
  const raw = parseTokenFile(options.tokenFile);
  const tokens = flattenTokens(raw);
  entries = addHistoryEntry(entries, tokens, label);
  saveHistory(historyFile, entries);
  console.log(`History entry "${label}" saved (total: ${entries.length}).`);
}
