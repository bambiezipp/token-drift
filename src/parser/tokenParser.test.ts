import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseTokenFile, TokenMap } from './tokenParser';

function writeTempJson(data: unknown): string {
  const tmpFile = path.join(os.tmpdir(), `token-drift-test-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(data), 'utf-8');
  return tmpFile;
}

describe('parseTokenFile', () => {
  it('parses a flat token file correctly', () => {
    const file = writeTempJson({
      'color-primary': { value: '#3366FF', type: 'color' },
    });
    const result: TokenMap = parseTokenFile(file);
    expect(result['color-primary']).toEqual({
      name: 'color-primary',
      value: '#3366FF',
      type: 'color',
      description: undefined,
    });
    fs.unlinkSync(file);
  });

  it('flattens nested token groups', () => {
    const file = writeTempJson({
      color: {
        primary: { value: '#3366FF', type: 'color' },
        secondary: { value: '#FF6633', type: 'color' },
      },
    });
    const result = parseTokenFile(file);
    expect(result['color.primary'].value).toBe('#3366FF');
    expect(result['color.secondary'].value).toBe('#FF6633');
    fs.unlinkSync(file);
  });

  it('includes description when present', () => {
    const file = writeTempJson({
      spacing: {
        base: { value: '8px', type: 'spacing', description: 'Base unit' },
      },
    });
    const result = parseTokenFile(file);
    expect(result['spacing.base'].description).toBe('Base unit');
    fs.unlinkSync(file);
  });

  it('throws if file does not exist', () => {
    expect(() => parseTokenFile('/nonexistent/tokens.json')).toThrow(
      'Token file not found'
    );
  });

  it('throws on unsupported file extension', () => {
    const file = writeTempJson({});
    const renamed = file.replace('.json', '.yaml');
    fs.renameSync(file, renamed);
    expect(() => parseTokenFile(renamed)).toThrow('Unsupported file format');
    fs.unlinkSync(renamed);
  });

  it('throws on invalid JSON', () => {
    const tmpFile = path.join(os.tmpdir(), `token-drift-bad-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, '{ bad json }', 'utf-8');
    expect(() => parseTokenFile(tmpFile)).toThrow('Failed to parse JSON');
    fs.unlinkSync(tmpFile);
  });
});
