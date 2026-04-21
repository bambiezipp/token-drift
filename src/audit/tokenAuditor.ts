import { FlatTokenMap } from '../parser/tokenParser';

export type AuditSeverity = 'error' | 'warning' | 'info';

export interface AuditIssue {
  token: string;
  rule: string;
  message: string;
  severity: AuditSeverity;
}

export interface AuditResult {
  issues: AuditIssue[];
  passed: number;
  failed: number;
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DIMENSION_RE = /^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|pt)$/;
const HARDCODED_VALUE_RE = /^#|^\d+(\.\d+)?(px|rem|em|%)/;

function auditNamingConvention(key: string, value: string): AuditIssue | null {
  if (/[A-Z]/.test(key)) {
    return {
      token: key,
      rule: 'naming-convention',
      message: `Token key "${key}" should use kebab-case, not camelCase or PascalCase.`,
      severity: 'warning',
    };
  }
  return null;
}

function auditHardcodedAlias(key: string, value: string): AuditIssue | null {
  if (typeof value === 'string' && HARDCODED_VALUE_RE.test(value)) {
    return {
      token: key,
      rule: 'prefer-alias',
      message: `Token "${key}" uses a hardcoded value "${value}". Consider using an alias instead.`,
      severity: 'info',
    };
  }
  return null;
}

function auditEmptyValue(key: string, value: string): AuditIssue | null {
  if (value === '' || value === null || value === undefined) {
    return {
      token: key,
      rule: 'no-empty-value',
      message: `Token "${key}" has an empty or null value.`,
      severity: 'error',
    };
  }
  return null;
}

function auditDuplicateValues(tokens: FlatTokenMap): AuditIssue[] {
  const valueMap: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(tokens)) {
    const v = String(value);
    if (!valueMap[v]) valueMap[v] = [];
    valueMap[v].push(key);
  }
  const issues: AuditIssue[] = [];
  for (const [value, keys] of Object.entries(valueMap)) {
    if (keys.length > 1) {
      issues.push({
        token: keys.join(', '),
        rule: 'no-duplicate-values',
        message: `Tokens [${keys.join(', ')}] share the same value "${value}".`,
        severity: 'warning',
      });
    }
  }
  return issues;
}

export function auditTokens(tokens: FlatTokenMap): AuditResult {
  const issues: AuditIssue[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    const v = String(value);
    const checks = [
      auditEmptyValue(key, v),
      auditNamingConvention(key, v),
      auditHardcodedAlias(key, v),
    ];
    for (const issue of checks) {
      if (issue) issues.push(issue);
    }
  }

  issues.push(...auditDuplicateValues(tokens));

  const failed = issues.filter((i) => i.severity === 'error').length;
  const passed = Object.keys(tokens).length - failed;

  return { issues, passed, failed };
}

export function formatAuditResult(result: AuditResult): string {
  if (result.issues.length === 0) {
    return `✅ Audit passed. No issues found across ${result.passed} tokens.`;
  }
  const lines: string[] = [
    `Audit complete: ${result.passed} passed, ${result.failed} error(s)`,
    '',
  ];
  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
    lines.push(`${icon} [${issue.rule}] ${issue.message}`);
  }
  return lines.join('\n');
}
