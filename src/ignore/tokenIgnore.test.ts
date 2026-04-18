import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadIgnoreFile,
  matchesPattern,
  shouldIgnore,
  applyIgnore,
} from './tokenIgnore';
import { TokenDiff } from '../diff';

function writeTempIgnore(lines: string[]): string {
  const p = path.join(os.tmpdir(), `test-ignore-${Date.now()}.txt`);
  fs.writeFileSync(p, lines.join('\n'), 'utf-8');
  return p;
}

const sampleDiff: TokenDiff = {
  added: { 'color.new': { value: '#fff' } },
  removed: { 'color.old': { value: '#000' } },
  modified: { 'spacing.md': { from: { value: '8px' }, to: { value: '10px' } } },
};

describe('loadIgnoreFile', () => {
  it('returns empty patterns if file missing', () => {
    const result = loadIgnoreFile('/nonexistent/path/.tokenignore');
    expect(result.patterns).toEqual([]);
  });

  it('loads patterns and ignores comments', () => {
    const p = writeTempIgnore(['# comment', 'color.*', '', 'spacing.md']);
    const result = loadIgnoreFile(p);
    expect(result.patterns).toEqual(['color.*', 'spacing.md']);
    fs.unlinkSync(p);
  });
});

describe('matchesPattern', () => {
  it('matches exact key', () => expect(matchesPattern('color.red', 'color.red')).toBe(true));
  it('matches prefix wildcard', () => expect(matchesPattern('color.red', 'color.*')).toBe(true));
  it('matches suffix wildcard', () => expect(matchesPattern('dark.color', '*.color')).toBe(true));
  it('does not match unrelated key', () => expect(matchesPattern('spacing.sm', 'color.*')).toBe(false));
});

describe('shouldIgnore', () => {
  it('returns false when no patterns', () => {
    expect(shouldIgnore('color.red', { patterns: [] })).toBe(false);
  });

  it('returns true when key matches a pattern', () => {
    expect(shouldIgnore('color.red', { patterns: ['color.*'] })).toBe(true);
  });
});

describe('applyIgnore', () => {
  it('filters out ignored keys from diff', () => {
    const result = applyIgnore(sampleDiff, { patterns: ['color.*'] });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.modified['spacing.md']).toBeDefined();
  });

  it('returns diff unchanged when no patterns', () => {
    const result = applyIgnore(sampleDiff, { patterns: [] });
    expect(result).toEqual(sampleDiff);
  });
});
