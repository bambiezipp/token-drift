import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runRenameCommand } from './renameCommand';

function writeTempJson(data: unknown): string {
  const file = path.join(os.tmpdir(), `token-drift-rename-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  return file;
}

const sampleTokens = {
  color: {
    primary: { value: '#0000ff', type: 'color' },
    secondary: { value: '#ff0000', type: 'color' },
  },
};

describe('runRenameCommand', () => {
  let tokenFile: string;
  let outputFile: string;

  beforeEach(() => {
    tokenFile = writeTempJson(sampleTokens);
    outputFile = path.join(os.tmpdir(), `token-drift-out-${Date.now()}.json`);
  });

  afterEach(() => {
    [tokenFile, outputFile].forEach(f => { try { fs.unlinkSync(f); } catch {} });
  });

  it('renames tokens and writes output', () => {
    runRenameCommand({
      tokenFile,
      renameMap: { 'color.primary': 'color.brand' },
      outputFile,
    });
    const result = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    expect(result.color.brand).toBeDefined();
    expect(result.color.primary).toBeUndefined();
  });

  it('dry run does not write file', () => {
    runRenameCommand({
      tokenFile,
      renameMap: { 'color.primary': 'color.brand' },
      outputFile,
      dryRun: true,
    });
    expect(fs.existsSync(outputFile)).toBe(false);
  });

  it('loads rename rules from file', () => {
    const renameFile = writeTempJson({ 'color.secondary': 'color.accent' });
    runRenameCommand({ tokenFile, renameFile, outputFile });
    const result = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    expect(result.color.accent).toBeDefined();
    fs.unlinkSync(renameFile);
  });
});
