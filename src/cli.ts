#!/usr/bin/env node
import { parseTokenFile } from './parser/tokenParser';
import { diffTokens, hasDrift } from './diff/tokenDiffer';
import { generateReport, ReportFormat } from './report';

function printUsage() {
  console.log('Usage: token-drift <base-file> <head-file> [--format text|json|markdown] [--output <path>]');
}

const VALID_FORMATS: ReportFormat[] = ['text', 'json', 'markdown'];

function parseArgs(args: string[]): { base: string; head: string; format: ReportFormat; output?: string } {
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const [base, head, ...rest] = args;
  let format: ReportFormat = 'text';
  let output: string | undefined;

  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--format' && rest[i + 1]) {
      const requestedFormat = rest[++i] as ReportFormat;
      if (!VALID_FORMATS.includes(requestedFormat)) {
        console.error(`Invalid format "${requestedFormat}". Valid options: ${VALID_FORMATS.join(', ')}`);
        process.exit(1);
      }
      format = requestedFormat;
    } else if (rest[i] === '--output' && rest[i + 1]) {
      output = rest[++i];
    }
  }

  return { base, head, format, output };
}

function main() {
  const args = process.argv.slice(2);
  const { base, head, format, output } = parseArgs(args);

  let baseTokens: Record<string, unknown>;
  let headTokens: Record<string, unknown>;

  try {
    baseTokens = parseTokenFile(base);
    headTokens = parseTokenFile(head);
  } catch (err) {
    console.error('Error reading token files:', (err as Error).message);
    process.exit(1);
  }

  const diffs = diffTokens(baseTokens, headTokens);
  const report = generateReport(diffs, { format, outputPath: output });

  if (!output) console.log(report);
  else console.log(`Report written to ${output}`);

  process.exit(hasDrift(diffs) ? 1 : 0);
}

main();
