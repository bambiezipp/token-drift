import { lintTokens, hasLintErrors, formatLintResults, LintResult } from './tokenLinter';
import { FlatTokenMap } from '../parser/tokenParser';

describe('lintTokens', () => {
  it('returns no results for clean tokens', () => {
    const tokens: FlatTokenMap = {
      'color.primary': '#ff0000',
      'spacing.small': '4px',
    };
    const results = lintTokens(tokens);
    expect(results).toHaveLength(0);
  });

  it('flags empty string values', () => {
    const tokens: FlatTokenMap = { 'color.bg': '' };
    const results = lintTokens(tokens);
    expect(results.some((r) => r.rule === 'no-empty-value')).toBe(true);
    expect(results.some((r) => r.severity === 'error')).toBe(true);
  });

  it('flags null values', () => {
    const tokens: FlatTokenMap = { 'font.size': null as unknown as string };
    const results = lintTokens(tokens);
    expect(results.some((r) => r.rule === 'no-empty-value')).toBe(true);
  });

  it('warns on hex value in non-color token', () => {
    const tokens: FlatTokenMap = { 'spacing.gap': '#fff' };
    const results = lintTokens(tokens);
    expect(results.some((r) => r.rule === 'no-hardcoded-hex-in-non-color')).toBe(true);
    expect(results.some((r) => r.severity === 'warning')).toBe(true);
  });

  it('does not warn on hex value in color token', () => {
    const tokens: FlatTokenMap = { 'color.accent': '#abc123' };
    const results = lintTokens(tokens);
    expect(results.some((r) => r.rule === 'no-hardcoded-hex-in-non-color')).toBe(false);
  });

  it('warns on uppercase in key', () => {
    const tokens: FlatTokenMap = { 'colorPrimary': '#ff0000' };
    const results = lintTokens(tokens);
    expect(results.some((r) => r.rule === 'consistent-naming')).toBe(true);
  });
});

describe('hasLintErrors', () => {
  it('returns true when errors present', () => {
    const results: LintResult[] = [{ key: 'a', rule: 'x', severity: 'error', message: 'err' }];
    expect(hasLintErrors(results)).toBe(true);
  });

  it('returns false for warnings only', () => {
    const results: LintResult[] = [{ key: 'a', rule: 'x', severity: 'warning', message: 'warn' }];
    expect(hasLintErrors(results)).toBe(false);
  });
});

describe('formatLintResults', () => {
  it('returns clean message for empty results', () => {
    expect(formatLintResults([])).toBe('No lint issues found.');
  });

  it('formats results with severity and rule', () => {
    const results: LintResult[] = [
      { key: 'x', rule: 'some-rule', severity: 'warning', message: 'Watch out' },
    ];
    const output = formatLintResults(results);
    expect(output).toContain('[WARNING]');
    expect(output).toContain('some-rule');
    expect(output).toContain('Watch out');
  });
});
