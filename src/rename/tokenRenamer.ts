import { FlatTokenMap } from '../parser/tokenParser';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  renamed: Record<string, string>;
  notFound: string[];
  tokens: FlatTokenMap;
}

export function applyRenames(tokens: FlatTokenMap, rules: RenameRule[]): RenameResult {
  const result: FlatTokenMap = { ...tokens };
  const renamed: Record<string, string> = {};
  const notFound: string[] = [];

  for (const rule of rules) {
    if (rule.from in result) {
      result[rule.to] = result[rule.from];
      delete result[rule.from];
      renamed[rule.from] = rule.to;
    } else {
      notFound.push(rule.from);
    }
  }

  return { renamed, notFound, tokens: result };
}

export function parseRenameMap(raw: Record<string, string>): RenameRule[] {
  return Object.entries(raw).map(([from, to]) => ({ from, to }));
}

export function formatRenameResult(result: RenameResult): string {
  const lines: string[] = [];
  const renamedKeys = Object.keys(result.renamed);

  if (renamedKeys.length > 0) {
    lines.push(`Renamed (${renamedKeys.length}):`);
    for (const [from, to] of Object.entries(result.renamed)) {
      lines.push(`  ${from} -> ${to}`);
    }
  }

  if (result.notFound.length > 0) {
    lines.push(`Not found (${result.notFound.length}):`);
    for (const key of result.notFound) {
      lines.push(`  ${key}`);
    }
  }

  if (lines.length === 0) {
    lines.push('No renames applied.');
  }

  return lines.join('\n');
}
