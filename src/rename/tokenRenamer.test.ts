import { applyRenames, parseRenameMap, formatRenameResult } from './tokenRenamer';
import { FlatTokenMap } from '../parser/tokenParser';

const baseTokens: FlatTokenMap = {
  'color.primary': { value: '#0000ff', type: 'color' },
  'color.secondary': { value: '#ff0000', type: 'color' },
  'spacing.sm': { value: '4px', type: 'dimension' },
};

describe('applyRenames', () => {
  it('renames existing tokens', () => {
    const result = applyRenames(baseTokens, [{ from: 'color.primary', to: 'color.brand' }]);
    expect(result.tokens['color.brand']).toEqual({ value: '#0000ff', type: 'color' });
    expect(result.tokens['color.primary']).toBeUndefined();
    expect(result.renamed['color.primary']).toBe('color.brand');
  });

  it('tracks not found keys', () => {
    const result = applyRenames(baseTokens, [{ from: 'color.missing', to: 'color.new' }]);
    expect(result.notFound).toContain('color.missing');
  });

  it('handles multiple rules', () => {
    const rules = [
      { from: 'color.primary', to: 'color.brand' },
      { from: 'spacing.sm', to: 'spacing.small' },
    ];
    const result = applyRenames(baseTokens, rules);
    expect(Object.keys(result.renamed)).toHaveLength(2);
    expect(result.tokens['color.brand']).toBeDefined();
    expect(result.tokens['spacing.small']).toBeDefined();
  });

  it('does not mutate original tokens', () => {
    applyRenames(baseTokens, [{ from: 'color.primary', to: 'color.brand' }]);
    expect(baseTokens['color.primary']).toBeDefined();
  });
});

describe('parseRenameMap', () => {
  it('converts object to rules array', () => {
    const rules = parseRenameMap({ 'color.primary': 'color.brand' });
    expect(rules).toEqual([{ from: 'color.primary', to: 'color.brand' }]);
  });
});

describe('formatRenameResult', () => {
  it('formats renamed and not found', () => {
    const result = applyRenames(baseTokens, [
      { from: 'color.primary', to: 'color.brand' },
      { from: 'color.ghost', to: 'color.phantom' },
    ]);
    const output = formatRenameResult(result);
    expect(output).toContain('color.primary -> color.brand');
    expect(output).toContain('color.ghost');
  });

  it('shows fallback when no renames', () => {
    const result = applyRenames(baseTokens, []);
    expect(formatRenameResult(result)).toBe('No renames applied.');
  });
});
