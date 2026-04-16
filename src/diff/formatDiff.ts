import { DiffResult, TokenChange } from './tokenDiffer';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

function formatValue(val: unknown): string {
  return typeof val === 'string' ? val : JSON.stringify(val);
}

function formatAdded(change: TokenChange): string {
  return `${GREEN}+ ${change.key}: ${formatValue(change.newValue)}${RESET}`;
}

function formatRemoved(change: TokenChange): string {
  return `${RED}- ${change.key}: ${formatValue(change.oldValue)}${RESET}`;
}

function formatModified(change: TokenChange): string {
  return (
    `${YELLOW}~ ${change.key}${RESET}\n` +
    `  ${DIM}old: ${formatValue(change.oldValue)}${RESET}\n` +
    `  new: ${formatValue(change.newValue)}`
  );
}

export function formatDiff(diff: DiffResult, color = true): string {
  const lines: string[] = [];

  if (!color) {
    // Strip ANSI for plain output
    const format = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
    return formatDiff(diff, true).split('\n').map(format).join('\n');
  }

  if (diff.added.length) {
    lines.push('Added:');
    diff.added.forEach(c => lines.push('  ' + formatAdded(c)));
  }
  if (diff.removed.length) {
    lines.push('Removed:');
    diff.removed.forEach(c => lines.push('  ' + formatRemoved(c)));
  }
  if (diff.modified.length) {
    lines.push('Modified:');
    diff.modified.forEach(c => lines.push('  ' + formatModified(c)));
  }
  if (!diff.added.length && !diff.removed.length && !diff.modified.length) {
    lines.push(`${DIM}No token drift detected.${RESET}`);
  }

  return lines.join('\n');
}
