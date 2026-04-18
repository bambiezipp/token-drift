import { mergeTokens, formatMergeResult } from './tokenMerger';
import { FlatTokens } from '../parser/tokenParser';

const source: FlatTokens = {
  'color.primary': '#0000ff',
  'color.secondary': '#ff0000',
  'spacing.sm': '4px',
};

const target: FlatTokens = {
  'color.primary': '#0033cc',
  'color.accent': '#00ff00',
  'spacing.sm': '4px',
};

describe('mergeTokens', () => {
  it('uses target values on conflict by default', () => {
    const result = mergeTokens(source, target);
    expect(result.merged['color.primary']).toBe('#0033cc');
    expect(result.conflicts).toContain('color.primary');
  });

  it('uses source values on conflict when strategy is source', () => {
    const result = mergeTokens(source, target, { strategy: 'source' });
    expect(result.merged['color.primary']).toBe('#0000ff');
    expect(result.overwritten).toContain('color.primary');
  });

  it('includes all keys in union strategy', () => {
    const result = mergeTokens(source, target, { strategy: 'union' });
    expect(result.merged).toHaveProperty('color.secondary');
    expect(result.merged).toHaveProperty('color.accent');
  });

  it('does not report conflict when values are equal', () => {
    const result = mergeTokens(source, target);
    expect(result.conflicts).not.toContain('spacing.sm');
  });

  it('tracks added keys from target not in source', () => {
    const result = mergeTokens(source, target);
    expect(result.added).toContain('color.accent');
  });

  it('returns all source keys when target is empty', () => {
    const result = mergeTokens(source, {});
    expect(Object.keys(result.merged)).toEqual(expect.arrayContaining(Object.keys(source)));
  });
});

describe('formatMergeResult', () => {
  it('includes summary counts', () => {
    const result = mergeTokens(source, target);
    const output = formatMergeResult(result);
    expect(output).toMatch(/Conflicts:/);
    expect(output).toMatch(/Added:/);
    expect(output).toMatch(/Merged tokens:/);
  });

  it('lists conflicting keys when present', () => {
    const result = mergeTokens(source, target);
    const output = formatMergeResult(result);
    expect(output).toContain('color.primary');
  });
});
