import * as fs from 'fs';
import * as path from 'path';
import { FlatTokenMap } from '../parser/tokenParser';
import { transformToCss, transformToScss, transformToJs, transformToJson } from '../transform/tokenTransformer';

export type ExportFormat = 'css' | 'scss' | 'js' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  prefix?: string;
}

export interface ExportResult {
  success: boolean;
  outputPath: string;
  format: ExportFormat;
  tokenCount: number;
  error?: string;
}

export function getExportContent(tokens: FlatTokenMap, format: ExportFormat, prefix?: string): string {
  switch (format) {
    case 'css':
      return transformToCss(tokens, prefix);
    case 'scss':
      return transformToScss(tokens, prefix);
    case 'js':
      return transformToJs(tokens);
    case 'json':
      return transformToJson(tokens);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function exportTokens(tokens: FlatTokenMap, options: ExportOptions): ExportResult {
  const { format, outputPath, prefix } = options;
  const tokenCount = Object.keys(tokens).length;

  try {
    const content = getExportContent(tokens, format, prefix);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');

    return { success: true, outputPath, format, tokenCount };
  } catch (err) {
    return {
      success: false,
      outputPath,
      format,
      tokenCount,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function formatExportResult(result: ExportResult): string {
  if (!result.success) {
    return `Export failed [${result.format}]: ${result.error}`;
  }
  return `Exported ${result.tokenCount} tokens as ${result.format.toUpperCase()} → ${result.outputPath}`;
}
