import { auditTokens, formatAuditResult, AuditResult } from './tokenAuditor';
import { FlatTokenMap } from '../parser/tokenParser';

describe('auditTokens', () => {
  it('returns no issues for clean tokens', () => {
    const tokens: FlatTokenMap = {
      'color.primary': '{color.blue.500}',
      'color.secondary': '{color.gray.300}',
    };
    const result = auditTokens(tokens);
    expect(result.issues).toHaveLength(0);
    expect(result.failed).toBe(0);
  });

  it('flags camelCase token names', () => {
    const tokens: FlatTokenMap = { colorPrimary: '{color.blue.500}' };
    const result = auditTokens(tokens);
    const issue = result.issues.find((i) => i.rule === 'naming-convention');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('flags empty values as errors', () => {
    const tokens: FlatTokenMap = { 'color.primary': '' };
    const result = auditTokens(tokens);
    const issue = result.issues.find((i) => i.rule === 'no-empty-value');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
    expect(result.failed).toBeGreaterThan(0);
  });

  it('flags hardcoded values with info severity', () => {
    const tokens: FlatTokenMap = { 'color.primary': '#ff0000' };
    const result = auditTokens(tokens);
    const issue = result.issues.find((i) => i.rule === 'prefer-alias');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('info');
  });

  it('flags duplicate values', () => {
    const tokens: FlatTokenMap = {
      'color.a': '#fff',
      'color.b': '#fff',
    };
    const result = auditTokens(tokens);
    const issue = result.issues.find((i) => i.rule === 'no-duplicate-values');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warning');
  });

  it('accumulates multiple issues', () => {
    const tokens: FlatTokenMap = {
      colorBad: '',
      'color.dup': '#abc',
      'color.dup2': '#abc',
    };
    const result = auditTokens(tokens);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('formatAuditResult', () => {
  it('shows pass message when no issues', () => {
    const result: AuditResult = { issues: [], passed: 5, failed: 0 };
    expect(formatAuditResult(result)).toContain('✅ Audit passed');
  });

  it('formats issues with icons', () => {
    const result: AuditResult = {
      issues: [
        { token: 'color.a', rule: 'no-empty-value', message: 'Empty value', severity: 'error' },
        { token: 'color.b', rule: 'naming-convention', message: 'Use kebab-case', severity: 'warning' },
      ],
      passed: 3,
      failed: 1,
    };
    const output = formatAuditResult(result);
    expect(output).toContain('❌');
    expect(output).toContain('⚠️');
    expect(output).toContain('no-empty-value');
  });
});
