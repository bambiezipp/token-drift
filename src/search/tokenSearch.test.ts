import { searchTokens, formatSearchResults } from './tokenSearch';

const tokens = {
  'color.primary': '#0066cc',
  'color.secondary': '#ff6600',
  'spacing.small': '4px',
  'spacing.medium': '8px',
  'font.size.base': '16px',
};

describe('searchTokens', () => {
  it('matches by key substring', () => {
    const results = searchTokens(tokens, { query: 'color' });
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.matchedOn === 'key')).toBe(true);
  });

  it('matches by value substring', () => {
    const results = searchTokens(tokens, { query: '8px' });
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('spacing.medium');
    expect(results[0].matchedOn).toBe('value');
  });

  it('is case-insensitive by default', () => {
    const results = searchTokens(tokens, { query: 'COLOR' });
    expect(results).toHaveLength(2);
  });

  it('respects caseSensitive option', () => {
    const results = searchTokens(tokens, { query: 'COLOR', caseSensitive: true });
    expect(results).toHaveLength(0);
  });

  it('can search values only', () => {
    const results = searchTokens(tokens, { query: 'px', keys: false, values: true });
    expect(results.every((r) => r.matchedOn === 'value')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty query', () => {
    const results = searchTokens(tokens, { query: '' });
    expect(results).toHaveLength(0);
  });
});

describe('formatSearchResults', () => {
  it('returns no match message for empty results', () => {
    expect(formatSearchResults([])).toBe('No tokens matched.');
  });

  it('formats results with match type prefix', () => {
    const results = searchTokens(tokens, { query: 'spacing' });
    const output = formatSearchResults(results);
    expect(output).toContain('[key]');
    expect(output).toContain('spacing.small');
  });
});
