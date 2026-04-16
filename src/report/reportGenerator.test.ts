import { generateTextReport, generateJsonReport, generateMarkdownReport, generateReport } from './reportGenerator';
import { TokenDiff } from '../diff/tokenDiffer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const sampleDiffs: TokenDiff[] = [
  { token: 'color.primary', type: 'modified', oldValue: '#000', newValue: '#fff' },
  { token: 'spacing.md', type: 'added', newValue: '16px' },
  { token: 'font.size.sm', type: 'removed', oldValue: '12px' },
];

describe('generateTextReport', () => {
  it('returns no-drift message when empty', () => {
    expect(generateTextReport([])).toContain('No token drift detected');
  });

  it('returns formatted diff for changes', () => {
    const result = generateTextReport(sampleDiffs);
    expect(result).toBeTruthy();
  });
});

describe('generateJsonReport', () => {
  it('includes driftCount and diffs array', () => {
    const result = JSON.parse(generateJsonReport(sampleDiffs));
    expect(result.driftCount).toBe(3);
    expect(result.diffs).toHaveLength(3);
  });

  it('returns zero count for empty diffs', () => {
    const result = JSON.parse(generateJsonReport([]));
    expect(result.driftCount).toBe(0);
  });
});

describe('generateMarkdownReport', () => {
  it('returns no-changes message when empty', () => {
    expect(generateMarkdownReport([])).toContain('No changes detected');
  });

  it('includes table header and rows', () => {
    const result = generateMarkdownReport(sampleDiffs);
    expect(result).toContain('| Token |');
    expect(result).toContain('color.primary');
    expect(result).toContain('spacing.md');
  });
});

describe('generateReport with outputPath', () => {
  it('writes report file to disk', () => {
    const tmpPath = path.join(os.tmpdir(), 'token-drift-test', 'report.md');
    generateReport(sampleDiffs, { format: 'markdown', outputPath: tmpPath });
    expect(fs.existsSync(tmpPath)).toBe(true);
    fs.rmSync(path.dirname(tmpPath), { recursive: true });
  });
});
