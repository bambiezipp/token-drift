import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { saveSnapshot } from './snapshotManager';
import { diffSnapshots } from './snapshotDiff';
import { FlatTokenMap } from '../parser/tokenParser';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-drift-sdiff-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const v1Tokens: FlatTokenMap = {
  'color.primary': '#007bff',
  'color.danger': '#dc3545',
  'spacing.sm': '8px',
};

const v2Tokens: FlatTokenMap = {
  'color.primary': '#0056b3',
  'spacing.sm': '8px',
  'spacing.md': '16px',
};

test('diffSnapshots returns correct added tokens', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  saveSnapshot(v2Tokens, '2.0.0', tmpDir);
  const result = diffSnapshots('1.0.0', '2.0.0', tmpDir);
  expect(result.diff.added['spacing.md']).toBe('16px');
});

test('diffSnapshots returns correct removed tokens', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  saveSnapshot(v2Tokens, '2.0.0', tmpDir);
  const result = diffSnapshots('1.0.0', '2.0.0', tmpDir);
  expect(result.diff.removed['color.danger']).toBe('#dc3545');
});

test('diffSnapshots returns correct modified tokens', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  saveSnapshot(v2Tokens, '2.0.0', tmpDir);
  const result = diffSnapshots('1.0.0', '2.0.0', tmpDir);
  expect(result.diff.modified['color.primary']).toEqual({
    from: '#007bff',
    to: '#0056b3',
  });
});

test('diffSnapshots includes version and timestamp metadata', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  saveSnapshot(v2Tokens, '2.0.0', tmpDir);
  const result = diffSnapshots('1.0.0', '2.0.0', tmpDir);
  expect(result.from).toBe('1.0.0');
  expect(result.to).toBe('2.0.0');
  expect(result.fromTimestamp).toBeDefined();
  expect(result.toTimestamp).toBeDefined();
});

test('diffSnapshots does not report unchanged tokens as added, removed, or modified', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  saveSnapshot(v2Tokens, '2.0.0', tmpDir);
  const result = diffSnapshots('1.0.0', '2.0.0', tmpDir);
  expect(result.diff.added['spacing.sm']).toBeUndefined();
  expect(result.diff.removed['spacing.sm']).toBeUndefined();
  expect(result.diff.modified['spacing.sm']).toBeUndefined();
});

test('diffSnapshots throws when a snapshot version does not exist', () => {
  saveSnapshot(v1Tokens, '1.0.0', tmpDir);
  expect(() => diffSnapshots('1.0.0', '9.9.9', tmpDir)).toThrow();
});
