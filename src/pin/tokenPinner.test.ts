import { pinTokens, unpinTokens, checkPinViolations, formatPinViolations, loadPinFile, savePinFile, PinFile } from './tokenPinner';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const sampleTokens = {
  'color.primary': '#0070f3',
  'color.secondary': '#ff4081',
  'spacing.sm': '8px',
  'spacing.md': '16px',
};

describe('pinTokens', () => {
  it('adds new pins to an empty pin file', () => {
    const pinFile: PinFile = { version: '1', pins: [] };
    const result = pinTokens(pinFile, sampleTokens, ['color.primary']);
    expect(result.pins).toHaveLength(1);
    expect(result.pins[0].key).toBe('color.primary');
    expect(result.pins[0].value).toBe('#0070f3');
  });

  it('updates an existing pin', () => {
    const pinFile: PinFile = { version: '1', pins: [{ key: 'color.primary', value: '#old', pinnedAt: '2024-01-01T00:00:00.000Z' }] };
    const result = pinTokens(pinFile, sampleTokens, ['color.primary']);
    expect(result.pins).toHaveLength(1);
    expect(result.pins[0].value).toBe('#0070f3');
  });

  it('attaches a comment when provided', () => {
    const pinFile: PinFile = { version: '1', pins: [] };
    const result = pinTokens(pinFile, sampleTokens, ['spacing.sm'], 'do not change');
    expect(result.pins[0].comment).toBe('do not change');
  });

  it('throws when key does not exist in tokens', () => {
    const pinFile: PinFile = { version: '1', pins: [] };
    expect(() => pinTokens(pinFile, sampleTokens, ['does.not.exist'])).toThrow('Token key not found');
  });
});

describe('unpinTokens', () => {
  it('removes specified pins', () => {
    const pinFile: PinFile = { version: '1', pins: [
      { key: 'color.primary', value: '#0070f3', pinnedAt: '' },
      { key: 'spacing.sm', value: '8px', pinnedAt: '' },
    ]};
    const result = unpinTokens(pinFile, ['color.primary']);
    expect(result.pins).toHaveLength(1);
    expect(result.pins[0].key).toBe('spacing.sm');
  });
});

describe('checkPinViolations', () => {
  it('returns empty array when all pins match', () => {
    const pinFile: PinFile = { version: '1', pins: [{ key: 'color.primary', value: '#0070f3', pinnedAt: '' }] };
    expect(checkPinViolations(pinFile, sampleTokens)).toHaveLength(0);
  });

  it('detects a changed pinned token', () => {
    const pinFile: PinFile = { version: '1', pins: [{ key: 'color.primary', value: '#000000', pinnedAt: '' }] };
    const violations = checkPinViolations(pinFile, sampleTokens);
    expect(violations).toHaveLength(1);
    expect(violations[0].expected).toBe('#000000');
    expect(violations[0].actual).toBe('#0070f3');
  });
});

describe('formatPinViolations', () => {
  it('shows success message when no violations', () => {
    expect(formatPinViolations([])).toContain('✅');
  });

  it('lists violations when present', () => {
    const output = formatPinViolations([{ key: 'color.primary', expected: '#000', actual: '#fff' }]);
    expect(output).toContain('❌');
    expect(output).toContain('color.primary');
  });
});

describe('loadPinFile / savePinFile', () => {
  it('returns empty pin file when path does not exist', () => {
    const result = loadPinFile('/nonexistent/path/pins.json');
    expect(result.pins).toHaveLength(0);
  });

  it('round-trips a pin file through save and load', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-drift-pins-'));
    const filePath = path.join(tmpDir, 'pins.json');
    const pinFile: PinFile = { version: '1', pins: [{ key: 'spacing.md', value: '16px', pinnedAt: '2024-06-01T00:00:00.000Z' }] };
    savePinFile(filePath, pinFile);
    const loaded = loadPinFile(filePath);
    expect(loaded.pins[0].key).toBe('spacing.md');
    fs.rmSync(tmpDir, { recursive: true });
  });
});
