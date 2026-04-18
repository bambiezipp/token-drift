import { computeStats, formatStats } from './tokenStats';
import { FlatTokenMap } from '../parser/tokenParser';

const sampleTokens: FlatTokenMap = {
  'color.primary': { value: '#0000ff', type: 'color' },
  'color.secondary': { value: '{color.primary}', type: 'color' },
  'spacing.sm': { value: '4px', type: 'dimension' },
  'spacing.md': { value: '8px', type: 'dimension' },
  'font.size.base': { value: '16px', type: 'dimension' },
};

describe('computeStats', () => {
  it('counts total tokens', () => {
    const stats = computeStats(sampleTokens);
    expect(stats.total).toBe(5);
  });

  it('counts aliases and literals', () => {
    const stats = computeStats(sampleTokens);
    expect(stats.aliasCount).toBe(1);
    expect(stats.literalCount).toBe(4);
  });

  it('groups by category', () => {
    const stats = computeStats(sampleTokens);
    expect(stats.byCategory['color']).toBe(2);
    expect(stats.byCategory['spacing']).toBe(2);
    expect(stats.byCategory['font']).toBe(1);
  });

  it('groups by type', () => {
    const stats = computeStats(sampleTokens);
    expect(stats.byType['color']).toBe(2);
    expect(stats.byType['dimension']).toBe(3);
  });

  it('handles empty token map', () => {
    const stats = computeStats({});
    expect(stats.total).toBe(0);
    expect(stats.aliasCount).toBe(0);
    expect(stats.byCategory).toEqual({});
  });
});

describe('formatStats', () => {
  it('returns a non-empty string', () => {
    const stats = computeStats(sampleTokens);
    const output = formatStats(stats);
    expect(typeof output).toBe('string');
    expect(output).toContain('Total tokens');
    expect(output).toContain('color');
  });

  it('includes alias and literal counts', () => {
    const stats = computeStats(sampleTokens);
    const output = formatStats(stats);
    expect(output).toContain('Aliases');
    expect(output).toContain('Literals');
  });
});
