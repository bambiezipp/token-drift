import { DiffResult } from '../diff';

export interface ThresholdConfig {
  maxAdded?: number;
  maxRemoved?: number;
  maxModified?: number;
  maxTotal?: number;
}

export interface ThresholdViolation {
  rule: string;
  limit: number;
  actual: number;
}

export interface ThresholdResult {
  passed: boolean;
  violations: ThresholdViolation[];
}

export function checkThresholds(
  diff: DiffResult,
  config: ThresholdConfig
): ThresholdResult {
  const violations: ThresholdViolation[] = [];

  const added = Object.keys(diff.added).length;
  const removed = Object.keys(diff.removed).length;
  const modified = Object.keys(diff.modified).length;
  const total = added + removed + modified;

  if (config.maxAdded !== undefined && added > config.maxAdded) {
    violations.push({ rule: 'maxAdded', limit: config.maxAdded, actual: added });
  }
  if (config.maxRemoved !== undefined && removed > config.maxRemoved) {
    violations.push({ rule: 'maxRemoved', limit: config.maxRemoved, actual: removed });
  }
  if (config.maxModified !== undefined && modified > config.maxModified) {
    violations.push({ rule: 'maxModified', limit: config.maxModified, actual: modified });
  }
  if (config.maxTotal !== undefined && total > config.maxTotal) {
    violations.push({ rule: 'maxTotal', limit: config.maxTotal, actual: total });
  }

  return { passed: violations.length === 0, violations };
}

export function formatThresholdResult(result: ThresholdResult): string {
  if (result.passed) return '✅ All threshold checks passed.';
  const lines = ['❌ Threshold violations detected:'];
  for (const v of result.violations) {
    lines.push(`  - ${v.rule}: limit ${v.limit}, actual ${v.actual}`);
  }
  return lines.join('\n');
}
