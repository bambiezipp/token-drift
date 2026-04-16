import { diffTokens, hasDrift } from './tokenDiffer';
import { FlatTokenMap } from '../parser/tokenParser';

const base: FlatTokenMap = {
  'color.primary': '#0000ff',
  'color.secondary': '#ff0000',
  'spacing.sm': '4px',
};

describe('diffTokens', () => {
  it('detects added tokens', () => {
    const next: FlatTokenMap = { ...base, 'color.accent': '#00ff00' };
    const result = diffTokens(base, next);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].key).toBe('color.accent');
    expect(result.added[0].newValue).toBe('#00ff00');
  });

  it('detects removed tokens', () => {
    const next: FlatTokenMap = { 'color.primary': '#0000ff' };
    const result = diffTokens(base, next);
    expect(result.removed).toHaveLength(2);
  });

  it('detects modified tokens', () => {
    const next: FlatTokenMap = { ...base, 'color.primary': '#123456' };
    const result = diffTokens(base, next);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].oldValue).toBe('#0000ff');
    expect(result.modified[0].newValue).toBe('#123456');
  });

  it('tracks unchanged tokens', () => {
    const result = diffTokens(base, { ...base });
    expect(result.unchanged).toHaveLength(3);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });
});

describe('hasDrift', () => {
  it('returns true when there are changes', () => {
    const result = diffTokens(base, { ...base, 'new.token': 'val' });
    expect(hasDrift(result)).toBe(true);
  });

  it('returns false when tokens are identical', () => {
    const result = diffTokens(base, { ...base });
    expect(hasDrift(result)).toBe(false);
  });
});
