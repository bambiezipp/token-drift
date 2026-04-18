import { FlatTokenMap } from '../parser/tokenParser';

export interface TokenStats {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  aliasCount: number;
  literalCount: number;
}

export function computeStats(tokens: FlatTokenMap): TokenStats {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let aliasCount = 0;
  let literalCount = 0;

  for (const [key, token] of Object.entries(tokens)) {
    const parts = key.split('.');
    const category = parts[0] ?? 'unknown';
    byCategory[category] = (byCategory[category] ?? 0) + 1;

    const type = token.type ?? 'unknown';
    byType[type] = (byType[type] ?? 0) + 1;

    const val = String(token.value ?? '');
    if (val.startsWith('{') && val.endsWith('}')) {
      aliasCount++;
    } else {
      literalCount++;
    }
  }

  return {
    total: Object.keys(tokens).length,
    byCategory,
    byType,
    aliasCount,
    literalCount,
  };
}

export function formatStats(stats: TokenStats): string {
  const lines: string[] = [
    `Total tokens : ${stats.total}`,
    `Aliases      : ${stats.aliasCount}`,
    `Literals     : ${stats.literalCount}`,
    '',
    'By category:',
    ...Object.entries(stats.byCategory).map(([k, v]) => `  ${k}: ${v}`),
    '',
    'By type:',
    ...Object.entries(stats.byType).map(([k, v]) => `  ${k}: ${v}`),
  ];
  return lines.join('\n');
}
