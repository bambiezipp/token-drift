import * as fs from 'fs';
import * as path from 'path';
import { parseTokenFile } from '../parser/tokenParser';
import { computeStats, formatStats, TokenStats } from './tokenStats';

export interface StatsCommandOptions {
  format?: 'text' | 'json';
  category?: string;
}

export function runStatsCommand(
  filePath: string,
  options: StatsCommandOptions = {}
): string {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const tokens = parseTokenFile(resolved);
  let stats: TokenStats = computeStats(tokens);

  if (options.category) {
    const cat = options.category;
    const filtered = Object.fromEntries(
      Object.entries(tokens).filter(([k]) => k.startsWith(`${cat}.`))
    );
    stats = computeStats(filtered);
  }

  if (options.format === 'json') {
    return JSON.stringify(stats, null, 2);
  }

  return formatStats(stats);
}
