import * as fs from 'fs';
import * as path from 'path';
import { FlatTokenMap } from '../parser/tokenParser';

export interface Snapshot {
  version: string;
  timestamp: string;
  tokens: FlatTokenMap;
}

export function saveSnapshot(
  tokens: FlatTokenMap,
  version: string,
  snapshotDir: string
): string {
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const snapshot: Snapshot = {
    version,
    timestamp: new Date().toISOString(),
    tokens,
  };
  const filename = `${version}.json`;
  const filepath = path.join(snapshotDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(version: string, snapshotDir: string): Snapshot {
  const filepath = path.join(snapshotDir, `${version}.json`);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot not found for version: ${version}`);
  }
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(snapshotDir: string): string[] {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort();
}

export function deleteSnapshot(version: string, snapshotDir: string): boolean {
  const filepath = path.join(snapshotDir, `${version}.json`);
  if (!fs.existsSync(filepath)) return false;
  fs.unlinkSync(filepath);
  return true;
}
