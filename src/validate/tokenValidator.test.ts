import { validateTokens, formatValidationReport } from './tokenValidator';

describe('validateTokens', () => {
  it('returns valid for clean tokens', () => {
    const tokens = {
      'color.primary': '#ff0000',
      'spacing.md': '16px',
      'opacity.disabled': '0.5',
    };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(true);
    expect(report.results).toHaveLength(0);
  });

  it('flags invalid color values', () => {
    const tokens = { 'color.brand': 'not-a-color' };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(false);
    expect(report.results[0].severity).toBe('error');
    expect(report.results[0].token).toBe('color.brand');
  });

  it('accepts rgb and hsl colors', () => {
    const tokens = {
      'color.a': 'rgb(255,0,0)',
      'color.b': 'hsl(120,100%,50%)',
    };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(true);
  });

  it('flags invalid dimension values as warning', () => {
    const tokens = { 'spacing.gap': 'large' };
    const report = validateTokens(tokens);
    expect(report.results[0].severity).toBe('warning');
  });

  it('allows zero as valid dimension', () => {
    const tokens = { 'spacing.none': '0' };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(true);
  });

  it('flags opacity out of range', () => {
    const tokens = { 'opacity.heavy': '1.5' };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(false);
    expect(report.results[0].message).toMatch(/between 0 and 1/);
  });

  it('flags empty token values', () => {
    const tokens = { 'color.empty': '' };
    const report = validateTokens(tokens);
    expect(report.valid).toBe(false);
  });
});

describe('formatValidationReport', () => {
  it('returns success message when no issues', () => {
    const msg = formatValidationReport({ results: [], valid: true });
    expect(msg).toContain('✅');
  });

  it('formats errors and warnings', () => {
    const report = validateTokens({ 'color.x': 'bad', 'opacity.y': '2' });
    const msg = formatValidationReport(report);
    expect(msg).toContain('[ERROR]');
  });
});
