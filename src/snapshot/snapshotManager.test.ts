import * as fs from 'fs';
import * as path from 'path';
import { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } from './snapshotManager';

const SNAPSHOT_DIR = '.token-drift/snapshots';

function cleanup(name: string) {
  const filePath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

describe('snapshotManager', () => {
  const testName = '__test_snapshot__';
  const tokens = { 'color.primary': '#fff', 'spacing.sm': '4px' };

  afterEach(() => cleanup(testName));

  test('saveSnapshot creates a file', () => {
    saveSnapshot(testName, tokens);
    const filePath = path.join(SNAPSHOT_DIR, `${testName}.json`);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('loadSnapshot returns saved tokens', () => {
    saveSnapshot(testName, tokens);
    const result = loadSnapshot(testName);
    expect(result).not.toBeNull();
    expect(result!.tokens).toEqual(tokens);
    expect(result!.name).toBe(testName);
    expect(result!.timestamp).toBeDefined();
  });

  test('loadSnapshot returns null for missing snapshot', () => {
    const result = loadSnapshot('__nonexistent__');
    expect(result).toBeNull();
  });

  test('listSnapshots includes saved snapshot', () => {
    saveSnapshot(testName, tokens);
    const list = listSnapshots();
    expect(list).toContain(testName);
  });

  test('deleteSnapshot removes the file', () => {
    saveSnapshot(testName, tokens);
    const deleted = deleteSnapshot(testName);
    expect(deleted).toBe(true);
    const filePath = path.join(SNAPSHOT_DIR, `${testName}.json`);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  test('deleteSnapshot returns false for missing snapshot', () => {
    const deleted = deleteSnapshot('__nonexistent__');
    expect(deleted).toBe(false);
  });
});
