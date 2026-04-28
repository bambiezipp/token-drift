import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadHistory,
  saveHistory,
  addHistoryEntry,
  getHistoryDiff,
  pruneHistory,
  HistoryEntry,
} from './tokenHistory';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-history-'));
const historyFile = path.join(tmpDir, 'history.json');

afterEach(() => {
  if (fs.existsSync(historyFile)) fs.unlinkSync(historyFile);
});

const tokensA = { 'color.primary': '#fff', 'color.secondary': '#000' };
const tokensB = { 'color.primary': '#eee', 'color.tertiary': '#111' };

describe('loadHistory', () => {
  it('returns empty array when file does not exist', () => {
    expect(loadHistory(historyFile)).toEqual([]);
  });
});

describe('saveHistory / loadHistory', () => {
  it('round-trips entries correctly', () => {
    let entries = addHistoryEntry([], tokensA, 'v1');
    saveHistory(historyFile, entries);
    const loaded = loadHistory(historyFile);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].label).toBe('v1');
    expect(loaded[0].tokens).toEqual(tokensA);
  });
});

describe('addHistoryEntry', () => {
  it('appends a new entry with a timestamp', () => {
    const entries = addHistoryEntry([], tokensA, 'v1');
    expect(entries).toHaveLength(1);
    expect(entries[0].label).toBe('v1');
    expect(entries[0].timestamp).toBeTruthy();
  });

  it('accumulates multiple entries', () => {
    let entries = addHistoryEntry([], tokensA, 'v1');
    entries = addHistoryEntry(entries, tokensB, 'v2');
    expect(entries).toHaveLength(2);
  });
});

describe('getHistoryDiff', () => {
  it('returns null when labels are missing', () => {
    const entries = addHistoryEntry([], tokensA, 'v1');
    expect(getHistoryDiff(entries, 'v1', 'v2')).toBeNull();
  });

  it('returns a diff between two labelled entries', () => {
    let entries = addHistoryEntry([], tokensA, 'v1');
    entries = addHistoryEntry(entries, tokensB, 'v2');
    const result = getHistoryDiff(entries, 'v1', 'v2');
    expect(result).not.toBeNull();
    expect(result!.from).toBe('v1');
    expect(result!.to).toBe('v2');
    expect(result!.diff.modified).toHaveLength(1);
    expect(result!.diff.added).toHaveLength(1);
    expect(result!.diff.removed).toHaveLength(1);
  });
});

describe('pruneHistory', () => {
  it('keeps all entries when under limit', () => {
    let entries: HistoryEntry[] = [];
    for (let i = 0; i < 5; i++) entries = addHistoryEntry(entries, tokensA, `v${i}`);
    expect(pruneHistory(entries, 10)).toHaveLength(5);
  });

  it('trims oldest entries beyond limit', () => {
    let entries: HistoryEntry[] = [];
    for (let i = 0; i < 10; i++) entries = addHistoryEntry(entries, tokensA, `v${i}`);
    const pruned = pruneHistory(entries, 4);
    expect(pruned).toHaveLength(4);
    expect(pruned[0].label).toBe('v6');
  });
});
