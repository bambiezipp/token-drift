import { FlatTokenMap } from '../parser/tokenParser';

export interface TokenAnnotation {
  key: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  owner?: string;
}

export type AnnotationMap = Record<string, TokenAnnotation>;

export interface AnnotateResult {
  annotated: AnnotationMap;
  skipped: string[];
  missing: string[];
}

export function applyAnnotations(
  tokens: FlatTokenMap,
  annotations: AnnotationMap
): AnnotateResult {
  const annotated: AnnotationMap = {};
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const [key, annotation] of Object.entries(annotations)) {
    if (key in tokens) {
      annotated[key] = { ...annotation, key };
    } else {
      missing.push(key);
    }
  }

  for (const key of Object.keys(tokens)) {
    if (!(key in annotations)) {
      skipped.push(key);
    }
  }

  return { annotated, skipped, missing };
}

export function filterByTag(
  annotations: AnnotationMap,
  tag: string
): AnnotationMap {
  return Object.fromEntries(
    Object.entries(annotations).filter(
      ([, ann]) => ann.tags?.includes(tag)
    )
  );
}

export function filterDeprecated(annotations: AnnotationMap): AnnotationMap {
  return Object.fromEntries(
    Object.entries(annotations).filter(([, ann]) => ann.deprecated === true)
  );
}

export function formatAnnotateResult(result: AnnotateResult): string {
  const lines: string[] = [];
  const count = Object.keys(result.annotated).length;
  lines.push(`Annotated: ${count} token(s)`);
  if (result.missing.length > 0) {
    lines.push(`Missing in token file: ${result.missing.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Unannotated tokens: ${result.skipped.length}`);
  }
  return lines.join('\n');
}
