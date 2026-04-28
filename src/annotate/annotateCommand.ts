import * as fs from 'fs';
import * as path from 'path';
import { parseTokenFile } from '../parser/tokenParser';
import {
  applyAnnotations,
  filterByTag,
  filterDeprecated,
  formatAnnotateResult,
  AnnotationMap,
} from './tokenAnnotator';

export interface AnnotateCommandOptions {
  tokenFile: string;
  annotationFile: string;
  tag?: string;
  deprecated?: boolean;
  outputJson?: boolean;
}

export async function runAnnotateCommand(options: AnnotateCommandOptions): Promise<void> {
  const { tokenFile, annotationFile, tag, deprecated, outputJson } = options;

  if (!fs.existsSync(tokenFile)) {
    console.error(`Token file not found: ${tokenFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(annotationFile)) {
    console.error(`Annotation file not found: ${annotationFile}`);
    process.exit(1);
  }

  const tokens = parseTokenFile(tokenFile);
  const raw = JSON.parse(fs.readFileSync(annotationFile, 'utf-8'));
  const annotations: AnnotationMap = raw;

  const result = applyAnnotations(tokens, annotations);

  let view = result.annotated;
  if (tag) {
    view = filterByTag(view, tag);
  } else if (deprecated) {
    view = filterDeprecated(view);
  }

  if (outputJson) {
    console.log(JSON.stringify(view, null, 2));
  } else {
    console.log(formatAnnotateResult(result));
    if (tag || deprecated) {
      console.log(`\nFiltered results (${Object.keys(view).length}):`);
      for (const [key, ann] of Object.entries(view)) {
        const parts = [key];
        if (ann.description) parts.push(`— ${ann.description}`);
        if (ann.deprecated) parts.push('[deprecated]');
        if (ann.tags?.length) parts.push(`[${ann.tags.join(', ')}]`);
        console.log('  ' + parts.join(' '));
      }
    }
  }
}
