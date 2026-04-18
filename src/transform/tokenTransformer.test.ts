import {
  toKebabCase,
  toCamelCase,
  cssVarName,
  transformToCss,
  transformToScss,
} from './tokenTransformer';

const sampleTokens: Record<string, string> = {
  'color.primary.base': '#3366FF',
  'color.neutral.100': '#F5F5F5',
  'spacing.md': '16px',
  'font.size.lg': '1.25rem',
};

describe('toKebabCase', () => {
  it('converts dot-separated path to kebab-case', () => {
    expect(toKebabCase('color.primary.base')).toBe('color-primary-base');
  });

  it('handles single segment', () => {
    expect(toKebabCase('spacing')).toBe('spacing');
  });
});

describe('toCamelCase', () => {
  it('converts dot-separated path to camelCase', () => {
    expect(toCamelCase('color.primary.base')).toBe('colorPrimaryBase');
  });

  it('handles numeric segments', () => {
    expect(toCamelCase('color.neutral.100')).toBe('colorNeutral100');
  });
});

describe('cssVarName', () => {
  it('wraps kebab name in CSS var syntax', () => {
    expect(cssVarName('color.primary.base')).toBe('--color-primary-base');
  });
});

describe('transformToCss', () => {
  it('generates a :root block with CSS custom properties', () => {
    const result = transformToCss(sampleTokens);
    expect(result).toContain(':root {');
    expect(result).toContain('--color-primary-base: #3366FF;');
    expect(result).toContain('--spacing-md: 16px;');
    expect(result).toContain('}');
  });
});

describe('transformToScss', () => {
  it('generates SCSS variable declarations', () => {
    const result = transformToScss(sampleTokens);
    expect(result).toContain('$color-primary-base: #3366FF;');
    expect(result).toContain('$font-size-lg: 1.25rem;');
    expect(result).not.toContain(':root');
  });
});
