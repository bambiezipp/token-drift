/**
 * tokenTransformer.ts
 * Transforms flat token maps into various output formats (CSS variables,
 * SCSS variables, JS/TS constants) for export or comparison purposes.
 */

import { FlatTokenMap } from '../parser/tokenParser';

export type TransformFormat = 'css' | 'scss' | 'js' | 'ts';

export interface TransformOptions {
  /** Output format */
  format: TransformFormat;
  /** Optional prefix for variable names, e.g. "token" -> "--token-color-primary" */
  prefix?: string;
  /** If true, wrap CSS variables in a :root { } block */
  cssRoot?: boolean;
}

/**
 * Converts a dot-separated token key to a kebab-case variable name.
 * e.g. "color.primary.base" -> "color-primary-base"
 */
export function toKebabCase(key: string): string {
  return key.replace(/\./g, '-');
}

/**
 * Converts a dot-separated token key to a camelCase identifier.
 * e.g. "color.primary.base" -> "colorPrimaryBase"
 */
export function toCamelCase(key: string): string {
  return key
    .split('.')
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

/**
 * Builds a CSS custom-property name from a token key and optional prefix.
 */
function cssVarName(key: string, prefix?: string): string {
  const base = toKebabCase(key);
  return prefix ? `--${prefix}-${base}` : `--${base}`;
}

/**
 * Transforms a flat token map into CSS custom properties.
 */
export function transformToCss(tokens: FlatTokenMap, options: TransformOptions): string {
  const lines = Object.entries(tokens).map(
    ([key, value]) => `  ${cssVarName(key, options.prefix)}: ${value};`
  );

  if (options.cssRoot !== false) {
    return `:root {\n${lines.join('\n')}\n}\n`;
  }
  return lines.join('\n') + '\n';
}

/**
 * Transforms a flat token map into SCSS variables.
 */
export function transformToScss(tokens: FlatTokenMap, options: TransformOptions): string {
  const lines = Object.entries(tokens).map(([key, value]) => {
    const name = toKebabCase(key);
    const varName = options.prefix ? `${options.prefix}-${name}` : name;
    return `$${varName}: ${value};`;
  });
  return lines.join('\n') + '\n';
}

/**
 * Transforms a flat token map into a JS or TS constants object.
 */
export function transformToJs(tokens: FlatTokenMap, options: TransformOptions): string {
  const isTs = options.format === 'ts';
  const entries = Object.entries(tokens)
    .map(([key, value]) => {
      const name = toCamelCase(key);
      const val = typeof value === 'string' ? `'${value}'` : String(value);
      return `  ${name}: ${val},`;
    })
    .join('\n');

  const exportKeyword = isTs
    ? 'export const tokens: Record<string, string | number> = {'
    : 'export const tokens = {';

  return `${exportKeyword}\n${entries}\n};\n`;
}

/**
 * Main transform entry point. Dispatches to the appropriate formatter.
 */
export function transformTokens(tokens: FlatTokenMap, options: TransformOptions): string {
  switch (options.format) {
    case 'css':
      return transformToCss(tokens, options);
    case 'scss':
      return transformToScss(tokens, options);
    case 'js':
    case 'ts':
      return transformToJs(tokens, options);
    default:
      throw new Error(`Unsupported transform format: ${(options as any).format}`);
  }
}
