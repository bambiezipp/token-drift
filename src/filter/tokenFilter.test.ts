import { filterTokens, listCategories } from './tokenFilter';

const sampleTokens = {
  'color.primary': '#0000ff',
  'color.secondary': '#ff0000',
  'spacing.small': '4px',
  'spacing.large': '16px',
  'typography.fontSize': '14px',
};

describe('filterTokens', () => {
  it('returns all tokens when no options provided', () => {
    const result = filterTokens(sampleTokens, {});
    expect(result).toEqual(sampleTokens);
  });

  it('filters by prefix', () => {
    const result = filterTokens(sampleTokens, { prefix: 'color' });
    expect(Object.keys(result)).toEqual(['color.primary', 'color.secondary']);
  });

  it('filters by category (segment match)', () => {
    const result = filterTokens(sampleTokens, { category: 'spacing' });
    expect(Object.keys(result)).toEqual(['spacing.small', 'spacing.large']);
  });

  it('filters by explicit keys', () => {
    const result = filterTokens(sampleTokens, {
      keys: ['color.primary', 'typography.fontSize'],
    });
    expect(result).toEqual({
      'color.primary': '#0000ff',
      'typography.fontSize': '14px',
    });
  });

  it('keys option takes precedence over prefix', () => {
    const result = filterTokens(sampleTokens, {
      prefix: 'color',
      keys: ['spacing.small'],
    });
    expect(result).toEqual({ 'spacing.small': '4px' });
  });

  it('returns empty object when nothing matches', () => {
    const result = filterTokens(sampleTokens, { prefix: 'nonexistent' });
    expect(result).toEqual({});
  });
});

describe('listCategories', () => {
  it('returns sorted unique top-level categories', () => {
    const cats = listCategories(sampleTokens);
    expect(cats).toEqual(['color', 'spacing', 'typography']);
  });

  it('returns empty array for empty token map', () => {
    expect(listCategories({})).toEqual([]);
  });
});
