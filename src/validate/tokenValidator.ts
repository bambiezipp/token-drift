import { FlatTokenMap } from '../parser/tokenParser';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationResult {
  token: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationReport {
  results: ValidationResult[];
  valid: boolean;
}

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DIMENSION_RE = /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|pt|dp)$/;

function inferType(key: string): string | null {
  if (key.includes('color')) return 'color';
  if (key.includes('spacing') || key.includes('size') || key.includes('radius')) return 'dimension';
  if (key.includes('opacity')) return 'opacity';
  return null;
}

function validateColor(token: string, value: string): ValidationResult | null {
  if (!HEX_COLOR_RE.test(value) && !value.startsWith('rgb') && !value.startsWith('hsl')) {
    return { token, message: `Invalid color value: "${value}"`, severity: 'error' };
  }
  return null;
}

function validateDimension(token: string, value: string): ValidationResult | null {
  if (!DIMENSION_RE.test(value) && value !== '0') {
    return { token, message: `Invalid dimension value: "${value}"`, severity: 'warning' };
  }
  return null;
}

function validateOpacity(token: string, value: string): ValidationResult | null {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0 || num > 1) {
    return { token, message: `Opacity must be between 0 and 1, got: "${value}"`, severity: 'error' };
  }
  return null;
}

export function validateTokens(tokens: FlatTokenMap): ValidationReport {
  const results: ValidationResult[] = [];

  for (const [key, value] of Object.entries(tokens)) {
    if (value === undefined || value === null || value === '') {
      results.push({ token: key, message: 'Token has empty or missing value', severity: 'error' });
      continue;
    }

    const type = inferType(key);
    let result: ValidationResult | null = null;

    if (type === 'color') result = validateColor(key, String(value));
    else if (type === 'dimension') result = validateDimension(key, String(value));
    else if (type === 'opacity') result = validateOpacity(key, String(value));

    if (result) results.push(result);
  }

  return {
    results,
    valid: results.filter(r => r.severity === 'error').length === 0,
  };
}

export function formatValidationReport(report: ValidationReport): string {
  if (report.results.length === 0) return '✅ All tokens are valid.';
  return report.results
    .map(r => `[${r.severity.toUpperCase()}] ${r.token}: ${r.message}`)
    .join('\n');
}
