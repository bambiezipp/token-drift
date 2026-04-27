import * as fs from 'fs';
import * as path from 'path';
import { FlatTokenMap } from '../parser/tokenParser';

export interface PinnedToken {
  key: string;
  value: string | number | boolean;
  pinnedAt: string;
  comment?: string;
}

export interface PinFile {
  version: string;
  pins: PinnedToken[];
}

const PIN_FILE_VERSION = '1';

export function loadPinFile(filePath: string): PinFile {
  if (!fs.existsSync(filePath)) {
    return { version: PIN_FILE_VERSION, pins: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as PinFile;
}

export function savePinFile(filePath: string, pinFile: PinFile): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(pinFile, null, 2), 'utf-8');
}

export function pinTokens(
  pinFile: PinFile,
  tokens: FlatTokenMap,
  keys: string[],
  comment?: string
): PinFile {
  const now = new Date().toISOString();
  const updatedPins = [...pinFile.pins];

  for (const key of keys) {
    if (!(key in tokens)) {
      throw new Error(`Token key not found: "${key}"`);
    }
    const existing = updatedPins.findIndex((p) => p.key === key);
    const entry: PinnedToken = { key, value: tokens[key], pinnedAt: now, ...(comment ? { comment } : {}) };
    if (existing >= 0) {
      updatedPins[existing] = entry;
    } else {
      updatedPins.push(entry);
    }
  }

  return { ...pinFile, pins: updatedPins };
}

export function unpinTokens(pinFile: PinFile, keys: string[]): PinFile {
  const pins = pinFile.pins.filter((p) => !keys.includes(p.key));
  return { ...pinFile, pins };
}

export function checkPinViolations(
  pinFile: PinFile,
  tokens: FlatTokenMap
): { key: string; expected: string | number | boolean; actual: string | number | boolean }[] {
  const violations: { key: string; expected: string | number | boolean; actual: string | number | boolean }[] = [];
  for (const pin of pinFile.pins) {
    if (pin.key in tokens && tokens[pin.key] !== pin.value) {
      violations.push({ key: pin.key, expected: pin.value, actual: tokens[pin.key] });
    }
  }
  return violations;
}

export function formatPinViolations(
  violations: { key: string; expected: string | number | boolean; actual: string | number | boolean }[]
): string {
  if (violations.length === 0) return '✅ All pinned tokens match.';
  const lines = [`❌ ${violations.length} pinned token(s) have changed:`];
  for (const v of violations) {
    lines.push(`  ${v.key}: expected "${v.expected}", got "${v.actual}"`);
  }
  return lines.join('\n');
}
