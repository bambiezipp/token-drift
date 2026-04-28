import {
  applyAnnotations,
  filterByTag,
  filterDeprecated,
  formatAnnotateResult,
  AnnotationMap,
} from './tokenAnnotator';
import { FlatTokenMap } from '../parser/tokenParser';

const tokens: FlatTokenMap = {
  'color.primary': '#0070f3',
  'color.secondary': '#ff0080',
  'spacing.md': '16px',
  'font.size.base': '14px',
};

const annotations: AnnotationMap = {
  'color.primary': { key: 'color.primary', description: 'Brand primary', tags: ['brand', 'color'] },
  'color.secondary': { key: 'color.secondary', deprecated: true, tags: ['color'] },
  'spacing.md': { key: 'spacing.md', owner: 'design-team', tags: ['spacing'] },
  'nonexistent.token': { key: 'nonexistent.token', description: 'Ghost token' },
};

describe('applyAnnotations', () => {
  it('annotates tokens that exist in the token map', () => {
    const result = applyAnnotations(tokens, annotations);
    expect(result.annotated['color.primary'].description).toBe('Brand primary');
    expect(result.annotated['spacing.md'].owner).toBe('design-team');
  });

  it('reports missing keys not found in tokens', () => {
    const result = applyAnnotations(tokens, annotations);
    expect(result.missing).toContain('nonexistent.token');
  });

  it('reports tokens with no annotation as skipped', () => {
    const result = applyAnnotations(tokens, annotations);
    expect(result.skipped).toContain('font.size.base');
  });
});

describe('filterByTag', () => {
  it('returns only annotations matching the tag', () => {
    const result = applyAnnotations(tokens, annotations);
    const branded = filterByTag(result.annotated, 'brand');
    expect(Object.keys(branded)).toEqual(['color.primary']);
  });

  it('returns empty object when no match', () => {
    const result = applyAnnotations(tokens, annotations);
    const none = filterByTag(result.annotated, 'nonexistent-tag');
    expect(Object.keys(none)).toHaveLength(0);
  });
});

describe('filterDeprecated', () => {
  it('returns only deprecated annotations', () => {
    const result = applyAnnotations(tokens, annotations);
    const deprecated = filterDeprecated(result.annotated);
    expect(Object.keys(deprecated)).toEqual(['color.secondary']);
  });
});

describe('formatAnnotateResult', () => {
  it('includes annotated count', () => {
    const result = applyAnnotations(tokens, annotations);
    const output = formatAnnotateResult(result);
    expect(output).toContain('Annotated: 3 token(s)');
  });

  it('mentions missing tokens', () => {
    const result = applyAnnotations(tokens, annotations);
    const output = formatAnnotateResult(result);
    expect(output).toContain('nonexistent.token');
  });
});
