import { checkThresholds, formatThresholdResult, ThresholdConfig } from './thresholdChecker';
import { DiffResult } from '../diff';

function makeDiff(added = 0, removed = 0, modified = 0): DiffResult {
  const makeEntries = (n: number, prefix: string) =>
    Object.fromEntries(
      Array.from({ length: n }, (_, i) => [`${prefix}.token${i}`, `val${i}`])
    );
  return {
    added: makeEntries(added, 'a'),
    removed: makeEntries(removed, 'r'),
    modified: Object.fromEntries(
      Array.from({ length: modified }, (_, i) => [
        `m.token${i}`,
        { before: 'old', after: 'new' },
      ])
    ),
  };
}

describe('checkThresholds', () => {
  it('passes when all counts are within limits', () => {
    const result = checkThresholds(makeDiff(2, 1, 3), { maxAdded: 5, maxRemoved: 5, maxModified: 5, maxTotal: 10 });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('reports maxAdded violation', () => {
    const result = checkThresholds(makeDiff(6, 0, 0), { maxAdded: 5 });
    expect(result.passed).toBe(false);
    expect(result.violations[0].rule).toBe('maxAdded');
  });

  it('reports maxRemoved violation', () => {
    const result = checkThresholds(makeDiff(0, 3, 0), { maxRemoved: 2 });
    expect(result.passed).toBe(false);
    expect(result.violations[0].rule).toBe('maxRemoved');
  });

  it('reports maxTotal violation', () => {
    const result = checkThresholds(makeDiff(3, 3, 3), { maxTotal: 5 });
    expect(result.passed).toBe(false);
    expect(result.violations[0].rule).toBe('maxTotal');
  });

  it('reports multiple violations', () => {
    const result = checkThresholds(makeDiff(10, 10, 0), { maxAdded: 5, maxRemoved: 5, maxTotal: 5 });
    expect(result.violations).toHaveLength(3);
  });
});

describe('formatThresholdResult', () => {
  it('returns success message when passed', () => {
    const msg = formatThresholdResult({ passed: true, violations: [] });
    expect(msg).toContain('passed');
  });

  it('lists violations when failed', () => {
    const msg = formatThresholdResult({
      passed: false,
      violations: [{ rule: 'maxAdded', limit: 5, actual: 10 }],
    });
    expect(msg).toContain('maxAdded');
    expect(msg).toContain('10');
  });
});
