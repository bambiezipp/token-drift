import { FlatTokenMap } from '../parser/tokenParser';

export type LintSeverity = 'error' | 'warning';

export interface LintRule {
  name: string;
  severity: LintSeverity;
  check: (key: string, value: unknown) => string | null;
}

export interface LintResult {
  key: string;
  rule: string;
  severity: LintSeverity;
  message: string;
}

const builtinRules: LintRule[] = [
  {
    name: 'no-empty-value',
    severity: 'error',
    check: (key, value) =>
      value === '' || value === null || value === undefined
        ? `Token "${key}" has an empty or null value.`
        : null,
  },
  {
    name: 'no-hardcoded-hex-in-non-color',
    severity: 'warning',
    check: (key, value) => {
      if (typeof value !== 'string') return null;
      const isColor = key.toLowerCase().includes('color');
      if (!isColor && /^#[0-9a-fA-F]{3,8}$/.test(value)) {
        return `Token "${key}" uses a hex color value but is not categorized as a color.`;
      }
      return null;
    },
  },
  {
    name: 'consistent-naming',
    severity: 'warning',
    check: (key) =>
      /[A-Z]/.test(key)
        ? `Token "${key}" contains uppercase letters; prefer kebab-case keys.`
        : null,
  },
];

export function lintTokens(
  tokens: FlatTokenMap,
  rules: LintRule[] = builtinRules
): LintResult[] {
  const results: LintResult[] = [];
  for (const [key, value] of Object.entries(tokens)) {
    for (const rule of rules) {
      const message = rule.check(key, value);
      if (message) {
        results.push({ key, rule: rule.name, severity: rule.severity, message });
      }
    }
  }
  return results;
}

export function hasLintErrors(results: LintResult[]): boolean {
  return results.some((r) => r.severity === 'error');
}

export function formatLintResults(results: LintResult[]): string {
  if (results.length === 0) return 'No lint issues found.';
  return results
    .map((r) => `[${r.severity.toUpperCase()}] (${r.rule}) ${r.message}`)
    .join('\n');
}

/**
 * Groups lint results by severity, returning a map of severity to results.
 * Useful for displaying errors and warnings in separate sections.
 */
export function groupLintResultsBySeverity(
  results: LintResult[]
): Record<LintSeverity, LintResult[]> {
  return results.reduce(
    (acc, result) => {
      acc[result.severity].push(result);
      return acc;
    },
    { error: [], warning: [] } as Record<LintSeverity, LintResult[]>
  );
}
