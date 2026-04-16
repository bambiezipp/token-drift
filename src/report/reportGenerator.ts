import { TokenDiff } from '../diff/tokenDiffer';
import { formatDiff } from '../diff/formatDiff';
import * as fs from 'fs';
import * as path from 'path';

export type ReportFormat = 'text' | 'json' | 'markdown';

export interface ReportOptions {
  format: ReportFormat;
  outputPath?: string;
}

export function generateTextReport(diffs: TokenDiff[]): string {
  if (diffs.length === 0) return 'No token drift detected.\n';
  return formatDiff(diffs);
}

export function generateJsonReport(diffs: TokenDiff[]): string {
  return JSON.stringify({ driftCount: diffs.length, diffs }, null, 2);
}

export function generateMarkdownReport(diffs: TokenDiff[]): string {
  if (diffs.length === 0) return '## Token Drift\n\nNo changes detected.\n';

  const lines: string[] = ['## Token Drift', '', `**${diffs.length} change(s) detected**`, '', '| Token | Type | Old Value | New Value |', '|-------|------|-----------|-----------|'];

  for (const diff of diffs) {
    const oldVal = diff.oldValue !== undefined ? String(diff.oldValue) : '-';
    const newVal = diff.newValue !== undefined ? String(diff.newValue) : '-';
    lines.push(`| ${diff.token} | ${diff.type} | ${oldVal} | ${newVal} |`);
  }

  return lines.join('\n') + '\n';
}

export function generateReport(diffs: TokenDiff[], options: ReportOptions): string {
  let content: string;

  switch (options.format) {
    case 'json':
      content = generateJsonReport(diffs);
      break;
    case 'markdown':
      content = generateMarkdownReport(diffs);
      break;
    default:
      content = generateTextReport(diffs);
  }

  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(options.outputPath, content, 'utf-8');
  }

  return content;
}
