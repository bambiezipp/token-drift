import * as fs from 'fs';
import * as path from 'path';
import { FlatTokenMap } from '../parser/tokenParser';

const SNAPSHOT_DIR = '.token-drift/snapshots';

export function ensureSnapshotDir(): void {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

export function saveSnapshot(name: string, tokens: FlatTokenMap): void {
  ensureSnapshotDir();
  const filePath = path.join(SNAPSHOT_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ name, timestamp: new Date().toISOString(), tokens }, null, 2));
}

export function loadSnapshot(name: string): { name: string; timestamp: string; tokens: FlatTokenMap } | null {
  const filePath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function listSnapshots(): string[] {
  if (!fs.existsSync(SNAPSHOT_DIR)) return [];
  return fs
    .readdirSync(SNAPSHOT_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

export function deleteSnapshot(name: string): boolean {
  const filePath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
