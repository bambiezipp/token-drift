import {
  isAlias,
  resolveAlias,
  resolveAllAliases,
  findUnresolvedAliases,
  FlatTokenMap,
} from './aliasResolver';

describe('isAlias', () => {
  it('returns true for alias syntax', () => {
    expect(isAlias('{color.primary}')).toBe(true);
    expect(isAlias('  {spacing.md}  ')).toBe(true);
  });

  it('returns false for plain values', () => {
    expect(isAlias('#fff')).toBe(false);
    expect(isAlias('16px')).toBe(false);
  });
});

describe('resolveAlias', () => {
  const tokens: FlatTokenMap = {
    'color.base.blue': '#0000ff',
    'color.primary': '{color.base.blue}',
    'button.background': '{color.primary}',
  };

  it('resolves a direct alias', () => {
    expect(resolveAlias('{color.base.blue}', tokens)).toBe('#0000ff');
  });

  it('resolves a chained alias', () => {
    expect(resolveAlias('{button.background}', tokens)).toBe('#0000ff');
  });

  it('returns plain value unchanged', () => {
    expect(resolveAlias('#fff', tokens)).toBe('#fff');
  });

  it('throws on unresolved alias', () => {
    expect(() => resolveAlias('{color.missing}', tokens)).toThrow('Unresolved alias');
  });

  it('throws on circular reference', () => {
    const circular: FlatTokenMap = {
      'a': '{b}',
      'b': '{a}',
    };
    expect(() => resolveAlias('{a}', circular)).toThrow('Circular alias');
  });
});

describe('resolveAllAliases', () => {
  it('resolves all aliases in a map', () => {
    const tokens: FlatTokenMap = {
      'color.base': '#ff0000',
      'color.brand': '{color.base}',
      'font.size': '16px',
    };
    const result = resolveAllAliases(tokens);
    expect(result['color.brand']).toBe('#ff0000');
    expect(result['font.size']).toBe('16px');
  });
});

describe('findUnresolvedAliases', () => {
  it('finds tokens with broken references', () => {
    const tokens: FlatTokenMap = {
      'color.primary': '{color.missing}',
      'color.base': '#fff',
    };
    expect(findUnresolvedAliases(tokens)).toEqual(['color.primary']);
  });

  it('returns empty array when all resolved', () => {
    const tokens: FlatTokenMap = {
      'color.base': '#fff',
      'color.primary': '{color.base}',
    };
    expect(findUnresolvedAliases(tokens)).toEqual([]);
  });
});
