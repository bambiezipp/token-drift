import { formatDiff } from './formatDiff';
import { DiffResult } from './tokenDiffer';

const emptyDiff: DiffResult = { added: [], removed: [], modified: [], unchanged: [] };

describe('formatDiff', () => {
  it('shows no drift message when diff is empty', () => {
    const output = formatDiff(emptyDiff, false);
    expect(output).toContain('No token drift detected');
  });

  it('shows added tokens', () => {
    const diff: DiffResult = {
      ...emptyDiff,
      added: [{ key: 'color.new', type: 'added', newValue: '#fff' }],
    };
    const output = formatDiff(diff, false);
    expect(output).toContain('Added:');
    expect(output).toContain('color.new');
    expect(output).toContain('#fff');
  });

  it('shows removed tokens', () => {
    const diff: DiffResult = {
      ...emptyDiff,
      removed: [{ key: 'spacing.lg', type: 'removed', oldValue: '24px' }],
    };
    const output = formatDiff(diff, false);
    expect(output).toContain('Removed:');
    expect(output).toContain('spacing.lg');
  });

  it('shows modified tokens with old and new values', () => {
    const diff: DiffResult = {
      ...emptyDiff,
      modified: [{ key: 'color.primary', type: 'modified', oldValue: '#000', newValue: '#111' }],
    };
    const output = formatDiff(diff, false);
    expect(output).toContain('Modified:');
    expect(output).toContain('old: #000');
    expect(output).toContain('new: #111');
  });

  it('strips ANSI codes in plain mode', () => {
    const diff: DiffResult = {
      ...emptyDiff,
      added: [{ key: 'x', type: 'added', newValue: 'y' }],
    };
    const output = formatDiff(diff, false);
    expect(output).not.toMatch(/\x1b\[/);
  });

  it('shows summary counts for multiple changes', () => {
    const diff: DiffResult = {
      added: [{ key: 'a', type: 'added', newValue: '1' }],
      removed: [{ key: 'b', type: 'removed', oldValue: '2' }],
      modified: [
        { key: 'c', type: 'modified', oldValue: '3', newValue: '4' },
        { key: 'd', type: 'modified', oldValue: '5', newValue: '6' },
      ],
      unchanged: [],
    };
    const output = formatDiff(diff, false);
    expect(output).toContain('1 added');
    expect(output).toContain('1 removed');
    expect(output).toContain('2 modified');
  });

  it('does not show Added/Removed/Modified sections when empty', () => {
    const diff: DiffResult = {
      ...emptyDiff,
      modified: [{ key: 'color.primary', type: 'modified', oldValue: '#000', newValue: '#111' }],
    };
    const output = formatDiff(diff, false);
    expect(output).not.toContain('Added:');
    expect(output).not.toContain('Removed:');
    expect(output).toContain('Modified:');
  });
});
