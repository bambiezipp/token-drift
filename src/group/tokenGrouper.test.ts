import {
  groupByNamespace,
  groupByDepth,
  summarizeGroups,
  formatGroupSummary,
} from './tokenGrouper';
import { FlatTokenMap } from '../parser/tokenParser';

const sampleTokens: FlatTokenMap = {
  'color.primary.500': '#3b82f6',
  'color.primary.600': '#2563eb',
  'color.neutral.100': '#f3f4f6',
  'spacing.sm': '8px',
  'spacing.md': '16px',
  'spacing.lg': '24px',
  'typography.body.size': '16px',
  'typography.body.weight': '400',
  'radius.md': '6px',
};

describe('groupByNamespace', () => {
  it('groups tokens by top-level key segment', () => {
    const result = groupByNamespace(sampleTokens);
    expect(Object.keys(result).sort()).toEqual(['color', 'radius', 'spacing', 'typography']);
  });

  it('places all color tokens under the color group', () => {
    const result = groupByNamespace(sampleTokens);
    expect(Object.keys(result['color'])).toHaveLength(3);
  });

  it('handles tokens with no dot separator under root', () => {
    const tokens: FlatTokenMap = { rootToken: 'value' };
    const result = groupByNamespace(tokens);
    expect(result['rootToken']).toBeDefined();
  });

  it('returns empty object for empty input', () => {
    expect(groupByNamespace({})).toEqual({});
  });
});

describe('groupByDepth', () => {
  it('groups by depth 1 same as namespace', () => {
    const byNs = groupByNamespace(sampleTokens);
    const byDepth = groupByDepth(sampleTokens, 1);
    expect(byDepth).toEqual(byNs);
  });

  it('groups by depth 2 correctly', () => {
    const result = groupByDepth(sampleTokens, 2);
    expect(result['color.primary']).toBeDefined();
    expect(Object.keys(result['color.primary'])).toHaveLength(2);
    expect(result['spacing.sm']).toBeDefined();
  });

  it('throws if depth < 1', () => {
    expect(() => groupByDepth(sampleTokens, 0)).toThrow('depth must be >= 1');
  });
});

describe('summarizeGroups', () => {
  it('returns summaries sorted by count descending', () => {
    const grouped = groupByNamespace(sampleTokens);
    const summaries = summarizeGroups(grouped);
    expect(summaries[0].count).toBeGreaterThanOrEqual(summaries[1].count);
  });

  it('includes correct group names and keys', () => {
    const grouped = groupByNamespace(sampleTokens);
    const summaries = summarizeGroups(grouped);
    const colorSummary = summaries.find((s) => s.group === 'color');
    expect(colorSummary).toBeDefined();
    expect(colorSummary!.keys).toContain('color.primary.500');
  });

  it('returns empty result for empty grouped tokens', () => {
    expect(summarizeGroups({})).toEqual([]);
  });
});

describe('formatGroupSummary', () => {
  it('returns a no-groups message for empty input', () => {
    expect(formatGroupSummary([])).toBe('No token groups found.');
  });

  it('includes group names and counts in output', () => {
    const grouped = groupByNamespace(sampleTokens);
    const summaries = summarizeGroups(grouped);
    const output = formatGroupSummary(summaries);
    expect(output).toContain('color');
    expect(output).toContain('spacing');
    expect(output).toContain('Total groups:');
  });

  it('uses singular "token" for groups with count 1', () => {
    const summaries = [{ group: 'radius', count: 1, keys: ['radius.md'] }];
    expect(formatGroupSummary(summaries)).toContain('1 token');
  });
});
