import * as fs from 'fs';
import * as path from 'path';

export interface DesignToken {
  name: string;
  value: string | number;
  type?: string;
  description?: string;
}

export type TokenMap = Record<string, DesignToken>;

function flattenTokens(
  obj: Record<string, unknown>,
  prefix = ''
): TokenMap {
  const result: TokenMap = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !('value' in (value as object))
    ) {
      Object.assign(
        result,
        flattenTokens(value as Record<string, unknown>, fullKey)
      );
    } else if (
      value !== null &&
      typeof value === 'object' &&
      'value' in (value as object)
    ) {
      const token = value as Record<string, unknown>;
      result[fullKey] = {
        name: fullKey,
        value: token['value'] as string | number,
        type: token['type'] as string | undefined,
        description: token['description'] as string | undefined,
      };
    }
  }

  return result;
}

export function parseTokenFile(filePath: string): TokenMap {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Token file not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== '.json') {
    throw new Error(`Unsupported file format: ${ext}. Only JSON is supported.`);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse JSON from: ${resolved}`);
  }

  return flattenTokens(parsed);
}
