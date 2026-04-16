import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  deleteSnapshot,
} from './snapshotManager';
import { FlatTokenMap } from '../parser/tokenParser';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-drift-snap-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const sampleTokens: FlatTokenMap = {
  'color.primary': '#007bff',
  'spacing.sm': '8px',
};

test('saveSnapshot creates a json file', () => {
  const filepath = saveSnapshot(sampleTokens, '1.0.0', tmpDir);
  expect(fs.existsSync(filepath)).toBe(true);
});

test('loadSnapshot returns saved snapshot', () => {
  saveSnapshot(sampleTokens, '1.0.0', tmpDir);
  const snap = loadSnapshot('1.0.0', tmpDir);
  expect(snap.version).toBe('1.0.0');
  expect(snap.tokens).toEqual(sampleTokens);
  expect(snap.timestamp).toBeDefined();
});

test('loadSnapshot throws for missing version', () => {
  expect(() => loadSnapshot('9.9.9', tmpDir)).toThrow('Snapshot not found');
});

test('listSnapshots returns sorted versions', () => {
  saveSnapshot(sampleTokens, '1.0.0', tmpDir);
  saveSnapshot(sampleTokens, '2.0.0', tmpDir);
  const list = listSnapshots(tmpDir);
  expect(list).toEqual(['1.0.0', '2.0.0']);
});

test('listSnapshots returns empty array for missing dir', () => {
  expect(listSnapshots('/nonexistent/path')).toEqual([]);
});

test('deleteSnapshot removes file and returns true', () => {
  saveSnapshot(sampleTokens, '1.0.0', tmpDir);
  const result = deleteSnapshot('1.0.0', tmpDir);
  expect(result).toBe(true);
  expect(listSnapshots(tmpDir)).toEqual([]);
});

test('deleteSnapshot returns false for missing version', () => {
  expect(deleteSnapshot('0.0.0', tmpDir)).toBe(false);
});
