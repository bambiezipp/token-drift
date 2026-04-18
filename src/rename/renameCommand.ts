import * as fs from 'fs';
import * as path from 'path';
import { parseTokenFile } from '../parser/tokenParser';
import { applyRenames, parseRenameMap, formatRenameResult, RenameRule } from './tokenRenamer';

export interface RenameCommandOptions {
  tokenFile: string;
  renameFile?: string;
  renameMap?: Record<string, string>;
  outputFile?: string;
  dryRun?: boolean;
}

export function runRenameCommand(options: RenameCommandOptions): void {
  const { tokenFile, renameFile, renameMap, outputFile, dryRun } = options;

  const tokens = parseTokenFile(tokenFile);

  let rules: RenameRule[] = [];
  if (renameFile) {
    const raw = JSON.parse(fs.readFileSync(renameFile, 'utf-8'));
    rules = parseRenameMap(raw);
  } else if (renameMap) {
    rules = parseRenameMap(renameMap);
  } else {
    console.error('No rename rules provided.');
    process.exit(1);
  }

  const result = applyRenames(tokens, rules);
  console.log(formatRenameResult(result));

  if (!dryRun) {
    const out = outputFile || tokenFile;
    const nested = unflattenTokens(result.tokens);
    fs.writeFileSync(out, JSON.stringify(nested, null, 2));
    console.log(`Written to ${path.resolve(out)}`);
  } else {
    console.log('Dry run — no files written.');
  }
}

function unflattenTokens(flat: Record<string, { value: unknown; type?: string }>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, token] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur: Record<string, unknown> = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = token;
  }
  return out;
}
