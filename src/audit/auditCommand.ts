import * as fs from 'fs';
import * as path from 'path';
import { parseTokenFile } from '../parser/tokenParser';
import { auditTokens, formatAuditResult } from './tokenAuditor';
import { applyIgnore, loadIgnoreFile } from '../ignore/tokenIgnore';

export interface AuditCommandOptions {
  tokenFile: string;
  ignorefile?: string;
  json?: boolean;
  category?: string;
}

export function runAuditCommand(options: AuditCommandOptions): void {
  const { tokenFile, ignorefile, json, category } = options;

  if (!fs.existsSync(tokenFile)) {
    console.error(`Error: Token file not found: ${tokenFile}`);
    process.exit(1);
  }

  let tokens = parseTokenFile(tokenFile);

  if (ignorefile && fs.existsSync(ignorefile)) {
    const patterns = loadIgnoreFile(ignorefile);
    tokens = applyIgnore(tokens, patterns);
  }

  if (category) {
    const prefix = category.endsWith('.') ? category : `${category}.`;
    tokens = Object.fromEntries(
      Object.entries(tokens).filter(([k]) => k.startsWith(prefix))
    );
  }

  const result = auditTokens(tokens);

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatAuditResult(result));
  }

  if (result.failed > 0) {
    process.exit(1);
  }
}
